import type { TimeGranularity } from '../tasks/types'
import { useTaskStore } from '../../stores/taskStore'

const labels: Record<TimeGranularity, string> = {
  month: '本月',
  week: '本周',
  day: '今日',
}

export function TimeGranularityNav() {
  const granularity = useTaskStore((s) => s.timeGranularity)
  const setGranularity = useTaskStore((s) => s.setTimeGranularity)

  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label="时间粒度"
      data-testid="time-granularity-nav"
    >
      {(['month', 'week', 'day'] as const).map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => setGranularity(g)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            granularity === g
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
          aria-pressed={granularity === g}
        >
          {labels[g]}
        </button>
      ))}
    </nav>
  )
}
