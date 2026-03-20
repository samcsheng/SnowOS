'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/app/lib/store/use-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  // Already booked lesson IDs for this guest
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
      // Check capacity
      if (template.max_capacity) {
        const guests = getGuestsForLesson(lesson.id)
        if (guests.length >= template.max_capacity) return false
      }
      return true
    })
  }, [selectedDate, getLessonsForDate, getTemplateForLesson, getGuestsForLesson])

  // Date options: today + next 4 days
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
      <h1 className="text-2xl font-bold mb-1">Book a Lesson</h1>
      <p className="text-sm text-muted-foreground mb-6">Browse available lessons and book your spot</p>

      {/* Date Selection */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {dateOptions.map(date => {
          const d = new Date(date + 'T00:00:00')
          const isSelected = date === selectedDate
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center min-w-[56px] px-3 py-2 rounded-lg text-sm transition-colors ${
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <span className="text-xs font-medium">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold">{d.getDate()}</span>
            </button>
          )
        })}
      </div>

      {/* Available Lessons */}
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
              <Card key={lesson.id} className={isBooked ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{template.name}</span>
                        <DisciplineBadge discipline={template.discipline_id} />
                        {template.level_numeric && (
                          <Badge variant="outline" className="text-xs">
                            {LEVEL_LABELS[template.level_numeric] || `L${template.level_numeric}`}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeRange(lesson.start_time, lesson.end_time)} &middot; {template.location}
                      </p>
                      {instructors.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {instructors.map(i => i.user?.name).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {guests.length}{template.max_capacity ? `/${template.max_capacity}` : ''} booked
                      </p>
                    </div>
                    {isBooked ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Check className="h-3 w-3 mr-1" /> Booked
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleBook(lesson.id)}>
                        Book
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
