'use client'

import { useRouter } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { Mountain, Users, UserCheck } from 'lucide-react'
import type { Role } from '@/app/lib/types'

const roles: { role: Role; icon: typeof Mountain; title: string; description: string }[] = [
  {
    role: 'instructor',
    icon: Mountain,
    title: 'Instructor',
    description: 'View your schedule, manage lessons, and submit reports',
  },
  {
    role: 'supervisor',
    icon: UserCheck,
    title: 'Supervisor',
    description: 'Oversee daily operations, assign instructors, and monitor lessons',
  },
  {
    role: 'guest',
    icon: Users,
    title: 'Guest',
    description: 'Book lessons, view your progress, and track your learning journey',
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
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Saffron hero header */}
      <div className="bg-[#FDBE00] py-16 px-4 text-center">
        <span
          className="block text-5xl font-bold text-[#000000] mb-2 leading-none"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Ψ
        </span>
        <h1
          className="text-4xl font-bold text-[#000000] mt-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          SnowOS
        </h1>
        <p className="text-[#000000]/70 mt-2 text-base font-semibold">
          Ski school management for Tomamu
        </p>
      </div>

      {/* Role selection */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-center text-[#666666] text-sm font-semibold mb-8 uppercase tracking-widest">
          Select your role to get started
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {roles.map(({ role, icon: Icon, title, description }, i) => (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              className={`
                group text-left rounded-xl p-6 border transition-all hover:-translate-y-1 hover:shadow-lg
                ${i === 0
                  ? 'bg-[#FDBE00] border-[#FDBE00] hover:bg-[#f0b400]'
                  : i === 1
                  ? 'bg-[#000000] border-[#000000] hover:bg-[#222222]'
                  : 'bg-white border-[#000000] hover:bg-[#F8F8F8]'
                }
              `}
            >
              <div className={`
                inline-flex p-3 rounded-full mb-4
                ${i === 0 ? 'bg-[#000000]/10' : i === 1 ? 'bg-white/10' : 'bg-[#F8F8F8]'}
              `}>
                <Icon className={`h-6 w-6 ${i === 0 ? 'text-[#000000]' : i === 1 ? 'text-white' : 'text-[#000000]'}`} />
              </div>
              <h2
                className={`text-lg font-bold mb-1 ${i === 1 ? 'text-white' : 'text-[#000000]'}`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {title}
              </h2>
              <p className={`text-sm ${i === 1 ? 'text-white/70' : 'text-[#666666]'}`}>
                {description}
              </p>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-[#999999] mt-10">
          Frontend prototype — all data stored in your browser
        </p>
      </div>
    </div>
  )
}
