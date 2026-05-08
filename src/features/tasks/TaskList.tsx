import { useMemo, useState, useEffect } from 'react'
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
import { TaskCard } from '../../components/TaskCard'
import { TaskProgressPanel } from './TaskProgressPanel'
import { TaskListToolbar } from './TaskListToolbar'

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks)
  const tagPresets = useTaskStore((s) => s.tagPresets)
  const timeGranularity = useTaskStore((s) => s.timeGranularity)
  const referenceDate = useTaskStore((s) => s.referenceDate)
  const customWindowStart = useTaskStore((s) => s.customWindowStart)
  const customWindowEnd = useTaskStore((s) => s.customWindowEnd)

  const [progressTaskId, setProgressTaskId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all')
  const [domainFilter, setDomainFilter] = useState<TaskDomainFilter>('all')
  const [tagFilter, setTagFilter] = useState('')
  const [sortKey, setSortKey] = useState<TaskSortKey>('default')

  useEffect(() => {
    if (domainFilter === 'all') setTagFilter('')
  }, [domainFilter])

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

  const visible = useMemo(() => {
    let list = filterTasksByStatus(inWindow, statusFilter)
    list = filterTasksByDomain(list, domainFilter)
    list = filterTasksByTag(list, tagFilter)
    list = sortTasks(list, sortKey)
    return list
  }, [inWindow, statusFilter, domainFilter, tagFilter, sortKey])

  if (inWindow.length === 0) {
    return (
      <>
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
          visibleCount={0}
        />
        <p className="rounded-2xl border border-dashed border-slate-300/80 bg-white/70 px-4 py-10 text-center text-sm text-slate-600 shadow-sm">
          当前时间范围内暂无任务。试试换个基准日、切换「本周 / 本月」或使用「自定义」日期区间；也可以新建任务。
        </p>
      </>
    )
  }

  return (
    <>
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
        visibleCount={visible.length}
      />
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-amber-200/90 bg-amber-50/90 px-4 py-8 text-center text-sm text-amber-950 shadow-sm">
          当前筛选项下没有任务，请尝试调整状态、领域、子标签或排序。
        </p>
      ) : (
        <ul
          className="grid grid-flow-row gap-4 sm:grid-cols-1 lg:grid-cols-2 lg:items-stretch"
          data-testid="task-list"
        >
          {visible.map((task) => (
            <li key={task.id} className="flex min-h-0">
              <TaskCard task={task} onOpenProgress={() => setProgressTaskId(task.id)} className="w-full" />
            </li>
          ))}
        </ul>
      )}
      <TaskProgressPanel taskId={progressTaskId} onClose={() => setProgressTaskId(null)} />
    </>
  )
}
