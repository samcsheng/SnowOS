'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useData } from '@/app/lib/store/use-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { StatusBadge } from '@/app/components/status-badge'
import { EmptyState } from '@/app/components/empty-state'
import { formatDate, formatTimeRange, getToday } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import { CalendarPlus, Snowflake, Calendar } from 'lucide-react'

export default function GuestDashboardPage() {
  const { state, getLessonsForGuest, getTemplateForLesson, getInstructorsForLesson, getGuestHistory } = useData()

  const guest = useMemo(() => {
    const user = state.users.find(u => u.id === state.currentUserId)
    if (!user) return null
    return state.guests.find(g => g.user_id === user.id)
  }, [state.users, state.guests, state.currentUserId])

  const guestUser = state.users.find(u => u.id === state.currentUserId)

  const upcomingLessons = useMemo(() => {
    if (!guest) return []
    const today = getToday()
    return getLessonsForGuest(guest.id).filter(l =>
      l.start_time >= today && (l.status === 'scheduled' || l.status === 'in_progress')
    )
  }, [guest, getLessonsForGuest])

  const history = useMemo(() => {
    if (!guest) return []
    return getGuestHistory(guest.id)
  }, [guest, getGuestHistory])

  // Latest recommended level
  const latestLevel = useMemo(() => {
    const withEntries = history.filter(h => h.entry)
    if (withEntries.length === 0) return null
    return withEntries[withEntries.length - 1].entry
  }, [history])

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Welcome{guestUser ? `, ${guestUser.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {guest ? `Room ${guest.room_number}` : ''} &middot; Tomamu
        </p>
      </div>

      {/* Current Level Card */}
      {latestLevel && (
        <Card className="mb-6 bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-sky-600 font-medium uppercase tracking-wide">Your Level</p>
                <p className="text-lg font-bold text-sky-900">
                  {LEVEL_LABELS[latestLevel.recommended_level] || `Level ${latestLevel.recommended_level}`}
                </p>
              </div>
              <Snowflake className="h-8 w-8 text-sky-300" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Book */}
      <Link href="/guest/booking">
        <Button className="w-full mb-6" size="lg">
          <CalendarPlus className="h-4 w-4 mr-2" /> Book a Lesson
        </Button>
      </Link>

      {/* Upcoming Lessons */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Upcoming ({upcomingLessons.length})
      </h2>

      {upcomingLessons.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No upcoming lessons"
          description="Book a lesson to get started!"
        />
      ) : (
        <div className="space-y-3 mb-6">
          {upcomingLessons.map(lesson => {
            const template = getTemplateForLesson(lesson.id)
            const instructors = getInstructorsForLesson(lesson.id)
            if (!template) return null
            return (
              <Card key={lesson.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{template.name}</span>
                        <DisciplineBadge discipline={template.discipline_id} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(lesson.start_time)} &middot; {formatTimeRange(lesson.start_time, lesson.end_time)}
                      </p>
                      {instructors.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Instructor: {instructors.map(i => i.user?.name).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Meet at: {template.location}</p>
                    </div>
                    <StatusBadge status={lesson.status} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Recent History Preview */}
      {history.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Recent
            </h2>
            <Link href="/guest/history" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {[...history].reverse().slice(0, 3).map(({ lesson, template, entry }) => (
              <Card key={lesson.id} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{formatDate(lesson.start_time)}</span>
                    </div>
                    {entry && (
                      <Badge variant="outline">{LEVEL_LABELS[entry.recommended_level] || `L${entry.recommended_level}`}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
