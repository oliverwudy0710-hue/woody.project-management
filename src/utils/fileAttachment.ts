import type { TaskAttachment } from '../features/tasks/types'

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

/** Read a user-picked file into storable attachment (localStorage quota applies). */
export async function fileToTaskAttachment(file: File): Promise<TaskAttachment> {
  const id = newId()
  const fileName = file.name
  const nameLower = fileName.toLowerCase()
  const mime = file.type || 'application/octet-stream'
  const treatAsMarkdown =
    nameLower.endsWith('.md') ||
    mime.includes('markdown') ||
    (mime === 'text/plain' && nameLower.endsWith('.md'))

  if (treatAsMarkdown || (mime.startsWith('text/') && !mime.includes('html'))) {
    const text = await file.text()
    return { id, fileName, mimeType: 'text/markdown', textContent: text }
  }

  const buf = await file.arrayBuffer()
  const dataBase64 = bytesToBase64(new Uint8Array(buf))
  return { id, fileName, mimeType: mime, dataBase64 }
}

export function attachmentDataUrl(att: TaskAttachment): string | null {
  if (att.dataBase64) {
    return `data:${att.mimeType};base64,${att.dataBase64}`
  }
  if (att.textContent !== undefined) {
    return `data:${att.mimeType || 'text/markdown'};charset=utf-8,${encodeURIComponent(att.textContent)}`
  }
  return null
}

export function isPdfAttachment(att: TaskAttachment): boolean {
  return att.mimeType.includes('pdf') || att.fileName.toLowerCase().endsWith('.pdf')
}

export function isTextLikeAttachment(att: TaskAttachment): boolean {
  return (
    att.textContent !== undefined ||
    att.mimeType.includes('markdown') ||
    att.fileName.toLowerCase().endsWith('.md')
  )
}
