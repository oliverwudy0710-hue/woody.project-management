import type { TaskPageSize } from './taskPaginationConstants'
import { TASK_PAGE_SIZE_OPTIONS } from './taskPaginationConstants'

const btnBase =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-900 disabled:pointer-events-none disabled:opacity-40'

const pageNumBase =
  'min-w-[2rem] rounded-lg px-2 py-1 text-xs font-medium transition-colors'

export interface TaskListPaginationProps {
  totalFiltered: number
  page: number
  totalPages: number
  pageSize: TaskPageSize
  onPageChange: (p: number) => void
  onPageSizeChange: (n: TaskPageSize) => void
}

function pageButtonList(totalPages: number, current: number): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (current <= 3) {
    return [1, 2, 3, 4, 'gap', totalPages]
  }
  if (current >= totalPages - 2) {
    return [1, 'gap', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, 'gap', current - 1, current, current + 1, 'gap', totalPages]
}

export function TaskListPagination({
  totalFiltered,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TaskListPaginationProps) {
  const from = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalFiltered)
  const buttons = pageButtonList(totalPages, page)

  return (
    <div
      className="flex shrink-0 flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
      data-testid="task-list-pagination"
    >
      <p className="text-xs text-slate-600">
        共 <span className="font-semibold tabular-nums text-slate-800">{totalFiltered}</span> 条匹配（全局筛选结果）
        {totalFiltered > 0 ? (
          <>
            ，显示第{' '}
            <span className="tabular-nums">{from}</span>–<span className="tabular-nums">{to}</span> 条
          </>
        ) : null}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-slate-600">
          每页
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value) as TaskPageSize)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            aria-label="每页条数"
          >
            {TASK_PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} 条
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-1" role="navigation" aria-label="任务列表分页">
          <button
            type="button"
            className={btnBase}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            上一页
          </button>
          {buttons.map((item, i) =>
            item === 'gap' ? (
              <span key={`g-${i}`} className="px-1 text-xs text-slate-400">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`${pageNumBase} ${
                  item === page
                    ? 'border border-indigo-200 bg-indigo-600 text-white shadow-sm'
                    : 'border border-transparent text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className={btnBase}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  )
}
