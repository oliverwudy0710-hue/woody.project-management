import type { CreateTaskInput, ProgressLogEntry, Task, TimeGranularity, TaskDomain } from '../features/tasks/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { migrateTask } from '../utils/migrateTask'
import { monthBounds } from '../utils/implementationWindow'
import { todayISODate } from '../utils/dateFilter'
import { pushActivity } from './activityLogStore'
import {
  emptyTagPresetsByDomain,
  type TagPresetsByDomain,
  TASK_DOMAINS,
  pushUniqueTag,
} from '../features/tasks/domainOptions'

const STORAGE_KEY = 'taskApp_tasks'
const STORE_VERSION = 5

const bootRef = todayISODate()
const bootCustom = monthBounds(bootRef)

function mergePresetForDomain(
  presets: TagPresetsByDomain,
  domain: TaskDomain,
  subtag: string,
): TagPresetsByDomain {
  const t = subtag.trim()
  if (!t) return presets
  const next = pushUniqueTag(presets[domain], t)
  if (next === presets[domain]) return presets
  return { ...presets, [domain]: next }
}

function normalizeTagPresetsRaw(raw: unknown, tasks: Task[]): TagPresetsByDomain {
  const out = emptyTagPresetsByDomain()
  if (Array.isArray(raw)) {
    for (const x of raw) {
      if (typeof x === 'string' && x.trim()) {
        out.work = pushUniqueTag(out.work, x.trim())
      }
    }
  } else if (raw && typeof raw === 'object') {
    for (const d of TASK_DOMAINS) {
      const arr = (raw as Record<string, unknown>)[d]
      if (Array.isArray(arr)) {
        for (const x of arr) {
          if (typeof x === 'string' && x.trim()) {
            out[d] = pushUniqueTag(out[d], x.trim())
          }
        }
      }
    }
  }
  for (const task of tasks) {
    const c = task.category.trim()
    if (c) out[task.domain] = pushUniqueTag(out[task.domain], c)
  }
  return out
}

interface TaskStoreState {
  tasks: Task[]
  tagPresets: TagPresetsByDomain
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

function patchSummary(patch: Partial<Omit<Task, 'id'>>): string {
  const parts: string[] = []
  if (patch.title !== undefined) parts.push(`标题→${String(patch.title).slice(0, 80)}`)
  if (patch.description !== undefined)
    parts.push(`描述已更新(约 ${String(patch.description).length} 字)`)
  if (patch.status !== undefined) parts.push(`状态→${patch.status}`)
  if (patch.priority !== undefined) parts.push(`优先级→${patch.priority}`)
  if (patch.domain !== undefined) parts.push(`领域→${patch.domain}`)
  if (patch.category !== undefined) parts.push(`子标签→${patch.category}`)
  if (patch.progressPercent !== undefined) parts.push(`进度→${patch.progressPercent}%`)
  if (patch.implementationStart !== undefined)
    parts.push(`实施开始→${patch.implementationStart}`)
  if (patch.implementationEnd !== undefined)
    parts.push(`实施结束→${patch.implementationEnd}`)
  if (patch.progressLog !== undefined) parts.push('进展列表变更')
  if (patch.attachments !== undefined) parts.push('附件变更')
  return parts.length ? parts.join('；') : '字段更新'
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

function parseRawTasksFromStorage(raw: string | null): Task[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return []
    const p = parsed as Record<string, unknown>
    const state = p.state
    if (!state || typeof state !== 'object') return []
    const tasks = (state as Record<string, unknown>).tasks
    if (!Array.isArray(tasks)) return []
    return tasks.map((t) => migrateTask(t))
  } catch {
    return []
  }
}

function unwrapPersistedPayload(persisted: unknown): Record<string, unknown> {
  if (!persisted || typeof persisted !== 'object') return {}
  const p = persisted as Record<string, unknown>
  if ('state' in p && p.state && typeof p.state === 'object') {
    return p.state as Record<string, unknown>
  }
  return p as Record<string, unknown>
}

function normalizePersistedSlice(persisted: unknown): PersistedSlice {
  const p = unwrapPersistedPayload(persisted) as Partial<{
    tasks: unknown[]
    tagPresets: unknown
    timeGranularity: TimeGranularity
    referenceDate: string
    customWindowStart: string
    customWindowEnd: string
  }>
  const tasks = Array.isArray(p.tasks) ? p.tasks.map((t) => migrateTask(t)) : []
  const tagPresets = normalizeTagPresetsRaw(p.tagPresets, tasks)
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

export function resolveMigrationSlice(
  persisted: unknown,
  rawStorageValue: string | null,
): { slice: PersistedSlice; usedSafeguard: boolean } {
  const normalized = normalizePersistedSlice(persisted)
  const safeguardTasks = parseRawTasksFromStorage(rawStorageValue)
  if (safeguardTasks.length > 0 && normalized.tasks.length === 0) {
    return {
      slice: {
        ...normalized,
        tasks: safeguardTasks,
        tagPresets: normalizeTagPresetsRaw(normalized.tagPresets, safeguardTasks),
      },
      usedSafeguard: true,
    }
  }
  return { slice: normalized, usedSafeguard: false }
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set) => ({
      tasks: [],
      tagPresets: emptyTagPresetsByDomain(),
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
            domain: input.domain ?? 'work',
            category: (input.category ?? '').trim(),
            createdAt: input.createdAt ?? now,
            implementationStart: input.implementationStart,
            implementationEnd: input.implementationEnd,
            progressPercent,
            status,
            progressLog: input.progressLog ?? [],
            attachments: input.attachments ?? [],
          }
          pushActivity({
            kind: 'task_created',
            taskId: task.id,
            taskTitle: task.title,
            summary: `新建任务「${task.title}」`,
          })
          return {
            tasks: [...s.tasks, task],
            tagPresets: mergePresetForDomain(s.tagPresets, task.domain, task.category),
          }
        }),

