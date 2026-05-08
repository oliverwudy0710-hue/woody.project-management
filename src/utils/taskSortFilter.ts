import type { Task, TaskDomain, TaskPriority, TaskStatus } from '../features/tasks/types'

export type TaskSortKey = 'default' | 'priority' | 'status' | 'progress'

export type TaskStatusFilter = 'all' | TaskStatus

export type TaskDomainFilter = 'all' | TaskDomain

const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }

const statusOrder: Record<TaskStatus, number> = {
  not_started: 0,
  in_progress: 1,
  blocked: 2,
  completed: 3,
  cancelled: 4,
}

export function sortTasks(tasks: Task[], key: TaskSortKey): Task[] {
  if (key === 'default') return tasks
  const out = [...tasks]
  if (key === 'priority') {
    out.sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority] || a.title.localeCompare(b.title, 'zh-CN'),
    )
  } else if (key === 'status') {
    out.sort(
      (a, b) => statusOrder[a.status] - statusOrder[b.status] || a.title.localeCompare(b.title, 'zh-CN'),
    )
  } else if (key === 'progress') {
    out.sort(
      (a, b) =>
        b.progressPercent - a.progressPercent || a.title.localeCompare(b.title, 'zh-CN'),
    )
  }
  return out
}

export function filterTasksByStatus(tasks: Task[], filter: TaskStatusFilter): Task[] {
  if (filter === 'all') return tasks
  return tasks.filter((t) => t.status === filter)
}

export function filterTasksByTag(tasks: Task[], tag: string): Task[] {
  const q = tag.trim()
  if (!q) return tasks
  return tasks.filter((t) => t.category.trim() === q)
}

export function filterTasksByDomain(tasks: Task[], filter: TaskDomainFilter): Task[] {
  if (filter === 'all') return tasks
  return tasks.filter((t) => t.domain === filter)
}
