'use client'

import React, { createContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import type {
  Resort, User, Instructor, Guest, Discipline, LessonTemplate,
  Lesson, Booking, InstructorAssignment, LessonReport, LessonReportEntry,
  Role, LessonStatus, AppState
} from '@/app/lib/types'

// Import seed data
import resortsSeed from '@/app/lib/data/resorts.json'
import usersSeed from '@/app/lib/data/users.json'
import instructorsSeed from '@/app/lib/data/instructors.json'
import guestsSeed from '@/app/lib/data/guests.json'
import disciplinesSeed from '@/app/lib/data/disciplines.json'
import lessonTemplatesSeed from '@/app/lib/data/lesson-templates.json'
import lessonsSeed from '@/app/lib/data/lessons.json'
import bookingsSeed from '@/app/lib/data/bookings.json'
import assignmentsSeed from '@/app/lib/data/instructor-assignments.json'
import reportsSeed from '@/app/lib/data/lesson-reports.json'
import entriesSeed from '@/app/lib/data/lesson-report-entries.json'
import seedIds from '@/app/lib/data/_seed-ids.json'

// ── Storage Keys ─────────────────────────────────────────────────────

const KEYS = {
  initialized: 'snowos:initialized',
  users: 'snowos:users',
  instructors: 'snowos:instructors',
  guests: 'snowos:guests',
  lessons: 'snowos:lessons',
  bookings: 'snowos:bookings',
  assignments: 'snowos:assignments',
  reports: 'snowos:reports',
  reportEntries: 'snowos:report-entries',
  currentRole: 'snowos:current-role',
  currentUserId: 'snowos:current-user-id',
} as const

// ── Actions ──────────────────────────────────────────────────────────

type Action =
  | { type: 'INIT'; payload: AppState }
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_USER'; payload: string }
  | { type: 'UPDATE_LESSON'; payload: { id: string; updates: Partial<Lesson> } }
  | { type: 'CREATE_BOOKING'; payload: Booking }
  | { type: 'CANCEL_BOOKING'; payload: string }
  | { type: 'ASSIGN_INSTRUCTOR'; payload: InstructorAssignment }
  | { type: 'REMOVE_ASSIGNMENT'; payload: string }
  | { type: 'SUBMIT_REPORT'; payload: { report: LessonReport; entries: LessonReportEntry[] } }
  | { type: 'RESET' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT':
      return { ...action.payload, initialized: true }
    case 'SET_ROLE':
      return { ...state, currentRole: action.payload }
    case 'SET_USER':
      return { ...state, currentUserId: action.payload }
    case 'UPDATE_LESSON':
      return {
        ...state,
        lessons: state.lessons.map(l =>
          l.id === action.payload.id ? { ...l, ...action.payload.updates } : l
        )
      }
    case 'CREATE_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] }
    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload ? { ...b, booking_status: 'cancelled' as const } : b
        )
      }
    case 'ASSIGN_INSTRUCTOR':
      return { ...state, instructorAssignments: [...state.instructorAssignments, action.payload] }
    case 'REMOVE_ASSIGNMENT':
      return {
        ...state,
        instructorAssignments: state.instructorAssignments.filter(a => a.id !== action.payload)
      }
    case 'SUBMIT_REPORT':
      return {
        ...state,
        lessonReports: [...state.lessonReports, action.payload.report],
        lessonReportEntries: [...state.lessonReportEntries, ...action.payload.entries],
        lessons: state.lessons.map(l =>
          l.id === action.payload.report.lesson_id ? { ...l, status: 'reported' as const } : l
        )
      }
    case 'RESET':
      return getInitialState()
    default:
      return state
  }
}

// ── Initial State ────────────────────────────────────────────────────

