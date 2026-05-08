function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function IconChat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m19.4 15-1.8-1.1a1 1 0 0 1-.36-1.15l.5-1.7a1 1 0 0 0-.56-1.2l-1.7-.7a1 1 0 0 1-.61-.76l-.18-1.8a1 1 0 0 0-.98-.88h-1.94a1 1 0 0 0-.98.88l-.18 1.8a1 1 0 0 1-.61.76l-1.7.7a1 1 0 0 0-.56 1.2l.5 1.7a1 1 0 0 1-.36 1.15L4.6 15a1 1 0 0 0-.1 1.65l1.4 1.2a1 1 0 0 0 1.18.02l1.45-.91a1 1 0 0 1 1.05 0l1.45.91a1 1 0 0 0 1.18-.02l1.4-1.2a1 1 0 0 0-.1-1.65Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const navBtn =
  'flex h-11 w-11 flex-none items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-white/80 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400'
const navBtnActive = 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80'

export interface AppSidebarProps {
  logoSrc: string
  assistantOpen: boolean
  onHome: () => void
  onOpenAddTask: () => void
  onToggleAssistant: () => void
  onOpenPersonalization: () => void
}

export function AppSidebar({
  logoSrc,
  assistantOpen,
  onHome,
  onOpenAddTask,
  onToggleAssistant,
  onOpenPersonalization,
}: AppSidebarProps) {
  return (
    <aside
      className="z-[45] flex h-full min-h-0 w-14 shrink-0 flex-col items-center gap-2 self-stretch border-r border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-100/90 py-3 shadow-sm"
      aria-label="主导航"
    >
      <div className="mb-1 flex h-10 w-10 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <img src={logoSrc} alt="" className="h-full w-full object-cover" width={40} height={40} decoding="async" />
      </div>

      <button type="button" className={`${navBtn}`} title="回到顶部" aria-label="回到顶部" onClick={onHome}>
        <IconHome className="h-5 w-5" />
      </button>

      <button
        type="button"
        className={`${navBtn}`}
        title="新建任务"
        aria-label="新建任务"
        onClick={onOpenAddTask}
        data-testid="add-task-fab"
      >
        <IconPlus className="h-6 w-6 stroke-[2.2]" />
      </button>

      <button
        type="button"
        className={`${navBtn} ${assistantOpen ? navBtnActive : ''}`}
        title="对话助手"
        aria-label={assistantOpen ? '关闭对话助手' : '打开对话助手'}
        onClick={onToggleAssistant}
        data-testid="assistant-fab"
      >
        <IconChat className="h-5 w-5" />
      </button>

      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          className={`${navBtn}`}
          title="个性化与模型"
          aria-label="个性化与模型"
          onClick={onOpenPersonalization}
        >
          <IconSettings className="h-5 w-5" />
        </button>
      </div>
    </aside>
  )
}
