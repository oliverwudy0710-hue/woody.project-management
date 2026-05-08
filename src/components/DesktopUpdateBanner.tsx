import { useEffect, useMemo, useState } from 'react'
import type { DesktopUpdaterStatus } from '../desktop-updater'

export function DesktopUpdateBanner() {
  const [status, setStatus] = useState<DesktopUpdaterStatus>({ stage: 'idle' })
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null)
  const updater = window.desktopUpdater

  useEffect(() => {
    if (!updater) return
    void updater.checkForUpdates()
    const off = updater.onStatus((s) => setStatus(s))
    return off
  }, [updater])

  const shouldShow = useMemo(() => {
    if (!updater) return false
    if (status.stage === 'available') return dismissedVersion !== (status.version ?? null)
    return status.stage === 'downloading' || status.stage === 'ready' || status.stage === 'error'
  }, [dismissedVersion, status, updater])

  if (!shouldShow) return null

  let content: React.ReactNode = null

  if (status.stage === 'available') {
    content = (
      <>
        <span>发现新版本{status.version ? ` v${status.version}` : ''}。</span>
        <button
          type="button"
          onClick={() => void updater?.downloadAndInstall()}
          className="rounded-md bg-indigo-600 px-2.5 py-1 text-white hover:bg-indigo-700"
        >
          立即更新
        </button>
        <button
          type="button"
          onClick={() => setDismissedVersion(status.version ?? 'unknown')}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-slate-600 hover:bg-slate-50"
        >
          稍后
        </button>
      </>
    )
  } else if (status.stage === 'downloading') {
    content = (
      <>
        <span>正在下载更新…</span>
        <span className="font-medium tabular-nums text-indigo-700">
          {Math.max(0, Math.min(100, Math.round(status.percent ?? 0)))}%
        </span>
      </>
    )
  } else if (status.stage === 'ready') {
    content = <span>更新包已下载，应用即将重启安装。</span>
  } else if (status.stage === 'error') {
    content = (
      <>
        <span>自动更新失败：{status.message}</span>
        <button
          type="button"
          onClick={() => void updater?.checkForUpdates()}
          className="rounded-md border border-rose-300 px-2.5 py-1 text-rose-700 hover:bg-rose-50"
        >
          重试
        </button>
      </>
    )
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
      {content}
    </div>
  )
}
