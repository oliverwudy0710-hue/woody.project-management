import type { Task } from '../features/tasks/types'
import { taskPriorityLabel } from '../utils/taskLabels'

const priorityClass: Record<Task['priority'], string> = {
  high: 'bg-rose-100 text-rose-800 ring-rose-200',
  medium: 'bg-amber-100 text-amber-900 ring-amber-200',
  low: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article
      className={`flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100 ${
        task.completed ? 'opacity-70' : ''
      }`}
      data-testid={`task-card-${task.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3
          className={`text-base font-semibold text-slate-900 ${
            task.completed ? 'line-through decoration-slate-400' : ''
          }`}
        >
          {task.title}
        </h3>
        <span
          className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityClass[task.priority]}`}
          data-testid="task-priority"
        >
          {taskPriorityLabel[task.priority]}
        </span>
      </div>
      {task.description ? (
        <p className="text-sm text-slate-600">{task.description}</p>
      ) : null}
      <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
        <span
          className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700"
          data-testid="task-category"
        >
          {task.category || '未分类'}
        </span>
        <span data-testid="task-scheduled">计划：{task.scheduledDate}</span>
        <span
          className="font-medium text-slate-700"
          data-testid="task-completed"
        >
          {task.completed ? '已完成' : '未完成'}
        </span>
      </div>
    </article>
  )
}
