/** 列表分页：先对全量任务做时间窗 + 筛选 + 排序，再按页切片展示。 */

export const TASK_PAGE_SIZE_OPTIONS = [12, 24, 48, 96] as const

export type TaskPageSize = (typeof TASK_PAGE_SIZE_OPTIONS)[number]

export const DEFAULT_TASK_PAGE_SIZE: TaskPageSize = 24

export function clampTaskPageSize(n: unknown): TaskPageSize {
  const x = typeof n === 'number' && Number.isFinite(n) ? n : DEFAULT_TASK_PAGE_SIZE
  return (TASK_PAGE_SIZE_OPTIONS as readonly number[]).includes(x)
    ? (x as TaskPageSize)
    : DEFAULT_TASK_PAGE_SIZE
}
