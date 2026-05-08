export type TaskPriority = 'high' | 'medium' | 'low'

/** 任务领域：工作 / 生活 / 学习 */
export type TaskDomain = 'work' | 'life' | 'study'

export type TimeGranularity = 'day' | 'week' | 'month' | 'custom'

export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'

export interface ProgressLogEntry {
  id: string
  /** YYYY-MM-DD */
  date: string
  note: string
  progressSnapshot?: number
}

/** Local file snapshot (stored in localStorage; large PDFs may hit quota). */
export interface TaskAttachment {
  id: string
  fileName: string
  mimeType: string
  /** Markdown / plain text source */
  textContent?: string
  /** Binary files (e.g. PDF) as raw base64 */
  dataBase64?: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: TaskPriority
  domain: TaskDomain
  /** 子标签（自定义细类），可空 */
  category: string
  attachments: TaskAttachment[]
  /** ISO datetime when the task record was created */
  createdAt: string
  /** 实施开始 YYYY-MM-DD */
  implementationStart: string
  /** 实施结束 YYYY-MM-DD */
  implementationEnd: string
  /** 0–100 */
  progressPercent: number
  status: TaskStatus
  progressLog: ProgressLogEntry[]
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt'> & {
  id?: string
  createdAt?: string
}
