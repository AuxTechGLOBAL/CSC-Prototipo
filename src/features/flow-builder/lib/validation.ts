import type { FlowEdge, FlowNode, FlowValidationResult } from '../types/flow-builder'

function hasMinConfig(node: FlowNode) {
  const { kind, config } = node.data
  if (kind === 'start' || kind === 'end') {
    return true
  }

  if (kind === 'statusChange') {
    return Boolean((config as { nextStatus?: string }).nextStatus)
  }

  if (kind === 'assign') {
    const assignConfig = config as { mode: 'specificUser' | 'area' | 'pickup'; user?: string; area?: string }
    if (assignConfig.mode === 'pickup') {
      return true
    }
    if (assignConfig.mode === 'specificUser') {
      return Boolean(assignConfig.user)
    }
    return Boolean(assignConfig.area)
  }

  if (kind === 'condition') {
    const condition = config as { field?: string; operator?: string; value?: string }
    return Boolean(condition.field && condition.operator && condition.value)
  }

  if (kind === 'approval') {
    const approval = config as { approverValue?: string }
    return Boolean(approval.approverValue)
  }

  if (kind === 'wait') {
    const waitConfig = config as { minutes?: number }
    return Number(waitConfig.minutes) > 0
  }

  if (kind === 'notification') {
    const notify = config as { message?: string }
    return Boolean(notify.message && notify.message.trim())
  }

  return false
}

function getNodeMap(nodes: FlowNode[]) {
  return new Map(nodes.map((node) => [node.id, node]))
}

function getConnectionStats(nodes: FlowNode[], edges: FlowEdge[]) {
  const incomingCount = new Map(nodes.map((node) => [node.id, 0]))
  const outgoingCount = new Map(nodes.map((node) => [node.id, 0]))

  for (const edge of edges) {
    incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1)
    outgoingCount.set(edge.source, (outgoingCount.get(edge.source) ?? 0) + 1)
  }

  return { incomingCount, outgoingCount }
}

function getConnectedIdsFromStart(nodes: FlowNode[], edges: FlowEdge[]) {
  const nodeIds = new Set(nodes.map((node) => node.id))
  if (!nodeIds.has('start')) {
    return new Set<string>()
  }

  const adjacency = new Map<string, string[]>()
  for (const edge of edges) {
    const targets = adjacency.get(edge.source) ?? []
    targets.push(edge.target)
    adjacency.set(edge.source, targets)
  }

  const visited = new Set<string>()
  const queue = ['start']

  while (queue.length > 0) {
    const current = queue.shift() as string
    if (visited.has(current)) {
      continue
    }

    visited.add(current)
    const neighbors = adjacency.get(current) ?? []
    for (const next of neighbors) {
      if (!visited.has(next)) {
        queue.push(next)
      }
    }
  }

  return visited
}

export function validateFlow(nodes: FlowNode[], edges: FlowEdge[]): FlowValidationResult {
  const errors: string[] = []
  const invalidNodeIds = new Set<string>()
  const nodeMap = getNodeMap(nodes)

  const startNodes = nodes.filter((node) => node.data.kind === 'start')
  const endNodes = nodes.filter((node) => node.data.kind === 'end')

  if (startNodes.length !== 1) {
    errors.push('O fluxo precisa ter exatamente 1 node Start.')
  }

  if (endNodes.length !== 1) {
    errors.push('O fluxo precisa ter exatamente 1 node End.')
  }

  const { incomingCount, outgoingCount } = getConnectionStats(nodes, edges)
  const reachable = getConnectedIdsFromStart(nodes, edges)

  for (const node of nodes) {
    const incoming = incomingCount.get(node.id) ?? 0
    const outgoing = outgoingCount.get(node.id) ?? 0

    if (node.data.kind === 'start' && outgoing === 0) {
      errors.push('Start precisa ter ao menos 1 saida.')
      invalidNodeIds.add(node.id)
    }

    if (node.data.kind === 'end' && incoming === 0) {
      errors.push('End precisa estar conectado.')
      invalidNodeIds.add(node.id)
    }

    if (node.data.kind !== 'start' && node.data.kind !== 'end' && (incoming === 0 || outgoing === 0)) {
      errors.push(`Node ${node.data.label} esta desconectado.`)
      invalidNodeIds.add(node.id)
    }

    if (!reachable.has(node.id)) {
      errors.push(`Node ${node.data.label} nao e alcancavel a partir do Start.`)
      invalidNodeIds.add(node.id)
    }

    if (!hasMinConfig(node)) {
      errors.push(`Node ${node.data.label} sem configuracao minima.`)
      invalidNodeIds.add(node.id)
    }

    if (node.data.kind === 'condition') {
      const trueEdge = edges.find((edge) => edge.source === node.id && edge.sourceHandle === 'true')
      const falseEdge = edges.find((edge) => edge.source === node.id && edge.sourceHandle === 'false')
      if (!trueEdge || !falseEdge) {
        errors.push('Condition precisa de saidas TRUE e FALSE.')
        invalidNodeIds.add(node.id)
      }
    }

    if (node.data.kind === 'approval') {
      const approvedEdge = edges.find((edge) => edge.source === node.id && edge.sourceHandle === 'approved')
      const rejectedEdge = edges.find((edge) => edge.source === node.id && edge.sourceHandle === 'rejected')
      if (!approvedEdge || !rejectedEdge) {
        errors.push('Approval precisa de saidas Approved e Rejected.')
        invalidNodeIds.add(node.id)
      }
    }
  }

  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      errors.push('Existe conexao apontando para node inexistente.')
    }
  }

  return {
    valid: errors.length === 0,
    errors: Array.from(new Set(errors)),
    invalidNodeIds: Array.from(invalidNodeIds),
  }
}
