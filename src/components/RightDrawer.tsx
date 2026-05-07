import type { ReactNode } from 'react'
import { useEffect } from 'react'

export interface RightDrawerProps {
  open: boolean
  onClose: () => void
  titleId: string
  title: ReactNode
  children: ReactNode
  /** z-index class, e.g. z-50 or z-[60] */
  zClass?: string
  backdropTestId?: string
  panelTestId?: string
  /** Replaces default `max-w-md sm:max-w-lg` when set (e.g. `max-w-2xl`). */
  panelMaxWidthClass?: string
}

export function RightDrawer({
  open,
  onClose,
  titleId,
  title,
  children,
  zClass = 'z-50',
  backdropTestId = 'right-drawer-backdrop',
  panelTestId = 'right-drawer-panel',
  panelMaxWidthClass,
}: RightDrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 ${zClass} flex justify-end bg-slate-900/35 backdrop-blur-[2px] transition-colors`}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      data-testid={backdropTestId}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex h-full w-full flex-col rounded-l-2xl border-l border-slate-200/90 bg-white shadow-2xl ${panelMaxWidthClass ?? 'max-w-md sm:max-w-lg'}`}
        data-testid={panelTestId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200/80 bg-slate-50/80 px-5 py-4 backdrop-blur-sm">
          <h2 id={titleId} className="pr-2 text-lg font-semibold text-slate-900">
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
      </div>
    </div>
  )
}
