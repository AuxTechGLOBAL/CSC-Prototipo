import type {
  ApprovalDecision,
  KbArticle,
  NewTicketInput,
  ServiceCatalogItem,
  Ticket,
  TicketFilters,
  TicketStatus,
  User,
} from '../types/domain'

const now = Date.now()

export const users: User[] = [
  { id: 'u1', name: 'Ana Ribeiro', role: 'Requester', area: 'Financeiro' },
  { id: 'u2', name: 'Bruno Costa', role: 'Agent', area: 'TI Operacoes' },
  { id: 'u3', name: 'Carla Nunes', role: 'Approver', area: 'Financeiro' },
  { id: 'u4', name: 'Diego Prado', role: 'Supervisor', area: 'TI Operacoes' },
  { id: 'u5', name: 'Ester Lima', role: 'Admin', area: 'Plataforma' },
  { id: 'u6', name: 'Fabio Silva', role: 'Agent', area: 'RH' },
]

let services: ServiceCatalogItem[] = [
  {
    id: 'svc-erp-access',
    name: 'Acesso ERP',
    description: 'Criacao e ajuste de acesso no ERP corporativo.',
    area: 'Financeiro',
    impact: 'High',
    urgency: 'High',
    requiresApproval: true,
  },
  {
    id: 'svc-vpn',
    name: 'VPN Corporativa',
    description: 'Solicitacao de acesso remoto seguro.',
    area: 'TI Operacoes',
    impact: 'Medium',
    urgency: 'Medium',
    requiresApproval: false,
  },
  {
    id: 'svc-payroll',
    name: 'Folha de Pagamento',
    description: 'Correcao e ajustes no processamento da folha.',
    area: 'RH',
    impact: 'High',
    urgency: 'Medium',
    requiresApproval: true,
  },
]

const kbArticles: KbArticle[] = [
  {
    id: 'kb-1',
    title: 'Como solicitar acesso ao ERP',
    tags: ['erp', 'acesso', 'financeiro'],
    serviceId: 'svc-erp-access',
    content:
      '# Solicitar acesso ao ERP\n\n1. Abra um ticket em **Acesso ERP**.\n2. Informe perfil e centro de custo.\n3. Aguarde aprovacao do gestor.',
  },
  {
    id: 'kb-2',
    title: 'Troubleshooting de VPN',
    tags: ['vpn', 'rede', 'acesso remoto'],
    serviceId: 'svc-vpn',
    content:
      '# Problemas comuns de VPN\n\n- Verifique token\n- Reinicie o cliente\n- Confirme conectividade local',
  },
  {
    id: 'kb-3',
    title: 'Checklist para fechamento de chamado',
    tags: ['processo', 'encerramento'],
    content:
      '# Checklist de fechamento\n\n- Validacao com solicitante\n- Evidencias anexadas\n- Solucao documentada',
  },
]

let ticketCounter = 1007

function buildTicketSeed(
  id: string,
  title: string,
  serviceId: string,
  requesterId: string,
  area: string,
  status: TicketStatus,
  assigneeId?: string,
): Ticket {
  const createdAt = new Date(now - Math.random() * 1000 * 60 * 60 * 36).toISOString()
  const dueAt = new Date(new Date(createdAt).getTime() + 1000 * 60 * 60 * 6).toISOString()

  return {
    id,
    title,
    description: `Detalhes da solicitacao: ${title}`,
    serviceId,
    requesterId,
    impactedUser: 'Usuario Final',
    area,
    status,
    priority: status === 'Resolved' ? 'Medium' : 'High',
    assigneeId,
    createdAt,
    updatedAt: createdAt,
    dueAt,
    attachments: [
      {
        id: `${id}-att-1`,
        name: 'evidencia.png',
        sizeKb: 224,
        uploadedAt: createdAt,
      },
    ],
    comments: [],
    events: [
      {
        id: `${id}-evt-1`,
        type: 'created',
        authorId: requesterId,
        createdAt,
        message: 'Ticket criado pelo solicitante.',
      },
    ],
  }
}

let tickets: Ticket[] = [
  buildTicketSeed('TCK-1001', 'Erro ao aprovar nota fiscal', 'svc-erp-access', 'u1', 'Financeiro', 'InTriage', 'u2'),
  buildTicketSeed('TCK-1002', 'VPN desconecta apos 5 minutos', 'svc-vpn', 'u1', 'TI Operacoes', 'InProgress', 'u2'),
  buildTicketSeed('TCK-1003', 'Ajuste de rubrica na folha', 'svc-payroll', 'u1', 'RH', 'AwaitingApproval'),
  buildTicketSeed('TCK-1004', 'Novo acesso para analista junior', 'svc-erp-access', 'u1', 'Financeiro', 'Assigned', 'u2'),
  buildTicketSeed('TCK-1005', 'Falha na exportacao de relatorio', 'svc-erp-access', 'u1', 'Financeiro', 'WaitingRequester', 'u2'),
  buildTicketSeed('TCK-1006', 'Revalidar permissao de pagamento', 'svc-erp-access', 'u1', 'Financeiro', 'Resolved', 'u2'),
]

function matchesFilter(ticket: Ticket, filters: TicketFilters): boolean {
  const search = filters.query?.toLowerCase().trim()

  if (filters.status && ticket.status !== filters.status) return false
  if (filters.priority && ticket.priority !== filters.priority) return false
  if (filters.area && ticket.area !== filters.area) return false
  if (filters.assigneeId && ticket.assigneeId !== filters.assigneeId) return false
  if (filters.requesterId && ticket.requesterId !== filters.requesterId) return false
  if (search && !`${ticket.id} ${ticket.title}`.toLowerCase().includes(search)) return false

  return true
}

