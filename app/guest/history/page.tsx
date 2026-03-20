'use client'

import { useMemo } from 'react'
import { useData } from '@/app/lib/store/use-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { StatusBadge } from '@/app/components/status-badge'
import { EmptyState } from '@/app/components/empty-state'
import { formatDate, formatTimeRange } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import { History } from 'lucide-react'

export default function GuestHistoryPage() {
  const { state, getGuestHistory, getInstructorsForLesson } = useData()

  const guest = useMemo(() => {
    const user = state.users.find(u => u.id === state.currentUserId)
    if (!user) return null
    return state.guests.find(g => g.user_id === user.id)
  }, [state.users, state.guests, state.currentUserId])

  const history = useMemo(() => {
    if (!guest) return []
    return getGuestHistory(guest.id)
  }, [guest, getGuestHistory])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Lesson History</h1>
      <p className="text-sm text-muted-foreground mb-6">{history.length} lessons</p>

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No lessons yet"
          description="Book your first lesson to start tracking your progress"
        />
      ) : (
        <div className="space-y-3">
          {[...history].reverse().map(({ lesson, template, report, entry }) => {
            const instructors = getInstructorsForLesson(lesson.id)
            return (
              <Card key={lesson.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{template.name}</span>
                        <DisciplineBadge discipline={template.discipline_id} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(lesson.start_time)} &middot; {formatTimeRange(lesson.start_time, lesson.end_time)}
                      </p>
                    </div>
                    <StatusBadge status={lesson.status} />
                  </div>

                  {instructors.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Instructor: {instructors.map(i => i.user?.name).join(', ')}
                    </p>
                  )}

                  {entry && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Level:</span>
                        <Badge variant="outline" className="text-xs">
                          {LEVEL_LABELS[entry.recommended_level] || `L${entry.recommended_level}`}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.progress_notes}</p>
                    </div>
                  )}

                  {report && report.terrain_skied.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {report.terrain_skied.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
