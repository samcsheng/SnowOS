'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useData } from '@/app/lib/store/use-data'
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

  const latestLevel = useMemo(() => {
    const withEntries = history.filter(h => h.entry)
    if (withEntries.length === 0) return null
    return withEntries[withEntries.length - 1].entry
  }, [history])

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#000000]" style={{ fontFamily: 'var(--font-heading)' }}>
          Welcome{guestUser ? `, ${guestUser.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-[#666666] text-sm mt-1">
          {guest ? `Room ${guest.room_number}` : ''} &middot; Tomamu
        </p>
      </div>

      {/* Current Level Card — Ultramarine */}
      {latestLevel && (
        <div className="bg-[#1E2643] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#9EAEF4] font-semibold uppercase tracking-widest">Your Level</p>
              <p className="text-lg font-bold text-white mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
                {LEVEL_LABELS[latestLevel.recommended_level] || `Level ${latestLevel.recommended_level}`}
              </p>
            </div>
            <Snowflake className="h-8 w-8 text-[#9EAEF4]" />
          </div>
        </div>
      )}

      {/* Book a Lesson CTA — CM primary */}
      <Link href="/guest/booking">
        <button className="w-full bg-[#FDBE00] text-[#000000] font-semibold rounded-full py-3 mb-6 flex items-center justify-center gap-2 hover:bg-[#f0b400] transition-colors text-base">
          <CalendarPlus className="h-4 w-4" /> Book a Lesson
        </button>
      </Link>

      {/* Upcoming Lessons */}
      <h2 className="text-xs font-semibold text-[#999999] uppercase tracking-widest mb-3">
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
              <div key={lesson.id} className="bg-white rounded-xl border border-[#CCCCCC] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-[#000000]" style={{ fontFamily: 'var(--font-heading)' }}>
                        {template.name}
                      </span>
                      <DisciplineBadge discipline={template.discipline_id} />
                    </div>
                    <p className="text-sm text-[#666666]">
                      {formatDate(lesson.start_time)} &middot; {formatTimeRange(lesson.start_time, lesson.end_time)}
                    </p>
                    {instructors.length > 0 && (
                      <p className="text-xs text-[#999999] mt-1">
                        Instructor: {instructors.map(i => i.user?.name).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-[#999999]">Meet at: {template.location}</p>
                  </div>
                  <StatusBadge status={lesson.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Recent History Preview */}
      {history.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[#999999] uppercase tracking-widest">
              Recent
            </h2>
            <Link href="/guest/history" className="text-xs text-[#000000] font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {[...history].reverse().slice(0, 3).map(({ lesson, template, entry }) => (
              <div key={lesson.id} className="bg-[#F8F8F8] rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-[#000000]">{template.name}</span>
                    <span className="text-xs text-[#666666] ml-2">{formatDate(lesson.start_time)}</span>
                  </div>
                  {entry && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#CCCCCC] text-[#333333]">
                      {LEVEL_LABELS[entry.recommended_level] || `L${entry.recommended_level}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
