import type { ProgressLogEntry } from './types'

export interface ProgressLogTimelineProps {
  entries: ProgressLogEntry[]
}

export function ProgressLogTimeline({ entries }: ProgressLogTimelineProps) {
  const sorted = [...entries].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
  )
  if (sorted.length === 0) {
    return <p className="text-sm text-slate-500">暂无进展记录。</p>
  }
  return (
    <ul className="max-h-48 space-y-3 overflow-y-auto border-t border-slate-200 pt-3" data-testid="progress-log">
      {sorted.map((e) => (
        <li key={e.id} className="text-sm">
          <div className="font-medium text-slate-800">
            {e.date}
            {e.progressSnapshot !== undefined ? (
              <span className="ml-2 text-xs font-normal text-slate-500">({e.progressSnapshot}%)</span>
            ) : null}
          </div>
          <p className="mt-0.5 text-slate-600">{e.note}</p>
        </li>
      ))}
    </ul>
  )
}
