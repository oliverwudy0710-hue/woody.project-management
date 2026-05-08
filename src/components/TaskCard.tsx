import { useState } from 'react'
import type { Task } from '../features/tasks/types'
import { latestProgressNote } from '../utils/taskProgressDisplay'
import { taskPriorityLabel } from '../utils/taskLabels'
import { taskStatusLabel } from '../utils/taskStatusLabels'
import { taskStatusPillClass, taskStatusProgressFillClass } from '../utils/taskStatusVisual'
import { useTaskStore } from '../stores/taskStore'
import { ConfirmDialog } from './ConfirmDialog'
import { MarkdownPreview } from './MarkdownPreview'
import { TaskCategoryBadge } from './TaskCategoryBadge'

const priorityClass: Record<Task['priority'], string> = {
  high: 'bg-rose-100 text-rose-800 ring-rose-200',
  medium: 'bg-amber-100 text-amber-900 ring-amber-200',
  low: 'bg-slate-100 text-slate-700 ring-slate-200',
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

export interface TaskCardProps {
  task: Task
  onOpenProgress: () => void
  className?: string
}

export function TaskCard({ task, onOpenProgress, className = '' }: TaskCardProps) {
  const removeTask = useTaskStore((s) => s.removeTask)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const muted = task.status === 'completed' || task.status === 'cancelled'
  const latest = latestProgressNote(task)

  return (
    <>
      <article
        className={`group flex h-full min-h-[12rem] gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-md shadow-slate-200/50 ring-1 ring-slate-100/80 backdrop-blur-sm transition-all duration-200 hover:border-indigo-200/60 hover:shadow-lg hover:shadow-indigo-100/40 ${
          muted ? 'opacity-80' : ''
        } ${className}`}
        data-testid={`task-card-${task.id}`}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label="打开任务进度"
          data-testid="task-card-open-progress"
          onClick={onOpenProgress}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onOpenProgress()
            }
          }}
          className="min-w-0 flex-1 cursor-pointer rounded-xl text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3
              className={`min-w-0 max-w-[85%] truncate text-base font-semibold text-slate-900 ${
                task.status === 'completed' ? 'line-through decoration-slate-400' : ''
              }`}
              title={task.title}
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
          {task.description.trim() ? (
            <div
              className="task-card-desc mt-1 line-clamp-3 min-h-0 overflow-hidden break-words"
              title={task.description}
            >
              <MarkdownPreview markdown={task.description} className="text-slate-600" />
            </div>
          ) : null}
          {task.attachments.length > 0 ? (
            <p className="mt-1 text-xs text-slate-400">附件 {task.attachments.length} 个 · 在详情中预览</p>
          ) : null}

          <div className="mt-2">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
              <span>{task.progressPercent}%</span>
              <span
                data-testid="task-status"
                className={`inline-flex rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ${taskStatusPillClass[task.status]}`}
              >
                {taskStatusLabel[task.status]}
              </span>
            </div>
            <div
              className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={task.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-[width] ${taskStatusProgressFillClass[task.status]}`}
                style={{ width: `${task.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <TaskCategoryBadge domain={task.domain} category={task.category} />
            <span data-testid="task-implementation">
              实施：{task.implementationStart} ~ {task.implementationEnd}
            </span>
          </div>
          {latest ? (
            <p
              className="mt-2 line-clamp-2 cursor-default text-xs text-slate-600"
              data-testid="task-latest-progress"
              title={latest}
            >
              最新进展：{latest}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end justify-start">
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="删除任务"
            data-testid="task-delete-button"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </article>

      <ConfirmDialog
        open={deleteOpen}
        title="删除任务"
        description={`确定要删除「${task.title}」吗？此操作不可恢复。`}
        confirmLabel="删除"
        variant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          removeTask(task.id)
          setDeleteOpen(false)
        }}
      />
    </>
  )
}
