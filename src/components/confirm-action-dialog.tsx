import { Button } from './ui/button'
import { Dialog } from './ui/dialog'

interface ConfirmActionDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onCancel: () => void
  onConfirm: () => Promise<void> | void
}

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading,
  onCancel,
  onConfirm,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-soft)]">{description}</p>
        <p className="text-sm font-medium text-[var(--text-strong)]">Tem certeza que quer fazer isso?</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processando...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}