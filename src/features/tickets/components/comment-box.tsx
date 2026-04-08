import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/textarea'

interface CommentBoxProps {
  isSending?: boolean
  onSend: (text: string) => Promise<void> | void
}

export function CommentBox({ isSending, onSend }: CommentBoxProps) {
  const [text, setText] = useState('')

  const submit = async () => {
    const normalized = text.trim()
    if (!normalized) return
    await onSend(normalized)
    setText('')
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Adicione um comentario para registrar andamento..."
      />
      <Button onClick={submit} disabled={isSending || !text.trim()}>
        {isSending ? 'Enviando...' : 'Enviar comentario'}
      </Button>
    </div>
  )
}
