import { useEffect } from 'react'
import { AddTaskEntry } from './features/tasks/AddTaskEntry'
import { TaskList } from './features/tasks/TaskList'
import { useTaskStore } from './stores/taskStore'
import { todayISODate } from './utils/dateFilter'

export default function App() {
  const setReferenceDate = useTaskStore((s) => s.setReferenceDate)

  useEffect(() => {
    setReferenceDate(todayISODate())
  }, [setReferenceDate])

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 px-5 py-6 shadow-sm shadow-slate-200/30 ring-1 ring-white/60 backdrop-blur-md sm:px-8 sm:py-7">
        <div
          className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-indigo-500 via-violet-500 to-fuchsia-500"
          aria-hidden
        />
        <div className="relative flex flex-col gap-3 pl-4 sm:flex-row sm:items-start sm:gap-4 sm:pl-5">
          <img
            src="/favicon.svg"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-2xl shadow-lg shadow-indigo-500/20 ring-1 ring-slate-200/50"
            decoding="async"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/80">Workspace</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Woody的任务管理系统
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              你好，Woody。这里只给你自己看：任务、标签和附件都保存在本机浏览器。
            </p>
          </div>
        </div>
      </header>

      <main className="relative min-h-[40vh] flex-1">
        <TaskList />
      </main>

      <AddTaskEntry />
    </div>
  )
}
