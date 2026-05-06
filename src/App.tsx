import { useEffect } from 'react'
import { AddTaskEntry } from './features/tasks/AddTaskEntry'
import { TimeGranularityNav } from './features/filters/TimeGranularityNav'
import { TaskList } from './features/tasks/TaskList'
import { useTaskStore } from './stores/taskStore'
import { todayISODate } from './utils/dateFilter'

export default function App() {
  const setReferenceDate = useTaskStore((s) => s.setReferenceDate)

  useEffect(() => {
    setReferenceDate(todayISODate())
  }, [setReferenceDate])

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">个人任务管理</h1>
          <p className="mt-1 text-sm text-slate-600">
            月 → 周 → 日 视图；数据保存在本机浏览器（localStorage）。
          </p>
        </div>
        <TimeGranularityNav />
      </header>
      <main className="relative min-h-[40vh]">
        <TaskList />
      </main>
      <AddTaskEntry />
    </div>
  )
}
