import { randomUUID } from 'crypto'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Helpers ──────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = join(__dirname, '..', 'app', 'lib', 'data')

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function uuid(): string {
  return randomUUID()
}

function isoDate(d: Date): string {
  return d.toISOString()
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function makeDateTime(dateStr: string, timeStr: string): string {
  // timeStr like "09:00" — combine with date in Tokyo timezone
  return `${dateStr}T${timeStr}:00+09:00`
}

// ── Name Pools ───────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Sammy', 'Jason', 'Yuki', 'Takeshi', 'Hana', 'Kenji', 'Sakura', 'Ryo',
  'Pierre', 'Marie', 'Jean', 'Claire', 'Lucas', 'Sophie', 'Antoine', 'Camille',
  'Jack', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Mia',
  'Ben', 'Sarah', 'Tom', 'Kate', 'Max', 'Zoe', 'Leo', 'Nina',
  'Carlos', 'Ana', 'Diego', 'Isabella', 'Marco', 'Lucia', 'Hugo', 'Elena',
  'Finn', 'Stella', 'Oscar', 'Ruby', 'Felix', 'Ivy', 'Kai', 'Luna',
  'Ren', 'Aoi', 'Sora', 'Mei', 'Haruto', 'Yuna', 'Daiki', 'Mana',
  'Chris', 'Alex', 'Jordan', 'Riley', 'Taylor', 'Morgan', 'Casey', 'Quinn',
  'Luca', 'Maya', 'Rio', 'Noa', 'Aiden', 'Chloe', 'James', 'Lily',
  'Dan', 'Amy', 'Matt', 'Jess', 'Nick', 'Tess', 'Will', 'Grace',
  'Oliver', 'Charlotte', 'Henry', 'Amelia', 'Sebastian', 'Harper', 'Theo', 'Ella',
  'Gabriel', 'Aria', 'Julian', 'Layla', 'Mateo', 'Penelope', 'Ezra', 'Nora'
]

const LAST_NAMES = [
  'Chen', 'Tanaka', 'Yamamoto', 'Suzuki', 'Watanabe', 'Sato', 'Nakamura',
  'Dupont', 'Martin', 'Bernard', 'Petit', 'Moreau', 'Laurent', 'Leroy',
  'Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Davis', 'Miller',
  'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White',
  'Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez', 'Fernandez',
  'Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer',
  'Rossi', 'Ferrari', 'Colombo', 'Ricci', 'Romano', 'Costa',
  'Kim', 'Park', 'Lee', 'Choi', 'Jung', 'Kang',
  'Silva', 'Santos', 'Oliveira', 'Pereira', 'Lima', 'Carvalho',
  'Eriksson', 'Larsson', 'Johansson', 'Lindberg', 'Berg', 'Holm',
  'Fraser', 'Campbell', 'Stewart', 'Murray', 'Reid', 'Ross',
  'Patel', 'Kumar', 'Singh', 'Sharma', 'Gupta', 'Mehta'
]

const TERRAIN_OPTIONS = [
  'Unkai Gondola Area', 'Tower Quad', 'Forest Run', 'Silver Bell',
  'Roller Coaster', 'Pioneer', 'Ningle Terrace', 'Crystal Run',
  'Green Park', 'Blue Sky', 'Snow Garden', 'Beginner Area'
]

const SKILL_OPTIONS = [
  'Snowplow', 'Snowplow turns', 'Stem turns', 'Parallel turns',
  'Short turns', 'Carving', 'Moguls', 'Powder skiing',
  'Edge control', 'Speed control', 'Balance drills', 'Pole planting',
  'Heel-side turns', 'Toe-side turns', 'Linking turns', 'Switch riding',
  'Jumps', 'Rails', 'Sideslip', 'Traversing'
]

const PROGRESS_TEMPLATES = [
  'Good progress today. {name} showed improvement in {skill}.',
  '{name} worked hard on {skill}. Recommend more practice on steeper terrain.',
  'Excellent session! {name} is ready to advance. Strong {skill}.',
  '{name} had a great time. Still building confidence with {skill}.',
  'Solid fundamentals. {name} needs to focus on {skill} for next lesson.',
  '{name} made steady progress. Comfortable on current terrain with {skill}.',
  'Great attitude! {name} is developing good {skill} technique.',
  '{name} was enthusiastic and made noticeable improvement in {skill}.',
]

