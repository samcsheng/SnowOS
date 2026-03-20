// All date/time helpers treat stored ISO timestamps as having an "intended" local
// date and time — the YYYY-MM-DD and HH:MM portions written in the string are the
// values to display, regardless of the timezone offset appended to the string.
//
// Strategy:
//   • Date display  → extract substring(0,10), parse as local midnight
//   • Time display  → extract T HH:MM from the string directly (no timezone conversion)
//   • Date math     → use local Date components (not UTC .toISOString())

/** Format a Date as YYYY-MM-DD using local calendar date */
function localDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

/**
 * Parse a date for display.
 * Always extracts the YYYY-MM-DD portion of any string so that an ISO timestamp
 * like "2026-03-10T09:00:00+09:00" displays as March 10, not March 9 in UTC-5.
 */
function toDisplayDate(date: string | Date): Date {
  if (typeof date !== 'string') return date
  // Take only the first 10 chars (YYYY-MM-DD) and parse as local midnight.
  // Without the T00:00:00 suffix the spec treats bare date strings as UTC.
  return new Date(date.substring(0, 10) + 'T00:00:00')
}

export function formatDate(date: string | Date): string {
  return toDisplayDate(date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

/**
 * Format the time portion of an ISO timestamp string.
 * Reads HH:MM directly from the string instead of converting through Date,
 * so "2026-03-10T09:00:00+09:00" always shows "9:00 AM" in every timezone.
 */
export function formatTime(dateStr: string): string {
  const m = dateStr.match(/T(\d{2}):(\d{2})/)
  if (m) {
    const h = parseInt(m[1], 10)
    const min = m[2]
    const period = h < 12 ? 'AM' : 'PM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${h12}:${min} ${period}`
  }
  // Fallback for bare time strings or unexpected formats
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

/** Today's date as YYYY-MM-DD using the local calendar (not UTC). */
export function getToday(): string {
  return localDateStr(new Date())
}

export function getTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return localDateStr(d)
}

/**
 * Add/subtract days from a YYYY-MM-DD string.
 * Parses as local midnight to avoid UTC DST/offset edge cases.
 */
export function addDays(date: string, days: number): string {
  const d = new Date(date.substring(0, 10) + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return localDateStr(d)
}

/**
 * Returns true if dateStr (YYYY-MM-DD or ISO timestamp) starts with today's date.
 * String prefix comparison works for both formats.
 */
export function isToday(dateStr: string): boolean {
  return dateStr.startsWith(getToday())
}

/** Returns true if dateStr is strictly before today (string comparison on YYYY-MM-DD prefix). */
export function isPast(dateStr: string): boolean {
  return dateStr.substring(0, 10) < getToday()
}

/** Returns true if dateStr is strictly after today's last second. */
export function isFuture(dateStr: string): boolean {
  return dateStr > getToday() + 'T23:59:59'
}

export function formatFullDate(date: string | Date): string {
  return toDisplayDate(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}
