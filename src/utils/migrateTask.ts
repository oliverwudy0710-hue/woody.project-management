import type { ProgressLogEntry, Task, TaskAttachment, TaskStatus } from '../features/tasks/types'
import { todayISODate } from './dateFilter'

/** Normalize persisted task: legacy `scheduledDate` / `completed` → new model. */
export function migrateTask(raw: unknown): Task {
  if (!raw || typeof raw !== 'object') {
    return emptyFallbackTask()
  }
  const r = raw as Record<string, unknown>
  if (typeof r.implementationStart === 'string' && typeof r.implementationEnd === 'string') {
    return sanitizeExisting(r as unknown as Task)
  }
  const sd = typeof r.scheduledDate === 'string' ? r.scheduledDate : todayISODate()
  const completed = Boolean(r.completed)
  const status: TaskStatus = completed ? 'completed' : 'not_started'
  return sanitizeExisting({
    id:
      String(r.id ?? '').trim() ||
      `migrated_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`,
    title: String(r.title ?? ''),
    description: typeof r.description === 'string' ? r.description : '',
    priority: r.priority === 'high' || r.priority === 'low' || r.priority === 'medium' ? r.priority : 'medium',
    category: typeof r.category === 'string' ? r.category : '',
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString(),
    implementationStart: sd,
    implementationEnd: sd,
    progressPercent: status === 'completed' ? 100 : 0,
    status,
    progressLog: Array.isArray(r.progressLog) ? (r.progressLog as ProgressLogEntry[]) : [],
    attachments: [],
  })
}

function emptyFallbackTask(): Task {
  const d = todayISODate()
  return {
    id: 'invalid',
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    createdAt: new Date().toISOString(),
    implementationStart: d,
    implementationEnd: d,
    progressPercent: 0,
    status: 'not_started',
    progressLog: [],
    attachments: [],
  }
}

function sanitizeAttachment(raw: unknown): TaskAttachment | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = String(r.id ?? '').trim()
  const fileName = String(r.fileName ?? '')
  if (!id || !fileName) return null
  const mimeType = String(r.mimeType ?? 'application/octet-stream')
  const textContent = typeof r.textContent === 'string' ? r.textContent : undefined
  const dataBase64 = typeof r.dataBase64 === 'string' ? r.dataBase64 : undefined
  if (textContent === undefined && dataBase64 === undefined) return null
  return { id, fileName, mimeType, textContent, dataBase64 }
}

function sanitizeExisting(t: Task): Task {
  const validStatus: Task['status'][] = [
    'not_started',
    'in_progress',
    'blocked',
    'completed',
    'cancelled',
  ]
  const status = validStatus.includes(t.status as Task['status'])
    ? t.status
    : 'not_started'
  let progressPercent = Math.max(0, Math.min(100, Math.round(Number(t.progressPercent) || 0)))
  if (status === 'completed') progressPercent = 100
  const log = Array.isArray(t.progressLog) ? t.progressLog : []
  const id =
    String(t.id ?? '').trim() ||
    `migrated_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
  const attachments = Array.isArray(t.attachments)
    ? (t.attachments as unknown[])
        .map(sanitizeAttachment)
        .filter((a): a is TaskAttachment => a !== null)
    : []
  return {
    ...t,
    id,
    status,
    progressPercent,
    attachments,
    progressLog: log.map((e) => ({
      id: String(e.id),
      date: String(e.date),
      note: String(e.note ?? ''),
      progressSnapshot:
        e.progressSnapshot === undefined
          ? undefined
          : Math.max(0, Math.min(100, Math.round(e.progressSnapshot))),
    })),
  }
}
