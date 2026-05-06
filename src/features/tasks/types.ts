export type TaskPriority = 'high' | 'medium' | 'low'

export type TimeGranularity = 'day' | 'week' | 'month'

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: TaskPriority
  category: string
  /** ISO datetime when the task record was created */
  createdAt: string
  /** Planned date YYYY-MM-DD */
  scheduledDate: string
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt'> & {
  id?: string
  createdAt?: string
}
