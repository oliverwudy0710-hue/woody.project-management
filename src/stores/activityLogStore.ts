import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { todayISODate } from '../utils/dateFilter'

const STORAGE_KEY = 'taskApp_activity_log'
const STORE_VERSION = 1
const MAX_ENTRIES = 3500

export interface ActivityLogEntry {
  id: string
  /** 本地日历日 YYYY-MM-DD */
  date: string
  /** ISO 时间 */
  at: string
  kind: 'task_created' | 'task_updated' | 'task_deleted' | 'progress_log'
  taskId: string
  taskTitle: string
  summary: string
}

interface ActivityLogState {
  entries: ActivityLogEntry[]
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
}

function prune(entries: ActivityLogEntry[]): ActivityLogEntry[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 120)
  const y = cutoff.getFullYear()
  const m = String(cutoff.getMonth() + 1).padStart(2, '0')
  const d = String(cutoff.getDate()).padStart(2, '0')
  const minDay = `${y}-${m}-${d}`
  const filtered = entries.filter((e) => e.date >= minDay)
  return filtered.slice(-MAX_ENTRIES)
}

export const useActivityLogStore = create<ActivityLogState>()(
  persist(
    (): ActivityLogState => ({
      entries: [],
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      migrate: (persisted) => {
        if (typeof persisted !== 'object' || persisted === null || !('entries' in persisted)) {
          return { entries: [] }
        }
        const p = persisted as { entries?: unknown }
        const arr = Array.isArray(p.entries) ? p.entries : []
        const entries: ActivityLogEntry[] = arr
          .filter((x): x is ActivityLogEntry => {
            if (!x || typeof x !== 'object') return false
            const e = x as Record<string, unknown>
            return (
              typeof e.id === 'string' &&
              typeof e.date === 'string' &&
              typeof e.at === 'string' &&
              typeof e.kind === 'string' &&
              typeof e.taskId === 'string' &&
              typeof e.taskTitle === 'string' &&
              typeof e.summary === 'string'
            )
          })
          .map((e) => ({ ...e }))
        return { entries: prune(entries) }
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ entries: s.entries }),
    },
  ),
)

/** 供 taskStore 等非 React 处调用；自动按「今天」落日期。 */
export function pushActivity(entry: {
  kind: ActivityLogEntry['kind']
  taskId: string
  taskTitle: string
  summary: string
  /** 指定日历日；默认今天（本地） */
  date?: string
}): void {
  const date = entry.date ?? todayISODate()
  const row: ActivityLogEntry = {
    id: newId(),
    date,
    at: new Date().toISOString(),
    kind: entry.kind,
    taskId: entry.taskId,
    taskTitle: entry.taskTitle.slice(0, 200),
    summary: entry.summary.slice(0, 2000),
  }
  useActivityLogStore.setState((s) => ({
    entries: prune([...s.entries, row]),
  }))
}

export function getActivityEntriesForDate(date: string): ActivityLogEntry[] {
  return useActivityLogStore.getState().entries.filter((e) => e.date === date)
}
