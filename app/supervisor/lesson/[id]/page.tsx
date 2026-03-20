'use client'

import { use, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { StatusBadge } from '@/app/components/status-badge'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
        <p className="text-[#666666]">Lesson not found</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 rounded-full text-sm font-semibold border border-[#CCCCCC] hover:bg-[#F8F8F8] transition-colors">
          <ArrowLeft className="h-4 w-4 inline mr-2" /> Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-[#CCCCCC] flex items-center justify-center hover:bg-[#F8F8F8] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#000000]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'var(--font-heading)' }}>
              {template.name}
            </h1>
            <DisciplineBadge discipline={template.discipline_id} />
            <StatusBadge status={lesson.status} />
          </div>
          <p className="text-sm text-[#666666] mt-0.5">
            {formatDate(lesson.start_time)} &middot; {formatTimeRange(lesson.start_time, lesson.end_time)} &middot; {template.location}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Instructors */}
        <div className="bg-white rounded-xl border border-[#CCCCCC] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#000000] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Users className="h-4 w-4" /> Instructors ({instructors.length})
            </h2>
            <button
              onClick={() => setShowAssign(!showAssign)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[#000000] bg-white text-[#000000] hover:bg-[#F8F8F8] transition-colors flex items-center gap-1"
            >
              <UserPlus className="h-3.5 w-3.5" /> Assign
            </button>
          </div>

          {showAssign && (
            <div className="mb-3">
              <Select onValueChange={handleAssign}>
                <SelectTrigger className="rounded-full border-[#CCCCCC]">
                  <SelectValue placeholder="Select instructor..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
              <div key={inst.id} className="flex items-center justify-between p-2 rounded-xl bg-[#F8F8F8]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FDBE00] flex items-center justify-center text-sm font-bold text-[#000000]">
                    {inst.user?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#000000]">{inst.user?.name}</p>
                    <p className="text-xs text-[#666666] capitalize">
                      {inst.assignment.role} &middot; L{inst.max_teaching_level}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAssignment(inst.assignment.id)}
                  className="w-7 h-7 rounded-full hover:bg-[#CCCCCC]/50 flex items-center justify-center transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-[#666666]" />
                </button>
              </div>
            ))}
            {instructors.length === 0 && (
              <p className="text-sm text-[#999999] text-center py-4">No instructor assigned</p>
            )}
          </div>
        </div>

        {/* Guests */}
        <div className="bg-white rounded-xl border border-[#CCCCCC] p-4">
          <h2 className="font-bold text-[#000000] flex items-center gap-2 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <Users className="h-4 w-4" /> Guests ({guests.length})
            {template.max_capacity && (
              <span className="text-xs text-[#666666] font-normal">/ {template.max_capacity} max</span>
            )}
          </h2>
          <div className="space-y-2">
            {guests.map(guest => (
              <div key={guest.id} className="flex items-center gap-3 p-2 rounded-xl bg-[#F8F8F8]">
                <div className="w-8 h-8 rounded-full bg-[#D5CDC2] text-[#000000] flex items-center justify-center text-xs font-bold">
                  {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#000000]">{guest.first_name} {guest.last_name}</p>
                  <p className="text-xs text-[#666666]">Room {guest.room_number}</p>
                </div>
              </div>
            ))}
            {guests.length === 0 && (
              <p className="text-sm text-[#999999] text-center py-4">No guests booked</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
