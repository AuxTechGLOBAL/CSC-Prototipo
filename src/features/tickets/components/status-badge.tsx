import { Badge } from '../../../components/ui/badge'
import type { TicketStatus } from '../../../types/domain'

const styleByStatus: Record<TicketStatus, Parameters<typeof Badge>[0]['variant']> = {
  New: 'info',
  InTriage: 'warning',
  AwaitingApproval: 'warning',
  Assigned: 'info',
  InProgress: 'info',
  WaitingRequester: 'warning',
  Resolved: 'success',
  Closed: 'neutral',
  Cancelled: 'danger',
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={styleByStatus[status]}>{status}</Badge>
}
