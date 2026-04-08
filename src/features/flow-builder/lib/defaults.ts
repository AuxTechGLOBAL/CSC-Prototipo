import { MarkerType } from 'reactflow'
import type { FlowEdge, FlowNode, FlowNodeType } from '../types/flow-builder'

let nodeCounter = 1

function nextNodeId() {
  nodeCounter += 1
  return `flow-node-${nodeCounter}`
}

export function getDefaultNodeLabel(kind: FlowNodeType) {
  switch (kind) {
    case 'start':
      return 'Inicio'
    case 'end':
      return 'Encerramento'
    case 'statusChange':
      return 'Mudar para InTriage'
    case 'assign':
      return 'Atribuicao'
    case 'condition':
      return 'Condicao'
    case 'approval':
      return 'Aprovacao'
    case 'wait':
      return 'Aguardar 30 min'
    case 'notification':
      return 'Notificar'
    default:
      return 'Etapa'
  }
}

export function getDefaultNodeData(kind: FlowNodeType): FlowNode['data'] {
  switch (kind) {
    case 'start':
      return { label: 'Inicio', kind, valid: true, config: {} }
    case 'end':
      return { label: 'Encerramento', kind, valid: true, config: {} }
    case 'statusChange':
      return { label: 'Mudar para InTriage', kind, valid: true, config: { nextStatus: 'InTriage' } }
    case 'assign':
      return { label: 'Atribuicao por area', kind, valid: false, config: { mode: 'area', area: '' } }
    case 'condition':
      return { label: 'Se prioridade equals Alta', kind, valid: false, config: { field: 'priority', operator: 'equals', value: '' } }
    case 'approval':
      return { label: 'Aprovacao do gestor', kind, valid: false, config: { approverType: 'role', approverValue: '' } }
    case 'wait':
      return { label: 'Aguardar 30 min', kind, valid: true, config: { minutes: 30 } }
    case 'notification':
      return { label: 'Notificar usuario', kind, valid: false, config: { channel: 'email', message: '' } }
    default:
      return { label: getDefaultNodeLabel(kind), kind, valid: false, config: {} }
  }
}

export function createFlowNode(kind: FlowNodeType, x: number, y: number): FlowNode {
  return {
    id: nextNodeId(),
    type: 'flowNode',
    position: { x, y },
    data: getDefaultNodeData(kind),
  }
}

export function createFlowEdge(source: string, target: string, sourceHandle?: string | null): FlowEdge {
  const edgeId = `${source}-${sourceHandle ?? 'default'}-${target}-${Date.now()}`
  const label = sourceHandle === 'true' ? 'TRUE' : sourceHandle === 'false' ? 'FALSE' : sourceHandle === 'approved' ? 'Approved' : sourceHandle === 'rejected' ? 'Rejected' : undefined

  return {
    id: edgeId,
    source,
    target,
    sourceHandle: sourceHandle ?? undefined,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'color-mix(in srgb, var(--brand-500) 78%, white)',
    },
    animated: true,
    type: 'addStepEdge',
    data: { label, animated: true },
    label,
  }
}

export function createInitialFlow() {
  const startNode: FlowNode = {
    id: 'start',
    type: 'flowNode',
    position: { x: 120, y: 220 },
    draggable: false,
    deletable: false,
    data: {
      kind: 'start',
      label: 'Inicio',
      valid: true,
      config: {},
    },
  }

  const endNode: FlowNode = {
    id: 'end',
    type: 'flowNode',
    position: { x: 760, y: 220 },
    draggable: false,
    deletable: false,
    data: {
      kind: 'end',
      label: 'Encerramento',
      valid: true,
      config: {},
    },
  }

  return {
    id: 'flow-default',
    name: 'Novo fluxo de atendimento',
    status: 'Draft' as const,
    nodes: [startNode, endNode],
    edges: [createFlowEdge('start', 'end')],
    updatedAt: new Date().toISOString(),
  }
}
