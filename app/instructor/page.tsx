'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useData } from '@/app/lib/store/use-data'
import { LessonCard } from '@/app/components/lesson-card'
import { EmptyState } from '@/app/components/empty-state'
import { CalendarPicker } from './components/calendar-picker'
import { Calendar, ChevronDown } from 'lucide-react'
import { getToday, formatDate } from '@/app/lib/utils/date-helpers'

// ── Constants ──────────────────────────────────────────────────────────

const RANGE_START = '2025-11-01'
const RANGE_END = '2026-05-15'
const TODAY = getToday()
const NAV_H = 56 // px — RoleSwitcher h-14

// sessionStorage keys for preserving state across navigation
const SS_DATE = 'snowos:instructor:selectedDate'
const SS_SCROLL = 'snowos:instructor:scrollTop'
const SS_EXPANDED = 'snowos:instructor:calendarExpanded'

// ── Page ──────────────────────────────────────────────────────────────

export default function InstructorSchedulePage() {
  const {
    state,
    getLessonsForInstructor,
    getGuestsForLesson,
    getInstructorsForLesson,
    getTemplateForLesson,
  } = useData()

  // ── Persisted state (restored from sessionStorage on mount) ──────────

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    (typeof window !== 'undefined' && sessionStorage.getItem(SS_DATE)) || TODAY
  )
  const [calendarExpanded, setCalendarExpanded] = useState<boolean>(() =>
    typeof window !== 'undefined' && sessionStorage.getItem(SS_EXPANDED) === 'true'
  )
  // True when this mount is a navigate-back restore. Never flips — cards keep
  // animation:none for the whole session so they don't re-animate on any re-render.
  // (Changing animation-name from 'none'→'fadeInUp' on an existing DOM node restarts it.)
  const [suppressAnimation] = useState<boolean>(() =>
    typeof window !== 'undefined' && sessionStorage.getItem(SS_SCROLL) !== null
  )

  // ── Refs ──────────────────────────────────────────────────────────────

  const listRef = useRef<HTMLDivElement>(null)
  const dayHeaderRefs = useRef<Map<string, HTMLElement>>(new Map())
  // Set true when list scroll drives selectedDate change → skip counter-scroll
  const isListDriven = useRef(false)
  // Set true during programmatic list scroll → silence the scroll handler
  const isScrollingToDate = useRef(false)
  const rafRef = useRef<number | null>(null)
  // Ensures initial snap runs exactly once per mount
  const snapDoneRef = useRef(false)
  // Ensures the selectedDate useEffect skips the very first render
  const mountedRef = useRef(false)

  // ── Data ──────────────────────────────────────────────────────────────

  const instructor = useMemo(
    () => state.instructors.find(i => i.user_id === state.currentUserId),
    [state.instructors, state.currentUserId]
  )
  const currentUser = useMemo(
    () => state.users.find(u => u.id === state.currentUserId),
    [state.users, state.currentUserId]
  )
  const allLessons = useMemo(
    () => (instructor ? getLessonsForInstructor(instructor.id) : []),
    [instructor, getLessonsForInstructor]
  )
  const lessonDates = useMemo(() => {
    const s = new Set<string>()
    for (const l of allLessons) s.add(l.start_time.substring(0, 10))
    return s
  }, [allLessons])

  const lessonDays = useMemo(() => {
    if (!instructor) return []
    return Array.from(lessonDates)
      .filter(d => d >= RANGE_START && d <= RANGE_END)
      .sort()
      .map(date => ({ date, lessons: getLessonsForInstructor(instructor.id, date) }))
      .filter(d => d.lessons.length > 0)
  }, [lessonDates, instructor, getLessonsForInstructor])

  const selectedLessons = useMemo(
    () => (instructor ? getLessonsForInstructor(instructor.id, selectedDate) : []),
    [instructor, selectedDate, getLessonsForInstructor]
  )
  const totalGuests = useMemo(
    () => selectedLessons.reduce((n, l) => n + getGuestsForLesson(l.id).length, 0),
    [selectedLessons, getGuestsForLesson]
  )

  // ── Persist state ────────────────────────────────────────────────────

  useEffect(() => { sessionStorage.setItem(SS_DATE, selectedDate) }, [selectedDate])
  useEffect(() => { sessionStorage.setItem(SS_EXPANDED, String(calendarExpanded)) }, [calendarExpanded])
  // Save scroll position when leaving the page
  useEffect(() => () => {
    const list = listRef.current
    if (list) sessionStorage.setItem(SS_SCROLL, String(list.scrollTop))
  }, [])

  // ── Core scroll helper ───────────────────────────────────────────────

  /** Scroll the lesson list so `date`'s header is at the top of the visible area */
  const scrollListToDate = useCallback((date: string, behavior: ScrollBehavior = 'smooth') => {
    const el = dayHeaderRefs.current.get(date)
    const list = listRef.current
    if (!el || !list) return
    const elRect = el.getBoundingClientRect()
    const listRect = list.getBoundingClientRect()
    const target = list.scrollTop + (elRect.top - listRect.top)
    if (behavior === 'instant') {
      list.scrollTop = target
    } else {
      isScrollingToDate.current = true
      list.scrollTo({ top: target, behavior: 'smooth' })
      setTimeout(() => { isScrollingToDate.current = false }, 600)
    }
  }, [])

  // ── Initial snap (runs once after first render) ──────────────────────
  //
  // Priority:
  //   1. Restore saved scroll position (returning from a sub-page)
  //   2. Scroll to selectedDate's section (if it has lessons)
  //   3. Snap to the nearest lesson day (if selectedDate has no lessons)

  useEffect(() => {
    if (snapDoneRef.current || lessonDays.length === 0) return
    snapDoneRef.current = true

    // Case 1 — restore saved scroll
    const rawScroll = sessionStorage.getItem(SS_SCROLL)
    if (rawScroll !== null) {
      sessionStorage.removeItem(SS_SCROLL) // consume once
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = Number(rawScroll)
      })
      return
    }

    // Case 2 — selectedDate already has lessons, just scroll there instantly
    if (lessonDays.some(d => d.date === selectedDate)) {
      requestAnimationFrame(() => scrollListToDate(selectedDate, 'instant'))
      return
    }

    // Case 3 — snap to nearest lesson day, update selectedDate to match
    const nearest = lessonDays.reduce((best, curr) => {
      const tD = new Date(curr.date + 'T00:00:00').getTime()
      const tS = new Date(selectedDate + 'T00:00:00').getTime()
      const tB = new Date(best.date + 'T00:00:00').getTime()
      return Math.abs(tD - tS) < Math.abs(tB - tS) ? curr : best
    }, lessonDays[0])

    isListDriven.current = true  // prevent the useEffect below from counter-scrolling
    setSelectedDate(nearest.date)
    requestAnimationFrame(() => scrollListToDate(nearest.date, 'instant'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonDays])  // only re-runs if the lesson data changes

  // ── Calendar-driven selectedDate → scroll list (skip on mount + list-driven) ──

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return  // snap effect handles the initial position
    }
    if (isListDriven.current) {
      isListDriven.current = false
      return
    }
    scrollListToDate(selectedDate, 'smooth')
  }, [selectedDate, scrollListToDate])

  // ── List scroll → update calendar selection ───────────────────────────

  const handleListScroll = useCallback(() => {
    if (isScrollingToDate.current) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const list = listRef.current
      if (!list) return
      const listTop = list.getBoundingClientRect().top
      let topDate: string | null = null
      for (const day of lessonDays) {
        const el = dayHeaderRefs.current.get(day.date)
        if (!el) continue
        if (el.getBoundingClientRect().top - listTop <= 8) topDate = day.date
      }
      if (topDate && topDate !== selectedDate) {
        isListDriven.current = true
        setSelectedDate(topDate)
      }
    })
  }, [lessonDays, selectedDate])

  // ── Render ──────────────────────────────────────────────────────────

  return (
    // Clean full-height flex column — no negative margin hacks.
    // The layout provides max-w-2xl centering; this div owns its own height.
    <div
      className="flex flex-col"
      style={{ height: `calc(100svh - ${NAV_H}px)` }}
    >
      {/* ── Fixed top: header + calendar ── */}
      <div className="flex-none px-4 pt-5">
        <div className="mb-3">
          {/* Row 1: name  ·  date */}
          <div className="flex items-baseline justify-between">
            <h1
              className="text-2xl font-bold text-[#000000]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {currentUser ? `Hi, ${currentUser.name.split(' ')[0]}` : 'Schedule'}
            </h1>
            <span
              key={selectedDate}
              className="text-sm font-semibold text-[#333333]"
              style={{ animation: suppressAnimation ? undefined : 'fadeIn 200ms ease both' }}
            >
              {formatDate(selectedDate)}
            </span>
          </div>

          {/* Row 2: stats  ·  Today button (active only when not on today) */}
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[#666666] text-sm">
              {selectedLessons.length} lesson{selectedLessons.length !== 1 ? 's' : ''}&ensp;·&ensp;
              {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setSelectedDate(TODAY)}
              className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
              style={selectedDate === TODAY ? {
                borderColor: '#CCCCCC',
                color: '#BBBBBB',
                cursor: 'default',
              } : {
                borderColor: '#000000',
                color: '#000000',
                backgroundColor: 'transparent',
              }}
              disabled={selectedDate === TODAY}
              aria-label="Go to today"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar picker + handle overlapping bottom border */}
        <div className="relative mb-6">
          <div className="bg-white border border-[#CCCCCC] rounded-xl px-2 pt-2 pb-3">
            <CalendarPicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              lessonDates={lessonDates}
              rangeStart={RANGE_START}
              rangeEnd={RANGE_END}
              today={TODAY}
              expanded={calendarExpanded}
              instantFirst={suppressAnimation}
            />
          </div>

          {/* Pill handle — straddles the picker's bottom border */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
            <button
              onClick={() => setCalendarExpanded(e => !e)}
              className="flex items-center justify-center h-5 px-5 bg-white border border-[#CCCCCC] rounded-full shadow-sm hover:bg-[#F8F8F8] active:scale-95 transition-all duration-100"
              aria-label={calendarExpanded ? 'Collapse calendar' : 'Expand calendar'}
            >
              <ChevronDown
                className="w-3 h-3 text-[#888888]"
                style={{
                  transition: 'transform 280ms cubic-bezier(0.25, 1, 0.5, 1)',
                  transform: calendarExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable lesson cards ── */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto min-h-0 px-4 pb-6"
        onScroll={handleListScroll}
      >
        {lessonDays.length === 0 ? (
          <div className="pt-4">
            <EmptyState icon={Calendar} title="No lessons" description="No lessons scheduled in this period" />
          </div>
        ) : (
          lessonDays.map(({ date, lessons }) => {
            const isDayToday = date === TODAY
            const isSelected = date === selectedDate
            return (
              {/* Ref lives on the NON-sticky wrapper. A sticky child's
                  getBoundingClientRect() returns its *stuck* position when it
                  is above the viewport, making the scroll target ≈ current
                  scrollTop (no movement). The parent wrapper is never sticky,
                  so its rect is always the natural flow position. */}
              <div
                key={date}
                ref={el => {
                  if (el) dayHeaderRefs.current.set(date, el)
                  else dayHeaderRefs.current.delete(date)
                }}
              >
                {/* Sticky day header — background matches page bg */}
                <div
                  className="sticky top-0 z-10 pt-3 pb-2"
                  style={{ backgroundColor: '#F8F8F8' }}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: isSelected ? '#1E2643' : '#000000',
                        transition: 'color 200ms cubic-bezier(0.25, 1, 0.5, 1)',
                      }}
                    >
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </span>
                    {isDayToday && (
                      <span className="text-[10px] font-bold text-[#FDBE00] uppercase tracking-widest">
                        Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Lesson cards */}
                <div className="space-y-3 pb-4">
                  {lessons.map((lesson, idx) => {
                    const template = getTemplateForLesson(lesson.id)
                    const guests = getGuestsForLesson(lesson.id)
                    const instructors = getInstructorsForLesson(lesson.id)
                    if (!template) return null
                    return (
                      <div
                        key={lesson.id}
                        style={suppressAnimation ? undefined : {
                          animation: `fadeInUp 220ms cubic-bezier(0.25,1,0.5,1) ${idx * 40}ms both`,
                        }}
                      >
                        <LessonCard
                          lesson={lesson}
                          template={template}
                          guestCount={guests.length}
                          instructorNames={instructors
                            .filter(i => i.user_id !== state.currentUserId)
                            .map(i => i.user?.name || 'Unknown')}
                          href={`/instructor/lesson/${lesson.id}`}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
