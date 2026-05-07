import { useEffect, useState } from 'react'
import { MarkdownPreview } from './MarkdownPreview'

const tabBtn =
  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400'

const field =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

export interface MarkdownEditorFieldProps {
  id: string
  label: string
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  rows?: number
}

export function MarkdownEditorField({
  id,
  label,
  value,
  onChange,
  disabled,
  rows = 5,
}: MarkdownEditorFieldProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>(() =>
    value.trim() ? 'preview' : 'edit',
  )

  useEffect(() => {
    if (!value.trim()) setMode('edit')
  }, [value])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}{' '}
          <span className="font-normal text-slate-500">（支持 Markdown）</span>
        </label>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            disabled={disabled}
            className={`${tabBtn} ${mode === 'edit' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setMode('edit')}
          >
            编辑
          </button>
          <button
            type="button"
            disabled={disabled}
            className={`${tabBtn} ${mode === 'preview' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setMode('preview')}
          >
            预览
          </button>
        </div>
      </div>
      {mode === 'edit' ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${field} font-mono text-sm leading-relaxed`}
          placeholder="标题、列表等，例如：&#10;## 小节&#10;- 项 A&#10;1. 第一步"
          data-testid="markdown-editor"
        />
      ) : (
        <div
          className={`mt-1 min-h-[8rem] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 ${disabled ? 'opacity-60' : ''}`}
          data-testid="markdown-preview-pane"
        >
          <MarkdownPreview markdown={value} />
        </div>
      )}
    </div>
  )
}
