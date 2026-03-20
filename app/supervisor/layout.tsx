'use client'

import { useData } from '@/app/lib/store/use-data'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const { state } = useData()
  const router = useRouter()

  useEffect(() => {
    if (state.initialized && state.currentRole !== 'supervisor') {
      router.push('/')
    }
  }, [state.initialized, state.currentRole, router])

  if (!state.initialized) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-[#999999] font-semibold">Loading…</p>
      </div>
    )
  }

  return <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
}
