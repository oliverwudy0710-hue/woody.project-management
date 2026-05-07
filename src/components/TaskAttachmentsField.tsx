import { useRef, useState } from 'react'
import type { TaskAttachment } from '../features/tasks/types'
import { fileToTaskAttachment } from '../utils/fileAttachment'
import { FilePreviewOverlay } from './FilePreviewOverlay'

const btn =
  'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50'

export interface TaskAttachmentsFieldProps {
  attachments: TaskAttachment[]
  onChange: (next: TaskAttachment[]) => void
  disabled?: boolean
}

export function TaskAttachmentsField({
  attachments,
  onChange,
  disabled,
}: TaskAttachmentsFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<TaskAttachment | null>(null)
  const [busy, setBusy] = useState(false)

  const addFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) return
    setBusy(true)
    try {
      const next = [...attachments]
      for (const f of Array.from(files)) {
        next.push(await fileToTaskAttachment(f))
      }
      onChange(next)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div data-testid="task-attachments-field">
      <label className="text-sm font-medium text-slate-700">关联文件</label>
      <p className="mt-0.5 text-xs text-slate-500">
        选择本地 .md 或 PDF 等；数据保存在浏览器本地（大文件可能占用较多存储）。
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        accept=".md,.pdf,.txt,text/*,application/pdf"
        disabled={disabled || busy}
        onChange={(e) => void addFiles(e.target.files)}
        data-testid="task-attachments-input"
      />
      <button
        type="button"
        disabled={disabled || busy}
        className={`${btn} mt-2`}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? '处理中…' : '添加本地文件'}
      </button>
      {attachments.length ? (
        <ul className="mt-2 space-y-1.5">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs"
            >
              <span className="min-w-0 truncate font-medium text-slate-800" title={a.fileName}>
                {a.fileName}
              </span>
              <span className="flex shrink-0 gap-1">
                <button
                  type="button"
                  className={btn}
                  onClick={() => setPreview(a)}
                  data-testid={`attachment-preview-${a.id}`}
                >
                  预览
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  className={`${btn} border-rose-200 text-rose-800 hover:bg-rose-50`}
                  onClick={() => onChange(attachments.filter((x) => x.id !== a.id))}
                >
                  移除
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <FilePreviewOverlay attachment={preview} onClose={() => setPreview(null)} />
    </div>
  )
}
