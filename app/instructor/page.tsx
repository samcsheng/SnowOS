'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/app/lib/store/use-data'
import { LessonCard } from '@/app/components/lesson-card'
import { EmptyState } from '@/app/components/empty-state'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { getToday, addDays, formatDate } from '@/app/lib/utils/date-helpers'

export default function InstructorSchedulePage() {
  const { state, getLessonsForInstructor, getGuestsForLesson, getInstructorsForLesson, getTemplateForLesson } = useData()
  const [selectedDate, setSelectedDate] = useState(getToday())

  // Find the instructor record for the current user
  const instructor = useMemo(() => {
    return state.instructors.find(i => i.user_id === state.currentUserId)
  }, [state.instructors, state.currentUserId])

  const lessons = useMemo(() => {
    if (!instructor) return []
    return getLessonsForInstructor(instructor.id, selectedDate)
  }, [instructor, selectedDate, getLessonsForInstructor])

  const currentUser = state.users.find(u => u.id === state.currentUserId)
  const totalGuests = useMemo(() => {
    return lessons.reduce((sum, l) => sum + getGuestsForLesson(l.id).length, 0)
  }, [lessons, getGuestsForLesson])

  // Date navigation
  const dates = useMemo(() => {
    const today = getToday()
    return Array.from({ length: 7 }, (_, i) => addDays(today, i - 2))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {currentUser ? `Hi, ${currentUser.name.split(' ')[0]}` : 'Schedule'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} &middot; {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Date Picker */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {dates.map(date => {
          const d = new Date(date + 'T00:00:00')
          const isSelected = date === selectedDate
          const isToday = date === getToday()
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center min-w-[56px] px-3 py-2 rounded-lg text-sm transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <span className="text-xs font-medium">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold">{d.getDate()}</span>
              {isToday && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* Lesson List */}
      <div className="space-y-3">
        {lessons.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No lessons"
            description={`No lessons scheduled for ${formatDate(selectedDate)}`}
          />
        ) : (
          lessons.map(lesson => {
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
          })
        )}
      </div>
    </div>
  )
}
