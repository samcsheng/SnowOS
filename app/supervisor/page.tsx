'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useData } from '@/app/lib/store/use-data'
import { StatusBadge } from '@/app/components/status-badge'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatTime, getToday, formatFullDate, addDays } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import { Calendar, Users, UserCheck, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { LessonStatus } from '@/app/lib/types'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'reported', label: 'Reported' },
]

export default function SupervisorDashboardPage() {
  const { state, getLessonsForDate, getGuestsForLesson, getInstructorsForLesson, getTemplateForLesson } = useData()
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const lessons = useMemo(() => getLessonsForDate(selectedDate), [selectedDate, getLessonsForDate])

  const filteredLessons = useMemo(() => {
    if (statusFilter === 'all') return lessons
    return lessons.filter(l => l.status === statusFilter)
  }, [lessons, statusFilter])

  const stats = useMemo(() => {
    const byStatus = { scheduled: 0, in_progress: 0, completed: 0, reported: 0 }
    let totalGuests = 0
    let flagged = 0

    for (const lesson of lessons) {
      byStatus[lesson.status as LessonStatus]++
      const guests = getGuestsForLesson(lesson.id)
      totalGuests += guests.length
      const instructors = getInstructorsForLesson(lesson.id)
      const template = getTemplateForLesson(lesson.id)
      if (instructors.length > 0 && guests.length / instructors.length > 8) flagged++
      if (instructors.length === 0 && template?.lesson_type !== 'Private') flagged++
    }
    return { ...byStatus, totalGuests, flagged, total: lessons.length }
  }, [lessons, getGuestsForLesson, getInstructorsForLesson, getTemplateForLesson])

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#000000]" style={{ fontFamily: 'var(--font-heading)' }}>
            Dashboard
          </h1>
          <p className="text-[#666666] text-sm">{formatFullDate(selectedDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="w-9 h-9 rounded-full border border-[#CCCCCC] flex items-center justify-center hover:bg-[#F8F8F8] transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-[#000000]" />
          </button>
          <button
            onClick={() => setSelectedDate(getToday())}
            className="px-4 py-1.5 rounded-full border border-[#CCCCCC] text-sm font-semibold text-[#000000] hover:bg-[#F8F8F8] transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="w-9 h-9 rounded-full border border-[#CCCCCC] flex items-center justify-center hover:bg-[#F8F8F8] transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-[#000000]" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {[
          { icon: Calendar, value: stats.total, label: 'Total', color: '' },
          { icon: null, value: stats.scheduled, label: 'Scheduled', color: 'text-[#1E2643]' },
          { icon: null, value: stats.in_progress, label: 'In Progress', color: 'text-[#FDBE00]' },
          { icon: null, value: stats.completed + stats.reported, label: 'Done', color: 'text-[#088A20]' },
          { icon: Users, value: stats.totalGuests, label: 'Guests', color: '' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#CCCCCC] p-4 text-center">
            {Icon && <Icon className="h-5 w-5 mx-auto mb-1 text-[#999999]" />}
            <p className={`text-2xl font-bold ${color || 'text-[#000000]'}`}>{value}</p>
            <p className="text-xs text-[#666666]">{label}</p>
          </div>
        ))}
        {stats.flagged > 0 && (
          <div className="bg-white rounded-xl border border-[#C75300]/30 p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-[#C75300]" />
            <p className="text-2xl font-bold text-[#C75300]">{stats.flagged}</p>
            <p className="text-xs text-[#C75300]">Flagged</p>
          </div>
        )}
      </div>

      {/* Filter Bar — CM pill filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              statusFilter === value
                ? 'bg-[#FDBE00] border-[#FDBE00] text-[#000000]'
                : 'bg-white border-[#CCCCCC] text-[#333333] hover:border-[#000000]'
            }`}
          >
            {statusFilter === value && <span className="mr-1">✓</span>}
            {label}
          </button>
        ))}
        <Link href="/supervisor/instructors">
          <button className="ml-auto px-4 py-1.5 rounded-full text-sm font-semibold border border-[#000000] bg-white text-[#000000] hover:bg-[#F8F8F8] transition-colors flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5" /> Instructor Pool
          </button>
        </Link>
      </div>

      {/* Lessons Table */}
      <div className="bg-white rounded-xl border border-[#CCCCCC] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#CCCCCC] bg-[#F8F8F8]">
                <TableHead className="font-semibold text-[#333333]">Time</TableHead>
                <TableHead className="font-semibold text-[#333333]">Lesson</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-[#333333]">Type</TableHead>
                <TableHead className="font-semibold text-[#333333]">Instructor</TableHead>
                <TableHead className="text-center font-semibold text-[#333333]">Guests</TableHead>
                <TableHead className="font-semibold text-[#333333]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.map(lesson => {
                const template = getTemplateForLesson(lesson.id)
                const guests = getGuestsForLesson(lesson.id)
                const instructors = getInstructorsForLesson(lesson.id)
                const isUnderstaffed = instructors.length === 0 || (guests.length / instructors.length > 8)

                return (
                  <TableRow
                    key={lesson.id}
                    className={`border-b border-[#F8F8F8] ${isUnderstaffed ? 'bg-[#C75300]/5' : ''}`}
                  >
                    <TableCell className="font-semibold text-sm whitespace-nowrap text-[#000000]">
                      {formatTime(lesson.start_time)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/supervisor/lesson/${lesson.id}`} className="hover:underline">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#000000]">{template?.name}</span>
                          <DisciplineBadge discipline={template?.discipline_id || '1'} />
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-[#666666]">
                      {template?.lesson_type}
                      {template?.level_numeric && ` · ${LEVEL_LABELS[template.level_numeric] || 'L' + template.level_numeric}`}
                    </TableCell>
                    <TableCell>
                      {instructors.length > 0 ? (
                        <div className="text-sm text-[#333333]">
                          {instructors.map(i => i.user?.name?.split(' ')[0]).join(', ')}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-[#C75300]/40 text-[#C75300]">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold text-sm ${guests.length >= (template?.max_capacity || 99) ? 'text-[#BF2F17]' : 'text-[#000000]'}`}>
                        {guests.length}{template?.max_capacity ? `/${template.max_capacity}` : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lesson.status} />
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredLessons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#999999]">
                    No lessons found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
