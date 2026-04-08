export type Role = 'Requester' | 'Agent' | 'Approver' | 'Supervisor' | 'Admin'

export type TicketStatus =
  | 'New'
  | 'InTriage'
  | 'AwaitingApproval'
  | 'Assigned'
  | 'InProgress'
  | 'WaitingRequester'
  | 'Resolved'
  | 'Closed'
  | 'Cancelled'

export type Priority = 'Low' | 'Medium' | 'High'

export interface User {
  id: string
  name: string
  role: Role
  area: string
}

export interface ServiceCatalogItem {
  id: string
  name: string
  description: string
  area: string
  impact: 'Low' | 'Medium' | 'High'
  urgency: 'Low' | 'Medium' | 'High'
  requiresApproval: boolean
}

export interface TicketAttachment {
  id: string
  name: string
  sizeKb: number
  uploadedAt: string
}

export interface TicketComment {
  id: string
  authorId: string
  body: string
  createdAt: string
}

export type TicketEventType =
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'approved'
  | 'rejected'
  | 'commented'
  | 'closed'
  | 'reopened'

export interface TicketEvent {
  id: string
  type: TicketEventType
  authorId: string
  createdAt: string
  message: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  serviceId: string
  requesterId: string
  impactedUser: string
  area: string
  status: TicketStatus
  priority: Priority
  assigneeId?: string
  createdAt: string
  updatedAt: string
  dueAt: string
  attachments: TicketAttachment[]
  comments: TicketComment[]
  events: TicketEvent[]
}

export interface KbArticle {
  id: string
  title: string
  tags: string[]
  serviceId?: string
  content: string
}

export interface TicketFilters {
  status?: TicketStatus
  priority?: Priority
  area?: string
  assigneeId?: string
  requesterId?: string
  query?: string
}

export interface NewTicketInput {
  title: string
  description: string
  serviceId: string
  requesterId: string
  impactedUser: string
  attachments: Array<{ name: string; sizeKb: number }>
}

export interface ApprovalDecision {
  ticketId: string
  approve: boolean
  comment: string
  actorId: string
}
