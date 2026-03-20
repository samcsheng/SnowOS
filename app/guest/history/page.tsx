'use client'

import { useMemo } from 'react'
import { useData } from '@/app/lib/store/use-data'
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
      <h1 className="text-2xl font-bold text-[#000000] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
        Lesson History
      </h1>
      <p className="text-sm text-[#666666] mb-6">{history.length} lessons</p>

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
              <div key={lesson.id} className="bg-white rounded-xl border border-[#CCCCCC] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#000000]" style={{ fontFamily: 'var(--font-heading)' }}>
                        {template.name}
                      </span>
                      <DisciplineBadge discipline={template.discipline_id} />
                    </div>
                    <p className="text-xs text-[#666666] mt-0.5">
                      {formatDate(lesson.start_time)} &middot; {formatTimeRange(lesson.start_time, lesson.end_time)}
                    </p>
                  </div>
                  <StatusBadge status={lesson.status} />
                </div>

                {instructors.length > 0 && (
                  <p className="text-xs text-[#999999] mb-2">
                    Instructor: {instructors.map(i => i.user?.name).join(', ')}
                  </p>
                )}

                {entry && (
                  <div className="mt-2 pt-2 border-t border-[#F8F8F8]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#666666]">Level:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#CCCCCC] text-[#333333]">
                        {LEVEL_LABELS[entry.recommended_level] || `L${entry.recommended_level}`}
                      </span>
                    </div>
                    <p className="text-sm text-[#666666]">{entry.progress_notes}</p>
                  </div>
                )}

                {report && report.terrain_skied.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {report.terrain_skied.map(t => (
                      <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F8F8F8] border border-[#CCCCCC] text-[#333333]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