// ── Generate Resort ──────────────────────────────────────────────────

const RESORT_ID = uuid()
const resort = {
  id: RESORT_ID,
  name: 'Tomamu',
  timezone: 'Asia/Tokyo',
  created_at: isoDate(new Date('2026-01-01T00:00:00+09:00'))
}

// ── Generate Disciplines ─────────────────────────────────────────────

const SKI_ID = '1'
const SB_ID = '2'
const disciplines = [
  { id: SKI_ID, name: 'ski' as const },
  { id: SB_ID, name: 'snowboard' as const }
]

// ── Generate Lesson Templates ────────────────────────────────────────

const lessonTemplates = [
  { id: uuid(), name: 'CLUB 6', lesson_type: 'Adult' as const, discipline_id: SKI_ID, level_numeric: 7, default_start_time: '09:00', default_end_time: '11:30', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'CLUB 5', lesson_type: 'Adult' as const, discipline_id: SKI_ID, level_numeric: 6, default_start_time: '09:00', default_end_time: '11:30', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'CLUB 4', lesson_type: 'Adult' as const, discipline_id: SKI_ID, level_numeric: 5, default_start_time: '09:15', default_end_time: '11:30', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'CLUB 3', lesson_type: 'Adult' as const, discipline_id: SKI_ID, level_numeric: 4, default_start_time: '09:30', default_end_time: '11:45', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'CLUB 2', lesson_type: 'Adult' as const, discipline_id: SKI_ID, level_numeric: 3, default_start_time: '09:45', default_end_time: '11:45', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'CLUB 1', lesson_type: 'Adult' as const, discipline_id: SKI_ID, level_numeric: 2, default_start_time: '10:00', default_end_time: '12:00', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'CLUB BEG', lesson_type: 'Adult' as const, discipline_id: SKI_ID, level_numeric: 1, default_start_time: '10:15', default_end_time: '12:15', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'SB 4', lesson_type: 'Adult' as const, discipline_id: SB_ID, level_numeric: 5, default_start_time: '09:45', default_end_time: '12:00', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'SB 3', lesson_type: 'Adult' as const, discipline_id: SB_ID, level_numeric: 4, default_start_time: '09:45', default_end_time: '12:00', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'SB 2', lesson_type: 'Adult' as const, discipline_id: SB_ID, level_numeric: 3, default_start_time: '10:00', default_end_time: '12:00', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'SB 1', lesson_type: 'Adult' as const, discipline_id: SB_ID, level_numeric: 2, default_start_time: '10:15', default_end_time: '12:15', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'SB BEG', lesson_type: 'Adult' as const, discipline_id: SB_ID, level_numeric: 1, default_start_time: '10:15', default_end_time: '12:15', location: 'Adult Departure', max_capacity: 8 },
  { id: uuid(), name: 'TRIDENT GOLD', lesson_type: 'Kids' as const, discipline_id: SKI_ID, level_numeric: 7, default_start_time: '09:00', default_end_time: '11:15', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'TRIDENT BRONZE', lesson_type: 'Kids' as const, discipline_id: SKI_ID, level_numeric: 6, default_start_time: '09:00', default_end_time: '11:15', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'TRIDENT 3', lesson_type: 'Kids' as const, discipline_id: SKI_ID, level_numeric: 5, default_start_time: '09:00', default_end_time: '11:15', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'TRIDENT 2', lesson_type: 'Kids' as const, discipline_id: SKI_ID, level_numeric: 4, default_start_time: '09:15', default_end_time: '11:30', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'TRIDENT 1', lesson_type: 'Kids' as const, discipline_id: SKI_ID, level_numeric: 3, default_start_time: '09:30', default_end_time: '11:30', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'DRAGON', lesson_type: 'Kids' as const, discipline_id: SKI_ID, level_numeric: 2, default_start_time: '09:30', default_end_time: '11:30', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'TIGER', lesson_type: 'Kids' as const, discipline_id: SKI_ID, level_numeric: 1, default_start_time: '09:45', default_end_time: '11:45', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'PANDA', lesson_type: 'Kids' as const, discipline_id: SKI_ID, level_numeric: 1, default_start_time: '10:00', default_end_time: '11:30', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'RIDER 3', lesson_type: 'Kids' as const, discipline_id: SB_ID, level_numeric: 4, default_start_time: '09:00', default_end_time: '11:15', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'RIDER 2', lesson_type: 'Kids' as const, discipline_id: SB_ID, level_numeric: 3, default_start_time: '09:00', default_end_time: '11:15', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'RIDER 1', lesson_type: 'Kids' as const, discipline_id: SB_ID, level_numeric: 2, default_start_time: '09:00', default_end_time: '11:00', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'RIDER', lesson_type: 'Kids' as const, discipline_id: SB_ID, level_numeric: 1, default_start_time: '09:00', default_end_time: '11:00', location: 'Mini Club', max_capacity: 8 },
  { id: uuid(), name: 'PRIVATE SKI', lesson_type: 'Private' as const, discipline_id: SKI_ID, level_numeric: null, default_start_time: null, default_end_time: null, location: 'Locker #', max_capacity: null },
  { id: uuid(), name: 'PRIVATE SB', lesson_type: 'Private' as const, discipline_id: SB_ID, level_numeric: null, default_start_time: null, default_end_time: null, location: 'Locker #', max_capacity: null },
]

