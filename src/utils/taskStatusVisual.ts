import type { TaskStatus } from '../features/tasks/types'

/** Colored pill classes for status badges */
export const taskStatusPillClass: Record<TaskStatus, string> = {
  not_started: 'bg-slate-100 text-slate-800 ring-slate-200',
  in_progress: 'bg-blue-100 text-blue-800 ring-blue-200',
  blocked: 'bg-amber-100 text-amber-900 ring-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  cancelled: 'bg-slate-200 text-slate-600 ring-slate-300',
}

/** Progress bar fill color by status */
export const taskStatusProgressFillClass: Record<TaskStatus, string> = {
  not_started: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  blocked: 'bg-amber-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-slate-400',
}
