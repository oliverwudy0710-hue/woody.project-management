import type { TaskStatus, TimeGranularity } from './types'
import { TASK_DOMAIN_LABELS, TASK_DOMAINS } from './domainOptions'
import type { TaskDomain } from './types'
import { describeImplementationWindow } from '../../utils/implementationWindow'
import { todayISODate } from '../../utils/dateFilter'
import { useTaskStore } from '../../stores/taskStore'
import { taskStatusLabel } from '../../utils/taskStatusLabels'
import type { TaskSortKey, TaskStatusFilter, TaskDomainFilter } from '../../utils/taskSortFilter'

const granularityLabels: Record<TimeGranularity, string> = {
  month: '本月',
  week: '本周',
  day: '今日',
  custom: '自定义',
}

const selectCls =
  'w-full min-w-[8.5rem] rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 hover:border-slate-300'

export interface TaskListToolbarProps {
  statusFilter: TaskStatusFilter
  onStatusFilterChange: (v: TaskStatusFilter) => void
  domainFilter: TaskDomainFilter
  onDomainFilterChange: (v: TaskDomainFilter) => void
  tagFilter: string
  onTagFilterChange: (v: string) => void
  sortKey: TaskSortKey
  onSortKeyChange: (v: TaskSortKey) => void
  subTagOptions: string[]
  visibleCount: number
}

export function TaskListToolbar({
  statusFilter,
  onStatusFilterChange,
  domainFilter,
  onDomainFilterChange,
  tagFilter,
  onTagFilterChange,
  sortKey,
  onSortKeyChange,
  subTagOptions,
  visibleCount,
}: TaskListToolbarProps) {
  const timeGranularity = useTaskStore((s) => s.timeGranularity)
  const setTimeGranularity = useTaskStore((s) => s.setTimeGranularity)
  const referenceDate = useTaskStore((s) => s.referenceDate)
  const setReferenceDate = useTaskStore((s) => s.setReferenceDate)
  const customWindowStart = useTaskStore((s) => s.customWindowStart)
  const customWindowEnd = useTaskStore((s) => s.customWindowEnd)
  const setCustomWindow = useTaskStore((s) => s.setCustomWindow)

  const statuses: TaskStatus[] = [
    'not_started',
    'in_progress',
    'blocked',
    'completed',
    'cancelled',
  ]

  const windowSummary = describeImplementationWindow(
    timeGranularity,
    referenceDate,
    timeGranularity === 'custom' ? { start: customWindowStart, end: customWindowEnd } : null,
  )

  return (
    <div
      className="mb-6 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-200/40 ring-1 ring-slate-100/80 backdrop-blur-sm"
      data-testid="task-list-toolbar"
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600/90">
              时间范围
            </span>
            <span className="hidden text-xs text-slate-400 sm:inline" aria-hidden>
              ·
            </span>
            <span className="text-xs text-slate-500">实施周期与窗口相交的任务会显示</span>
          </div>
          <div
            className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
            data-testid="time-granularity-nav"
          >
            <div
              className="inline-flex flex-wrap gap-1 rounded-full bg-slate-100/90 p-1 ring-1 ring-slate-200/60"
              role="group"
              aria-label="时间粒度"
            >
              {(['month', 'week', 'day', 'custom'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  data-testid={`granularity-${g}`}
                  onClick={() => setTimeGranularity(g)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    timeGranularity === g
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  }`}
                  aria-pressed={timeGranularity === g}
                >
                  {granularityLabels[g]}
                </button>
              ))}
            </div>

            {timeGranularity === 'custom' ? (
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  开始日期
                  <input
                    type="date"
                    value={customWindowStart}
                    onChange={(e) => setCustomWindow(e.target.value, customWindowEnd)}
                    className={selectCls}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  结束日期
                  <input
                    type="date"
                    value={customWindowEnd}
                    onChange={(e) => setCustomWindow(customWindowStart, e.target.value)}
                    className={selectCls}
                  />
                </label>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  基准日
                  <input
                    type="date"
                    value={referenceDate}
                    onChange={(e) => setReferenceDate(e.target.value)}
                    className={selectCls}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setReferenceDate(todayISODate())}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
                >
                  今天
                </button>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            当前窗口：<span className="font-medium text-slate-700">{windowSummary}</span>
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">筛选与排序</span>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                状态
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value as TaskStatusFilter)}
                  className={selectCls}
                  aria-label="按状态筛选"
                >
                  <option value="all">全部状态</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {taskStatusLabel[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                领域
                <select
                  value={domainFilter}
                  onChange={(e) => onDomainFilterChange(e.target.value as TaskDomainFilter)}
                  className={selectCls}
                  aria-label="按领域筛选"
                >
                  <option value="all">全部领域</option>
                  {TASK_DOMAINS.map((d: TaskDomain) => (
                    <option key={d} value={d}>
                      {TASK_DOMAIN_LABELS[d]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                子标签
                <select
                  value={tagFilter}
                  onChange={(e) => onTagFilterChange(e.target.value)}
                  className={selectCls}
                  aria-label="按子标签筛选"
                  disabled={domainFilter === 'all'}
                >
                  <option value="">全部子标签</option>
                  {subTagOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                排序
                <select
                  value={sortKey}
                  onChange={(e) => onSortKeyChange(e.target.value as TaskSortKey)}
                  className={selectCls}
                  aria-label="排序方式"
                >
                  <option value="default">默认</option>
                  <option value="priority">优先级 · 高先</option>
                  <option value="status">状态</option>
                  <option value="progress">完成度 · 高先</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-50/80 px-3 py-2 ring-1 ring-indigo-100">
            <span className="text-2xl font-bold tabular-nums text-indigo-700">{visibleCount}</span>
            <span className="text-xs font-medium leading-tight text-indigo-900/80">个任务</span>
          </div>
        </div>
      </div>
    </div>
  )
}
