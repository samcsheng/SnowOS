// All date functions use LOCAL calendar date (not UTC) so that
// YYYY-MM-DD strings always represent the user's local calendar day.

function localDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

/** Parse a YYYY-MM-DD string as local midnight (not UTC) */
function parseLocalDate(date: string): Date {
  // date-only strings like "2026-03-10" are treated as UTC by spec,
  // so we force local midnight by appending T00:00:00
  return new Date(date.length === 10 ? date + 'T00:00:00' : date)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : date
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`
}

export function getToday(): string {
  return localDateStr(new Date())
}

export function getTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return localDateStr(d)
}

export function addDays(date: string, days: number): string {
  const d = parseLocalDate(date)
  d.setDate(d.getDate() + days)
  return localDateStr(d)
}

export function isToday(dateStr: string): boolean {
  return dateStr.startsWith(getToday())
}

export function isPast(dateStr: string): boolean {
  return dateStr < getToday()
}

export function isFuture(dateStr: string): boolean {
  return dateStr > getToday() + 'T23:59:59'
}

export function formatFullDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : date
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}
