'use client'

import { use, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useData } from '@/app/lib/store/use-data'
import { StatusBadge } from '@/app/components/status-badge'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { formatTimeRange, formatDate } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import { ArrowLeft, Play, CheckCircle, FileText, Users, MapPin, Clock } from 'lucide-react'
import { toast } from 'sonner'
import type { LessonStatus } from '@/app/lib/types'

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { state, getGuestsForLesson, getInstructorsForLesson, getTemplateForLesson, updateLessonStatus } = useData()

  const lesson = useMemo(() => state.lessons.find(l => l.id === id), [state.lessons, id])
  const template = useMemo(() => lesson ? getTemplateForLesson(lesson.id) : undefined, [lesson, getTemplateForLesson])
  const guests = useMemo(() => lesson ? getGuestsForLesson(lesson.id) : [], [lesson, getGuestsForLesson])
  const instructors = useMemo(() => lesson ? getInstructorsForLesson(lesson.id) : [], [lesson, getInstructorsForLesson])

  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set(guests.map(g => g.id)))

  if (!lesson || !template) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lesson not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    )
  }

  function toggleGuest(guestId: string) {
    setSelectedGuests(prev => {
      const next = new Set(prev)
      if (next.has(guestId)) next.delete(guestId)
      else next.add(guestId)
      return next
    })
  }

  function handleStartLesson() {
    updateLessonStatus(lesson!.id, 'in_progress')
    toast.success('Lesson started!')
  }

  function handleCompleteLesson() {
    updateLessonStatus(lesson!.id, 'completed')
    toast.success('Lesson completed!')
  }

  const actionButton = {
    scheduled: (
      <Button className="w-full" size="lg" onClick={handleStartLesson}>
        <Play className="h-4 w-4 mr-2" /> Start Lesson
      </Button>
    ),
    in_progress: (
      <Button className="w-full" size="lg" variant="secondary" onClick={handleCompleteLesson}>
        <CheckCircle className="h-4 w-4 mr-2" /> Complete Lesson
      </Button>
    ),
    completed: (
      <Link href={`/instructor/report/${lesson.id}`}>
        <Button className="w-full" size="lg">
          <FileText className="h-4 w-4 mr-2" /> Write Report
        </Button>
      </Link>
    ),
    reported: (
      <Link href={`/instructor/report/${lesson.id}`}>
        <Button className="w-full" size="lg" variant="outline">
          <FileText className="h-4 w-4 mr-2" /> View Report
        </Button>
      </Link>
    ),
  }[lesson.status as LessonStatus]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{template.name}</h1>
            <DisciplineBadge discipline={template.discipline_id} />
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(lesson.start_time)}</p>
        </div>
        <StatusBadge status={lesson.status} />
      </div>

      {/* Lesson Info */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm font-medium">{formatTimeRange(lesson.start_time, lesson.end_time)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm font-medium">{template.location}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="text-sm font-medium">
              {template.level_numeric ? LEVEL_LABELS[template.level_numeric] || `L${template.level_numeric}` : 'Any'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Co-Instructors */}
      {instructors.length > 1 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Instructors</h2>
          <div className="space-y-2">
            {instructors.map(inst => (
              <div key={inst.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {inst.user?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{inst.user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{inst.assignment.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator className="my-4" />

      {/* Guest List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Guests ({guests.length})
          </h2>
          {lesson.status === 'scheduled' && guests.length > 1 && (
            <span className="text-xs text-muted-foreground">Select guests for your group</span>
          )}
        </div>
        <div className="space-y-2">
          {guests.map(guest => (
            <Link
              key={guest.id}
              href={`/instructor/guest/${guest.id}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
            >
              {(lesson.status === 'scheduled' || lesson.status === 'in_progress') && instructors.length > 1 && (
                <Checkbox
                  checked={selectedGuests.has(guest.id)}
                  onCheckedChange={() => toggleGuest(guest.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium">
                {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{guest.first_name} {guest.last_name}</p>
                <p className="text-xs text-muted-foreground">Room {guest.room_number}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="sticky bottom-4">
        {actionButton}
      </div>
    </div>
  )
}
