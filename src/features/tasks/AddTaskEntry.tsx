import { useState } from 'react'
import { AddTaskModal } from './AddTaskModal'

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconChat({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

const fabBtn =
  'flex h-14 w-14 items-center justify-center rounded-full border border-indigo-500/30 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/35 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300/60 active:translate-y-0'

export interface AddTaskEntryProps {
  onOpenAssistant: () => void
}

export function AddTaskEntry({ onOpenAssistant }: AddTaskEntryProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="fixed bottom-6 right-6 z-40 flex flex-col gap-3"
        data-testid="fab-cluster"
      >
        <button
          type="button"
          onClick={onOpenAssistant}
          className={`${fabBtn} bg-gradient-to-br from-slate-600 to-slate-800 shadow-slate-500/30`}
          title="对话助手"
          aria-label="打开对话助手"
          data-testid="assistant-fab"
        >
          <IconChat className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="新建任务"
          className={fabBtn}
          aria-label="新建任务"
          data-testid="add-task-fab"
        >
          <IconPlus className="h-7 w-7 stroke-[2.2]" />
        </button>
      </div>
      <AddTaskModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
