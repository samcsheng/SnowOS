'use client'

import { use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { Button } from '@/components/ui/button'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { StatusBadge } from '@/app/components/status-badge'
import { formatDate, formatTimeRange } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import { ArrowLeft, DoorOpen, History } from 'lucide-react'

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
        <p className="text-[#666666]">Guest not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4 rounded-full">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    )
  }

  const reportedHistory = history.filter(h => h.entry)
  const latestEntry = reportedHistory.length > 0 ? reportedHistory[reportedHistory.length - 1].entry : null

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-[#CCCCCC] flex items-center justify-center hover:bg-[#F8F8F8] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#000000]" />
        </button>
        <h1 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'var(--font-heading)' }}>
          Guest Profile
        </h1>
      </div>

      {/* Guest Info Card */}
      <div className="bg-white rounded-xl border border-[#CCCCCC] p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FDBE00] text-[#000000] flex items-center justify-center text-xl font-bold">
            {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#000000]" style={{ fontFamily: 'var(--font-heading)' }}>
              {guest.first_name} {guest.last_name}
            </h2>
            {guestUser && <p className="text-sm text-[#666666]">{guestUser.email}</p>}
          </div>
        </div>
        <div className="h-px bg-[#CCCCCC] my-4" />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4 text-[#999999]" />
            <span className="text-[#666666]">Room</span>
            <span className="font-semibold text-[#000000]">{guest.room_number}</span>
          </div>
          {latestEntry && (
            <div className="flex items-center gap-2">
              <span className="text-[#666666]">Level</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F8F8F8] border border-[#CCCCCC] text-[#000000]">
                {LEVEL_LABELS[latestEntry.recommended_level] || `L${latestEntry.recommended_level}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lesson History */}
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-[#999999]" />
        <h2 className="text-xs font-semibold text-[#999999] uppercase tracking-widest">
          Lesson History ({history.length})
        </h2>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-[#999999] text-center py-6">No lesson history yet</p>
      ) : (
        <div className="space-y-3">
          {[...history].reverse().map(({ lesson, template, entry }) => (
            <div key={lesson.id} className="bg-white rounded-xl border border-[#CCCCCC] p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[#000000]">{template.name}</span>
                    <DisciplineBadge discipline={template.discipline_id} />
                  </div>
                  <p className="text-xs text-[#666666] mt-0.5">
                    {formatDate(lesson.start_time)} &middot; {formatTimeRange(lesson.start_time, lesson.end_time)}
                  </p>
                </div>
                <StatusBadge status={lesson.status} />
              </div>
              {entry && (
                <div className="mt-2 pt-2 border-t border-[#CCCCCC] text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#666666]">Recommended:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#CCCCCC] text-[#333333]">
                      {LEVEL_LABELS[entry.recommended_level] || `L${entry.recommended_level}`}
                    </span>
                  </div>
                  <p className="text-[#666666] text-xs">{entry.progress_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
