'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useData } from '@/app/lib/store/use-data'
import { StatusBadge } from '@/app/components/status-badge'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatTime, getToday, formatFullDate, addDays } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import { Calendar, Users, UserCheck, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { LessonStatus } from '@/app/lib/types'

export default function SupervisorDashboardPage() {
  const { state, getLessonsForDate, getGuestsForLesson, getInstructorsForLesson, getTemplateForLesson } = useData()
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const lessons = useMemo(() => getLessonsForDate(selectedDate), [selectedDate, getLessonsForDate])

  const filteredLessons = useMemo(() => {
    if (statusFilter === 'all') return lessons
    return lessons.filter(l => l.status === statusFilter)
  }, [lessons, statusFilter])

  // Summary stats
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
      // Flag: understaffed (more than 8 guests per instructor)
      if (instructors.length > 0 && guests.length / instructors.length > 8) flagged++
      // Flag: no instructor assigned
      if (instructors.length === 0 && template?.lesson_type !== 'Private') flagged++
    }
    return { ...byStatus, totalGuests, flagged, total: lessons.length }
  }, [lessons, getGuestsForLesson, getInstructorsForLesson, getTemplateForLesson])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{formatFullDate(selectedDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(getToday())}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed + stats.reported}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.totalGuests}</p>
            <p className="text-xs text-muted-foreground">Guests</p>
          </CardContent>
        </Card>
        {stats.flagged > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-orange-500" />
              <p className="text-2xl font-bold text-orange-600">{stats.flagged}</p>
              <p className="text-xs text-orange-600">Flagged</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/supervisor/instructors">
          <Button variant="outline" size="sm">
            <UserCheck className="h-4 w-4 mr-2" /> Instructor Pool
          </Button>
        </Link>
      </div>

      {/* Lessons Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead className="text-center">Guests</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.map(lesson => {
                const template = getTemplateForLesson(lesson.id)
                const guests = getGuestsForLesson(lesson.id)
                const instructors = getInstructorsForLesson(lesson.id)
                const isUnderstaffed = instructors.length === 0 || (guests.length / instructors.length > 8)

                return (
                  <TableRow key={lesson.id} className={isUnderstaffed ? 'bg-orange-50/50' : ''}>
                    <TableCell className="font-medium text-sm whitespace-nowrap">
                      {formatTime(lesson.start_time)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/supervisor/lesson/${lesson.id}`} className="hover:underline">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{template?.name}</span>
                          <DisciplineBadge discipline={template?.discipline_id || '1'} />
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {template?.lesson_type}
                      {template?.level_numeric && ` · ${LEVEL_LABELS[template.level_numeric] || 'L' + template.level_numeric}`}
                    </TableCell>
                    <TableCell>
                      {instructors.length > 0 ? (
                        <div className="text-sm">
                          {instructors.map(i => i.user?.name?.split(' ')[0]).join(', ')}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={guests.length >= (template?.max_capacity || 99) ? 'text-red-600 font-medium' : ''}>
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No lessons found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
