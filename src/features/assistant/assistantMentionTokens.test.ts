import { describe, expect, it } from 'vitest'
import { formatTaskMention, parseTaskIdsFromMentionText, stripMentionForTaskId } from './assistantMentionTokens'

describe('assistantMentionTokens', () => {
  const id = '11111111-1111-1111-1111-111111111111'

  it('formats and parses round-trip', () => {
    const raw = `hello ${formatTaskMention('任务A', id)} done`
    expect(parseTaskIdsFromMentionText(raw)).toEqual([id])
  })

  it('dedupes repeated mentions', () => {
    const m = formatTaskMention('T', id)
    expect(parseTaskIdsFromMentionText(`${m} ${m}`)).toEqual([id])
  })

  it('stripMentionForTaskId removes token', () => {
    const m = formatTaskMention('T', id)
    const s = stripMentionForTaskId(`x ${m} y`, id)
    expect(s).toBe('x y')
    expect(parseTaskIdsFromMentionText(s)).toEqual([])
  })
})