// ── Generate Users & Instructors ─────────────────────────────────────

const now = new Date()
const TODAY = formatDate(now)
const usedNames = new Set<string>()

function uniqueName(): { first: string; last: string } {
  let attempts = 0
  while (attempts < 1000) {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    const key = `${first}-${last}`
    if (!usedNames.has(key)) {
      usedNames.add(key)
      return { first, last }
    }
    attempts++
  }
  // Fallback with number suffix
  const first = pick(FIRST_NAMES)
  const last = pick(LAST_NAMES) + randomInt(1, 999)
  usedNames.add(`${first}-${last}`)
  return { first, last }
}

// Create users for instructors
const instructorUsers: Array<{ id: string; name: string; email: string; role: 'instructor'; created_at: string }> = []
const instructors: Array<{ id: string; user_id: string; resort_id: string; discipline: 'ski' | 'snowboard'; max_teaching_level: number; created_at: string }> = []

// First instructor is Sammy (the user persona)
const sammyUserId = uuid()
const sammyInstructorId = uuid()
instructorUsers.push({
  id: sammyUserId,
  name: 'Sammy Chen',
  email: 'sammy@snowos.app',
  role: 'instructor',
  created_at: isoDate(new Date('2026-01-01'))
})
instructors.push({
  id: sammyInstructorId,
  user_id: sammyUserId,
  resort_id: RESORT_ID,
  discipline: 'ski',
  max_teaching_level: 7,
  created_at: isoDate(new Date('2026-01-01'))
})
usedNames.add('Sammy-Chen')

// Generate 63 more instructors
for (let i = 0; i < 63; i++) {
  const { first, last } = uniqueName()
  const userId = uuid()
  const instId = uuid()
  // ~62% ski, ~38% snowboard
  const disc: 'ski' | 'snowboard' = i < 39 ? 'ski' : 'snowboard'
  const maxLevel = disc === 'ski' ? randomInt(3, 7) : randomInt(2, 5)

  instructorUsers.push({
    id: userId,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@snowos.app`,
    role: 'instructor',
    created_at: isoDate(new Date('2026-01-01'))
  })
  instructors.push({
    id: instId,
    user_id: userId,
    resort_id: RESORT_ID,
    discipline: disc,
    max_teaching_level: maxLevel,
    created_at: isoDate(new Date('2026-01-01'))
  })
}

// Create supervisor user — Jason
const jasonUserId = uuid()
const supervisorUser = {
  id: jasonUserId,
  name: 'Jason Taylor',
  email: 'jason@snowos.app',
  role: 'supervisor' as const,
  created_at: isoDate(new Date('2026-01-01'))
}
usedNames.add('Jason-Taylor')

// ── Generate Guests ──────────────────────────────────────────────────

const guestUsers: Array<{ id: string; name: string; email: string; role: 'guest'; created_at: string }> = []
const guests: Array<{ id: string; user_id: string | null; first_name: string; last_name: string; room_number: string; created_at: string }> = []

// First guest is Anna (the guest persona)
const annaUserId = uuid()
const annaGuestId = uuid()
guestUsers.push({
  id: annaUserId,
  name: 'Anna Garcia',
  email: 'anna@guest.snowos.app',
  role: 'guest',
  created_at: isoDate(new Date('2026-03-01'))
})
guests.push({
  id: annaGuestId,
  user_id: annaUserId,
  first_name: 'Anna',
  last_name: 'Garcia',
  room_number: '305',
  created_at: isoDate(new Date('2026-03-01'))
})
usedNames.add('Anna-Garcia')

// Generate 665 more guests
for (let i = 0; i < 665; i++) {
  const { first, last } = uniqueName()
  const guestId = uuid()
  const guestUserId = uuid()
  const room = String(randomInt(101, 999))

  guestUsers.push({
    id: guestUserId,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@guest.snowos.app`,
    role: 'guest',
    created_at: isoDate(addDays(new Date('2026-03-01'), randomInt(0, 13)))
  })
  guests.push({
    id: guestId,
    user_id: guestUserId,
    first_name: first,
    last_name: last,
    room_number: room,
    created_at: isoDate(addDays(new Date('2026-03-01'), randomInt(0, 13)))
  })
}

