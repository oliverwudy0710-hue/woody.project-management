import { useEffect, useRef } from 'react'
import { TaskCategoryFields } from '../../components/TaskCategoryFields'
import { TaskPriorityFieldset } from '../../components/TaskPriorityFieldset'
import { useAddTaskForm } from '../../hooks/useAddTaskForm'

export interface AddTaskModalProps {
  open: boolean
  onClose: () => void
}

const fieldClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

export function AddTaskModal({ open, onClose }: AddTaskModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    scheduledDate,
    setScheduledDate,
    categorySelect,
    setCategorySelect,
    categoryCustom,
    setCategoryCustom,
    titleError,
    submit,
  } = useAddTaskForm({ open, onSuccess: onClose })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>('input[name="task-title"]')?.focus()
    }, 0)
    return () => window.clearTimeout(t)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      data-testid="add-task-modal-backdrop"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-dialog-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        data-testid="add-task-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="add-task-dialog-title" className="text-lg font-semibold text-slate-900">
            新增任务
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div>
            <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-slate-700">
              任务标题 <span className="text-rose-600">*</span>
            </label>
            <input
              id="task-title"
              name="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
              autoComplete="off"
            />
            {titleError ? (
              <p className="mt-1 text-sm text-rose-600" role="alert" data-testid="title-error">
                {titleError}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="task-desc" className="mb-1 block text-sm font-medium text-slate-700">
              任务描述
            </label>
            <textarea
              id="task-desc"
              name="task-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={fieldClass}
            />
          </div>

          <TaskPriorityFieldset value={priority} onChange={setPriority} />

          <div>
            <label htmlFor="task-date" className="mb-1 block text-sm font-medium text-slate-700">
              计划日期 <span className="text-rose-600">*</span>
            </label>
            <input
              id="task-date"
              name="task-date"
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className={fieldClass}
            />
          </div>

          <TaskCategoryFields
            categorySelect={categorySelect}
            onCategorySelectChange={setCategorySelect}
            categoryCustom={categoryCustom}
            onCategoryCustomChange={setCategoryCustom}
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
            >
              创建任务
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
