'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RotateCcw, Mountain } from 'lucide-react'
import type { Role } from '@/app/lib/types'

const ROLE_CONFIG: Record<Role, { label: string; path: string }> = {
  instructor: { label: 'Instructor', path: '/instructor' },
  supervisor: { label: 'Supervisor', path: '/supervisor' },
  guest: { label: 'Guest', path: '/guest' },
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

  // Don't show on landing page
  if (pathname === '/') return null

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Mountain className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg hidden sm:inline">SnowOS</span>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {currentUser.name}
            </span>
          )}
          <Select value={state.currentRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={handleReset} title="Reset data">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
