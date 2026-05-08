import type { Task } from './types'
import { MarkdownEditorField } from '../../components/MarkdownEditorField'
import { TaskAttachmentsField } from '../../components/TaskAttachmentsField'
import { TaskCategoryFields } from '../../components/TaskCategoryFields'
import { TaskPriorityFieldset } from '../../components/TaskPriorityFieldset'
import { useTaskStore } from '../../stores/taskStore'

const field =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:text-slate-500'

export function TaskDetailSection({ task }: { task: Task }) {
  const updateTask = useTaskStore((s) => s.updateTask)
  const tagPresets = useTaskStore((s) => s.tagPresets)
  const locked = task.status === 'completed' || task.status === 'cancelled'

  return (
    <div className="space-y-4 border-b border-slate-200 pb-4">
      <h3 className="text-sm font-semibold text-slate-800">基本信息</h3>
      <div>
        <label htmlFor="edit-task-title" className="text-sm font-medium text-slate-700">
          任务名称
        </label>
        <input
          id="edit-task-title"
          name="edit-task-title"
          value={task.title}
          disabled={locked}
          onChange={(e) => updateTask(task.id, { title: e.target.value })}
          className={field}
        />
      </div>

      <TaskPriorityFieldset
        value={task.priority}
        disabled={locked}
        radioName={`task-priority-${task.id}`}
        onChange={(p) => updateTask(task.id, { priority: p })}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-task-start" className="text-sm font-medium text-slate-700">
            实施开始
          </label>
          <input
            id="edit-task-start"
            name="edit-task-start"
            type="date"
            value={task.implementationStart}
            disabled={locked}
            onChange={(e) => {
              const v = e.target.value
              if (v <= task.implementationEnd) {
                updateTask(task.id, { implementationStart: v })
              } else {
                updateTask(task.id, { implementationStart: v, implementationEnd: v })
              }
            }}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="edit-task-end" className="text-sm font-medium text-slate-700">
            实施结束
          </label>
          <input
            id="edit-task-end"
            name="edit-task-end"
            type="date"
            value={task.implementationEnd}
            disabled={locked}
            onChange={(e) => {
              const v = e.target.value
              if (v >= task.implementationStart) {
                updateTask(task.id, { implementationEnd: v })
              } else {
                updateTask(task.id, { implementationStart: v, implementationEnd: v })
              }
            }}
            className={field}
          />
        </div>
      </div>

      <MarkdownEditorField
        id="edit-task-desc"
        label="任务描述"
        value={task.description}
        disabled={locked}
        onChange={(d) => updateTask(task.id, { description: d })}
      />

      <fieldset disabled={locked}>
        <TaskCategoryFields
          domain={task.domain}
          onDomainChange={(d) => updateTask(task.id, { domain: d })}
          subTag={task.category}
          onSubTagChange={(v) => updateTask(task.id, { category: v })}
          savedSubTags={tagPresets[task.domain]}
        />
      </fieldset>

      <TaskAttachmentsField
        attachments={task.attachments}
        disabled={locked}
        onChange={(next) => updateTask(task.id, { attachments: next })}
      />
    </div>
  )
}
