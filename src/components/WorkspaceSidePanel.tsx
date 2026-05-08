import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { RightDrawer } from './RightDrawer'

export interface WorkspaceSidePanelProps {
  open: boolean
  onClose: () => void
  titleId: string
  title: ReactNode
  children: ReactNode
  ariaLabel: string
  panelTestId?: string
  backdropTestId?: string
  zClass?: string
  panelMaxWidthClass?: string
  inlineWidthClass?: string
}

export function WorkspaceSidePanel({
  open,
  onClose,
  titleId,
  title,
  children,
  ariaLabel,
  panelTestId = 'workspace-side-panel',
  backdropTestId = 'workspace-side-backdrop',
  zClass = 'z-[70]',
  panelMaxWidthClass = 'max-w-xl',
  inlineWidthClass = 'w-[min(36rem,42vw)] min-w-[18rem]',
}: WorkspaceSidePanelProps) {
  const inline = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    if (!open || !inline) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, inline])

  if (!open) return null

  if (inline) {
    return (
      <aside
        className={`${zClass} flex h-full min-h-0 shrink-0 flex-col border-l border-slate-200/90 bg-white shadow-[0_0_24px_-8px_rgba(0,0,0,0.12)] ${inlineWidthClass}`}
        aria-label={ariaLabel}
        data-testid={panelTestId}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200/80 bg-slate-50/80 px-5 py-4 backdrop-blur-sm">
          <h2 id={titleId} className="min-w-0 flex-1 pr-2 text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    )
  }

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      titleId={titleId}
      title={title}
      zClass={zClass}
      panelMaxWidthClass={panelMaxWidthClass}
      backdropTestId={backdropTestId}
      panelTestId={panelTestId}
    >
      {children}
    </RightDrawer>
  )
}
