'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/app/lib/store/use-data'
import { LessonCard } from '@/app/components/lesson-card'
import { EmptyState } from '@/app/components/empty-state'
import { Calendar } from 'lucide-react'
import { getToday, addDays, formatDate } from '@/app/lib/utils/date-helpers'

export default function InstructorSchedulePage() {
  const { state, getLessonsForInstructor, getGuestsForLesson, getInstructorsForLesson, getTemplateForLesson } = useData()
  const [selectedDate, setSelectedDate] = useState(getToday())

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

  const dates = useMemo(() => {
    const today = getToday()
    return Array.from({ length: 7 }, (_, i) => addDays(today, i - 2))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#000000]" style={{ fontFamily: 'var(--font-heading)' }}>
          {currentUser ? `Hi, ${currentUser.name.split(' ')[0]}` : 'Schedule'}
        </h1>
        <p className="text-[#666666] text-sm mt-1">
          {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} &middot; {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
        </p>
      </div>

      {/* CM Tab-style Date Picker */}
      <div className="bg-[#F8F8F8] rounded-xl p-2 flex gap-1 mb-6 overflow-x-auto">
        {dates.map(date => {
          const d = new Date(date + 'T00:00:00')
          const isSelected = date === selectedDate
          const isToday = date === getToday()
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center min-w-[52px] px-3 py-2 rounded-full text-sm transition-colors flex-shrink-0 ${
                isSelected
                  ? 'bg-[#000000] text-white'
                  : 'text-[#333333] hover:bg-[#000000]/10'
              }`}
            >
              <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#666666]'}`}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-base font-bold">{d.getDate()}</span>
              {isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-[#FDBE00] mt-0.5" />
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
