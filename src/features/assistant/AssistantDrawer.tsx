import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RightDrawer } from '../../components/RightDrawer'
import { ASSISTANT_SYSTEM_PROMPT } from './assistantSystemPrompt'
import { ASSISTANT_PRESET_PROMPTS } from './assistantPresets'
import { AssistantHelpPanel } from './AssistantHelpPanel'
import { buildAssistantContextBlock } from './buildAssistantContext'
import { executeAssistantOperations } from './executeAssistantOperations'
import { parseAssistantResponse } from './assistantTypes'
import { postOpenAICompatibleChat } from './openaiCompatibleClient'
import { useAssistantSettingsStore } from '../../stores/assistantSettingsStore'
import { useTaskStore } from '../../stores/taskStore'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { Task } from '../tasks/types'
import {
  formatTaskMention,
  getActiveMentionPickerState,
  mentionTokenBoundsForBackspace,
  mentionTokenBoundsForDelete,
  parseLinkedTaskIdsFromText,
  sortTasksForMentionPicker,
} from './assistantMentionTokens'

export interface AssistantDrawerProps {
  open: boolean
  onClose: () => void
}

const field =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

type ChatTurn =
  | { role: 'user'; content: string; apiContent?: string }
  | { role: 'assistant'; content: string }

function toApiMessages(
  historyForApi: ChatTurn[],
  systemContent: string,
): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const out: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemContent },
  ]
  for (const m of historyForApi) {
    if (m.role === 'user') {
      out.push({ role: 'user', content: m.apiContent ?? m.content })
    } else {
      out.push({ role: 'assistant', content: m.content })
    }
  }
  return out
}

