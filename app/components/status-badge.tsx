'use client'

import { Badge } from '@/components/ui/badge'
import type { LessonStatus } from '@/app/lib/types'

const STATUS_CONFIG: Record<LessonStatus, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  reported: { label: 'Reported', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
}

export function StatusBadge({ status }: { status: LessonStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}
