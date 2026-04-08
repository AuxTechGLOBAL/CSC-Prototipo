import type { Role, TicketStatus } from '../types/domain'

export const ticketStatuses: TicketStatus[] = [
  'New',
  'InTriage',
  'AwaitingApproval',
  'Assigned',
  'InProgress',
  'WaitingRequester',
  'Resolved',
  'Closed',
  'Cancelled',
]

export const statusLabelsPt: Record<TicketStatus, string> = {
  New: 'Novo',
  InTriage: 'Em triagem',
  AwaitingApproval: 'Aguardando aprovacao',
  Assigned: 'Atribuido',
  InProgress: 'Em andamento',
  WaitingRequester: 'Aguardando solicitante',
  Resolved: 'Resolvido',
  Closed: 'Fechado',
  Cancelled: 'Cancelado',
}

const transitions: Record<TicketStatus, TicketStatus[]> = {
  New: ['InTriage', 'Cancelled'],
  InTriage: ['AwaitingApproval', 'Assigned', 'Cancelled'],
  AwaitingApproval: ['Assigned', 'Cancelled'],
  Assigned: ['InProgress', 'Cancelled'],
  InProgress: ['WaitingRequester', 'Resolved', 'Cancelled'],
  WaitingRequester: ['InProgress', 'Cancelled'],
  Resolved: ['Closed', 'InProgress'],
  Closed: [],
  Cancelled: [],
}

const rolePermissions: Record<Role, Partial<Record<TicketStatus, TicketStatus[]>>> = {
  Requester: {
    WaitingRequester: ['InProgress'],
    Resolved: ['InProgress'],
  },
  Agent: {
    New: ['InTriage'],
    InTriage: ['Assigned'],
    Assigned: ['InProgress'],
    InProgress: ['WaitingRequester', 'Resolved'],
    WaitingRequester: ['InProgress'],
    Resolved: ['Closed'],
  },
  Approver: {
    AwaitingApproval: ['Assigned', 'Cancelled'],
  },
  Supervisor: {
    New: ['InTriage', 'Cancelled'],
    InTriage: ['AwaitingApproval', 'Assigned', 'Cancelled'],
    Assigned: ['InProgress', 'Cancelled'],
    InProgress: ['WaitingRequester', 'Resolved', 'Cancelled'],
    WaitingRequester: ['InProgress', 'Cancelled'],
    Resolved: ['Closed', 'InProgress'],
  },
  Admin: {
    New: ['InTriage', 'Cancelled'],
    InTriage: ['AwaitingApproval', 'Assigned', 'Cancelled'],
    AwaitingApproval: ['Assigned', 'Cancelled'],
    Assigned: ['InProgress', 'Cancelled'],
    InProgress: ['WaitingRequester', 'Resolved', 'Cancelled'],
    WaitingRequester: ['InProgress', 'Cancelled'],
    Resolved: ['Closed', 'InProgress'],
  },
}

export function getAllowedTransitions(status: TicketStatus, role: Role): TicketStatus[] {
  const byRole = rolePermissions[role][status] ?? []
  return byRole.filter((target) => transitions[status].includes(target))
}

export function canTransition(
  currentStatus: TicketStatus,
  nextStatus: TicketStatus,
  role: Role,
): boolean {
  return getAllowedTransitions(currentStatus, role).includes(nextStatus)
}

export function getStatusLabelPt(status: TicketStatus): string {
  return statusLabelsPt[status]
}

export function describeTransitionPt(currentStatus: TicketStatus, nextStatus: TicketStatus): string {
  return `Alterar status de "${getStatusLabelPt(currentStatus)}" para "${getStatusLabelPt(nextStatus)}".`
}
