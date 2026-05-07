import type { TaskPriority } from '../features/tasks/types'
import { taskPriorityLabel } from '../utils/taskLabels'

export interface TaskPriorityFieldsetProps {
  value: TaskPriority
  onChange: (priority: TaskPriority) => void
  disabled?: boolean
  /** Distinct name when multiple fieldsets exist on page */
  radioName?: string
}

const order: TaskPriority[] = ['high', 'medium', 'low']

export function TaskPriorityFieldset({
  value,
  onChange,
  disabled,
  radioName = 'task-priority',
}: TaskPriorityFieldsetProps) {
  return (
    <fieldset className={`rounded-lg border border-slate-200 p-3 ${disabled ? 'opacity-70' : ''}`}>
      <legend className="px-1 text-sm font-medium text-slate-700">
        优先级 <span className="text-rose-600">*</span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-4">
        {order.map((p) => (
          <label key={p} className="inline-flex items-center gap-2 text-sm text-slate-800">
            <input
              type="radio"
              name={radioName}
              value={p}
              checked={value === p}
              disabled={disabled}
              onChange={() => onChange(p)}
            />
            {taskPriorityLabel[p]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