// All users combined
const allUsers = [...instructorUsers, supervisorUser, ...guestUsers]

// ── Generate Lessons, Bookings, Assignments ──────────────────────────

const lessons: Array<{
  id: string; resort_id: string; lesson_template_id: string;
  start_time: string; end_time: string; status: string;
  created_by: string; created_at: string
}> = []
const bookings: Array<{
  id: string; lesson_id: string; guest_id: string;
  booking_status: string; created_at: string
}> = []
const instructorAssignments: Array<{
  id: string; lesson_id: string; instructor_id: string;
  role: string; assigned_at: string
}> = []
const lessonReports: Array<{
  id: string; lesson_id: string; submitted_by: string;
  summary: string | null; terrain_skied: string[];
  skills_worked_on: string[]; created_at: string
}> = []
const lessonReportEntries: Array<{
  id: string; report_id: string; guest_id: string;
  recommended_level: number; progress_notes: string; created_at: string
}> = []

// Date range: today - 10 to today + 4
const startDate = addDays(now, -10)
const endDate = addDays(now, 4)

// Group templates (exclude private)
const groupTemplates = lessonTemplates.filter(t => t.lesson_type !== 'Private')
const privateSkiTemplate = lessonTemplates.find(t => t.name === 'PRIVATE SKI')!
const privateSbTemplate = lessonTemplates.find(t => t.name === 'PRIVATE SB')!