function getInitialState(): AppState {
  return {
    resort: (resortsSeed as Resort[])[0],
    users: usersSeed as User[],
    instructors: instructorsSeed as Instructor[],
    guests: guestsSeed as Guest[],
    disciplines: disciplinesSeed as Discipline[],
    lessonTemplates: lessonTemplatesSeed as LessonTemplate[],
    lessons: lessonsSeed as Lesson[],
    bookings: bookingsSeed as Booking[],
    instructorAssignments: assignmentsSeed as InstructorAssignment[],
    lessonReports: reportsSeed as LessonReport[],
    lessonReportEntries: entriesSeed as LessonReportEntry[],
    currentRole: 'instructor',
    currentUserId: seedIds.sammyUserId,
    initialized: false,
  }
}

function loadFromStorage(): AppState | null {
  if (typeof window === 'undefined') return null
  try {
    const init = localStorage.getItem(KEYS.initialized)
    if (init !== 'true') return null

    return {
      resort: (resortsSeed as Resort[])[0],
      users: JSON.parse(localStorage.getItem(KEYS.users) || '[]'),
      instructors: JSON.parse(localStorage.getItem(KEYS.instructors) || '[]'),
      guests: JSON.parse(localStorage.getItem(KEYS.guests) || '[]'),
      disciplines: disciplinesSeed as Discipline[],
      lessonTemplates: lessonTemplatesSeed as LessonTemplate[],
      lessons: JSON.parse(localStorage.getItem(KEYS.lessons) || '[]'),
      bookings: JSON.parse(localStorage.getItem(KEYS.bookings) || '[]'),
      instructorAssignments: JSON.parse(localStorage.getItem(KEYS.assignments) || '[]'),
      lessonReports: JSON.parse(localStorage.getItem(KEYS.reports) || '[]'),
      lessonReportEntries: JSON.parse(localStorage.getItem(KEYS.reportEntries) || '[]'),
      currentRole: (localStorage.getItem(KEYS.currentRole) as Role) || 'instructor',
      currentUserId: localStorage.getItem(KEYS.currentUserId) || seedIds.sammyUserId,
      initialized: true,
    }
  } catch {
    return null
  }
}

function saveToStorage(state: AppState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEYS.initialized, 'true')
    localStorage.setItem(KEYS.users, JSON.stringify(state.users))
    localStorage.setItem(KEYS.instructors, JSON.stringify(state.instructors))
    localStorage.setItem(KEYS.guests, JSON.stringify(state.guests))
    localStorage.setItem(KEYS.lessons, JSON.stringify(state.lessons))
    localStorage.setItem(KEYS.bookings, JSON.stringify(state.bookings))
    localStorage.setItem(KEYS.assignments, JSON.stringify(state.instructorAssignments))
    localStorage.setItem(KEYS.reports, JSON.stringify(state.lessonReports))
    localStorage.setItem(KEYS.reportEntries, JSON.stringify(state.lessonReportEntries))
    localStorage.setItem(KEYS.currentRole, state.currentRole)
    localStorage.setItem(KEYS.currentUserId, state.currentUserId)
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

// ── Context ──────────────────────────────────────────────────────────

export interface DataContextType {
  state: AppState

  // Session
  setCurrentRole: (role: Role) => void
  setCurrentUser: (id: string) => void

  // Lesson actions
  updateLessonStatus: (lessonId: string, status: LessonStatus) => void

  // Booking actions
  createBooking: (lessonId: string, guestId: string) => void
  cancelBooking: (bookingId: string) => void

  // Assignment actions
  assignInstructor: (lessonId: string, instructorId: string, role: 'lead' | 'assistant') => void
  removeAssignment: (assignmentId: string) => void

  // Report actions
  submitReport: (report: LessonReport, entries: LessonReportEntry[]) => void

  // Selectors
  getLessonsForInstructor: (instructorId: string, date?: string) => Lesson[]
  getLessonsForGuest: (guestId: string) => Lesson[]
  getLessonsForDate: (date: string) => Lesson[]
  getGuestsForLesson: (lessonId: string) => Guest[]
  getInstructorsForLesson: (lessonId: string) => (Instructor & { user: User; assignment: InstructorAssignment })[]
  getTemplateForLesson: (lessonId: string) => LessonTemplate | undefined
  getUserForInstructor: (instructorId: string) => User | undefined
  getUserForGuest: (guestId: string) => User | undefined
  getReportForLesson: (lessonId: string) => { report: LessonReport; entries: LessonReportEntry[] } | null
  getGuestHistory: (guestId: string) => { lesson: Lesson; template: LessonTemplate; report: LessonReport | null; entry: LessonReportEntry | null }[]

