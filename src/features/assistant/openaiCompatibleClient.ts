export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function postOpenAICompatibleChat(opts: {
  baseUrl: string
  chatPath: string
  apiKey: string
  model: string
  messages: ChatMessage[]
  useDevProxy: boolean
}): Promise<string> {
  const path = opts.chatPath.startsWith('/') ? opts.chatPath : `/${opts.chatPath}`
  const url =
    opts.useDevProxy && import.meta.env.DEV
      ? `${window.location.origin}/api-llm${path}`
      : `${opts.baseUrl.replace(/\/$/, '')}${path}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.apiKey ? { Authorization: `Bearer ${opts.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: 0.2,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(errText || `HTTP ${res.status}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new Error('响应中缺少 choices[0].message.content')
  }
  return content
}
