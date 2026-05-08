import { useEffect } from 'react'
import { RightDrawer } from '../../components/RightDrawer'
import { MarkdownEditorField } from '../../components/MarkdownEditorField'
import { TaskAttachmentsField } from '../../components/TaskAttachmentsField'
import { TaskCategoryFields } from '../../components/TaskCategoryFields'
import { TaskPriorityFieldset } from '../../components/TaskPriorityFieldset'
import { useAddTaskForm } from '../../hooks/useAddTaskForm'
import { useTaskStore } from '../../stores/taskStore'

export interface AddTaskModalProps {
  open: boolean
  onClose: () => void
}

const fieldClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

export function AddTaskModal({ open, onClose }: AddTaskModalProps) {
  const tagPresets = useTaskStore((s) => s.tagPresets)
  const {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    implementationStart,
    setImplementationStart,
    implementationEnd,
    setImplementationEnd,
    domain,
    setDomain,
    subTag,
    setSubTag,
    titleError,
    periodError,
    submit,
    attachments,
    setAttachments,
  } = useAddTaskForm({ open, onSuccess: onClose })

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => {
      document.querySelector<HTMLInputElement>('[data-testid="add-task-modal"] input[name="task-title"]')?.focus()
    }, 0)
    return () => window.clearTimeout(t)
  }, [open])

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      titleId="add-task-dialog-title"
      title="新增任务"
      zClass="z-[60]"
      panelMaxWidthClass="max-w-2xl"
      backdropTestId="add-task-modal-backdrop"
      panelTestId="add-task-modal"
    >
      <p className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
        填写基本信息、Markdown 描述与关联文件；创建后仍可点击卡片在右侧抽屉中继续编辑。
      </p>

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

        <MarkdownEditorField
          id="task-desc"
          label="任务描述"
          value={description}
          onChange={setDescription}
          rows={4}
        />

        <TaskPriorityFieldset value={priority} onChange={setPriority} />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="task-start" className="mb-1 block text-sm font-medium text-slate-700">
              实施开始 <span className="text-rose-600">*</span>
            </label>
            <input
              id="task-start"
              name="task-start"
              type="date"
              required
              value={implementationStart}
              onChange={(e) => setImplementationStart(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="task-end" className="mb-1 block text-sm font-medium text-slate-700">
              实施结束 <span className="text-rose-600">*</span>
            </label>
            <input
              id="task-end"
              name="task-end"
              type="date"
              required
              value={implementationEnd}
              onChange={(e) => setImplementationEnd(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
        {periodError ? (
          <p className="text-sm text-rose-600" role="alert" data-testid="period-error">
            {periodError}
          </p>
        ) : null}

        <TaskCategoryFields
          domain={domain}
          onDomainChange={setDomain}
          subTag={subTag}
          onSubTagChange={setSubTag}
          savedSubTags={tagPresets[domain]}
        />

        <TaskAttachmentsField attachments={attachments} onChange={setAttachments} />

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
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
    </RightDrawer>
  )
}
