import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-2 text-lg font-bold text-slate-900 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-2 text-base font-semibold text-slate-900 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-1.5 text-sm font-semibold text-slate-800 first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="my-1 list-inside list-disc space-y-0.5 pl-1 text-slate-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1 list-inside list-decimal space-y-0.5 pl-1 text-slate-700">{children}</ol>
  ),
  li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
  p: ({ children }) => <p className="my-1 text-sm leading-relaxed text-slate-700">{children}</p>,
  code: ({ className, children }) => (
    <code
      className={`rounded bg-slate-200/80 px-1 py-0.5 font-mono text-xs text-slate-900 ${className ?? ''}`}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-slate-800 p-2 text-xs text-slate-100">{children}</pre>
  ),
  a: ({ children, href }) => (
    <a className="text-indigo-600 underline hover:text-indigo-800" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
}

export interface MarkdownPreviewProps {
  markdown: string
  className?: string
}

export function MarkdownPreview({ markdown, className = '' }: MarkdownPreviewProps) {
  if (!markdown.trim()) {
    return <p className="text-sm text-slate-400">（暂无内容）</p>
  }
  return (
    <div className={`markdown-preview ${className}`}>
      <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
    </div>
  )
}