// Track instructor bookings per day to avoid double-booking
function generateDayLessons(dateStr: string, dayOffset: number) {
  const instructorSchedule = new Map<string, string[]>() // instructor_id -> time slots used
  const guestSchedule = new Map<string, boolean>() // guest_id -> booked today

  // Determine which templates to use each day (all group + some privates)
  const dayTemplates = [...groupTemplates]

  // Add 5-10 private lessons per day
  const numPrivates = randomInt(5, 10)
  for (let p = 0; p < numPrivates; p++) {
    dayTemplates.push(Math.random() > 0.3 ? privateSkiTemplate : privateSbTemplate)
  }

  // Shuffle to mix things up
  dayTemplates.sort(() => Math.random() - 0.5)

  // For each template, create a lesson
  for (const template of dayTemplates) {
    const lessonId = uuid()
    let startTime: string
    let endTime: string

    if (template.lesson_type === 'Private') {
      // Private lessons at various times
      const hour = randomInt(9, 14)
      const minute = pick(['00', '30'])
      startTime = makeDateTime(dateStr, `${String(hour).padStart(2, '0')}:${minute}`)
      // 1-2 hour lessons
      const endHour = hour + randomInt(1, 2)
      endTime = makeDateTime(dateStr, `${String(endHour).padStart(2, '0')}:${minute}`)
    } else {
      startTime = makeDateTime(dateStr, template.default_start_time!)
      endTime = makeDateTime(dateStr, template.default_end_time!)
    }

    // Determine status based on date
    let status: string
    const todayStr = TODAY
    if (dateStr < todayStr) {
      // Past days — reported
      status = 'reported'
    } else if (dateStr === todayStr) {
      // Today — mix based on time
      const lessonHour = parseInt(template.default_start_time?.split(':')[0] || '10')
      const currentHour = now.getHours() + 9 - (now.getTimezoneOffset() / -60) // rough Tokyo offset
      if (lessonHour < 10) {
        status = pick(['completed', 'reported'])
      } else if (lessonHour < 12) {
        status = pick(['in_progress', 'completed', 'scheduled'])
      } else {
        status = 'scheduled'
      }
    } else {
      // Future days
      status = 'scheduled'
    }

    lessons.push({
      id: lessonId,
      resort_id: RESORT_ID,
      lesson_template_id: template.id,
      start_time: startTime,
      end_time: endTime,
      status,
      created_by: jasonUserId,
      created_at: isoDate(addDays(new Date(dateStr), -randomInt(1, 5)))
    })

    // Assign instructor(s)
    const discipline = template.discipline_id === SKI_ID ? 'ski' : 'snowboard'
    const eligibleInstructors = instructors.filter(inst => {
      if (inst.discipline !== discipline) return false
      if (template.level_numeric && inst.max_teaching_level < template.level_numeric) return false
      const scheduled = instructorSchedule.get(inst.id) || []
      if (template.default_start_time && scheduled.includes(template.default_start_time)) return false
      return true
    })

    const numInstructors = template.lesson_type === 'Private' ? 1 : randomInt(1, 2)
    const assignedInstructors = pickN(eligibleInstructors, numInstructors)

    for (let i = 0; i < assignedInstructors.length; i++) {
      const inst = assignedInstructors[i]
      instructorAssignments.push({
        id: uuid(),
        lesson_id: lessonId,
        instructor_id: inst.id,
        role: i === 0 ? 'lead' : 'assistant',
        assigned_at: isoDate(addDays(new Date(dateStr), -randomInt(1, 3)))
      })
      // Mark time slot as used
      const slots = instructorSchedule.get(inst.id) || []
      if (template.default_start_time) slots.push(template.default_start_time)
      instructorSchedule.set(inst.id, slots)
    }

    // Assign guests
    const numGuests = template.lesson_type === 'Private'
      ? randomInt(1, 2)
      : randomInt(3, template.max_capacity || 8)

    const eligibleGuests = guests.filter(g => !guestSchedule.has(g.id))
    const assignedGuests = pickN(eligibleGuests, numGuests)

    for (const guest of assignedGuests) {
      bookings.push({
        id: uuid(),
        lesson_id: lessonId,
        guest_id: guest.id,
        booking_status: 'active',
        created_at: isoDate(addDays(new Date(dateStr), -randomInt(0, 3)))
      })
      guestSchedule.set(guest.id, true)
    }

    // Generate reports for completed/reported lessons
    if (status === 'reported' && assignedInstructors.length > 0 && assignedGuests.length > 0) {
      const reportId = uuid()
      const terrain = pickN(TERRAIN_OPTIONS, randomInt(2, 4))
      const skills = pickN(SKILL_OPTIONS, randomInt(2, 4))

      lessonReports.push({
        id: reportId,
        lesson_id: lessonId,
        submitted_by: assignedInstructors[0].id,
        summary: `Good session today with the ${template.name} group. ${pick(['Great conditions.', 'Challenging but fun.', 'Everyone made progress.', 'Solid improvement across the board.'])}`,
        terrain_skied: terrain,
        skills_worked_on: skills,
        created_at: endTime
      })

      for (const guest of assignedGuests) {
        const guestName = guest.first_name
        const skill = pick(skills)
        const note = pick(PROGRESS_TEMPLATES)
          .replace('{name}', guestName)
          .replace('{skill}', skill)

        const currentLevel = template.level_numeric || 1
        const recLevel = Math.random() > 0.7
          ? Math.min(currentLevel + 1, 7)
          : currentLevel

        lessonReportEntries.push({
          id: uuid(),
          report_id: reportId,
          guest_id: guest.id,
          recommended_level: recLevel,
          progress_notes: note,
          created_at: endTime
        })
      }
    }
  }
}

