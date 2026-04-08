import { db } from './mockDb'
import { canTransition } from '../lib/workflow'
import type {
  ApprovalDecision,
  NewTicketInput,
  Role,
  ServiceCatalogItem,
  TicketFilters,
  TicketStatus,
  ViewerContext,
} from '../types/domain'

function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

export const fakeApi = {
  async listUsers() {
    await wait(200)
    return clone(db.listUsers())
  },

  async listServices() {
    await wait(300)
    return clone(db.listServices())
  },

  async createService(input: Omit<ServiceCatalogItem, 'id'>) {
    await wait(400)
    return clone(db.createService(input))
  },

  async updateService(serviceId: string, input: Partial<ServiceCatalogItem>) {
    await wait(350)
    return clone(db.updateService(serviceId, input))
  },

  async deleteService(serviceId: string) {
    await wait(300)
    db.deleteService(serviceId)
  },

  async listKb(query?: string) {
    await wait(250)
    return clone(db.listKb(query))
  },

  async listTickets(filters: TicketFilters = {}, viewer: ViewerContext) {
    await wait(500)
    return clone(db.listTickets(filters, viewer))
  },

  async getTicket(ticketId: string, viewer: ViewerContext) {
    await wait(350)
    const ticket = db.getTicket(ticketId, viewer)
    if (!ticket) throw new Error('Ticket nao encontrado ou sem permissao de acesso')
    return clone(ticket)
  },

  async createTicket(input: NewTicketInput) {
    await wait(800)
    return clone(db.createTicket(input))
  },

  async assignTicket(ticketId: string, assigneeId: string, actorId: string) {
    await wait(500)
    return clone(db.assignTicket(ticketId, assigneeId, actorId))
  },

  async changeStatus(
    ticketId: string,
    nextStatus: TicketStatus,
    role: Role,
    actorId: string,
    closeData?: { closeReason?: string; solutionSummary?: string },
  ) {
    await wait(500)
    const current = db.getTicket(ticketId, { role, userId: actorId })
    if (!current) throw new Error('Ticket nao encontrado ou sem permissao de acesso')

    if (!canTransition(current.status, nextStatus, role)) {
      throw new Error(`Transicao invalida: ${current.status} -> ${nextStatus} para role ${role}`)
    }

    return clone(db.changeStatus(ticketId, nextStatus, actorId, closeData))
  },

  async addComment(
    ticketId: string,
    body: string,
    authorId: string,
    isInternal?: boolean,
    attachments?: Array<{ name: string; sizeKb: number }>,
  ) {
    await wait(350)
    return clone(db.addComment(ticketId, body, authorId, isInternal, attachments))
  },

  async decideApproval(input: ApprovalDecision) {
    await wait(550)
    if (!input.comment.trim()) {
      throw new Error('Comentario obrigatorio para aprovacao/rejeicao')
    }
    return clone(db.decideApproval(input))
  },
}
