'use client'

import type { LessonStatus } from '@/app/lib/types'

const STATUS_CONFIG: Record<LessonStatus, { label: string; className: string }> = {
  scheduled:   { label: 'Scheduled',   className: 'bg-[#1E2643] text-white' },
  in_progress: { label: 'In Progress', className: 'bg-[#FDBE00] text-[#000000]' },
  completed:   { label: 'Completed',   className: 'bg-[#088A20] text-white' },
  reported:    { label: 'Reported',    className: 'bg-[#9D432C] text-white' },
}

export function StatusBadge({ status }: { status: LessonStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.className}`}>
      {config.label}
    </span>
  )
}
