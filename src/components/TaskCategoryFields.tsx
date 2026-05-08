import type { TaskDomain } from '../features/tasks/types'
import { TASK_DOMAINS, TASK_DOMAIN_LABELS } from '../features/tasks/domainOptions'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

export interface TaskCategoryFieldsProps {
  domain: TaskDomain
  onDomainChange: (value: TaskDomain) => void
  subTag: string
  onSubTagChange: (value: string) => void
  savedSubTags: string[]
}

export function TaskCategoryFields({
  domain,
  onDomainChange,
  subTag,
  onSubTagChange,
  savedSubTags,
}: TaskCategoryFieldsProps) {
  const datalistId = 'task-saved-subtags-datalist'

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="task-domain-select" className="mb-1 block text-sm font-medium text-slate-700">
          领域
        </label>
        <select
          id="task-domain-select"
          value={domain}
          onChange={(e) => onDomainChange(e.target.value as TaskDomain)}
          className={inputClass}
        >
          {TASK_DOMAINS.map((d) => (
            <option key={d} value={d}>
              {TASK_DOMAIN_LABELS[d]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="task-subtag-input" className="mb-1 block text-sm font-medium text-slate-700">
          子标签（可选）
        </label>
        <input
          id="task-subtag-input"
          type="text"
          list={datalistId}
          placeholder="例如：前端、健身、英语…"
          value={subTag}
          onChange={(e) => onSubTagChange(e.target.value)}
          className={inputClass}
          data-testid="task-subtag-input"
        />
        <datalist id={datalistId}>
          {savedSubTags.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      </div>
    </div>
  )
}
