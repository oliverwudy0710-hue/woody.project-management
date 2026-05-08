import { describe, expect, it } from 'vitest'
import { parseAssistantResponse } from './assistantTypes'

describe('parseAssistantResponse', () => {
  it('parses plain JSON', () => {
    const r = parseAssistantResponse(
      JSON.stringify({
        message: '好',
        operations: [{ op: 'create_task', title: '周报', priority: 'high' }],
      }),
    )
    expect(r.message).toBe('好')
    expect(r.operations[0]).toMatchObject({ op: 'create_task', title: '周报', priority: 'high' })
  })

  it('parses update_task', () => {
    const r = parseAssistantResponse(
      JSON.stringify({
        message: '已处理',
        operations: [
          {
            op: 'update_task',
            taskId: 'tid-1',
            title: '新标题',
            progressPercent: 50,
            status: 'in_progress',
          },
        ],
      }),
    )
    expect(r.operations[0]).toMatchObject({
      op: 'update_task',
      taskId: 'tid-1',
      title: '新标题',
      progressPercent: 50,
      status: 'in_progress',
    })
  })

  it('strips markdown fence', () => {
    const r = parseAssistantResponse(
      '```json\n{"message":"x","operations":[{"op":"none"}]}\n```',
    )
    expect(r.message).toBe('x')
    expect(r.operations).toEqual([{ op: 'none' }])
  })
})
