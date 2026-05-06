import type { CategorySelectValue } from '../features/tasks/categoryOptions'
import {
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
}

export function TaskCategoryFields({
  categorySelect,
  onCategorySelectChange,
  categoryCustom,
  onCategoryCustomChange,
}: TaskCategoryFieldsProps) {
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
        <option value="工作">工作</option>
        <option value="个人">个人</option>
        <option value="学习">学习</option>
        <option value={TASK_CATEGORY_CUSTOM}>自定义…</option>
      </select>
      {categorySelect === TASK_CATEGORY_CUSTOM ? (
        <input
          type="text"
          placeholder="输入自定义分类"
          value={categoryCustom}
          onChange={(e) => onCategoryCustomChange(e.target.value)}
          className={`mt-2 ${inputClass}`}
          data-testid="task-category-custom"
        />
      ) : null}
    </div>
  )
}
