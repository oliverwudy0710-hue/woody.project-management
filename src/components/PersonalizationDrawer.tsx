import { useState } from 'react'
import { sendDailyReport } from '../features/feishuReport/sendDailyReport'
import { useAssistantSettingsStore } from '../stores/assistantSettingsStore'
import { useFeishuReportStore } from '../stores/feishuReportStore'
import { useUiPreferencesStore } from '../stores/uiPreferencesStore'
import { RightDrawer } from './RightDrawer'

export interface PersonalizationDrawerProps {
  open: boolean
  onClose: () => void
}

const field =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

export function PersonalizationDrawer({ open, onClose }: PersonalizationDrawerProps) {
  const {
    appTitle,
    workspaceBadge,
    welcomeLine,
    logoDataUrl,
    setUiPreferences,
    resetBranding,
  } = useUiPreferencesStore()

  const baseUrl = useAssistantSettingsStore((s) => s.baseUrl)
  const chatPath = useAssistantSettingsStore((s) => s.chatPath)
  const model = useAssistantSettingsStore((s) => s.model)
  const apiKey = useAssistantSettingsStore((s) => s.apiKey)
  const useDevProxy = useAssistantSettingsStore((s) => s.useDevProxy)
  const setAssistantSettings = useAssistantSettingsStore((s) => s.setAssistantSettings)
  const feishuEnabled = useFeishuReportStore((s) => s.enabled)
  const webhookUrl = useFeishuReportStore((s) => s.webhookUrl)
  const sendTimeLocal = useFeishuReportStore((s) => s.sendTimeLocal)
  const lastSentDate = useFeishuReportStore((s) => s.lastSentDate)
  const setFeishuReportSettings = useFeishuReportStore((s) => s.setFeishuReportSettings)
  const [sendingTest, setSendingTest] = useState(false)
  const [sendHint, setSendHint] = useState<string | null>(null)

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      titleId="personalization-drawer-title"
      zClass="z-[75]"
      backdropTestId="personalization-backdrop"
      panelTestId="personalization-panel"
      panelMaxWidthClass="max-w-xl"
      title={<span className="text-lg font-semibold text-slate-900">个性化与模型</span>}
    >
      <p className="mb-4 text-xs text-slate-500">
        以下配置保存在本机浏览器；更换电脑或清除站点数据后需重新填写。API Key 请勿分享或提交到 Git。
      </p>

      <section className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">外观</h3>
        <label className="block text-sm text-slate-700">
          系统名称（顶栏主标题）
          <input
            className={field}
            value={appTitle}
            onChange={(e) => setUiPreferences({ appTitle: e.target.value })}
            placeholder="例如：Woody的任务管理系统"
            maxLength={120}
          />
        </label>
        <label className="block text-sm text-slate-700">
          顶栏角标文案
          <input
            className={field}
            value={workspaceBadge}
            onChange={(e) => setUiPreferences({ workspaceBadge: e.target.value })}
            placeholder="例如：Workspace"
            maxLength={40}
          />
        </label>
        <label className="block text-sm text-slate-700">
          欢迎说明
          <textarea
            className={`${field} min-h-[72px] resize-y`}
            value={welcomeLine}
            onChange={(e) => setUiPreferences({ welcomeLine: e.target.value })}
            placeholder="顶栏下方灰色说明文字"
            maxLength={500}
          />
        </label>
        <div className="text-sm text-slate-700">
          <span className="block">顶栏图标</span>
          <p className="mt-0.5 text-[11px] text-slate-500">上传小图（建议方形，≤500KB）；留空则用默认图标。</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="max-w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-2 file:py-1 file:text-white"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                if (f.size > 500 * 1024) {
                  window.alert('图片请小于 500KB')
                  e.target.value = ''
                  return
                }
                const reader = new FileReader()
                reader.onload = () => {
                  const s = String(reader.result ?? '')
                  if (s.startsWith('data:image/')) setUiPreferences({ logoDataUrl: s })
                }
                reader.readAsDataURL(f)
              }}
            />
            {logoDataUrl ? (
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-white"
                onClick={() => setUiPreferences({ logoDataUrl: '' })}
              >
                恢复默认图标
              </button>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className="text-xs text-indigo-600 underline hover:text-indigo-800"
          onClick={() => resetBranding()}
        >
          外观全部恢复默认
        </button>
      </section>

      <section className="mt-4 space-y-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-900/90">对话模型（OpenAI 兼容）</h3>
        <p className="text-xs text-amber-950/80">
          供左侧「对话助手」使用；未配置 API Key 时无法发送对话。
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
          代理默认 DeepSeek；根目录 <code className="rounded bg-white/80 px-1">.env</code> 可设{' '}
          <code className="rounded bg-white/80 px-1">VITE_LLM_PROXY_TARGET</code>。
        </p>
      </section>

      <section className="mt-4 space-y-3 rounded-xl border border-sky-200/80 bg-sky-50/60 p-3 text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-900/90">飞书日报</h3>
        <p className="text-xs text-sky-950/80">
          仅在桌面应用运行时按设定时间发送；通过飞书机器人 Webhook 推送三段日报（今日完成 / 明日计划 / 阻碍）。
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-slate-700">
          <input
            type="checkbox"
            checked={feishuEnabled}
            onChange={(e) => setFeishuReportSettings({ enabled: e.target.checked })}
          />
          启用定时日报
        </label>
        <label className="block text-slate-700">
          飞书机器人 Webhook URL
          <input
            className={field}
            value={webhookUrl}
            onChange={(e) => setFeishuReportSettings({ webhookUrl: e.target.value.trim() })}
            placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
            autoComplete="off"
          />
        </label>
        <label className="block text-slate-700">
          每日发送时间（本地）
          <input
            type="time"
            className={field}
            value={sendTimeLocal}
            onChange={(e) => setFeishuReportSettings({ sendTimeLocal: e.target.value })}
          />
        </label>
        <p className="text-[11px] text-slate-600">
          最近成功发送日期：{lastSentDate || '暂无'}。应用不运行时不会触发；可先用下面按钮测试。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={sendingTest}
            className="rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-xs font-medium text-sky-800 hover:bg-sky-100 disabled:opacity-50"
            onClick={() => {
              setSendHint(null)
              setSendingTest(true)
              void sendDailyReport({ force: true, ignoreEnabled: true })
                .then((res) => {
                  setSendHint(res.ok ? '测试发送成功。' : `测试发送失败：${res.reason ?? '未知错误'}`)
                })
                .finally(() => setSendingTest(false))
            }}
          >
            {sendingTest ? '发送中…' : '立即测试发送日报'}
          </button>
          {sendHint ? <span className="text-xs text-slate-700">{sendHint}</span> : null}
        </div>
      </section>
    </RightDrawer>
  )
}
