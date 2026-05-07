import type { CreateTaskInput, ProgressLogEntry, Task, TimeGranularity } from '../features/tasks/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { migrateTask } from '../utils/migrateTask'
import { monthBounds } from '../utils/implementationWindow'
import { todayISODate } from '../utils/dateFilter'

const STORAGE_KEY = 'taskApp_tasks'
const STORE_VERSION = 4

const bootRef = todayISODate()
const bootCustom = monthBounds(bootRef)

function mergeTagPresets(list: string[], category: string): string[] {
  const t = category.trim()
  if (!t) return list
  if (list.includes(t)) return list
  return [...list, t]
}

function dedupeTagPresets(fromStore: string[], tasks: Task[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of fromStore) {
    const x = typeof raw === 'string' ? raw.trim() : ''
    if (!x || seen.has(x)) continue
    seen.add(x)
    out.push(x)
  }
  for (const task of tasks) {
    const x = task.category.trim()
    if (!x || seen.has(x)) continue
    seen.add(x)
    out.push(x)
  }
  return out
}

interface TaskStoreState {
  tasks: Task[]
  tagPresets: string[]
  timeGranularity: TimeGranularity
  referenceDate: string
  customWindowStart: string
  customWindowEnd: string
  setTimeGranularity: (g: TimeGranularity) => void
  setReferenceDate: (d: string) => void
  setCustomWindow: (start: string, end: string) => void
  addTask: (input: CreateTaskInput) => void
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
  appendProgressLog: (
    taskId: string,
    entry: Pick<ProgressLogEntry, 'date' | 'note'> & { progressSnapshot?: number; id?: string },
  ) => void
  removeTask: (id: string) => void
}

function newTaskId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
}

type PersistedSlice = Pick<
  TaskStoreState,
  | 'tasks'
  | 'tagPresets'
  | 'timeGranularity'
  | 'referenceDate'
  | 'customWindowStart'
  | 'customWindowEnd'
>

function normalizePersistedSlice(persisted: unknown): PersistedSlice {
  const p = persisted as Partial<{
    tasks: unknown[]
    tagPresets: unknown[]
    timeGranularity: TimeGranularity
    referenceDate: string
    customWindowStart: string
    customWindowEnd: string
  }>
  const tasks = Array.isArray(p.tasks) ? p.tasks.map((t) => migrateTask(t)) : []
  const fromStore = Array.isArray(p.tagPresets)
    ? p.tagPresets.filter((x): x is string => typeof x === 'string')
    : []
  const tagPresets = dedupeTagPresets(fromStore, tasks)
  const ref = p.referenceDate ?? todayISODate()
  const mb = monthBounds(ref)
  let customWindowStart = typeof p.customWindowStart === 'string' && p.customWindowStart ? p.customWindowStart : mb.start
  let customWindowEnd = typeof p.customWindowEnd === 'string' && p.customWindowEnd ? p.customWindowEnd : mb.end
  if (customWindowStart > customWindowEnd) {
    const t = customWindowStart
    customWindowStart = customWindowEnd
    customWindowEnd = t
  }
  const raw = p.timeGranularity
  const timeGranularity: TimeGranularity =
    raw === 'day' || raw === 'week' || raw === 'month' || raw === 'custom' ? raw : 'month'
  return {
    tasks,
    tagPresets,
    timeGranularity,
    referenceDate: ref,
    customWindowStart,
    customWindowEnd,
  }
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set) => ({
      tasks: [],
      tagPresets: [],
      timeGranularity: 'month',
      referenceDate: bootRef,
      customWindowStart: bootCustom.start,
      customWindowEnd: bootCustom.end,

      setTimeGranularity: (g) =>
        set((s) => {
          if (g === 'custom') {
            if (s.timeGranularity === 'custom') return { timeGranularity: 'custom' }
            const { start, end } = monthBounds(s.referenceDate)
            return {
              timeGranularity: 'custom',
              customWindowStart: start,
              customWindowEnd: end,
            }
          }
          return { timeGranularity: g }
        }),

      setReferenceDate: (d) => set({ referenceDate: d }),

      setCustomWindow: (a, b) =>
        set({
          customWindowStart: a <= b ? a : b,
          customWindowEnd: a <= b ? b : a,
        }),

      addTask: (input) =>
        set((s) => {
          const now = new Date().toISOString()
          let progressPercent = Math.max(
            0,
            Math.min(100, Math.round(input.progressPercent ?? 0)),
          )
          const status = input.status ?? 'not_started'
          if (status === 'completed') progressPercent = 100
          const task: Task = {
            id: input.id ?? newTaskId(),
            title: input.title,
            description: input.description,
            priority: input.priority,
            category: input.category,
            createdAt: input.createdAt ?? now,
            implementationStart: input.implementationStart,
            implementationEnd: input.implementationEnd,
            progressPercent,
            status,
            progressLog: input.progressLog ?? [],
            attachments: input.attachments ?? [],
          }
          return {
            tasks: [...s.tasks, task],
            tagPresets: mergeTagPresets(s.tagPresets, task.category),
          }
        }),

      updateTask: (id, patch) =>
        set((s) => {
          let tagPresets = s.tagPresets
          const tasks = s.tasks.map((t) => {
            if (t.id !== id) return t
            const merged: Task = { ...t, ...patch }
            if (patch.progressPercent !== undefined) {
              merged.progressPercent = Math.max(
                0,
                Math.min(100, Math.round(patch.progressPercent)),
              )
            }
            if (patch.status === 'completed') {
              merged.progressPercent = 100
            }
            if (merged.progressPercent >= 100 && merged.status !== 'cancelled') {
              merged.progressPercent = 100
              merged.status = 'completed'
            }
            if (patch.category !== undefined) {
              tagPresets = mergeTagPresets(tagPresets, merged.category)
            }
            return merged
          })
          return { tasks, tagPresets }
        }),

      appendProgressLog: (taskId, entry) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId)
          if (!task || task.status === 'completed' || task.status === 'cancelled') {
            return s
          }
          const note = entry.note.trim()
          if (!note) return s
          const logEntry: ProgressLogEntry = {
            id: entry.id ?? newTaskId(),
            date: entry.date,
            note,
            progressSnapshot: entry.progressSnapshot ?? task.progressPercent,
          }
          return {
            tasks: s.tasks.map((t) =>
              t.id === taskId ? { ...t, progressLog: [...t.progressLog, logEntry] } : t,
            ),
          }
        }),

      removeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
        })),
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      migrate: (persisted) => {
        if (typeof persisted !== 'object' || persisted === null) {
          const ref = todayISODate()
          const mb = monthBounds(ref)
          return {
            tasks: [],
            tagPresets: [],
            timeGranularity: 'month',
            referenceDate: ref,
            customWindowStart: mb.start,
            customWindowEnd: mb.end,
          }
        }
        return normalizePersistedSlice(persisted)
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        tagPresets: state.tagPresets,
        timeGranularity: state.timeGranularity,
        referenceDate: state.referenceDate,
        customWindowStart: state.customWindowStart,
        customWindowEnd: state.customWindowEnd,
      }),
    },
  ),
)
