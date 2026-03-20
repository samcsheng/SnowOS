'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/app/lib/store/use-data'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { EmptyState } from '@/app/components/empty-state'
import { getToday, addDays, formatDate, formatTimeRange } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import { CalendarOff, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function BookingPage() {
  const { state, getLessonsForDate, getGuestsForLesson, getInstructorsForLesson, getTemplateForLesson, createBooking } = useData()
  const [selectedDate, setSelectedDate] = useState(getToday())

  const guest = useMemo(() => {
    const user = state.users.find(u => u.id === state.currentUserId)
    if (!user) return null
    return state.guests.find(g => g.user_id === user.id)
  }, [state.users, state.guests, state.currentUserId])

  const bookedLessonIds = useMemo(() => {
    if (!guest) return new Set<string>()
    return new Set(
      state.bookings
        .filter(b => b.guest_id === guest.id && b.booking_status === 'active')
        .map(b => b.lesson_id)
    )
  }, [guest, state.bookings])

  const availableLessons = useMemo(() => {
    return getLessonsForDate(selectedDate).filter(lesson => {
      if (lesson.status !== 'scheduled') return false
      const template = getTemplateForLesson(lesson.id)
      if (!template) return false
      if (template.max_capacity) {
        const guests = getGuestsForLesson(lesson.id)
        if (guests.length >= template.max_capacity) return false
      }
      return true
    })
  }, [selectedDate, getLessonsForDate, getTemplateForLesson, getGuestsForLesson])

  const dateOptions = useMemo(() => {
    const today = getToday()
    return Array.from({ length: 5 }, (_, i) => addDays(today, i))
  }, [])

  function handleBook(lessonId: string) {
    if (!guest) return
    createBooking(lessonId, guest.id)
    toast.success('Lesson booked!')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#000000] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
        Book a Lesson
      </h1>
      <p className="text-sm text-[#666666] mb-6">Browse available lessons and book your spot</p>

      {/* CM Tab date picker */}
      <div className="bg-[#F8F8F8] rounded-xl p-1.5 flex gap-1 mb-6 overflow-x-auto">
        {dateOptions.map(date => {
          const d = new Date(date + 'T00:00:00')
          const isSelected = date === selectedDate
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
            </button>
          )
        })}
      </div>

      {availableLessons.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="No available lessons"
          description={`No open lessons for ${formatDate(selectedDate)}`}
        />
      ) : (
        <div className="space-y-3">
          {availableLessons.map(lesson => {
            const template = getTemplateForLesson(lesson.id)
            const guests = getGuestsForLesson(lesson.id)
            const instructors = getInstructorsForLesson(lesson.id)
            const isBooked = bookedLessonIds.has(lesson.id)
            if (!template) return null

            return (
              <div key={lesson.id} className={`bg-white rounded-xl border border-[#CCCCCC] p-4 ${isBooked ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-[#000000]" style={{ fontFamily: 'var(--font-heading)' }}>
                        {template.name}
                      </span>
                      <DisciplineBadge discipline={template.discipline_id} />
                      {template.level_numeric && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#CCCCCC] text-[#333333]">
                          {LEVEL_LABELS[template.level_numeric] || `L${template.level_numeric}`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#666666]">
                      {formatTimeRange(lesson.start_time, lesson.end_time)} &middot; {template.location}
                    </p>
                    {instructors.length > 0 && (
                      <p className="text-xs text-[#999999] mt-1">
                        {instructors.map(i => i.user?.name).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-[#999999] mt-0.5">
                      {guests.length}{template.max_capacity ? `/${template.max_capacity}` : ''} booked
                    </p>
                  </div>
                  {isBooked ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#088A20] text-white">
                      <Check className="h-3 w-3 mr-1" /> Booked
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBook(lesson.id)}
                      className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#FDBE00] text-[#000000] hover:bg-[#f0b400] transition-colors"
                    >
                      Book
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
