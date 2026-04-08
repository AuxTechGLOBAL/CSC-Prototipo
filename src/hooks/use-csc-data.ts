import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fakeApi } from '../services/fakeApi'
import type {
  ApprovalDecision,
  NewTicketInput,
  ServiceCatalogItem,
  TicketFilters,
  TicketStatus,
} from '../types/domain'
import { useAppStore } from '../store/app-store'

export const queryKeys = {
  users: ['users'] as const,
  services: ['services'] as const,
  kb: (query: string) => ['kb', query] as const,
  tickets: (filters: TicketFilters, role: string, userId: string) => ['tickets', filters, role, userId] as const,
  ticket: (ticketId: string, role: string, userId: string) => ['ticket', ticketId, role, userId] as const,
}

export function useUsersQuery() {
  return useQuery({ queryKey: queryKeys.users, queryFn: () => fakeApi.listUsers() })
}

export function useServicesQuery() {
  return useQuery({ queryKey: queryKeys.services, queryFn: () => fakeApi.listServices() })
}

export function useKbQuery(query: string) {
  return useQuery({
    queryKey: queryKeys.kb(query),
    queryFn: () => fakeApi.listKb(query),
  })
}

export function useTicketsQuery(filters: TicketFilters) {
  const role = useAppStore((state) => state.activeRole)
  const userId = useAppStore((state) => state.activeUserId)

  return useQuery({
    queryKey: queryKeys.tickets(filters, role, userId),
    queryFn: () => fakeApi.listTickets(filters, { role, userId }),
  })
}

export function useTicketQuery(ticketId?: string) {
  const role = useAppStore((state) => state.activeRole)
  const userId = useAppStore((state) => state.activeUserId)

  return useQuery({
    enabled: Boolean(ticketId),
    queryKey: queryKeys.ticket(ticketId ?? '', role, userId),
    queryFn: () => fakeApi.getTicket(ticketId ?? '', { role, userId }),
  })
}

function invalidateTicketData(queryClient: ReturnType<typeof useQueryClient>, ticketId?: string) {
  queryClient.invalidateQueries({ queryKey: ['tickets'] })
  if (ticketId) {
    queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
  }
}

export function useCreateTicketMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: NewTicketInput) => fakeApi.createTicket(input),
    onSuccess: (ticket) => {
      invalidateTicketData(queryClient, ticket.id)
    },
  })
}

export function useAssignTicketMutation() {
  const queryClient = useQueryClient()
  const actorId = useAppStore((state) => state.activeUserId)

  return useMutation({
    mutationFn: (input: { ticketId: string; assigneeId: string }) => {
      return fakeApi.assignTicket(input.ticketId, input.assigneeId, actorId)
    },
    onSuccess: (ticket) => {
      invalidateTicketData(queryClient, ticket.id)
    },
  })
}

export function useChangeStatusMutation() {
  const queryClient = useQueryClient()
  const role = useAppStore((state) => state.activeRole)
  const actorId = useAppStore((state) => state.activeUserId)

  return useMutation({
    mutationFn: (input: {
      ticketId: string
      status: TicketStatus
      closeReason?: string
      solutionSummary?: string
    }) => {
      return fakeApi.changeStatus(input.ticketId, input.status, role, actorId, {
        closeReason: input.closeReason,
        solutionSummary: input.solutionSummary,
      })
    },
    onSuccess: (ticket) => {
      invalidateTicketData(queryClient, ticket.id)
    },
  })
}

export function useAddCommentMutation() {
  const queryClient = useQueryClient()
  const actorId = useAppStore((state) => state.activeUserId)

  return useMutation({
    mutationFn: (input: {
      ticketId: string
      body: string
      isInternal?: boolean
      attachments?: Array<{ name: string; sizeKb: number }>
    }) => {
      return fakeApi.addComment(input.ticketId, input.body, actorId, input.isInternal, input.attachments)
    },
    onSuccess: (ticket) => {
      invalidateTicketData(queryClient, ticket.id)
    },
  })
}

export function useApprovalMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ApprovalDecision) => fakeApi.decideApproval(input),
    onSuccess: (ticket) => {
      invalidateTicketData(queryClient, ticket.id)
    },
  })
}

export function useCreateServiceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<ServiceCatalogItem, 'id'>) => fakeApi.createService(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services })
    },
  })
}

export function useUpdateServiceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { serviceId: string; patch: Partial<ServiceCatalogItem> }) => {
      return fakeApi.updateService(input.serviceId, input.patch)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services })
    },
  })
}

export function useDeleteServiceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (serviceId: string) => fakeApi.deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services })
    },
  })
}
