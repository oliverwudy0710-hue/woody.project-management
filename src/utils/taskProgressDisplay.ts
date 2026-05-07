import type { Task } from '../features/tasks/types'

export function latestProgressNote(task: Task): string | null {
  if (task.progressLog.length === 0) return null
  const sorted = [...task.progressLog].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
  )
  return sorted[0]?.note ?? null
}
