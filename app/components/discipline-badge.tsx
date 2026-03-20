'use client'

import type { DisciplineType } from '@/app/lib/types'

const DISC_CONFIG: Record<DisciplineType, { label: string; className: string }> = {
  ski:       { label: 'Ski',       className: 'bg-[#ACBEB9] text-[#000000]' },
  snowboard: { label: 'Snowboard', className: 'bg-[#D5CDC2] text-[#000000]' },
}

export function DisciplineBadge({ discipline }: { discipline: DisciplineType | string }) {
  const disc = discipline === '1' || discipline === 'ski' ? 'ski' : 'snowboard'
  const config = DISC_CONFIG[disc]
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.className}`}>
      {config.label}
    </span>
  )
}
