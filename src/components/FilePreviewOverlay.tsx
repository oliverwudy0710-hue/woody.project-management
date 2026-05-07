import type { TaskAttachment } from '../features/tasks/types'
import {
  attachmentDataUrl,
  isPdfAttachment,
  isTextLikeAttachment,
} from '../utils/fileAttachment'
import { MarkdownPreview } from './MarkdownPreview'

export interface FilePreviewOverlayProps {
  attachment: TaskAttachment | null
  onClose: () => void
}

export function FilePreviewOverlay({ attachment, onClose }: FilePreviewOverlayProps) {
  if (!attachment) return null

  const url = attachmentDataUrl(attachment)
  const isPdf = isPdfAttachment(attachment)
  const isMd = isTextLikeAttachment(attachment)

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal>
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="关闭预览"
        onClick={onClose}
        data-testid="file-preview-backdrop"
      />
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200"
        data-testid="file-preview-panel"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <h2 className="truncate text-sm font-semibold text-slate-900" title={attachment.fileName}>
            {attachment.fileName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            关闭
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-4">
          {isPdf && url ? (
            <iframe title={attachment.fileName} src={url} className="h-[75vh] w-full rounded-lg border border-slate-200 bg-white" />
          ) : isMd ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <MarkdownPreview markdown={attachment.textContent ?? ''} />
            </div>
          ) : url ? (
            <iframe title={attachment.fileName} src={url} className="h-[75vh] w-full rounded-lg border border-slate-200 bg-white" />
          ) : (
            <p className="text-sm text-slate-600">当前文件无法预览。</p>
          )}
        </div>
      </div>
    </div>
  )
}
