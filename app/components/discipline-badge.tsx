'use client'

import { Badge } from '@/components/ui/badge'
import type { DisciplineType } from '@/app/lib/types'

const DISC_CONFIG: Record<DisciplineType, { label: string; className: string }> = {
  ski: { label: 'Ski', className: 'bg-sky-100 text-sky-800 hover:bg-sky-100' },
  snowboard: { label: 'Snowboard', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
}

export function DisciplineBadge({ discipline }: { discipline: DisciplineType | string }) {
  const disc = discipline === '1' || discipline === 'ski' ? 'ski' : 'snowboard'
  const config = DISC_CONFIG[disc]
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}
