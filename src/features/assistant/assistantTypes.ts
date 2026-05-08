import type { TaskPriority, TaskStatus, TaskDomain } from '../tasks/types'
import { isTaskDomain } from '../tasks/domainOptions'

export type AssistantOperation =
  | {
      op: 'create_task'
      title: string
      description?: string
      priority?: TaskPriority
      domain?: TaskDomain
      category?: string
      implementationStart?: string
      implementationEnd?: string
    }
  | { op: 'append_log'; taskTitleKeyword: string; note: string; date?: string }
  | {
      op: 'update_task'
      taskId: string
      title?: string
      description?: string
      priority?: TaskPriority
      domain?: TaskDomain
      category?: string
      implementationStart?: string
      implementationEnd?: string
      progressPercent?: number
      status?: TaskStatus
    }
  | { op: 'none' }

export interface AssistantModelResponse {
  message: string
  operations: AssistantOperation[]
}

export function parseAssistantResponse(raw: string): AssistantModelResponse {
  let t = raw.trim()
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '')
    t = t.replace(/\s*```\s*$/i, '')
  }
  const parsed = JSON.parse(t) as unknown
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('模型返回不是 JSON 对象')
  }
  const obj = parsed as Record<string, unknown>
  const message = typeof obj.message === 'string' ? obj.message : ''
  const opsRaw = obj.operations
  if (!Array.isArray(opsRaw)) {
    throw new Error('缺少 operations 数组')
  }
  const operations: AssistantOperation[] = opsRaw.map((x) => normalizeOp(x))
  return { message, operations }
}

const STATUSES: TaskStatus[] = [
  'not_started',
  'in_progress',
  'blocked',
  'completed',
  'cancelled',
]

function normalizeOp(x: unknown): AssistantOperation {
  if (!x || typeof x !== 'object') return { op: 'none' }
  const o = x as Record<string, unknown>
  const op = o.op
  if (op === 'create_task' && typeof o.title === 'string' && o.title.trim()) {
    return {
      op: 'create_task',
      title: o.title.trim(),
      description: typeof o.description === 'string' ? o.description : '',
      priority:
        o.priority === 'high' || o.priority === 'medium' || o.priority === 'low'
          ? o.priority
          : 'medium',
      domain: typeof o.domain === 'string' && isTaskDomain(o.domain) ? o.domain : undefined,
      category: typeof o.category === 'string' ? o.category : '',
      implementationStart:
        typeof o.implementationStart === 'string' ? o.implementationStart : undefined,
      implementationEnd:
        typeof o.implementationEnd === 'string' ? o.implementationEnd : undefined,
    }
  }
  if (op === 'append_log' && typeof o.note === 'string' && o.note.trim()) {
    const kw =
      typeof o.taskTitleKeyword === 'string'
        ? o.taskTitleKeyword.trim()
        : typeof o.taskTitle === 'string'
          ? o.taskTitle.trim()
          : ''
    return {
      op: 'append_log',
      taskTitleKeyword: kw,
      note: o.note.trim(),
      date: typeof o.date === 'string' ? o.date : undefined,
    }
  }
  if (op === 'update_task' && typeof o.taskId === 'string' && o.taskId.trim()) {
    const st = o.status
    const status =
      typeof st === 'string' && (STATUSES as string[]).includes(st) ? (st as TaskStatus) : undefined
    const pp = o.progressPercent
    const progressPercent =
      typeof pp === 'number' && Number.isFinite(pp) ? Math.round(pp) : undefined
    return {
      op: 'update_task',
      taskId: o.taskId.trim(),
      title: typeof o.title === 'string' ? o.title : undefined,
      description: typeof o.description === 'string' ? o.description : undefined,
      priority:
        o.priority === 'high' || o.priority === 'medium' || o.priority === 'low'
          ? o.priority
          : undefined,
      domain: typeof o.domain === 'string' && isTaskDomain(o.domain) ? o.domain : undefined,
      category: typeof o.category === 'string' ? o.category : undefined,
      implementationStart:
        typeof o.implementationStart === 'string' ? o.implementationStart : undefined,
      implementationEnd:
        typeof o.implementationEnd === 'string' ? o.implementationEnd : undefined,
      progressPercent,
      status,
    }
  }
  return { op: 'none' }
}
