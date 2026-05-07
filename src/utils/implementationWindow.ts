import type { TimeGranularity } from '../features/tasks/types'
import { parseYMD, ymdToDate } from './dateFilter'

/** Inclusive YYYY-MM-DD range overlap (valid for chronological strings). */
export function ymdRangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd
}

export function weekMonSun(refYmd: string): { mon: string; sun: string } {
  const r = parseYMD(refYmd)
  const refDt = ymdToDate(r.y, r.m, r.d)
  const day = refDt.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(refDt)
  monday.setDate(refDt.getDate() + mondayOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }
  return { mon: fmt(monday), sun: fmt(sunday) }
}

export function monthBounds(refYmd: string): { start: string; end: string } {
  const [yStr, mStr] = refYmd.split('-')
  const y = Number(yStr)
  const m = Number(mStr)
  const first = `${y}-${String(m).padStart(2, '0')}-01`
  const lastDay = new Date(y, m, 0).getDate()
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start: first, end }
}

/** Human-readable active window (YYYY-MM-DD strings). */
export function describeImplementationWindow(
  granularity: TimeGranularity,
  referenceDate: string,
  custom: { start: string; end: string } | null,
): string {
  if (granularity === 'custom' && custom) {
    return `${custom.start} — ${custom.end}`
  }
  if (granularity === 'day') return referenceDate
  if (granularity === 'week') {
    const { mon, sun } = weekMonSun(referenceDate)
    return `${mon} — ${sun}`
  }
  const { start, end } = monthBounds(referenceDate)
  return `${start} — ${end}`
}

export function taskVisibleInImplementationWindow(
  task: { implementationStart: string; implementationEnd: string },
  granularity: 'day' | 'week' | 'month',
  referenceDate: string,
): boolean {
  const { implementationStart: s, implementationEnd: e } = task
  if (granularity === 'day') {
    return referenceDate >= s && referenceDate <= e
  }
  if (granularity === 'week') {
    const { mon, sun } = weekMonSun(referenceDate)
    return ymdRangesOverlap(s, e, mon, sun)
  }
  const { start, end } = monthBounds(referenceDate)
  return ymdRangesOverlap(s, e, start, end)
}

export function filterTasksByImplementationWindow<
  T extends { implementationStart: string; implementationEnd: string },
>(
  tasks: T[],
  granularity: TimeGranularity,
  referenceDate: string,
  customWindow: { start: string; end: string } | null,
): T[] {
  if (granularity === 'custom') {
    if (!customWindow) return tasks
    return tasks.filter((t) =>
      ymdRangesOverlap(t.implementationStart, t.implementationEnd, customWindow.start, customWindow.end),
    )
  }
  return tasks.filter((t) => taskVisibleInImplementationWindow(t, granularity, referenceDate))
}
