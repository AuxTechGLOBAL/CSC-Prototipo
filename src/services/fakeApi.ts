import { db } from './mockDb'
import { canTransition } from '../lib/workflow'
import type {
  ApprovalDecision,
  NewTicketInput,
  Role,
  ServiceCatalogItem,
  TicketFilters,
  TicketStatus,
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

  async listTickets(filters: TicketFilters = {}) {
    await wait(500)
    return clone(db.listTickets(filters))
  },

  async getTicket(ticketId: string) {
    await wait(350)
    const ticket = db.getTicket(ticketId)
    if (!ticket) throw new Error('Ticket nao encontrado')
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
  ) {
    await wait(500)
    const current = db.getTicket(ticketId)
    if (!current) throw new Error('Ticket nao encontrado')

    if (!canTransition(current.status, nextStatus, role)) {
      throw new Error(`Transicao invalida: ${current.status} -> ${nextStatus} para role ${role}`)
    }

    return clone(db.changeStatus(ticketId, nextStatus, actorId))
  },

  async addComment(ticketId: string, body: string, authorId: string) {
    await wait(350)
    return clone(db.addComment(ticketId, body, authorId))
  },

  async decideApproval(input: ApprovalDecision) {
    await wait(550)
    if (!input.comment.trim()) {
      throw new Error('Comentario obrigatorio para aprovacao/rejeicao')
    }
    return clone(db.decideApproval(input))
  },
}
