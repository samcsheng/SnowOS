'use client'

import { use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { StatusBadge } from '@/app/components/status-badge'
import { formatDate, formatTimeRange } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import { ArrowLeft, User, DoorOpen, History } from 'lucide-react'

export default function GuestProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { state, getGuestHistory } = useData()

  const guest = useMemo(() => state.guests.find(g => g.id === id), [state.guests, id])
  const guestUser = useMemo(() => {
    if (!guest?.user_id) return null
    return state.users.find(u => u.id === guest.user_id)
  }, [guest, state.users])
  const history = useMemo(() => guest ? getGuestHistory(guest.id) : [], [guest, getGuestHistory])

  if (!guest) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Guest not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    )
  }

  // Get most recent recommended level from reports
  const reportedHistory = history.filter(h => h.entry)
  const latestEntry = reportedHistory.length > 0 ? reportedHistory[reportedHistory.length - 1].entry : null

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Guest Profile</h1>
      </div>

      {/* Guest Info Card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-semibold">
              {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{guest.first_name} {guest.last_name}</h2>
              {guestUser && <p className="text-sm text-muted-foreground">{guestUser.email}</p>}
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Room</span>
              <span className="font-medium">{guest.room_number}</span>
            </div>
            {latestEntry && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Level</span>
                <Badge variant="secondary">{LEVEL_LABELS[latestEntry.recommended_level] || `L${latestEntry.recommended_level}`}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lesson History */}
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Lesson History ({history.length})
        </h2>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No lesson history yet</p>
      ) : (
        <div className="space-y-3">
          {[...history].reverse().map(({ lesson, template, entry }) => (
            <Card key={lesson.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{template.name}</span>
                      <DisciplineBadge discipline={template.discipline_id} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(lesson.start_time)} &middot; {formatTimeRange(lesson.start_time, lesson.end_time)}
                    </p>
                  </div>
                  <StatusBadge status={lesson.status} />
                </div>
                {entry && (
                  <div className="mt-2 pt-2 border-t text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-muted-foreground">Recommended:</span>
                      <Badge variant="outline">{LEVEL_LABELS[entry.recommended_level] || `L${entry.recommended_level}`}</Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">{entry.progress_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
