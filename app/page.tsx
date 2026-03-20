'use client'

import { useRouter } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { Card, CardContent } from '@/components/ui/card'
import { Mountain, Users, UserCheck } from 'lucide-react'
import type { Role } from '@/app/lib/types'

const roles: { role: Role; icon: typeof Mountain; title: string; description: string; color: string }[] = [
  {
    role: 'instructor',
    icon: Mountain,
    title: 'Instructor',
    description: 'View your schedule, manage lessons, and submit reports',
    color: 'from-sky-500 to-blue-600',
  },
  {
    role: 'supervisor',
    icon: UserCheck,
    title: 'Supervisor',
    description: 'Oversee daily operations, assign instructors, and monitor lessons',
    color: 'from-violet-500 to-purple-600',
  },
  {
    role: 'guest',
    icon: Users,
    title: 'Guest',
    description: 'Book lessons, view your progress, and track your learning journey',
    color: 'from-emerald-500 to-green-600',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const { setCurrentRole } = useData()

  function handleSelect(role: Role) {
    setCurrentRole(role)
    router.push(`/${role}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Mountain className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">SnowOS</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Ski school management for Tomamu. Select your role to get started.
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-3xl sm:grid-cols-3">
        {roles.map(({ role, icon: Icon, title, description, color }) => (
          <Card
            key={role}
            className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
            onClick={() => handleSelect(role)}
          >
            <CardContent className="p-6 text-center">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-4`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        Frontend prototype — all data stored in your browser
      </p>
    </div>
  )
}