export function AssistantDrawer({ open, onClose }: AssistantDrawerProps) {
  const tasks = useTaskStore((s) => s.tasks)
  const baseUrl = useAssistantSettingsStore((s) => s.baseUrl)
  const chatPath = useAssistantSettingsStore((s) => s.chatPath)
  const model = useAssistantSettingsStore((s) => s.model)
  const apiKey = useAssistantSettingsStore((s) => s.apiKey)
  const useDevProxy = useAssistantSettingsStore((s) => s.useDevProxy)

  const [history, setHistory] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeMention, setActiveMention] = useState<{ start: number; query: string } | null>(null)
  const [mentionIdx, setMentionIdx] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const mentionCandidates = useMemo(() => {
    if (!activeMention) return []
    return sortTasksForMentionPicker(tasks, activeMention.query).slice(0, 15)
  }, [activeMention, tasks])

  useEffect(() => {
    setMentionIdx(0)
  }, [activeMention?.start, activeMention?.query])

  useEffect(() => {
    if (mentionCandidates.length === 0) return
    setMentionIdx((i) => Math.min(i, mentionCandidates.length - 1))
  }, [mentionCandidates.length])

  const updateMentionFromInput = useCallback((text: string, cursor: number) => {
    setActiveMention(getActiveMentionPickerState(text, cursor))
  }, [])

  const pickMention = useCallback(
    (task: Task) => {
      if (!activeMention || !textareaRef.current) return
      const el = textareaRef.current
      const cursor = el.selectionStart
      const before = input.slice(0, activeMention.start)
      const after = input.slice(cursor)
      const insert = `${formatTaskMention(task.title)} `
      const next = before + insert + after
      setInput(next)
      setActiveMention(null)
      const pos = before.length + insert.length
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(pos, pos)
      })
    },
    [activeMention, input],
  )

  const submitChat = useCallback(
    async (userTurn: { role: 'user'; content: string; apiContent?: string }) => {
      const display = userTurn.content.trim()
      if (!display || loading) return
      if (!apiKey.trim()) {
        setError('请先在左侧主导航点击 ⚙，打开「个性化与模型」填写 API Key。')
        return
      }

      const linked = parseLinkedTaskIdsFromText(
        userTurn.apiContent ?? userTurn.content,
        useTaskStore.getState().tasks,
      )
      const nextHist = [...history, userTurn]

      setInput('')
      setActiveMention(null)
      setError(null)
      setLoading(true)
      setHistory(nextHist)

      try {
        const freshTasks = useTaskStore.getState().tasks
        const tw = useTaskStore.getState()
        const ctx = buildAssistantContextBlock(freshTasks, {
          linkedTaskIds: linked,
          listWindow: {
            granularity: tw.timeGranularity,
            referenceDate: tw.referenceDate,
            customWindowStart: tw.customWindowStart,
            customWindowEnd: tw.customWindowEnd,
          },
        })
        const systemContent = `${ASSISTANT_SYSTEM_PROMPT}\n\n[当前任务库快照]\n${ctx}`

        const apiMessages = toApiMessages(nextHist, systemContent)

        const raw = await postOpenAICompatibleChat({
          baseUrl,
          chatPath,
          apiKey,
          model,
          messages: apiMessages,
          useDevProxy,
        })

        let parsed
        try {
          parsed = parseAssistantResponse(raw)
        } catch {
          setHistory((h) => [
            ...h,
            {
              role: 'assistant',
              content:
                raw ||
                '模型返回无法解析为 JSON。请尝试说明「创建任务：…」或查看控制台。',
            },
          ])
          return
        }

        const execLog = executeAssistantOperations(parsed.operations, { linkedTaskIds: linked })
        let body = parsed.message.trim()
        if (execLog.length) {
          body += `\n\n——\n${execLog.join('\n')}`
        }
        setHistory((h) => [...h, { role: 'assistant', content: body }])
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
        setHistory((h) => [
          ...h,
          {
            role: 'assistant',
            content: `请求失败：${msg}。若浏览器报 CORS，请在开发环境开启「通过本机代理」并 npm run dev。`,
          },
        ])
      } finally {
        setLoading(false)
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
        })
      }
    },
    [
      apiKey,
      baseUrl,
      chatPath,
      history,
      loading,
      model,
      useDevProxy,
    ],
  )

  const sendFromInput = useCallback(() => {
    const text = input.trim()
    if (!text || loading) return
    void submitChat({ role: 'user', content: text })
  }, [input, loading, submitChat])

  /** md 及以上：右侧固定栏，主区仍可点击；窄屏沿用全屏抽屉 */
  const assistantInline = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    if (!open || !assistantInline) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, assistantInline])

  if (!open) return null

  const titleBody = (
    <>
      <span className="text-base font-semibold text-slate-900">对话助手</span>
      <p className="mt-1 text-xs font-normal text-slate-500">
        在输入框输入 <kbd className="rounded bg-slate-100 px-1">@</kbd> 检索并选择任务（仅插入标题）；可多选；系统会记录当日操作快照供总结。模型与 API Key 请在左侧 ⚙
        「个性化与模型」中配置。
      </p>
    </>
  )

  const titleForInline = <div id="assistant-drawer-title">{titleBody}</div>
  const titleForDrawer = <div>{titleBody}</div>

  const panelBody = (
    <div className="flex h-full min-h-0 flex-col gap-3">
        <div
          ref={listRef}
          className="min-h-[160px] flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-sm"
        >
          {history.length === 0 && (
            <p className="text-slate-500">
              可展开下方「助手能力说明」了解能做什么；用 @ 关联任务后可对话修改；「今日要点」与「工作日志」支持一键发起。
            </p>
          )}
          {history.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 ${
                m.role === 'user'
                  ? 'ml-6 bg-indigo-600 text-white'
                  : 'mr-6 whitespace-pre-wrap bg-white text-slate-800 ring-1 ring-slate-200'
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && <p className="text-xs text-slate-500">正在请求模型…</p>}
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <AssistantHelpPanel />

        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            快捷提示
          </p>
          <div className="flex flex-wrap gap-2">
            {ASSISTANT_PRESET_PROMPTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (p.mode === 'inject_input') {
                    setInput((prev) => (prev ? `${prev}\n${p.body}` : p.body))
                    return
                  }
                  void submitChat({
                    role: 'user',
                    content: p.displayUser,
                    apiContent: p.userPrompt,
                  })
                }}
                disabled={loading}
                className="rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-xs font-medium text-indigo-900 hover:bg-indigo-100 disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              className={`${field} min-h-[72px] w-full resize-y`}
              value={input}
              onChange={(e) => {
                const v = e.target.value
                setInput(v)
                const c = e.target.selectionStart
                requestAnimationFrame(() => updateMentionFromInput(v, c))
              }}
              onSelect={(e) => updateMentionFromInput(e.currentTarget.value, e.currentTarget.selectionStart)}
              onClick={(e) => updateMentionFromInput(e.currentTarget.value, e.currentTarget.selectionStart)}
              onKeyUp={(e) => updateMentionFromInput(e.currentTarget.value, e.currentTarget.selectionStart)}
              placeholder="用中文描述需求，输入 @ 可关联任务…"
              disabled={loading}
              onKeyDown={(e) => {
                const el = textareaRef.current
                if (e.key === 'Backspace' && !loading && el) {
                  const pos = el.selectionStart
                  const selEnd = el.selectionEnd
                  if (pos === selEnd) {
                    const span = mentionTokenBoundsForBackspace(input, pos)
                    if (span) {
                      e.preventDefault()
                      const [a, b] = span
                      const next = input.slice(0, a) + input.slice(b)
                      setInput(next)
                      setActiveMention(getActiveMentionPickerState(next, a))
                      requestAnimationFrame(() => {
                        el.focus()
                        el.setSelectionRange(a, a)
                      })
                      return
                    }
                  }
                }
                if (e.key === 'Delete' && !loading && el) {
                  const pos = el.selectionStart
                  const selEnd = el.selectionEnd
                  if (pos === selEnd) {
                    const span = mentionTokenBoundsForDelete(input, pos)
                    if (span) {
                      e.preventDefault()
                      const [a, b] = span
                      const next = input.slice(0, a) + input.slice(b)
                      setInput(next)
                      setActiveMention(getActiveMentionPickerState(next, a))
                      requestAnimationFrame(() => {
                        el.focus()
                        el.setSelectionRange(a, a)
                      })
                      return
                    }
                  }
                }

                if (activeMention && mentionCandidates.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setMentionIdx((i) => Math.min(i + 1, mentionCandidates.length - 1))
                    return
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setMentionIdx((i) => Math.max(i - 1, 0))
                    return
                  }
                  if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                    e.preventDefault()
                    pickMention(mentionCandidates[mentionIdx])
                    return
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    setActiveMention(null)
                    return
                  }
                }

                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !e.metaKey &&
                  !e.ctrlKey &&
                  el &&
                  !(activeMention && mentionCandidates.length > 0)
                ) {
                  const pos = el.selectionStart
                  const before = input.slice(0, pos)
                  const lineStart = before.lastIndexOf('\n') + 1
                  const line = before.slice(lineStart)
                  const m = line.match(/^(\s*)(\d+)\.\s/)
                  if (m) {
                    e.preventDefault()
                    const indent = m[1]
                    const n = parseInt(m[2], 10)
                    const insert = `\n${indent}${n + 1}. `
                    const next = input.slice(0, pos) + insert + input.slice(pos)
                    setInput(next)
                    const caret = pos + insert.length
                    requestAnimationFrame(() => {
                      el.focus()
                      el.setSelectionRange(caret, caret)
                    })
                    return
                  }
                }

                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  void sendFromInput()
                }
              }}
            />
            {activeMention && !loading ? (
              <ul
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
                role="listbox"
              >
                {mentionCandidates.length === 0 ? (
                  <li className="px-3 py-2 text-slate-500">无匹配任务</li>
                ) : (
                  mentionCandidates.map((t, idx) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={idx === mentionIdx}
                        className={`flex w-full px-3 py-2 text-left hover:bg-indigo-50 ${
                          idx === mentionIdx ? 'bg-indigo-50 text-indigo-900' : 'text-slate-800'
                        }`}
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => pickMention(t)}
                      >
                        {t.title}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void sendFromInput()}
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              发送
            </button>
            <button
              type="button"
              onClick={() => {
                setHistory([])
                setInput('')
                setActiveMention(null)
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              清空对话
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400">
          ⌘/Ctrl + Enter 发送 · @ 关键字筛选 · ↑↓ Enter 插入 · 退格整块删 @ · Shift+Enter 换行 · 有序列表 Enter 续序号
        </p>
    </div>
  )

  if (assistantInline) {
    return (
      <aside
        className="z-[55] flex h-full min-h-0 w-[min(36rem,42vw)] min-w-[18rem] shrink-0 flex-col border-l border-slate-200/90 bg-white shadow-[0_0_24px_-8px_rgba(0,0,0,0.12)]"
        aria-label="对话助手"
        data-testid="assistant-panel"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200/80 bg-slate-50/80 px-5 py-4 backdrop-blur-sm">
          <div className="min-w-0 flex-1 pr-2">{titleForInline}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{panelBody}</div>
      </aside>
    )
  }

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      titleId="assistant-drawer-title"
      zClass="z-[70]"
      backdropTestId="assistant-backdrop"
      panelTestId="assistant-panel"
      panelMaxWidthClass="max-w-xl"
      title={titleForDrawer}
    >
      {panelBody}
    </RightDrawer>
  )
}
