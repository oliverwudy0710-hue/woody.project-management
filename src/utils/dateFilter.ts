/** YYYY-MM-DD for "today" in local timezone */
export function todayISODate(): string {
  const n = new Date()
  const y = n.getFullYear()
  const m = String(n.getMonth() + 1).padStart(2, '0')
  const d = String(n.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseYMD(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split('-').map(Number)
  return { y, m: m ?? 1, d: d ?? 1 }
}

export function ymdToDate(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d)
}

export function dateInSameMonth(scheduled: string, ref: string): boolean {
  return scheduled.slice(0, 7) === ref.slice(0, 7)
}

export function dateOnSameDay(scheduled: string, ref: string): boolean {
  return scheduled === ref
}

/** Week is Monday–Sunday (local). `ref` is any YYYY-MM-DD in that week. */
export function dateInSameWeek(scheduled: string, ref: string): boolean {
  const r = parseYMD(ref)
  const refDt = ymdToDate(r.y, r.m, r.d)
  const day = refDt.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(refDt)
  monday.setDate(refDt.getDate() + mondayOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const s = parseYMD(scheduled)
  const schedDt = ymdToDate(s.y, s.m, s.d)
  return schedDt >= monday && schedDt <= sunday
}

export function filterTasksByGranularity<T extends { scheduledDate: string }>(
  tasks: T[],
  granularity: 'day' | 'week' | 'month',
  referenceDate: string,
): T[] {
  return tasks.filter((t) => {
    if (granularity === 'day') return dateOnSameDay(t.scheduledDate, referenceDate)
    if (granularity === 'week') return dateInSameWeek(t.scheduledDate, referenceDate)
    return dateInSameMonth(t.scheduledDate, referenceDate)
  })
}
