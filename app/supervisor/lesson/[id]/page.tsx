'use client'

import { use, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { StatusBadge } from '@/app/components/status-badge'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { formatTimeRange, formatDate } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import { ArrowLeft, UserPlus, Users, MapPin, Clock, X } from 'lucide-react'
import { toast } from 'sonner'

export default function SupervisorLessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const {
    state, getGuestsForLesson, getInstructorsForLesson, getTemplateForLesson,
    assignInstructor, removeAssignment
  } = useData()

  const lesson = useMemo(() => state.lessons.find(l => l.id === id), [state.lessons, id])
  const template = useMemo(() => lesson ? getTemplateForLesson(lesson.id) : undefined, [lesson, getTemplateForLesson])
  const guests = useMemo(() => lesson ? getGuestsForLesson(lesson.id) : [], [lesson, getGuestsForLesson])
  const instructors = useMemo(() => lesson ? getInstructorsForLesson(lesson.id) : [], [lesson, getInstructorsForLesson])

  const [showAssign, setShowAssign] = useState(false)

  // Available instructors for assignment
  const availableInstructors = useMemo(() => {
    if (!template) return []
    const assignedIds = new Set(instructors.map(i => i.id))
    const disc = template.discipline_id === '1' ? 'ski' : 'snowboard'
    return state.instructors.filter(inst => {
      if (assignedIds.has(inst.id)) return false
      if (inst.discipline !== disc) return false
      if (template.level_numeric && inst.max_teaching_level < template.level_numeric) return false
      return true
    })
  }, [template, instructors, state.instructors])

  function handleAssign(instructorId: string | null) {
    if (!instructorId || !lesson) return
    const role = instructors.length === 0 ? 'lead' : 'assistant'
    assignInstructor(lesson.id, instructorId, role as 'lead' | 'assistant')
    setShowAssign(false)
    toast.success('Instructor assigned!')
  }

  function handleRemoveAssignment(assignmentId: string) {
    removeAssignment(assignmentId)
    toast.success('Instructor removed')
  }

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

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{template.name}</h1>
            <DisciplineBadge discipline={template.discipline_id} />
            <StatusBadge status={lesson.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(lesson.start_time)} &middot; {formatTimeRange(lesson.start_time, lesson.end_time)} &middot; {template.location}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Instructors */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" /> Instructors ({instructors.length})
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowAssign(!showAssign)}>
                <UserPlus className="h-3.5 w-3.5 mr-1" /> Assign
              </Button>
            </div>

            {showAssign && (
              <div className="mb-3">
                <Select onValueChange={handleAssign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInstructors.length === 0 ? (
                      <SelectItem value="_none" disabled>No available instructors</SelectItem>
                    ) : (
                      availableInstructors.map(inst => {
                        const user = state.users.find(u => u.id === inst.user_id)
                        return (
                          <SelectItem key={inst.id} value={inst.id}>
                            {user?.name} (L{inst.max_teaching_level})
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              {instructors.map(inst => (
                <div key={inst.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {inst.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{inst.user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {inst.assignment.role} &middot; L{inst.max_teaching_level}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => handleRemoveAssignment(inst.assignment.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {instructors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No instructor assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Guests */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" /> Guests ({guests.length})
              {template.max_capacity && (
                <span className="text-xs text-muted-foreground font-normal">/ {template.max_capacity} max</span>
              )}
            </h2>
            <div className="space-y-2">
              {guests.map(guest => (
                <div key={guest.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium">
                    {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{guest.first_name} {guest.last_name}</p>
                    <p className="text-xs text-muted-foreground">Room {guest.room_number}</p>
                  </div>
                </div>
              ))}
              {guests.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No guests booked</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
