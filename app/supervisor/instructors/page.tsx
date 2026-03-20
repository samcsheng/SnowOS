'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getToday } from '@/app/lib/utils/date-helpers'
import { ArrowLeft, User } from 'lucide-react'

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

  const grouped = useMemo(() => {
    const teaching = filtered.filter(i => i.status === 'teaching')
    const assigned = filtered.filter(i => i.status === 'assigned')
    const available = filtered.filter(i => i.status === 'available')
    return { teaching, assigned, available }
  }, [filtered])

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Instructor Pool</h1>
          <p className="text-sm text-muted-foreground">{state.instructors.length} instructors</p>
        </div>
        <Select value={disciplineFilter} onValueChange={(v) => v && setDisciplineFilter(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ski">Ski</SelectItem>
            <SelectItem value="snowboard">Snowboard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teaching Now */}
      {grouped.teaching.length > 0 && (
        <Section title="Teaching Now" count={grouped.teaching.length} color="yellow">
          {grouped.teaching.map(inst => (
            <InstructorCard key={inst.id} inst={inst} />
          ))}
        </Section>
      )}

      {/* Assigned Today */}
      {grouped.assigned.length > 0 && (
        <Section title="Assigned Today" count={grouped.assigned.length} color="blue">
          {grouped.assigned.map(inst => (
            <InstructorCard key={inst.id} inst={inst} />
          ))}
        </Section>
      )}

      {/* Available */}
      <Section title="Available" count={grouped.available.length} color="green">
        {grouped.available.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">All instructors are assigned</p>
        ) : (
          grouped.available.map(inst => (
            <InstructorCard key={inst.id} inst={inst} />
          ))
        )}
      </Section>
    </div>
  )
}

function Section({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
  }
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h2>
        <Badge variant="secondary" className={colorMap[color]}>{count}</Badge>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  )
}

function InstructorCard({ inst }: { inst: { id: string; discipline: string; max_teaching_level: number; user?: { name: string } | null; todayLessons: { id: string }[]; status: string } }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
            {inst.user?.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{inst.user?.name || 'Unknown'}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <DisciplineBadge discipline={inst.discipline} />
              <span className="text-xs text-muted-foreground">Max L{inst.max_teaching_level}</span>
            </div>
          </div>
          {inst.todayLessons.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {inst.todayLessons.length} lesson{inst.todayLessons.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
