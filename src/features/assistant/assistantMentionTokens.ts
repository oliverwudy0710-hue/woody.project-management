/** Visible stable mention: `@[title](task:uuid)` — title must not contain `]`. */
const MENTION_RE = /@\[([^\]]*)\]\(task:([0-9a-fA-F-]{36})\)/g

export function escapeForMentionTitle(title: string): string {
  return title.replace(/\]/g, '›')
}

export function formatTaskMention(title: string, taskId: string): string {
  const safe = escapeForMentionTitle(title.trim() || '未命名')
  return `@[${safe}](task:${taskId})`
}

export function parseTaskIdsFromMentionText(text: string): string[] {
  const ids: string[] = []
  let m: RegExpExecArray | null
  const re = new RegExp(MENTION_RE.source, 'g')
  while ((m = re.exec(text)) !== null) {
    ids.push(m[2])
  }
  return [...new Set(ids)]
}

export function stripMentionForTaskId(text: string, taskId: string): string {
  const re = new RegExp(
    `@\\[[^\\]]*\\]\\(task:${taskId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\\s*`,
    'g',
  )
  return text.replace(re, '')
}
