'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useData } from '@/app/lib/store/use-data'
import { LessonCard } from '@/app/components/lesson-card'
import { EmptyState } from '@/app/components/empty-state'
import { CalendarPicker } from './components/calendar-picker'
import { Calendar } from 'lucide-react'
import { getToday, formatDate } from '@/app/lib/utils/date-helpers'

// ── Calendar date range for testing ──────────────────────────────────

const RANGE_START = '2025-11-01'
const RANGE_END = '2026-05-15'
const TODAY = getToday()

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

  const listRef = useRef<HTMLDivElement>(null)
  const dayHeaderRefs = useRef<Map<string, HTMLElement>>(new Map())
  const isProg = useRef(false) // guard against scroll→select→scroll loops
  const listScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Data ───────────────────────────────────────────────────────────

  const instructor = useMemo(
    () => state.instructors.find(i => i.user_id === state.currentUserId),
    [state.instructors, state.currentUserId]
  )

  const currentUser = useMemo(
    () => state.users.find(u => u.id === state.currentUserId),
    [state.users, state.currentUserId]
  )

  // All instructor lessons (unfiltered) for building the lesson-date index
  const allLessons = useMemo(
    () => (instructor ? getLessonsForInstructor(instructor.id) : []),
    [instructor, getLessonsForInstructor]
  )

  // Set of YYYY-MM-DD dates that have lessons
  const lessonDates = useMemo(() => {
    const s = new Set<string>()
    for (const l of allLessons) {
      s.add(l.start_time.substring(0, 10))
    }
    return s
  }, [allLessons])

  // Sorted list of days (with their lessons) in range that have ≥1 lesson
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

  // Lessons for the currently selected date (for the stats line)
  const selectedLessons = useMemo(
    () => (instructor ? getLessonsForInstructor(instructor.id, selectedDate) : []),
    [instructor, selectedDate, getLessonsForInstructor]
  )

  const totalGuests = useMemo(
    () => selectedLessons.reduce((n, l) => n + getGuestsForLesson(l.id).length, 0),
    [selectedLessons, getGuestsForLesson]
  )

  // ── Scroll to date in lesson list ──────────────────────────────────

  const scrollListToDate = useCallback((date: string) => {
    const el = dayHeaderRefs.current.get(date)
    const list = listRef.current
    if (!el || !list) return
    const elRect = el.getBoundingClientRect()
    const listRect = list.getBoundingClientRect()
    const targetScrollTop = list.scrollTop + (elRect.top - listRect.top)
    isProg.current = true
    list.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
    setTimeout(() => { isProg.current = false }, 600)
  }, [])

  // When selectedDate changes (from calendar tap), scroll list
  useEffect(() => {
    scrollListToDate(selectedDate)
  }, [selectedDate, scrollListToDate])

  // Initial scroll after mount (DOM needs to render first)
  useEffect(() => {
    const t = setTimeout(() => scrollListToDate(selectedDate), 120)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally only on mount

  // ── List scroll → update calendar selected date ────────────────────

  const handleListScroll = useCallback(() => {
    if (isProg.current) return
    if (listScrollTimer.current) clearTimeout(listScrollTimer.current)
    listScrollTimer.current = setTimeout(() => {
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
        setSelectedDate(topDate)
      }
    }, 40)
  }, [lessonDays, selectedDate])

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
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
            {formatDate(selectedDate)}
          </p>
        </div>

        {/* Calendar picker */}
        <div className="bg-white border border-[#CCCCCC] rounded-xl px-2 pt-2 pb-1 mb-2">
          <CalendarPicker
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            lessonDates={lessonDates}
            rangeStart={RANGE_START}
            rangeEnd={RANGE_END}
            today={TODAY}
          />
        </div>
      </div>

      {/* ── Scrollable lesson cards (scrollbar visible) ── */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 pb-6"
        onScroll={handleListScroll}
      >
        {lessonDays.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              icon={Calendar}
              title="No lessons"
              description="No lessons scheduled in this period"
            />
          </div>
        ) : (
          lessonDays.map(({ date, lessons }) => {
            const isToday = date === TODAY
            const isSelected = date === selectedDate
            return (
              <div key={date}>
                {/* Day header */}
                <div
                  ref={el => {
                    if (el) dayHeaderRefs.current.set(date, el)
                    else dayHeaderRefs.current.delete(date)
                  }}
                  className="pt-4 pb-2 bg-white"
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-sm font-bold ${isSelected ? 'text-[#1E2643]' : 'text-[#000000]'}`}
                    >
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold text-[#FDBE00] uppercase tracking-widest">
                        Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Lesson cards */}
                <div className="space-y-3 pb-4">
                  {lessons.map(lesson => {
                    const template = getTemplateForLesson(lesson.id)
                    const guests = getGuestsForLesson(lesson.id)
                    const instructors = getInstructorsForLesson(lesson.id)
                    if (!template) return null
                    return (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        template={template}
                        guestCount={guests.length}
                        instructorNames={instructors
                          .filter(i => i.user_id !== state.currentUserId)
                          .map(i => i.user?.name || 'Unknown')}
                        href={`/instructor/lesson/${lesson.id}`}
                      />
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
