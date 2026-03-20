'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { DisciplineBadge } from './discipline-badge'
import { formatTimeRange } from '@/app/lib/utils/date-helpers'
import { LEVEL_LABELS } from '@/app/lib/utils/report-helpers'
import type { Lesson, LessonTemplate } from '@/app/lib/types'
import { Users, MapPin } from 'lucide-react'

interface LessonCardProps {
  lesson: Lesson
  template: LessonTemplate
  guestCount: number
  instructorNames: string[]
  href: string
}

export function LessonCard({ lesson, template, guestCount, instructorNames, href }: LessonCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-base">{template.name}</span>
                <DisciplineBadge discipline={template.discipline_id} />
                {template.level_numeric && (
                  <span className="text-xs text-muted-foreground">
                    {LEVEL_LABELS[template.level_numeric] || `L${template.level_numeric}`}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {formatTimeRange(lesson.start_time, lesson.end_time)}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {guestCount} guest{guestCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {template.location}
                </span>
              </div>
              {instructorNames.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {instructorNames.join(', ')}
                </p>
              )}
            </div>
            <StatusBadge status={lesson.status} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
