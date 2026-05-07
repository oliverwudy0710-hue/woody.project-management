import type { CategorySelectValue } from '../features/tasks/categoryOptions'
import {
  TASK_CATEGORY_BUILTIN,
  TASK_CATEGORY_CUSTOM,
  TASK_CATEGORY_SELECT_EMPTY,
} from '../features/tasks/categoryOptions'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

export interface TaskCategoryFieldsProps {
  categorySelect: CategorySelectValue
  onCategorySelectChange: (value: CategorySelectValue) => void
  categoryCustom: string
  onCategoryCustomChange: (value: string) => void
  /** 曾用过的自定义标签，可在下拉里复选 */
  savedTags?: string[]
}

export function TaskCategoryFields({
  categorySelect,
  onCategorySelectChange,
  categoryCustom,
  onCategoryCustomChange,
  savedTags = [],
}: TaskCategoryFieldsProps) {
  const builtinSet = new Set<string>(TASK_CATEGORY_BUILTIN)
  const extraSaved = savedTags.filter((t) => {
    const x = t.trim()
    return x && !builtinSet.has(x)
  })
  const datalistId = 'task-saved-tags-datalist'

  return (
    <div>
      <label htmlFor="task-category-select" className="mb-1 block text-sm font-medium text-slate-700">
        分类标签
      </label>
      <select
        id="task-category-select"
        value={categorySelect}
        onChange={(e) => onCategorySelectChange(e.target.value as CategorySelectValue)}
        className={inputClass}
      >
        <option value={TASK_CATEGORY_SELECT_EMPTY}>（不选）</option>
        {TASK_CATEGORY_BUILTIN.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
        {extraSaved.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
        <option value={TASK_CATEGORY_CUSTOM}>自定义…</option>
      </select>
      {categorySelect === TASK_CATEGORY_CUSTOM ? (
        <>
          <input
            type="text"
            list={datalistId}
            placeholder="输入自定义标签（可复用于后续任务）"
            value={categoryCustom}
            onChange={(e) => onCategoryCustomChange(e.target.value)}
            className={`mt-2 ${inputClass}`}
            data-testid="task-category-custom"
          />
          <datalist id={datalistId}>
            {extraSaved.map((v) => (
              <option key={`dl-${v}`} value={v} />
            ))}
          </datalist>
        </>
      ) : null}
    </div>
  )
}
