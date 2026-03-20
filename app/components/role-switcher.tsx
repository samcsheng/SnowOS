'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import type { Role } from '@/app/lib/types'

const ROLE_CONFIG: Record<Role, { label: string; path: string }> = {
  instructor: { label: 'Instructor', path: '/instructor' },
  supervisor: { label: 'Supervisor', path: '/supervisor' },
  guest:      { label: 'Guest',      path: '/guest' },
}

export function RoleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const { state, setCurrentRole, resetData } = useData()

  const currentUser = state.users.find(u => u.id === state.currentUserId)

  function handleRoleChange(role: string | null) {
    if (!role) return
    setCurrentRole(role as Role)
    router.push(ROLE_CONFIG[role as Role].path)
  }

  function handleReset() {
    if (confirm('Reset all data to initial seed? This cannot be undone.')) {
      resetData()
      router.push('/')
    }
  }

  if (pathname === '/') return null

  return (
    <header className="sticky top-0 z-50 bg-[#FDBE00]">
      <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Trident Ψ wordmark */}
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-bold text-[#000000] leading-none select-none"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
            aria-label="Trident"
          >
            Ψ
          </span>
          <span
            className="font-bold text-lg text-[#000000] hidden sm:inline"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            SnowOS
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <span className="text-sm font-semibold text-[#000000] hidden sm:inline">
              {currentUser.name}
            </span>
          )}
          <Select value={state.currentRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[140px] rounded-full border-[#000000] border bg-transparent text-[#000000] font-semibold text-sm h-9 focus:ring-0 focus:ring-offset-0 hover:bg-[#000000]/10 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#CCCCCC]">
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="Reset data"
            className="rounded-full text-[#000000] hover:bg-[#000000]/10 h-9 w-9"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
