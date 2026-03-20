// SnowOS Type Definitions — mirrors v1 database schema as TypeScript interfaces

export type Role = 'instructor' | 'supervisor' | 'guest'
export type DisciplineType = 'ski' | 'snowboard'
export type LessonStatus = 'scheduled' | 'in_progress' | 'completed' | 'reported'
export type LessonType = 'Adult' | 'Kids' | 'Private'
export type BookingStatus = 'active' | 'cancelled'
export type AssignmentRole = 'lead' | 'assistant'

export interface Resort {
  id: string
  name: string
  timezone: string
  created_at: string
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  created_at: string
}

export interface Instructor {
  id: string
  user_id: string
  resort_id: string
  discipline: DisciplineType
  max_teaching_level: number
  created_at: string
}

export interface Guest {
  id: string
  user_id: string | null
  first_name: string
  last_name: string
  room_number: string
  created_at: string
}

export interface Discipline {
  id: string
  name: DisciplineType
}

export interface LessonTemplate {
  id: string
  name: string
  lesson_type: LessonType
  discipline_id: string
  level_numeric: number | null
  default_start_time: string | null
  default_end_time: string | null
  location: string
  max_capacity: number | null
}

export interface Lesson {
  id: string
  resort_id: string
  lesson_template_id: string
  start_time: string
  end_time: string
  status: LessonStatus
  created_by: string
  created_at: string
}

export interface Booking {
  id: string
  lesson_id: string
  guest_id: string
  booking_status: BookingStatus
  created_at: string
}

export interface InstructorAssignment {
  id: string
  lesson_id: string
  instructor_id: string
  role: AssignmentRole
  assigned_at: string
}

export interface LessonReport {
  id: string
  lesson_id: string
  submitted_by: string
  summary: string | null
  terrain_skied: string[]
  skills_worked_on: string[]
  created_at: string
}

export interface LessonReportEntry {
  id: string
  report_id: string
  guest_id: string
  recommended_level: number
  progress_notes: string
  created_at: string
}

// Convenience types for the store
export interface AppState {
  resort: Resort
  users: User[]
  instructors: Instructor[]
  guests: Guest[]
  disciplines: Discipline[]
  lessonTemplates: LessonTemplate[]
  lessons: Lesson[]
  bookings: Booking[]
  instructorAssignments: InstructorAssignment[]
  lessonReports: LessonReport[]
  lessonReportEntries: LessonReportEntry[]
  currentRole: Role
  currentUserId: string
  initialized: boolean
}
