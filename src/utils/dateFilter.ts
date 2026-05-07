/** YYYY-MM-DD for "today" in local timezone */
export function todayISODate(): string {
  const n = new Date()
  const y = n.getFullYear()
  const m = String(n.getMonth() + 1).padStart(2, '0')
  const d = String(n.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseYMD(s: string): { y: number; m: number; d: number } {
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
