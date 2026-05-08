import type { TaskDomain } from '../features/tasks/types'
import { TASK_DOMAIN_LABELS } from '../features/tasks/domainOptions'

type BadgeTone = 'work' | 'life' | 'study' | 'other'

function domainToTone(domain: TaskDomain): BadgeTone {
  if (domain === 'work') return 'work'
  if (domain === 'life') return 'life'
  if (domain === 'study') return 'study'
  return 'other'
}

function IconWork({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  )
}

function IconLife({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconStudy({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function IconTag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

const toneConfig: Record<BadgeTone, { Icon: typeof IconWork; pill: string; iconWrap: string }> = {
  work: {
    Icon: IconWork,
    pill: 'bg-sky-50 text-sky-900 ring-sky-200',
    iconWrap: 'text-sky-600',
  },
  life: {
    Icon: IconLife,
    pill: 'bg-violet-50 text-violet-900 ring-violet-200',
    iconWrap: 'text-violet-600',
  },
  study: {
    Icon: IconStudy,
    pill: 'bg-teal-50 text-teal-900 ring-teal-200',
    iconWrap: 'text-teal-600',
  },
  other: {
    Icon: IconTag,
    pill: 'bg-slate-100 text-slate-800 ring-slate-200',
    iconWrap: 'text-slate-500',
  },
}

export interface TaskCategoryBadgeProps {
  domain: TaskDomain
  category: string
}

export function TaskCategoryBadge({ domain, category }: TaskCategoryBadgeProps) {
  const sub = category.trim()
  const base = TASK_DOMAIN_LABELS[domain]
  const label = sub ? `${base} · ${sub}` : base
  const tone = domainToTone(domain)
  const cfg = toneConfig[tone]
  const { Icon } = cfg
  return (
    <span
      data-testid="task-category"
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.pill}`}
    >
      <span className={cfg.iconWrap}>
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </span>
      {label}
    </span>
  )
}
