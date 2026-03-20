'use client'

import { use, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useData } from '@/app/lib/store/use-data'
import { StatusBadge } from '@/app/components/status-badge'
import { DisciplineBadge } from '@/app/components/discipline-badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatTimeRange, formatDate } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import { ArrowLeft, Play, CheckCircle, FileText, Users, MapPin, Clock, ChevronRight } from 'lucide-react'
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
        <p className="text-[#666666]">Lesson not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4 rounded-full">
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
      <button
        onClick={handleStartLesson}
        className="w-full bg-[#FDBE00] text-[#000000] font-semibold rounded-full py-3 flex items-center justify-center gap-2 hover:bg-[#f0b400] transition-colors"
      >
        <Play className="h-4 w-4" /> Start Lesson
      </button>
    ),
    in_progress: (
      <button
        onClick={handleCompleteLesson}
        className="w-full bg-[#000000] text-white font-semibold rounded-full py-3 flex items-center justify-center gap-2 hover:bg-[#222222] transition-colors"
      >
        <CheckCircle className="h-4 w-4" /> Complete Lesson
      </button>
    ),
    completed: (
      <Link href={`/instructor/report/${lesson.id}`}>
        <button className="w-full bg-[#FDBE00] text-[#000000] font-semibold rounded-full py-3 flex items-center justify-center gap-2 hover:bg-[#f0b400] transition-colors">
          <FileText className="h-4 w-4" /> Write Report
        </button>
      </Link>
    ),
    reported: (
      <Link href={`/instructor/report/${lesson.id}`}>
        <button className="w-full bg-white text-[#000000] font-semibold rounded-full py-3 border border-[#000000] flex items-center justify-center gap-2 hover:bg-[#F8F8F8] transition-colors">
          <FileText className="h-4 w-4" /> View Report
        </button>
      </Link>
    ),
  }[lesson.status as LessonStatus]

  return (
    <div className="px-4 py-6">
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
          </div>
          <p className="text-sm text-[#666666]">{formatDate(lesson.start_time)}</p>
        </div>
        <StatusBadge status={lesson.status} />
      </div>

      {/* Lesson Info */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Clock, label: 'Time', value: formatTimeRange(lesson.start_time, lesson.end_time) },
          { icon: MapPin, label: 'Location', value: template.location },
          { icon: Users, label: 'Level', value: template.level_numeric ? LEVEL_LABELS[template.level_numeric] || `L${template.level_numeric}` : 'Any' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl p-3 text-center border border-[#CCCCCC]">
            <Icon className="h-4 w-4 mx-auto mb-1 text-[#999999]" />
            <p className="text-xs text-[#666666]">{label}</p>
            <p className="text-sm font-semibold text-[#000000]">{value}</p>
          </div>
        ))}
      </div>

      {/* Co-Instructors */}
      {instructors.length > 1 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-[#999999] mb-2 uppercase tracking-widest">Instructors</h2>
          <div className="space-y-2">
            {instructors.map(inst => (
              <div key={inst.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#CCCCCC]">
                <div className="w-8 h-8 rounded-full bg-[#FDBE00] flex items-center justify-center text-sm font-bold text-[#000000]">
                  {inst.user?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#000000]">{inst.user?.name}</p>
                  <p className="text-xs text-[#666666] capitalize">{inst.assignment.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-[#CCCCCC] my-4" />

      {/* Guest List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-[#999999] uppercase tracking-widest">
            Guests ({guests.length})
          </h2>
          {lesson.status === 'scheduled' && guests.length > 1 && (
            <span className="text-xs text-[#666666]">Select guests for your group</span>
          )}
        </div>
        <div className="space-y-2">
          {guests.map(guest => (
            <div
              key={guest.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#CCCCCC]"
            >
              {(lesson.status === 'scheduled' || lesson.status === 'in_progress') && instructors.length > 1 && (
                <Checkbox
                  checked={selectedGuests.has(guest.id)}
                  onCheckedChange={() => toggleGuest(guest.id)}
                />
              )}
              <div className="w-9 h-9 rounded-full bg-[#D5CDC2] text-[#000000] flex items-center justify-center text-sm font-bold flex-shrink-0">
                {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#000000]">{guest.first_name} {guest.last_name}</p>
                <p className="text-xs text-[#666666]">Room {guest.room_number}</p>
              </div>
              <Link
                href={`/instructor/guest/${guest.id}`}
                className="flex items-center justify-center w-8 h-8 -mr-1 rounded-lg text-[#CCCCCC] hover:text-[#000000] hover:bg-[#F0F0F0] transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
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
