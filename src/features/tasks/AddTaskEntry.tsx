import { useState } from 'react'
import { AddTaskModal } from './AddTaskModal'

export function AddTaskEntry() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="新建任务"
        className="fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600 to-violet-600 pl-4 pr-5 text-white shadow-lg shadow-indigo-500/35 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/60 active:translate-y-0"
        aria-label="新建任务"
        data-testid="add-task-fab"
      >
        <span className="text-2xl font-light leading-none">+</span>
        <span className="text-sm font-semibold tracking-wide">新建任务</span>
      </button>
      <AddTaskModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
