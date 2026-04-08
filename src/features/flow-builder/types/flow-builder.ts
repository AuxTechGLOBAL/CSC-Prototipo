import type { Edge, Node } from 'reactflow'

export type FlowStatus = 'Draft' | 'Published'

export type FlowNodeType = 'start' | 'end' | 'statusChange' | 'assign' | 'condition' | 'approval' | 'wait' | 'notification'

export type StatusValue = 'InTriage' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed'

export interface StatusChangeConfig {
  nextStatus: StatusValue
}

export interface AssignConfig {
  mode: 'specificUser' | 'area' | 'pickup'
  user?: string
  area?: string
}

export interface ConditionConfig {
  field: 'priority' | 'type' | 'area'
  operator: 'equals' | 'greaterThan'
  value: string
}

export interface ApprovalConfig {
  approverType: 'user' | 'role'
  approverValue: string
  timeoutMinutes?: number
}

export interface WaitConfig {
  minutes: number
}

export interface NotificationConfig {
  channel: 'email' | 'slack' | 'system'
  message: string
}

export type FlowNodeConfig =
  | { type: 'start'; config: Record<string, never> }
  | { type: 'end'; config: Record<string, never> }
  | { type: 'statusChange'; config: StatusChangeConfig }
  | { type: 'assign'; config: AssignConfig }
  | { type: 'condition'; config: ConditionConfig }
  | { type: 'approval'; config: ApprovalConfig }
  | { type: 'wait'; config: WaitConfig }
  | { type: 'notification'; config: NotificationConfig }

export interface FlowNodeData {
  label: string
  valid: boolean
  kind: FlowNodeType
  config: FlowNodeConfig['config']
  active?: boolean
}

export interface FlowEdgeData {
  label?: string
  animated?: boolean
}

export type FlowNode = Node<FlowNodeData>
export type FlowEdge = Edge<FlowEdgeData>

export interface FlowValidationResult {
  valid: boolean
  errors: string[]
  invalidNodeIds: string[]
}

export interface FlowModel {
  id: string
  name: string
  status: FlowStatus
  nodes: FlowNode[]
  edges: FlowEdge[]
  updatedAt: string
}