// Generate for each day
console.log('Generating seed data...')
for (let dayOffset = -10; dayOffset <= 4; dayOffset++) {
  const date = addDays(now, dayOffset)
  const dateStr = formatDate(date)
  generateDayLessons(dateStr, dayOffset)
  console.log(`  Day ${dayOffset >= 0 ? '+' : ''}${dayOffset} (${dateStr}): done`)
}

// Make sure Sammy has lessons today
const sammyTodayAssignments = instructorAssignments.filter(a => {
  if (a.instructor_id !== sammyInstructorId) return false
  const lesson = lessons.find(l => l.id === a.lesson_id)
  return lesson && lesson.start_time.startsWith(TODAY)
})

if (sammyTodayAssignments.length === 0) {
  // Assign Sammy to a few of today's ski lessons
  const todayLessons = lessons.filter(l => l.start_time.startsWith(TODAY))
  const skiLessons = todayLessons.filter(l => {
    const tmpl = lessonTemplates.find(t => t.id === l.lesson_template_id)
    return tmpl && tmpl.discipline_id === SKI_ID && tmpl.lesson_type !== 'Private'
  })
  const toAssign = pickN(skiLessons, 3)
  for (const lesson of toAssign) {
    instructorAssignments.push({
      id: uuid(),
      lesson_id: lesson.id,
      instructor_id: sammyInstructorId,
      role: 'lead',
      assigned_at: isoDate(addDays(now, -1))
    })
  }
}

// Make sure Anna has some bookings
const annaTodayBookings = bookings.filter(b => {
  if (b.guest_id !== annaGuestId) return false
  const lesson = lessons.find(l => l.id === b.lesson_id)
  return lesson && lesson.start_time.startsWith(TODAY)
})

if (annaTodayBookings.length === 0) {
  const todayLessons = lessons.filter(l => l.start_time.startsWith(TODAY) && l.status === 'scheduled')
  const skiLessons = todayLessons.filter(l => {
    const tmpl = lessonTemplates.find(t => t.id === l.lesson_template_id)
    return tmpl && tmpl.discipline_id === SKI_ID
  })
  if (skiLessons.length > 0) {
    bookings.push({
      id: uuid(),
      lesson_id: skiLessons[0].id,
      guest_id: annaGuestId,
      booking_status: 'active',
      created_at: isoDate(addDays(now, -1))
    })
  }
}

// ── Write Output ─────────────────────────────────────────────────────

mkdirSync(DATA_DIR, { recursive: true })

function writeJSON(filename: string, data: unknown) {
  const path = join(DATA_DIR, filename)
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log(`  Wrote ${filename}`)
}

console.log('\nWriting JSON files...')
writeJSON('resorts.json', [resort])
writeJSON('users.json', allUsers)
writeJSON('instructors.json', instructors)
writeJSON('guests.json', guests)
writeJSON('disciplines.json', disciplines)
writeJSON('lesson-templates.json', lessonTemplates)
writeJSON('lessons.json', lessons)
writeJSON('bookings.json', bookings)
writeJSON('instructor-assignments.json', instructorAssignments)
writeJSON('lesson-reports.json', lessonReports)
writeJSON('lesson-report-entries.json', lessonReportEntries)

console.log(`\nSeed data generated successfully!`)
console.log(`  Resort: ${resort.name}`)
console.log(`  Users: ${allUsers.length}`)
console.log(`  Instructors: ${instructors.length}`)
console.log(`  Guests: ${guests.length}`)
console.log(`  Lessons: ${lessons.length}`)
console.log(`  Bookings: ${bookings.length}`)
console.log(`  Assignments: ${instructorAssignments.length}`)
console.log(`  Reports: ${lessonReports.length}`)
console.log(`  Report Entries: ${lessonReportEntries.length}`)

// Export key IDs for reference
writeJSON('_seed-ids.json', {
  resortId: RESORT_ID,
  sammyUserId,
  sammyInstructorId,
  jasonUserId,
  annaUserId,
  annaGuestId,
  generatedAt: isoDate(now),
  dateRange: { from: formatDate(startDate), to: formatDate(endDate) }
})
console.log('\nKey IDs saved to _seed-ids.json')
