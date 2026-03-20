'use client'

import { useRef, useEffect, useMemo, useCallback } from 'react'

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

export interface CalendarPickerProps {
  selectedDate: string
  onSelectDate: (date: string) => void
  lessonDates: Set<string>
  rangeStart: string
  rangeEnd: string
  today: string
  expanded: boolean  // controlled by parent
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
  expanded,
}: CalendarPickerProps) {
  const collapsedRef = useRef<HTMLDivElement>(null)
  const expandedRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const monthLabelRef = useRef<HTMLSpanElement>(null)
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isProg = useRef(false)

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
    setTimeout(() => { isProg.current = false }, 400)
  }, [selectedDate, expanded, selectedWeekIdx])

  // ── Sync scroll: expanded → selected week (on selectedDate change only) ──

  useEffect(() => {
    if (!expanded) return
    const c = expandedRef.current
    if (!c) return
    const target = selectedWeekIdx * ROW_HEIGHT
    if (Math.abs(c.scrollTop - target) < 2) return
    isProg.current = true
    c.scrollTo({ top: target, behavior: 'smooth' })
    setTimeout(() => { isProg.current = false }, 400)
  }, [selectedDate, expanded, selectedWeekIdx])

  // ── Expanded scroll → month overlay only (no selection change) ──────

  const flatDays = useMemo(() => weeks.flat(), [weeks])

  const handleExpandedScroll = useCallback(() => {
    const c = expandedRef.current
    if (!c) return

    // Imperatively update overlay — zero re-renders during scroll
    const weekIdx = Math.round(c.scrollTop / ROW_HEIGHT)
    const midIdx = Math.min(weekIdx * 7 + 3, flatDays.length - 1)
    const label = flatDays[midIdx]?.monthFull ?? ''

    if (overlayRef.current) overlayRef.current.style.opacity = '1'
    if (monthLabelRef.current) monthLabelRef.current.textContent = label

    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current)
    scrollEndTimer.current = setTimeout(() => {
      if (overlayRef.current) overlayRef.current.style.opacity = '0'
      // Note: scrolling the picker does NOT change selectedDate.
      // Only tapping a DayCell changes selection.
    }, 180)
  }, [flatDays])

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="select-none">
      {/* DOW header — full width, perfectly aligned with date columns */}
      <div className="flex mb-0.5">
        {DOW_LABELS.map(dow => (
          <div
            key={dow}
            className="flex-1 text-center text-[10px] font-bold text-[#999999] py-1 tracking-widest uppercase"
          >
            {dow}
          </div>
        ))}
      </div>

      {/* Scrollable date grid — height animates on expand/collapse */}
      <div
        className="relative overflow-hidden"
        style={{
          height: expanded ? ROW_HEIGHT * VISIBLE_ROWS : ROW_HEIGHT,
          transition: 'height 280ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* ── Collapsed: single week, horizontal scroll ── */}
        <div
          ref={collapsedRef}
          className="cal-scroll flex h-full overflow-x-auto absolute inset-0"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            // Fade out when expanding, fade in when collapsing
            opacity: expanded ? 0 : 1,
            pointerEvents: expanded ? 'none' : 'auto',
            transition: 'opacity 150ms ease',
          }}
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

        {/* ── Expanded: 5 rows, vertical scroll ── */}
        <div
          ref={expandedRef}
          className="cal-scroll h-full overflow-y-auto absolute inset-0"
          style={{
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            opacity: expanded ? 1 : 0,
            pointerEvents: expanded ? 'auto' : 'none',
            transition: 'opacity 150ms ease 100ms',
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

        {/* ── Month overlay (visible while scrolling in expanded) ── */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
          style={{
            opacity: 0,
            backgroundColor: 'rgba(255,255,255,0.9)',
            transition: 'opacity 120ms ease',
          }}
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
      className="flex-1 flex flex-col items-center justify-center relative focus:outline-none active:scale-95"
      style={{
        height: ROW_HEIGHT,
        transition: 'transform 100ms ease',
      }}
      onClick={onClick}
      disabled={!day.inRange}
      tabIndex={day.inRange ? 0 : -1}
    >
      {/* Month label — first of month in expanded view */}
      {showMonthLabel && (
        <span className="absolute top-1.5 left-0 right-0 text-center text-[8px] font-bold text-[#FDBE00] leading-none tracking-wide uppercase">
          {day.monthAbbr}
        </span>
      )}

      {/* Date circle */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold leading-none"
        style={{
          backgroundColor: circleColor,
          color: numColor,
          transition: 'background-color 180ms cubic-bezier(0.25, 1, 0.5, 1), color 180ms ease',
        }}
      >
        {day.dayNum}
      </div>

      {/* Lesson indicator or alignment spacer */}
      {hasLesson && day.inRange ? (
        <div
          className="w-1 h-1 rounded-full mt-0.5"
          style={{
            backgroundColor: dotColor,
            transition: 'background-color 180ms ease',
          }}
        />
      ) : (
        <div className="w-1 h-1 mt-0.5" />
      )}
    </button>
  )
}
