import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RightDrawer } from '../../components/RightDrawer'
import { ASSISTANT_SYSTEM_PROMPT } from './assistantSystemPrompt'
import { ASSISTANT_PRESET_PROMPTS } from './assistantPresets'
import { buildAssistantContextBlock } from './buildAssistantContext'
import { executeAssistantOperations } from './executeAssistantOperations'
import { parseAssistantResponse } from './assistantTypes'
import { postOpenAICompatibleChat } from './openaiCompatibleClient'
import { useAssistantSettingsStore } from '../../stores/assistantSettingsStore'
import { useTaskStore } from '../../stores/taskStore'
import type { Task } from '../tasks/types'
import { formatTaskMention, parseTaskIdsFromMentionText } from './assistantMentionTokens'

export interface AssistantDrawerProps {
  open: boolean
  onClose: () => void
}

const field =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

export function AssistantDrawer({ open, onClose }: AssistantDrawerProps) {
  const tasks = useTaskStore((s) => s.tasks)
  const baseUrl = useAssistantSettingsStore((s) => s.baseUrl)
  const chatPath = useAssistantSettingsStore((s) => s.chatPath)
  const model = useAssistantSettingsStore((s) => s.model)
  const apiKey = useAssistantSettingsStore((s) => s.apiKey)
  const useDevProxy = useAssistantSettingsStore((s) => s.useDevProxy)
  const setAssistantSettings = useAssistantSettingsStore((s) => s.setAssistantSettings)

  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [activeMention, setActiveMention] = useState<{ start: number; query: string } | null>(null)
  const [mentionIdx, setMentionIdx] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN')),
    [tasks],
  )

  const mentionCandidates = useMemo(() => {
    if (!activeMention) return []
    const q = activeMention.query.trim().toLowerCase()
    const list = q
      ? sortedTasks.filter((t) => t.title.toLowerCase().includes(q))
      : sortedTasks
    return list.slice(0, 8)
  }, [activeMention, sortedTasks])

  useEffect(() => {
    setMentionIdx(0)
  }, [activeMention?.start, activeMention?.query])

  useEffect(() => {
    if (mentionCandidates.length === 0) return
    setMentionIdx((i) => Math.min(i, mentionCandidates.length - 1))
  }, [mentionCandidates.length])

  const updateMentionFromInput = useCallback((text: string, cursor: number) => {
    const before = text.slice(0, cursor)
    const m = before.match(/@([^\s@]*)$/)
    if (!m) {
      setActiveMention(null)
      return
    }
    setActiveMention({ start: cursor - m[0].length, query: m[1] })
  }, [])

  const pickMention = useCallback(
    (task: Task) => {
      if (!activeMention || !textareaRef.current) return
      const el = textareaRef.current
      const cursor = el.selectionStart
      const before = input.slice(0, activeMention.start)
      const after = input.slice(cursor)
      const insert = `${formatTaskMention(task.title, task.id)} `
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

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    if (!apiKey.trim()) {
      setError('请先在「模型配置」中填写 API Key')
      setShowSettings(true)
      return
    }

    const linked = parseTaskIdsFromMentionText(text)
    const nextHist = [...history, { role: 'user' as const, content: text }]

    setInput('')
    setActiveMention(null)
    setError(null)
    setLoading(true)
    setHistory(nextHist)

    try {
      const freshTasks = useTaskStore.getState().tasks
      const ctx = buildAssistantContextBlock(freshTasks, { linkedTaskIds: linked })
      const systemContent = `${ASSISTANT_SYSTEM_PROMPT}\n\n[当前任务库快照]\n${ctx}`

      const apiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemContent },
        ...nextHist.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: text },
      ]

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
  }, [apiKey, baseUrl, chatPath, history, input, loading, model, useDevProxy])

  if (!open) return null

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      titleId="assistant-drawer-title"
      zClass="z-[70]"
      backdropTestId="assistant-backdrop"
      panelTestId="assistant-panel"
      panelMaxWidthClass="max-w-xl"
      title={
        <div>
          <span id="assistant-drawer-title" className="text-base font-semibold text-slate-900">
            对话助手
          </span>
          <p className="mt-1 text-xs text-slate-500">
            在输入框输入 <kbd className="rounded bg-slate-100 px-1">@</kbd> 选择任务后可对话编辑；系统会记录当日操作快照供总结。需配置兼容
            OpenAI 的 Chat Completions API。
          </p>
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowSettings((s) => !s)}
          className="w-fit rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          {showSettings ? '收起模型配置' : '展开模型配置'}
        </button>

        {showSettings && (
          <div className="space-y-2 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-950">
            <p className="font-medium text-amber-900">安全提示</p>
            <p>
              API Key 保存在本机 localStorage，仅适合个人使用；切勿在公共电脑填写。生产环境建议自建后端转发。
            </p>
            <label className="block text-slate-700">
              API Base URL（直连）
              <input
                className={field}
                value={baseUrl}
                onChange={(e) => setAssistantSettings({ baseUrl: e.target.value.trim() })}
                placeholder="https://api.deepseek.com"
                autoComplete="off"
              />
            </label>
            <label className="block text-slate-700">
              Chat 路径
              <input
                className={field}
                value={chatPath}
                onChange={(e) => setAssistantSettings({ chatPath: e.target.value.trim() })}
                placeholder="/v1/chat/completions"
              />
            </label>
            <label className="block text-slate-700">
              模型名称
              <input
                className={field}
                value={model}
                onChange={(e) => setAssistantSettings({ model: e.target.value.trim() })}
                placeholder="deepseek-chat"
              />
            </label>
            <label className="block text-slate-700">
              API Key
              <input
                className={field}
                type="password"
                value={apiKey}
                onChange={(e) => setAssistantSettings({ apiKey: e.target.value })}
                placeholder="sk-..."
                autoComplete="off"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={useDevProxy}
                onChange={(e) => setAssistantSettings({ useDevProxy: e.target.checked })}
              />
              开发环境通过 /api-llm 代理（避免浏览器 CORS，需 npm run dev）
            </label>
            <p className="text-[11px] text-slate-600">
              代理目标默认 DeepSeek；可在项目根 <code className="rounded bg-white/80 px-1">.env</code>{' '}
              设置 <code className="rounded bg-white/80 px-1">VITE_LLM_PROXY_TARGET</code> 改为其它
              OpenAI 兼容网关。
            </p>
          </div>
        )}

        <div
          ref={listRef}
          className="min-h-[160px] flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-sm"
        >
          {history.length === 0 && (
            <p className="text-slate-500">
              可先点下方快捷提示词，在输入框用 @ 提及任务后说「把标题改成…」「进度调到 60」等。
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

        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            快捷提示
          </p>
          <div className="flex flex-wrap gap-2">
            {ASSISTANT_PRESET_PROMPTS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setInput((prev) => (prev ? `${prev}\n${p.body}` : p.body))}
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
                if (activeMention && mentionCandidates.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setMentionIdx((i) => (i + 1) % mentionCandidates.length)
                    return
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setMentionIdx((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length)
                    return
                  }
                  if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
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
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  void send()
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
              onClick={() => void send()}
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
        <p className="text-[10px] text-slate-400">⌘/Ctrl + Enter 发送 · @ 选择任务 · ↑↓ 选择 Enter 插入</p>
      </div>
    </RightDrawer>
  )
}
