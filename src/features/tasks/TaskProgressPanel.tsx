import { useRef } from 'react'
import type { TaskStatus } from './types'
import { ProgressLogTimeline } from './ProgressLogTimeline'
import { TaskDetailSection } from './TaskDetailSection'
import { WorkspaceSidePanel } from '../../components/WorkspaceSidePanel'
import { useTaskStore } from '../../stores/taskStore'
import { taskStatusLabel } from '../../utils/taskStatusLabels'
import { taskStatusPillClass } from '../../utils/taskStatusVisual'
import { todayISODate } from '../../utils/dateFilter'

export interface TaskProgressPanelProps {
  taskId: string | null
  onClose: () => void
}

const field =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

const statuses: TaskStatus[] = [
  'not_started',
  'in_progress',
  'blocked',
  'completed',
  'cancelled',
]

export function TaskProgressPanel({ taskId, onClose }: TaskProgressPanelProps) {
  const task = useTaskStore((s) => (taskId ? s.tasks.find((t) => t.id === taskId) : undefined))
  const updateTask = useTaskStore((s) => s.updateTask)
  const appendProgressLog = useTaskStore((s) => s.appendProgressLog)
  const logDateRef = useRef<HTMLInputElement>(null)
  const logNoteRef = useRef<HTMLTextAreaElement>(null)

  const open = Boolean(taskId && task)
  if (!open || !task) return null

  const locked = task.status === 'completed' || task.status === 'cancelled'

  return (
    <WorkspaceSidePanel
      open={open}
      onClose={onClose}
      titleId="progress-panel-title"
      ariaLabel="任务详情与进度"
      zClass="z-[60]"
      panelMaxWidthClass="max-w-2xl"
      backdropTestId="task-progress-backdrop"
      panelTestId="task-progress-panel"
      title={
        <div>
          <span className="text-base font-semibold text-slate-900">任务详情与进度</span>
          <p className="mt-1 text-sm font-medium text-slate-800">{task.title}</p>
          <p className="text-xs text-slate-500">
            实施 {task.implementationStart} ~ {task.implementationEnd}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${taskStatusPillClass[task.status]}`}
          >
            {taskStatusLabel[task.status]}
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        <TaskDetailSection task={task} />

        <div>
          <label htmlFor="progress-status" className="text-sm font-medium text-slate-700">
            状态
          </label>
          <select
            id="progress-status"
            value={task.status}
            onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
            className={field}
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {taskStatusLabel[st]}
              </option>
            ))}
          </select>

          <label htmlFor="progress-percent" className="mt-3 block text-sm font-medium text-slate-700">
            完成进度（0–100%，步进 1%）。拖到 100% 时会询问是否标记为已完成；完成后可在「状态」中改回进行中或阻塞。
          </label>
          <datalist id={`progress-ticks-${task.id}`}>
            <option value="50" />
          </datalist>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="progress-percent"
              type="range"
              min={0}
              max={100}
              step={1}
              list={`progress-ticks-${task.id}`}
              disabled={locked}
              value={task.progressPercent}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (locked) return
                if (v < 100) {
                  updateTask(task.id, { progressPercent: v })
                  return
                }
                const ok = window.confirm(
                  '将进度设为 100% 并标记为「已完成」，确定吗？',
                )
                if (ok) {
                  updateTask(task.id, { progressPercent: 100, status: 'completed' })
                }
              }}
              className="h-2 w-full flex-1 cursor-pointer accent-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="w-10 shrink-0 tabular-nums text-sm text-slate-700">{task.progressPercent}%</span>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">追加每日进展</h3>
            {locked ? (
              <p className="mt-2 text-sm text-amber-700">当前状态为已完成或已取消，不可再追加进展。</p>
            ) : (
              <form
                key={task.id}
                className="mt-2 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  const noteEl = logNoteRef.current
                  const dateEl = logDateRef.current
                  if (!noteEl || !dateEl) return
                  const note = noteEl.value.trim()
                  if (!note) return
                  appendProgressLog(task.id, {
                    date: dateEl.value,
                    note,
                    progressSnapshot: task.progressPercent,
                  })
                  noteEl.value = ''
                }}
              >
                <div>
                  <label htmlFor="log-date" className="text-xs font-medium text-slate-600">
                    日期
                  </label>
                  <input
                    ref={logDateRef}
                    id="log-date"
                    type="date"
                    name="log-date"
                    className={field}
                    defaultValue={todayISODate()}
                  />
                </div>
                <div>
                  <label htmlFor="log-note" className="text-xs font-medium text-slate-600">
                    进展说明
                  </label>
                  <textarea
                    ref={logNoteRef}
                    id="log-note"
                    name="log-note"
                    rows={3}
                    className={field}
                    placeholder="今天做了什么、遇到什么问题…"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  保存本条进展
                </button>
              </form>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-800">历史进展</h3>
            <ProgressLogTimeline entries={task.progressLog} />
          </div>
        </div>
      </div>
    </WorkspaceSidePanel>
  )
}