      updateTask: (id, patch) =>
        set((s) => {
          const prev = s.tasks.find((t) => t.id === id)
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
            if (patch.category !== undefined || patch.domain !== undefined) {
              tagPresets = mergePresetForDomain(tagPresets, merged.domain, merged.category)
            }
            return merged
          })
          const mergedTask = tasks.find((t) => t.id === id)
          if (prev && mergedTask) {
            pushActivity({
              kind: 'task_updated',
              taskId: id,
              taskTitle: mergedTask.title,
              summary: patchSummary(patch),
            })
          }
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
          pushActivity({
            kind: 'progress_log',
            taskId,
            taskTitle: task.title,
            summary: `${entry.date} 进展：${note.slice(0, 300)}`,
          })
          return {
            tasks: s.tasks.map((t) =>
              t.id === taskId ? { ...t, progressLog: [...t.progressLog, logEntry] } : t,
            ),
          }
        }),

      removeTask: (id) =>
        set((s) => {
          const prev = s.tasks.find((t) => t.id === id)
          if (prev) {
            pushActivity({
              kind: 'task_deleted',
              taskId: id,
              taskTitle: prev.title,
              summary: `删除任务「${prev.title}」`,
            })
          }
          return {
            tasks: s.tasks.filter((t) => t.id !== id),
          }
        }),
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      migrate: (persisted, version) => {
        void version
        if (typeof persisted !== 'object' || persisted === null) {
          const ref = todayISODate()
          const mb = monthBounds(ref)
          return {
            tasks: [],
            tagPresets: emptyTagPresetsByDomain(),
            timeGranularity: 'month',
            referenceDate: ref,
            customWindowStart: mb.start,
            customWindowEnd: mb.end,
          }
        }
        const rawStorage =
          typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
        const resolved = resolveMigrationSlice(persisted, rawStorage)
        if (resolved.usedSafeguard) {
          console.warn('[taskStore] migration safeguard restored tasks from raw storage snapshot')
        }
        return resolved.slice
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
