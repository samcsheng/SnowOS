'use client'

import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ROW_HEIGHT = 56 // px per week row
const VISIBLE_ROWS = 5

// ── Types ─────────────────────────────────────────────────────────────

interface DayInfo {
  date: string        // YYYY-MM-DD
  dayNum: number
  inRange: boolean
  isFirstOfMonth: boolean
  monthAbbr: string
  monthFull: string
}

interface CalendarPickerProps {
  selectedDate: string
  onSelectDate: (date: string) => void
  lessonDates: Set<string>
  rangeStart: string
  rangeEnd: string
  today: string
}

// ── Grid builder ─────────────────────────────────────────────────────

function buildWeeks(rangeStart: string, rangeEnd: string): DayInfo[][] {
  const start = new Date(rangeStart + 'T00:00:00')
  const end = new Date(rangeEnd + 'T00:00:00')

  // Monday on or before rangeStart
  const sd = start.getDay()
  const daysToMon = sd === 0 ? 6 : sd - 1
  const gridStart = new Date(start)
  gridStart.setDate(gridStart.getDate() - daysToMon)

  // Sunday on or after rangeEnd
  const ed = end.getDay()
  const daysToSun = ed === 0 ? 0 : 7 - ed
  const gridEnd = new Date(end)
  gridEnd.setDate(gridEnd.getDate() + daysToSun)

  const weeks: DayInfo[][] = []
  const cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    const week: DayInfo[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(cursor)
      week.push({
        date: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
        inRange: d >= start && d <= end,
        isFirstOfMonth: d.getDate() === 1,
        monthAbbr: d.toLocaleString('en-US', { month: 'short' }),
        monthFull: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

// ── CalendarPicker ────────────────────────────────────────────────────

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  lessonDates,
  rangeStart,
  rangeEnd,
  today,
}: CalendarPickerProps) {
  const [expanded, setExpanded] = useState(false)

  const collapsedRef = useRef<HTMLDivElement>(null)
  const expandedRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const monthLabelRef = useRef<HTMLSpanElement>(null)
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isProg = useRef(false) // programmatic scroll guard

  const weeks = useMemo(() => buildWeeks(rangeStart, rangeEnd), [rangeStart, rangeEnd])

  const selectedWeekIdx = useMemo(
    () => weeks.findIndex(w => w.some(d => d.date === selectedDate)),
    [weeks, selectedDate]
  )

  // ── Sync scroll: collapsed → selected week ──────────────────────────

  useEffect(() => {
    if (expanded) return
    const c = collapsedRef.current
    if (!c) return
    const target = selectedWeekIdx * c.offsetWidth
    if (Math.abs(c.scrollLeft - target) < 2) return
    isProg.current = true
    c.scrollTo({ left: target, behavior: 'smooth' })
    setTimeout(() => { isProg.current = false }, 450)
  }, [selectedDate, expanded, selectedWeekIdx])

  // ── Sync scroll: expanded → selected week ──────────────────────────

  useEffect(() => {
    if (!expanded) return
    const c = expandedRef.current
    if (!c) return
    const target = selectedWeekIdx * ROW_HEIGHT
    if (Math.abs(c.scrollTop - target) < 2) return
    isProg.current = true
    c.scrollTo({ top: target, behavior: 'smooth' })
    setTimeout(() => { isProg.current = false }, 450)
  }, [selectedDate, expanded, selectedWeekIdx])

  // ── Collapsed scroll → update selected date ─────────────────────────

  const handleCollapsedScroll = useCallback(() => {
    if (isProg.current) return
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current)
    scrollEndTimer.current = setTimeout(() => {
      const c = collapsedRef.current
      if (!c) return
      const weekIdx = Math.round(c.scrollLeft / c.offsetWidth)
      const week = weeks[weekIdx]
      if (!week) return
      // Try to keep same day-of-week
      const dow = new Date(selectedDate + 'T00:00:00').getDay()
      const dowIdx = dow === 0 ? 6 : dow - 1
      const target = week[dowIdx]?.inRange ? week[dowIdx] : week.find(d => d.inRange)
      if (target && target.date !== selectedDate) {
        onSelectDate(target.date)
      }
    }, 120)
  }, [weeks, selectedDate, onSelectDate])

  // ── Expanded scroll → month overlay + update selected date ──────────

  const flatDays = useMemo(() => weeks.flat(), [weeks])

  const handleExpandedScroll = useCallback(() => {
    const c = expandedRef.current
    if (!c) return

    // Imperatively update the overlay (no React state → no re-render during scroll)
    const weekIdx = Math.round(c.scrollTop / ROW_HEIGHT)
    const midIdx = Math.min(weekIdx * 7 + 3, flatDays.length - 1)
    const label = flatDays[midIdx]?.monthFull ?? ''

    if (overlayRef.current) {
      overlayRef.current.style.opacity = '1'
    }
    if (monthLabelRef.current) {
      monthLabelRef.current.textContent = label
    }

    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current)
    scrollEndTimer.current = setTimeout(() => {
      // Hide overlay
      if (overlayRef.current) overlayRef.current.style.opacity = '0'

      if (isProg.current) return

      // Update selectedDate to the snapped week
      const snappedIdx = Math.round(c.scrollTop / ROW_HEIGHT)
      const week = weeks[snappedIdx]
      if (!week) return
      const dow = new Date(selectedDate + 'T00:00:00').getDay()
      const dowIdx = dow === 0 ? 6 : dow - 1
      const target = week[dowIdx]?.inRange ? week[dowIdx] : week.find(d => d.inRange)
      if (target && target.date !== selectedDate) {
        onSelectDate(target.date)
      }
    }, 160)
  }, [weeks, flatDays, selectedDate, onSelectDate])

  // ── Toggle: reset scroll on expand ─────────────────────────────────

  const handleToggle = useCallback(() => {
    setExpanded(e => !e)
  }, [])

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="select-none">
      {/* DOW header row + toggle */}
      <div className="flex items-center mb-0.5">
        <div className="flex flex-1">
          {DOW_LABELS.map(dow => (
            <div
              key={dow}
              className="flex-1 text-center text-[10px] font-bold text-[#999999] py-1 tracking-widest uppercase"
            >
              {dow}
            </div>
          ))}
        </div>
        <button
          onClick={handleToggle}
          className="ml-2 p-1 rounded-full hover:bg-[#F0EFEE] transition-colors flex-none"
          aria-label={expanded ? 'Collapse calendar' : 'Expand calendar'}
        >
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-[#999999]" />
            : <ChevronDown className="w-3.5 h-3.5 text-[#999999]" />}
        </button>
      </div>

      {/* Scrollable date grid */}
      <div
        className="relative overflow-hidden"
        style={{ height: expanded ? ROW_HEIGHT * VISIBLE_ROWS : ROW_HEIGHT }}
      >
        {/* ── Collapsed: single week, horizontal scroll ── */}
        {!expanded && (
          <div
            ref={collapsedRef}
            className="cal-scroll flex h-full overflow-x-auto"
            style={{
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
            }}
            onScroll={handleCollapsedScroll}
          >
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className="flex flex-none w-full"
                style={{ scrollSnapAlign: 'start' }}
              >
                {week.map(day => (
                  <DayCell
                    key={day.date}
                    day={day}
                    isSelected={day.date === selectedDate}
                    isToday={day.date === today}
                    hasLesson={lessonDates.has(day.date)}
                    showMonthLabel={false}
                    onClick={() => day.inRange && onSelectDate(day.date)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Expanded: 5 rows, vertical scroll ── */}
        {expanded && (
          <div
            ref={expandedRef}
            className="cal-scroll h-full overflow-y-auto"
            style={{
              scrollSnapType: 'y mandatory',
              scrollbarWidth: 'none',
            }}
            onScroll={handleExpandedScroll}
          >
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className="flex flex-none"
                style={{ height: ROW_HEIGHT, scrollSnapAlign: 'start' }}
              >
                {week.map(day => (
                  <DayCell
                    key={day.date}
                    day={day}
                    isSelected={day.date === selectedDate}
                    isToday={day.date === today}
                    hasLesson={lessonDates.has(day.date)}
                    showMonthLabel={day.isFirstOfMonth}
                    onClick={() => day.inRange && onSelectDate(day.date)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Month overlay (visible while scrolling in expanded) ── */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 transition-opacity duration-150"
          style={{ opacity: 0, backgroundColor: 'rgba(255,255,255,0.88)' }}
          aria-hidden="true"
        >
          <span
            ref={monthLabelRef}
            className="text-xl font-bold text-[#000000]"
            style={{ fontFamily: 'var(--font-heading)' }}
          />
        </div>
      </div>
    </div>
  )
}

// ── DayCell ───────────────────────────────────────────────────────────

interface DayCellProps {
  day: DayInfo
  isSelected: boolean
  isToday: boolean
  hasLesson: boolean
  showMonthLabel: boolean
  onClick: () => void
}

function DayCell({ day, isSelected, isToday, hasLesson, showMonthLabel, onClick }: DayCellProps) {
  const circleColor = isToday
    ? '#FDBE00'
    : isSelected
    ? '#1E2643'
    : 'transparent'

  const numColor = isToday
    ? '#000000'
    : isSelected
    ? '#FFFFFF'
    : day.inRange
    ? '#1a1a1a'
    : '#CCCCCC'

  const dotColor = isToday || isSelected ? '#FDBE00' : '#1E2643'

  return (
    <button
      className="flex-1 flex flex-col items-center justify-center relative focus:outline-none"
      style={{ height: ROW_HEIGHT }}
      onClick={onClick}
      disabled={!day.inRange}
      tabIndex={day.inRange ? 0 : -1}
    >
      {/* Month label — first of month in expanded view */}
      {showMonthLabel && (
        <span
          className="absolute top-1.5 left-0 right-0 text-center text-[8px] font-bold text-[#FDBE00] leading-none tracking-wide uppercase"
        >
          {day.monthAbbr}
        </span>
      )}

      {/* Date number with circular crop */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold leading-none transition-colors duration-100"
        style={{ backgroundColor: circleColor, color: numColor }}
      >
        {day.dayNum}
      </div>

      {/* Lesson indicator (or spacer to keep alignment) */}
      {hasLesson && day.inRange ? (
        <div
          className="w-1 h-1 rounded-full mt-0.5"
          style={{ backgroundColor: dotColor }}
        />
      ) : (
        <div className="w-1 h-1 mt-0.5" />
      )}
    </button>
  )
}
