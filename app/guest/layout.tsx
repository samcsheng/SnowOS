'use client'

import { useData } from '@/app/lib/store/use-data'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarPlus, History } from 'lucide-react'

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const { state } = useData()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (state.initialized && state.currentRole !== 'guest') {
      router.push('/')
    }
  }, [state.initialized, state.currentRole, router])

  if (!state.initialized) {
    return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-muted-foreground">Loading...</p></div>
  }

  const navItems = [
    { href: '/guest', icon: Home, label: 'Home' },
    { href: '/guest/booking', icon: CalendarPlus, label: 'Book' },
    { href: '/guest/history', icon: History, label: 'History' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      {children}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="flex justify-around max-w-2xl mx-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center py-2 px-4 text-xs transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
