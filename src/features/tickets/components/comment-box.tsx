import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/textarea'

interface CommentBoxProps {
  isSending?: boolean
  canMarkInternal?: boolean
  onSend: (
    text: string,
    isInternal: boolean,
    attachments: Array<{ name: string; sizeKb: number }>,
  ) => Promise<void> | void
}

export function CommentBox({ isSending, canMarkInternal, onSend }: CommentBoxProps) {
  const [text, setText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ name: string; sizeKb: number }>>([])

  const submit = async () => {
    const normalized = text.trim()
    if (!normalized) return
    await onSend(normalized, isInternal, attachments)
    setText('')
    setIsInternal(false)
    setAttachments([])
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Adicione um comentario para registrar andamento..."
      />
      {canMarkInternal && (
        <label className="flex items-center gap-2 text-xs text-[var(--text-soft)]">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(event) => setIsInternal(event.target.checked)}
          />
          Comentario interno (visivel apenas para equipe)
        </label>
      )}
      <input
        type="file"
        multiple
        className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2 text-xs text-[var(--text-soft)]"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          setAttachments(files.map((file) => ({ name: file.name, sizeKb: Math.ceil(file.size / 1024) })))
        }}
      />
      {attachments.length > 0 && (
        <ul className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2 text-xs text-[var(--text-soft)]">
          {attachments.map((attachment) => (
            <li key={attachment.name}>
              {attachment.name} ({attachment.sizeKb} KB)
            </li>
          ))}
        </ul>
      )}
      <Button onClick={submit} disabled={isSending || !text.trim()}>
        {isSending ? 'Enviando...' : 'Enviar comentario'}
      </Button>
    </div>
  )
}