  // Utility
  resetData: () => void
}

export const DataContext = createContext<DataContextType | null>(null)

// ── Provider ─────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getInitialState())

  // Initialize from localStorage or seed data
  useEffect(() => {
    const stored = loadFromStorage()
    if (stored) {
      dispatch({ type: 'INIT', payload: stored })
    } else {
      const initial = getInitialState()
      dispatch({ type: 'INIT', payload: initial })
      saveToStorage({ ...initial, initialized: true })
    }
  }, [])

  // Persist changes to localStorage
  useEffect(() => {
    if (state.initialized) {
      saveToStorage(state)
    }
  }, [state])

  // ── Actions ────────────────────────────────────────────────────────

  const setCurrentRole = useCallback((role: Role) => {
    dispatch({ type: 'SET_ROLE', payload: role })
    // Auto-select default user for role
    if (role === 'instructor') {
      dispatch({ type: 'SET_USER', payload: seedIds.sammyUserId })
    } else if (role === 'supervisor') {
      dispatch({ type: 'SET_USER', payload: seedIds.jasonUserId })
    } else {
      dispatch({ type: 'SET_USER', payload: seedIds.annaUserId })
    }
  }, [])

  const setCurrentUser = useCallback((id: string) => {
    dispatch({ type: 'SET_USER', payload: id })
  }, [])

  const updateLessonStatus = useCallback((lessonId: string, status: LessonStatus) => {
    dispatch({ type: 'UPDATE_LESSON', payload: { id: lessonId, updates: { status } } })
  }, [])

  const createBooking = useCallback((lessonId: string, guestId: string) => {
    const booking: Booking = {
      id: crypto.randomUUID(),
      lesson_id: lessonId,
      guest_id: guestId,
      booking_status: 'active',
      created_at: new Date().toISOString(),
    }
    dispatch({ type: 'CREATE_BOOKING', payload: booking })
  }, [])

  const cancelBooking = useCallback((bookingId: string) => {
    dispatch({ type: 'CANCEL_BOOKING', payload: bookingId })
  }, [])

  const assignInstructor = useCallback((lessonId: string, instructorId: string, role: 'lead' | 'assistant') => {
    const assignment: InstructorAssignment = {
      id: crypto.randomUUID(),
      lesson_id: lessonId,
      instructor_id: instructorId,
      role,
      assigned_at: new Date().toISOString(),
    }
    dispatch({ type: 'ASSIGN_INSTRUCTOR', payload: assignment })
  }, [])

  const removeAssignment = useCallback((assignmentId: string) => {
    dispatch({ type: 'REMOVE_ASSIGNMENT', payload: assignmentId })
  }, [])

  const submitReport = useCallback((report: LessonReport, entries: LessonReportEntry[]) => {
    dispatch({ type: 'SUBMIT_REPORT', payload: { report, entries } })
  }, [])

  // ── Selectors ──────────────────────────────────────────────────────

  const getLessonsForInstructor = useCallback((instructorId: string, date?: string) => {
    const assignedLessonIds = new Set(
      state.instructorAssignments
        .filter(a => a.instructor_id === instructorId)
        .map(a => a.lesson_id)
    )
    return state.lessons
      .filter(l => {
        if (!assignedLessonIds.has(l.id)) return false
        if (date) return l.start_time.startsWith(date)
        return true
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [state.instructorAssignments, state.lessons])

  const getLessonsForGuest = useCallback((guestId: string) => {
    const bookedLessonIds = new Set(
      state.bookings
        .filter(b => b.guest_id === guestId && b.booking_status === 'active')
        .map(b => b.lesson_id)
    )
    return state.lessons
      .filter(l => bookedLessonIds.has(l.id))
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [state.bookings, state.lessons])

  const getLessonsForDate = useCallback((date: string) => {
    return state.lessons
      .filter(l => l.start_time.startsWith(date))
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [state.lessons])

  const getGuestsForLesson = useCallback((lessonId: string) => {
    const guestIds = new Set(
      state.bookings
        .filter(b => b.lesson_id === lessonId && b.booking_status === 'active')
        .map(b => b.guest_id)
    )
    return state.guests.filter(g => guestIds.has(g.id))
  }, [state.bookings, state.guests])

  const getInstructorsForLesson = useCallback((lessonId: string) => {
    const assignments = state.instructorAssignments.filter(a => a.lesson_id === lessonId)
    return assignments.map(a => {
      const instructor = state.instructors.find(i => i.id === a.instructor_id)!
      const user = state.users.find(u => u.id === instructor?.user_id)!
      return { ...instructor, user, assignment: a }
    }).filter(i => i.user)
  }, [state.instructorAssignments, state.instructors, state.users])

  const getTemplateForLesson = useCallback((lessonId: string) => {
    const lesson = state.lessons.find(l => l.id === lessonId)
    if (!lesson) return undefined
    return state.lessonTemplates.find(t => t.id === lesson.lesson_template_id)
  }, [state.lessons, state.lessonTemplates])

  const getUserForInstructor = useCallback((instructorId: string) => {
    const instructor = state.instructors.find(i => i.id === instructorId)
    if (!instructor) return undefined
    return state.users.find(u => u.id === instructor.user_id)
  }, [state.instructors, state.users])

  const getUserForGuest = useCallback((guestId: string) => {
    const guest = state.guests.find(g => g.id === guestId)
    if (!guest || !guest.user_id) return undefined
    return state.users.find(u => u.id === guest.user_id)
  }, [state.guests, state.users])

  const getReportForLesson = useCallback((lessonId: string) => {
    const report = state.lessonReports.find(r => r.lesson_id === lessonId)
    if (!report) return null
    const entries = state.lessonReportEntries.filter(e => e.report_id === report.id)
    return { report, entries }
  }, [state.lessonReports, state.lessonReportEntries])

  const getGuestHistory = useCallback((guestId: string) => {
    const guestLessons = getLessonsForGuest(guestId)
    return guestLessons.map(lesson => {
      const template = state.lessonTemplates.find(t => t.id === lesson.lesson_template_id)!
      const reportData = getReportForLesson(lesson.id)
      const entry = reportData?.entries.find(e => e.guest_id === guestId) || null
      return { lesson, template, report: reportData?.report || null, entry }
    })
  }, [getLessonsForGuest, state.lessonTemplates, getReportForLesson])

  const resetData = useCallback(() => {
    if (typeof window !== 'undefined') {
      Object.values(KEYS).forEach(key => localStorage.removeItem(key))
    }
    const initial = getInitialState()
    dispatch({ type: 'INIT', payload: initial })
    saveToStorage({ ...initial, initialized: true })
  }, [])

  // ── Context Value ──────────────────────────────────────────────────

  const contextValue = useMemo<DataContextType>(() => ({
    state,
    setCurrentRole,
    setCurrentUser,
    updateLessonStatus,
    createBooking,
    cancelBooking,
    assignInstructor,
    removeAssignment,
    submitReport,
    getLessonsForInstructor,
    getLessonsForGuest,
    getLessonsForDate,
    getGuestsForLesson,
    getInstructorsForLesson,
    getTemplateForLesson,
    getUserForInstructor,
    getUserForGuest,
    getReportForLesson,
    getGuestHistory,
    resetData,
  }), [
    state, setCurrentRole, setCurrentUser, updateLessonStatus,
    createBooking, cancelBooking, assignInstructor, removeAssignment,
    submitReport, getLessonsForInstructor, getLessonsForGuest,
    getLessonsForDate, getGuestsForLesson, getInstructorsForLesson,
    getTemplateForLesson, getUserForInstructor, getUserForGuest,
    getReportForLesson, getGuestHistory, resetData,
  ])

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}
