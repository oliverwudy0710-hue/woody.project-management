import { useEffect, useState } from 'react'
import {
  TASK_CATEGORY_BUILTIN,
  TASK_CATEGORY_CUSTOM,
  TASK_CATEGORY_SELECT_EMPTY,
} from './categoryOptions'
import type { Task } from './types'
import { MarkdownEditorField } from '../../components/MarkdownEditorField'
import { TaskAttachmentsField } from '../../components/TaskAttachmentsField'
import { TaskCategoryFields } from '../../components/TaskCategoryFields'
import { TaskPriorityFieldset } from '../../components/TaskPriorityFieldset'
import { useTaskStore } from '../../stores/taskStore'

const field =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:text-slate-500'

function syncCategoryUi(
  category: string,
  tagPresets: string[],
): { select: string; custom: string } {
  const c = category.trim()
  const builtin = new Set<string>(TASK_CATEGORY_BUILTIN)
  const inSaved = tagPresets.includes(c)
  if (!c) return { select: TASK_CATEGORY_SELECT_EMPTY, custom: '' }
  if (builtin.has(c) || inSaved) return { select: c, custom: '' }
  return { select: TASK_CATEGORY_CUSTOM, custom: c }
}

export function TaskDetailSection({ task }: { task: Task }) {
  const updateTask = useTaskStore((s) => s.updateTask)
  const tagPresets = useTaskStore((s) => s.tagPresets)
  const locked = task.status === 'completed' || task.status === 'cancelled'

  const [catSelect, setCatSelect] = useState('')
  const [catCustom, setCatCustom] = useState('')

  useEffect(() => {
    const { select, custom } = syncCategoryUi(task.category, tagPresets)
    setCatSelect(select)
    setCatCustom(custom)
  }, [task.id, task.category, tagPresets])

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

      <TaskCategoryFields
        categorySelect={catSelect}
        onCategorySelectChange={(v) => {
          setCatSelect(v)
          if (v === TASK_CATEGORY_CUSTOM) {
            setCatCustom(task.category)
            return
          }
          if (v === TASK_CATEGORY_SELECT_EMPTY) {
            updateTask(task.id, { category: '' })
            setCatCustom('')
            return
          }
          updateTask(task.id, { category: v })
        }}
        categoryCustom={catCustom}
        onCategoryCustomChange={(next) => {
          setCatCustom(next)
          updateTask(task.id, { category: next })
        }}
        savedTags={tagPresets}
      />

      <TaskAttachmentsField
        attachments={task.attachments}
        disabled={locked}
        onChange={(next) => updateTask(task.id, { attachments: next })}
      />
    </div>
  )
}
