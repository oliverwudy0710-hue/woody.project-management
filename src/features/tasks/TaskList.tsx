import { useMemo } from 'react'
import { filterTasksByGranularity } from '../../utils/dateFilter'
import { useTaskStore } from '../../stores/taskStore'
import { TaskCard } from '../../components/TaskCard'

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks)
  const timeGranularity = useTaskStore((s) => s.timeGranularity)
  const referenceDate = useTaskStore((s) => s.referenceDate)

  const filtered = useMemo(
    () => filterTasksByGranularity(tasks, timeGranularity, referenceDate),
    [tasks, timeGranularity, referenceDate],
  )

  if (filtered.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
        当前时间粒度下暂无任务，可通过其它日期或粒度查看，或稍后添加任务。
      </p>
    )
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2" data-testid="task-list">
      {filtered.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} />
        </li>
      ))}
    </ul>
  )
}
