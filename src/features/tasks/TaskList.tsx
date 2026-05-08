import { useCallback, useEffect, useMemo, useState } from 'react'
import { filterTasksByImplementationWindow } from '../../utils/implementationWindow'
import {
  filterTasksByStatus,
  filterTasksByTag,
  filterTasksByDomain,
  sortTasks,
  type TaskSortKey,
  type TaskStatusFilter,
  type TaskDomainFilter,
} from '../../utils/taskSortFilter'
import { useTaskStore } from '../../stores/taskStore'
import { useUiPreferencesStore } from '../../stores/uiPreferencesStore'
import { TaskCard } from '../../components/TaskCard'
import { TaskListToolbar } from './TaskListToolbar'
import { TaskListPagination } from './TaskListPagination'
import { clampTaskPageSize, type TaskPageSize } from './taskPaginationConstants'

export interface TaskListProps {
  onOpenTaskDetail?: (taskId: string) => void
}

export function TaskList({ onOpenTaskDetail }: TaskListProps) {
  const tasks = useTaskStore((s) => s.tasks)
  const tagPresets = useTaskStore((s) => s.tagPresets)
  const timeGranularity = useTaskStore((s) => s.timeGranularity)
  const referenceDate = useTaskStore((s) => s.referenceDate)
  const customWindowStart = useTaskStore((s) => s.customWindowStart)
  const customWindowEnd = useTaskStore((s) => s.customWindowEnd)

  const pageSize = useUiPreferencesStore((s) => clampTaskPageSize(s.tasksPerPage))
  const setUiPreferences = useUiPreferencesStore((s) => s.setUiPreferences)

  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all')
  const [domainFilter, setDomainFilter] = useState<TaskDomainFilter>('all')
  const [tagFilter, setTagFilter] = useState('')
  const [sortKey, setSortKey] = useState<TaskSortKey>('default')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (domainFilter === 'all') setTagFilter('')
  }, [domainFilter])

  useEffect(() => {
    setPage(1)
  }, [
    statusFilter,
    domainFilter,
    tagFilter,
    sortKey,
    timeGranularity,
    referenceDate,
    customWindowStart,
    customWindowEnd,
  ])

  const customWindow = useMemo(
    () => (timeGranularity === 'custom' ? { start: customWindowStart, end: customWindowEnd } : null),
    [timeGranularity, customWindowStart, customWindowEnd],
  )

  const inWindow = useMemo(
    () => filterTasksByImplementationWindow(tasks, timeGranularity, referenceDate, customWindow),
    [tasks, timeGranularity, referenceDate, customWindow],
  )

  const subTagOptions = useMemo(() => {
    if (domainFilter === 'all') return []
    const set = new Set<string>([...tagPresets[domainFilter]])
    for (const t of tasks) {
      if (t.domain !== domainFilter) continue
      const c = t.category.trim()
      if (c) set.add(c)
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'))
  }, [tasks, tagPresets, domainFilter])

  const filteredAll = useMemo(() => {
    let list = filterTasksByStatus(inWindow, statusFilter)
    list = filterTasksByDomain(list, domainFilter)
    list = filterTasksByTag(list, tagFilter)
    list = sortTasks(list, sortKey)
    return list
  }, [inWindow, statusFilter, domainFilter, tagFilter, sortKey])

  const totalFiltered = filteredAll.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (safePage !== page) setPage(safePage)
  }, [page, safePage])

  const pageSlice = useMemo(
    () => filteredAll.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredAll, safePage, pageSize],
  )

  const onPageChange = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)))
  }, [totalPages])

  const onPageSizeChange = useCallback(
    (n: TaskPageSize) => {
      setUiPreferences({ tasksPerPage: n })
      setPage(1)
    },
    [setUiPreferences],
  )

  if (inWindow.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <TaskListToolbar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          domainFilter={domainFilter}
          onDomainFilterChange={setDomainFilter}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
          subTagOptions={subTagOptions}
          matchedCount={0}
        />
        <p className="rounded-2xl border border-dashed border-slate-300/80 bg-white/70 px-4 py-10 text-center text-sm text-slate-600 shadow-sm">
          当前时间范围内暂无任务。试试换个基准日、切换「本周 / 本月」或使用「自定义」日期区间；也可以新建任务。
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <TaskListToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        domainFilter={domainFilter}
        onDomainFilterChange={setDomainFilter}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        sortKey={sortKey}
        onSortKeyChange={setSortKey}
        subTagOptions={subTagOptions}
        matchedCount={totalFiltered}
      />

      {totalFiltered === 0 ? (
        <p className="rounded-2xl border border-dashed border-amber-200/90 bg-amber-50/90 px-4 py-8 text-center text-sm text-amber-950 shadow-sm">
          当前筛选项下没有任务，请尝试调整状态、领域、子标签或排序。筛选项作用于<strong>当前时间窗内的全部任务</strong>
          ，再分页展示。
        </p>
      ) : (
        <>
          <TaskListPagination
            totalFiltered={totalFiltered}
            page={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
          <div id="task-list-scroll" className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
            <ul
              className="grid grid-flow-row gap-4 sm:grid-cols-1 lg:grid-cols-2 lg:items-stretch"
              data-testid="task-list"
            >
              {pageSlice.map((task) => (
                <li key={task.id} className="flex min-h-0">
                  <TaskCard
                    task={task}
                    onOpenProgress={() => onOpenTaskDetail?.(task.id)}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
