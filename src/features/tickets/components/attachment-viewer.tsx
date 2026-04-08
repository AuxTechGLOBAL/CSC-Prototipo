import { File, FileImage, FileText, FileJson, Download } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import type { TicketAttachment } from '../../../types/domain'

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase()

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext ?? '')) {
    return FileImage
  }
  if (['pdf'].includes(ext ?? '')) {
    return FileText
  }
  if (['json', 'txt', 'xml', 'yaml', 'yml'].includes(ext ?? '')) {
    return FileJson
  }
  return File
}

function getFilePreview(fileName: string): string | null {
  // Em um cenario real, isso retornaria uma URL de imagem
  // Para agora, apenas retornamos null
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext ?? '')) {
    // Simulando que teríamos uma URL de preview
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3C/svg%3E`
  }
  return null
}

export function AttachmentViewer({ attachment }: { attachment: TicketAttachment }) {
  const FileIcon = getFileIcon(attachment.name)
  const preview = getFilePreview(attachment.name)
  const isImage = preview !== null

  const handleDownload = () => {
    // Em um cenario real, isso faria o download do arquivo
    // Por enquanto, apenas mostramos um toast
    console.log(`Download iniciado: ${attachment.name}`)
  }

  return (
    <div className="group relative flex flex-col gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 transition-colors hover:border-[var(--brand-500)]/50 hover:bg-[var(--surface-3)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {isImage ? (
            <div className="h-10 w-10 shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] p-1">
              <img
                src={preview}
                alt={attachment.name}
                className="h-full w-full object-cover rounded"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)]">
              <FileIcon size={18} className="text-[var(--text-soft)]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-strong)]">
              {attachment.name}
            </p>
            <p className="text-xs text-[var(--text-soft)]">{attachment.sizeKb} KB</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDownload}
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          title="Download"
        >
          <Download size={16} />
        </Button>
      </div>
      {isImage && (
        <div className="max-h-32 overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)]">
          <img
            src={preview}
            alt={attachment.name}
            className="h-full w-full object-cover max-h-32"
          />
        </div>
      )}
    </div>
  )
}

export function AttachmentList({ attachments }: { attachments: TicketAttachment[] }) {
  if (attachments.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
        <p className="text-sm font-medium text-[var(--text-strong)]">Nenhum anexo</p>
        <p className="text-xs text-[var(--text-soft)]">Este ticket não possui anexos.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {attachments.map((attachment) => (
        <AttachmentViewer key={attachment.id} attachment={attachment} />
      ))}
    </div>
  )
}
