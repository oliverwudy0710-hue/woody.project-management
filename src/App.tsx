import { useEffect, useState } from 'react'
import { AppSidebar } from './components/AppSidebar'
import { PersonalizationDrawer } from './components/PersonalizationDrawer'
import { AssistantDrawer } from './features/assistant/AssistantDrawer'
import { AddTaskModal } from './features/tasks/AddTaskModal'
import { sendDailyReport } from './features/feishuReport/sendDailyReport'
import { TaskList } from './features/tasks/TaskList'
import { TaskProgressPanel } from './features/tasks/TaskProgressPanel'
import { useFeishuReportStore } from './stores/feishuReportStore'
import { useTaskStore } from './stores/taskStore'
import { useUiPreferencesStore } from './stores/uiPreferencesStore'
import { todayISODate } from './utils/dateFilter'

const appVersion = import.meta.env.VITE_APP_VERSION
type RightPanelMode = 'assistant' | 'add-task' | 'task-detail' | null

export default function App() {
  const setReferenceDate = useTaskStore((s) => s.setReferenceDate)
  const appTitle = useUiPreferencesStore((s) => s.appTitle)
  const workspaceBadge = useUiPreferencesStore((s) => s.workspaceBadge)
  const welcomeLine = useUiPreferencesStore((s) => s.welcomeLine)
  const logoDataUrl = useUiPreferencesStore((s) => s.logoDataUrl)
  const sendTimeLocal = useFeishuReportStore((s) => s.sendTimeLocal)

  const [rightPanel, setRightPanel] = useState<RightPanelMode>(null)
  const [taskDetailId, setTaskDetailId] = useState<string | null>(null)
  const [personalizationOpen, setPersonalizationOpen] = useState(false)

  const logoSrc = logoDataUrl.trim() || `${import.meta.env.BASE_URL}favicon.svg`

  useEffect(() => {
    setReferenceDate(todayISODate())
  }, [setReferenceDate])

  useEffect(() => {
    const t = appTitle.trim()
    if (t) document.title = t
  }, [appTitle])

  useEffect(() => {
    window.desktopReport?.updateSchedule(sendTimeLocal).catch(() => undefined)
  }, [sendTimeLocal])

  useEffect(() => {
    if (!window.desktopReport) return
    return window.desktopReport.onScheduledFeishuReport(() => {
      void sendDailyReport().catch(() => undefined)
    })
  }, [])

  const scrollTaskListToTop = () => {
    document.getElementById('task-list-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-100/90">
        <AppSidebar
          logoSrc={logoSrc}
          assistantOpen={rightPanel === 'assistant'}
          onHome={scrollTaskListToTop}
          onOpenAddTask={() => {
            setTaskDetailId(null)
            setRightPanel('add-task')
          }}
          onToggleAssistant={() => {
            setTaskDetailId(null)
            setRightPanel((prev) => (prev === 'assistant' ? null : 'assistant'))
          }}
          onOpenPersonalization={() => setPersonalizationOpen(true)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r border-slate-200/85 bg-white/55">
            <header className="shrink-0 overflow-y-auto border-b border-slate-200/70 bg-white/85 px-4 py-5 shadow-sm sm:px-6 sm:py-6">
              <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 px-5 py-5 shadow-sm shadow-slate-200/30 ring-1 ring-white/60 backdrop-blur-md sm:px-8 sm:py-6">
                <div
                  className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-indigo-500 via-violet-500 to-fuchsia-500"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-3 pl-4 sm:flex-row sm:items-start sm:gap-4 sm:pl-5">
                  <img
                    src={logoSrc}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-2xl object-cover shadow-lg shadow-indigo-500/20 ring-1 ring-slate-200/50"
                    decoding="async"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/80">
                      {workspaceBadge}
                    </p>
                    <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
                      {appTitle}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{welcomeLine}</p>
                  </div>
                </div>
                <p
                  className="pointer-events-none absolute bottom-4 right-5 text-[11px] tabular-nums text-slate-400 sm:bottom-5 sm:right-8"
                  aria-label={`应用版本 ${appVersion}`}
                >
                  v{appVersion}
                </p>
              </div>
            </header>

            <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-0 overflow-hidden px-4 py-4 sm:px-6">
              <TaskList
                onOpenTaskDetail={(taskId) => {
                  setTaskDetailId(taskId)
                  setRightPanel('task-detail')
                }}
              />
            </main>
          </div>
          <AssistantDrawer
            open={rightPanel === 'assistant'}
            onClose={() => {
              setRightPanel(null)
            }}
          />
          <AddTaskModal
            open={rightPanel === 'add-task'}
            onClose={() => {
              setRightPanel(null)
            }}
          />
          <TaskProgressPanel
            taskId={rightPanel === 'task-detail' ? taskDetailId : null}
            onClose={() => {
              setTaskDetailId(null)
              setRightPanel(null)
            }}
          />
        </div>
      </div>
      <PersonalizationDrawer open={personalizationOpen} onClose={() => setPersonalizationOpen(false)} />
    </>
  )
}
