import { useState } from 'react'
import { AddTaskModal } from './AddTaskModal'

export function AddTaskEntry() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl font-light leading-none text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="新增任务"
        data-testid="add-task-fab"
      >
        +
      </button>
      <AddTaskModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
