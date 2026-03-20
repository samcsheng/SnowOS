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
// RoleSwitcher nav is h-14 = 56px
const NAV_HEIGHT = 56

// ── Page ──────────────────────────────────────────────────────────────

export default function InstructorSchedulePage() {
  const {
    state,
    getLessonsForInstructor,
    getGuestsForLesson,
    getInstructorsForLesson,
    getTemplateForLesson,
  } = useData()

  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [calendarExpanded, setCalendarExpanded] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const dayHeaderRefs = useRef<Map<string, HTMLElement>>(new Map())
  // Prevents the useEffect from re-scrolling the list when the list itself drove
  // the selectedDate change (avoids feedback loops)
  const isListDriven = useRef(false)
  // Prevents the list scroll handler from firing during programmatic list scroll
  const isScrollingToDate = useRef(false)
  const rafRef = useRef<number | null>(null)

  // ── Data ───────────────────────────────────────────────────────────

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
      .map(date => ({
        date,
        lessons: getLessonsForInstructor(instructor.id, date),
      }))
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

  // ── Scroll list to a date ─────────────────────────────────────────

  const scrollListToDate = useCallback((date: string, behavior: ScrollBehavior = 'smooth') => {
    const el = dayHeaderRefs.current.get(date)
    const list = listRef.current
    if (!el || !list) return
    const elRect = el.getBoundingClientRect()
    const listRect = list.getBoundingClientRect()
    const targetScrollTop = list.scrollTop + (elRect.top - listRect.top)
    isScrollingToDate.current = true
    list.scrollTo({ top: targetScrollTop, behavior })
    // Clear the guard after scroll completes
    const clearDelay = behavior === 'instant' ? 50 : 600
    setTimeout(() => { isScrollingToDate.current = false }, clearDelay)
  }, [])

  // When selectedDate changes due to a calendar tap → scroll list to that date
  useEffect(() => {
    if (isListDriven.current) {
      // The list scroll caused this state change — don't counter-scroll
      isListDriven.current = false
      return
    }
    scrollListToDate(selectedDate, 'smooth')
  }, [selectedDate, scrollListToDate])

  // On mount: jump to today's section instantly (no loading animation)
  useEffect(() => {
    const t = setTimeout(() => scrollListToDate(TODAY, 'instant'), 80)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── List scroll → update calendar selection ───────────────────────

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
        const elTop = el.getBoundingClientRect().top - listTop
        if (elTop <= 8) topDate = day.date
      }
      if (topDate && topDate !== selectedDate) {
        isListDriven.current = true
        setSelectedDate(topDate)
      }
    })
  }, [lessonDays, selectedDate])

  // ── Render ──────────────────────────────────────────────────────────

  // Break out of the instructor layout's px-4 py-6 and fill the full viewport
  // minus the sticky nav (56px = h-14). Each inner section re-applies its own padding.
  return (
    <div
      className="-mx-4 -my-6 flex flex-col"
      style={{ height: `calc(100dvh - ${NAV_HEIGHT}px)` }}
    >
      {/* ── Fixed top: header + calendar ── */}
      <div className="flex-none px-4 pt-5 pb-0">
        {/* Greeting + stats */}
        <div className="mb-3">
          <h1
            className="text-2xl font-bold text-[#000000]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {currentUser ? `Hi, ${currentUser.name.split(' ')[0]}` : 'Schedule'}
          </h1>
          <p className="text-[#666666] text-sm mt-0.5">
            {selectedLessons.length} lesson{selectedLessons.length !== 1 ? 's' : ''}&ensp;·&ensp;
            {totalGuests} guest{totalGuests !== 1 ? 's' : ''}&ensp;·&ensp;
            <span
              key={selectedDate}
              style={{ animation: 'fadeIn 200ms ease both' }}
            >
              {formatDate(selectedDate)}
            </span>
          </p>
        </div>

        {/* Calendar picker box + handle button overlapping bottom border */}
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
            />
          </div>

          {/* Handle — slim pill straddling the bottom border */}
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
            <EmptyState
              icon={Calendar}
              title="No lessons"
              description="No lessons scheduled in this period"
            />
          </div>
        ) : (
          lessonDays.map(({ date, lessons }) => {
            const isDayToday = date === TODAY
            const isSelected = date === selectedDate
            return (
              <div key={date}>
                {/* Sticky day header */}
                <div
                  ref={el => {
                    if (el) dayHeaderRefs.current.set(date, el)
                    else dayHeaderRefs.current.delete(date)
                  }}
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
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
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
                        style={{
                          animation: `fadeInUp 220ms cubic-bezier(0.25, 1, 0.5, 1) ${idx * 40}ms both`,
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