export const db = {
  listUsers() {
    return users
  },

  listServices() {
    return services
  },

  createService(input: Omit<ServiceCatalogItem, 'id'>) {
    const service: ServiceCatalogItem = {
      ...input,
      id: `svc-${Math.random().toString(36).slice(2, 8)}`,
    }
    services = [service, ...services]
    return service
  },

  updateService(serviceId: string, input: Partial<ServiceCatalogItem>) {
    const target = services.find((item) => item.id === serviceId)
    if (!target) throw new Error('Servico nao encontrado')
    Object.assign(target, input)
    return target
  },

  deleteService(serviceId: string) {
    services = services.filter((item) => item.id !== serviceId)
  },

  listKb(query?: string) {
    if (!query) return kbArticles
    const term = query.toLowerCase().trim()
    return kbArticles.filter((article) => {
      return (
        article.title.toLowerCase().includes(term) ||
        article.tags.some((tag) => tag.toLowerCase().includes(term))
      )
    })
  },

  listTickets(filters: TicketFilters = {}) {
    return tickets.filter((ticket) => matchesFilter(ticket, filters))
  },

  getTicket(ticketId: string) {
    return tickets.find((ticket) => ticket.id === ticketId)
  },

  createTicket(input: NewTicketInput) {
    const service = services.find((item) => item.id === input.serviceId)
    if (!service) throw new Error('Servico nao encontrado')

    ticketCounter += 1
    const createdAt = new Date().toISOString()
    const dueAt = new Date(Date.now() + (service.urgency === 'High' ? 2 : 6) * 60 * 60 * 1000).toISOString()

    const ticket: Ticket = {
      id: `TCK-${ticketCounter}`,
      title: input.title,
      description: input.description,
      serviceId: input.serviceId,
      requesterId: input.requesterId,
      impactedUser: input.impactedUser,
      area: service.area,
      status: 'New',
      priority: service.impact === 'High' ? 'High' : service.impact === 'Medium' ? 'Medium' : 'Low',
      createdAt,
      updatedAt: createdAt,
      dueAt,
      attachments: input.attachments.map((attachment, index) => ({
        id: `${ticketCounter}-att-${index + 1}`,
        name: attachment.name,
        sizeKb: attachment.sizeKb,
        uploadedAt: createdAt,
      })),
      comments: [],
      events: [
        {
          id: `${ticketCounter}-evt-created`,
          type: 'created',
          authorId: input.requesterId,
          createdAt,
          message: 'Ticket criado no portal CSC.',
        },
      ],
    }

    tickets = [ticket, ...tickets]
    return ticket
  },

  assignTicket(ticketId: string, assigneeId: string, actorId: string) {
    const ticket = tickets.find((item) => item.id === ticketId)
    if (!ticket) throw new Error('Ticket nao encontrado')

    const updatedAt = new Date().toISOString()
    ticket.assigneeId = assigneeId
    ticket.updatedAt = updatedAt
    ticket.events.unshift({
      id: `${ticket.id}-evt-assigned-${Date.now()}`,
      type: 'assigned',
      authorId: actorId,
      createdAt: updatedAt,
      message: `Ticket atribuido para ${assigneeId}.`,
    })

    return ticket
  },

  changeStatus(ticketId: string, status: TicketStatus, actorId: string) {
    const ticket = tickets.find((item) => item.id === ticketId)
    if (!ticket) throw new Error('Ticket nao encontrado')

    const previous = ticket.status
    const updatedAt = new Date().toISOString()

    ticket.status = status
    ticket.updatedAt = updatedAt

    ticket.events.unshift({
      id: `${ticket.id}-evt-status-${Date.now()}`,
      type: 'status_changed',
      authorId: actorId,
      createdAt: updatedAt,
      message: `Status alterado de ${previous} para ${status}.`,
    })

    if (status === 'Closed') {
      ticket.events.unshift({
        id: `${ticket.id}-evt-close-${Date.now()}`,
        type: 'closed',
        authorId: actorId,
        createdAt: updatedAt,
        message: 'Ticket fechado.',
      })
    }

    return ticket
  },

  addComment(ticketId: string, body: string, authorId: string) {
    const ticket = tickets.find((item) => item.id === ticketId)
    if (!ticket) throw new Error('Ticket nao encontrado')

    const createdAt = new Date().toISOString()

    ticket.comments.unshift({
      id: `${ticket.id}-comment-${Date.now()}`,
      authorId,
      body,
      createdAt,
    })

    ticket.events.unshift({
      id: `${ticket.id}-evt-comment-${Date.now()}`,
      type: 'commented',
      authorId,
      createdAt,
      message: 'Novo comentario registrado.',
    })

    ticket.updatedAt = createdAt

    return ticket
  },

  decideApproval(input: ApprovalDecision) {
    const ticket = tickets.find((item) => item.id === input.ticketId)
    if (!ticket) throw new Error('Ticket nao encontrado')

    const createdAt = new Date().toISOString()

    ticket.events.unshift({
      id: `${ticket.id}-evt-approval-${Date.now()}`,
      type: input.approve ? 'approved' : 'rejected',
      authorId: input.actorId,
      createdAt,
      message: input.approve
        ? `Aprovado. Comentario: ${input.comment}`
        : `Rejeitado. Comentario: ${input.comment}`,
    })

    ticket.status = input.approve ? 'Assigned' : 'Cancelled'
    ticket.updatedAt = createdAt

    return ticket
  },
}
