'use client'

import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F8F8F8] border border-[#CCCCCC] flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-[#999999]" />
      </div>
      <h3 className="text-base font-semibold text-[#333333]">{title}</h3>
      {description && (
        <p className="text-sm text-[#999999] mt-1 max-w-sm">{description}</p>
      )}
    </div>
  )
}
