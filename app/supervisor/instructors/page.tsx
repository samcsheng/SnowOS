'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { getToday } from '@/app/lib/utils/date-helpers'
import { ArrowLeft } from 'lucide-react'

const DISCIPLINE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'ski', label: 'Ski' },
  { value: 'snowboard', label: 'Snowboard' },
]

export default function InstructorPoolPage() {
  const router = useRouter()
  const { state, getLessonsForInstructor } = useData()
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all')

  const today = getToday()

  const instructorPool = useMemo(() => {
    return state.instructors.map(inst => {
      const user = state.users.find(u => u.id === inst.user_id)
      const todayLessons = getLessonsForInstructor(inst.id, today)
      const activeLessons = todayLessons.filter(l => l.status === 'in_progress')
      const status = activeLessons.length > 0 ? 'teaching' : todayLessons.length > 0 ? 'assigned' : 'available'
      return { ...inst, user, todayLessons, status }
    })
  }, [state.instructors, state.users, getLessonsForInstructor, today])

  const filtered = useMemo(() => {
    if (disciplineFilter === 'all') return instructorPool
    return instructorPool.filter(i => i.discipline === disciplineFilter)
  }, [instructorPool, disciplineFilter])

  const grouped = useMemo(() => ({
    teaching: filtered.filter(i => i.status === 'teaching'),
    assigned: filtered.filter(i => i.status === 'assigned'),
    available: filtered.filter(i => i.status === 'available'),
  }), [filtered])

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-[#CCCCCC] flex items-center justify-center hover:bg-[#F8F8F8] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#000000]" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#000000]" style={{ fontFamily: 'var(--font-heading)' }}>
            Instructor Pool
          </h1>
          <p className="text-sm text-[#666666]">{state.instructors.length} instructors</p>
        </div>

        {/* CM discipline filter pills */}
        <div className="flex gap-2">
          {DISCIPLINE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setDisciplineFilter(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                disciplineFilter === value
                  ? 'bg-[#FDBE00] border-[#FDBE00] text-[#000000]'
                  : 'bg-white border-[#CCCCCC] text-[#333333] hover:border-[#000000]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {grouped.teaching.length > 0 && (
        <Section title="Teaching Now" count={grouped.teaching.length} dotColor="bg-[#FDBE00]">
          {grouped.teaching.map(inst => <InstructorCard key={inst.id} inst={inst} />)}
        </Section>
      )}

      {grouped.assigned.length > 0 && (
        <Section title="Assigned Today" count={grouped.assigned.length} dotColor="bg-[#1E2643]">
          {grouped.assigned.map(inst => <InstructorCard key={inst.id} inst={inst} />)}
        </Section>
      )}

      <Section title="Available" count={grouped.available.length} dotColor="bg-[#088A20]">
        {grouped.available.length === 0 ? (
          <p className="text-sm text-[#999999] py-4 text-center col-span-3">All instructors are assigned</p>
        ) : (
          grouped.available.map(inst => <InstructorCard key={inst.id} inst={inst} />)
        )}
      </Section>
    </div>
  )
}

function Section({ title, count, dotColor, children }: {
  title: string
  count: number
  dotColor: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <h2 className="text-xs font-semibold text-[#999999] uppercase tracking-widest">{title}</h2>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F8F8F8] border border-[#CCCCCC] text-[#333333]">
          {count}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  )
}

function InstructorCard({ inst }: {
  inst: {
    id: string
    discipline: string
    max_teaching_level: number
    user?: { name: string } | null
    todayLessons: { id: string }[]
    status: string
  }
}) {
  return (
    <div className="bg-white rounded-xl border border-[#CCCCCC] p-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#FDBE00] flex items-center justify-center text-sm font-bold text-[#000000]">
          {inst.user?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#000000] truncate">{inst.user?.name || 'Unknown'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <DisciplineBadge discipline={inst.discipline} />
            <span className="text-xs text-[#666666]">Max L{inst.max_teaching_level}</span>
          </div>
        </div>
        {inst.todayLessons.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-[#CCCCCC] text-[#333333] whitespace-nowrap">
            {inst.todayLessons.length}L
          </span>
        )}
      </div>
    </div>
  )
}
