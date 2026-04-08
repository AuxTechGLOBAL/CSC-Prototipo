import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createFlowEdge, createFlowNode, createInitialFlow, getDefaultNodeLabel } from '../lib/defaults'
import { validateFlow } from '../lib/validation'
import type { FlowEdge, FlowModel, FlowNode, FlowNodeType, FlowStatus } from '../types/flow-builder'

interface FlowBuilderStore {
  flow: FlowModel
  selectedNodeId?: string
  validationErrors: string[]
  isValid: boolean
  isSimulating: boolean
  simulatedNodeIds: string[]
  simulatedEdgeIds: string[]
  setFlowName: (name: string) => void
  selectNode: (nodeId?: string) => void
  setNodes: (nodes: FlowNode[]) => void
  setEdges: (edges: FlowEdge[]) => void
  addNode: (kind: FlowNodeType, x: number, y: number) => string
  removeNode: (nodeId: string) => void
  updateNodeConfig: (nodeId: string, config: FlowNode['data']['config']) => void
  addEdge: (source: string, target: string, sourceHandle?: string | null) => void
  saveDraft: () => void
  publish: () => boolean
  testFlow: () => { success: boolean; message: string }
  runVisualSimulation: () => { success: boolean; message: string }
  clearSimulation: () => void
  markDraft: () => void
  addNodeBetween: (edgeId: string, kind: FlowNodeType) => void
}

const simulationTimers: ReturnType<typeof setTimeout>[] = []

function clearSimulationTimers() {
  while (simulationTimers.length) {
    const timer = simulationTimers.pop()
    if (timer) {
      clearTimeout(timer)
    }
  }
}

function pickSimulationEdge(node: FlowNode, edges: FlowEdge[]) {
  const outgoing = edges.filter((edge) => edge.source === node.id)
  if (outgoing.length === 0) {
    return undefined
  }

  if (node.data.kind === 'condition') {
    return outgoing.find((edge) => edge.sourceHandle === 'true') ?? outgoing[0]
  }

  if (node.data.kind === 'approval') {
    return outgoing.find((edge) => edge.sourceHandle === 'approved') ?? outgoing[0]
  }

  return outgoing[0]
}

function buildSimulationSequence(nodes: FlowNode[], edges: FlowEdge[]) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const startNode = nodes.find((node) => node.data.kind === 'start')
  if (!startNode) {
    return { nodes: [] as string[], edges: [] as string[] }
  }

  const nodeTrail: string[] = []
  const edgeTrail: string[] = []
  const visited = new Set<string>()

  let currentNode: FlowNode | undefined = startNode
  let maxSteps = 0

  while (currentNode && maxSteps < 120) {
    maxSteps += 1
    nodeTrail.push(currentNode.id)

    if (currentNode.data.kind === 'end') {
      break
    }

    const edge = pickSimulationEdge(currentNode, edges)
    if (!edge) {
      break
    }

    edgeTrail.push(edge.id)
    if (visited.has(`${edge.source}->${edge.target}->${edge.sourceHandle ?? 'default'}`)) {
      break
    }
    visited.add(`${edge.source}->${edge.target}->${edge.sourceHandle ?? 'default'}`)

    currentNode = nodeMap.get(edge.target)
  }

  return { nodes: nodeTrail, edges: edgeTrail }
}

function runValidation(flow: FlowModel) {
  return validateFlow(flow.nodes, flow.edges)
}

export const useFlowBuilderStore = create<FlowBuilderStore>()(
  persist(
    (set, get) => {
      const initialFlow = createInitialFlow()
      const initialValidation = runValidation(initialFlow)

      return {
        flow: {
          ...initialFlow,
          nodes: initialFlow.nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              valid: !initialValidation.invalidNodeIds.includes(node.id),
            },
          })),
        },
        selectedNodeId: undefined,
        validationErrors: initialValidation.errors,
        isValid: initialValidation.valid,
        isSimulating: false,
        simulatedNodeIds: [],
        simulatedEdgeIds: [],
        setFlowName: (name) => {
          set((state) => ({
            flow: {
              ...state.flow,
              name,
              updatedAt: new Date().toISOString(),
            },
          }))
        },
        selectNode: (selectedNodeId) => set({ selectedNodeId }),
        setNodes: (nodes) => {
          set((state) => {
            const nextFlow = {
              ...state.flow,
              nodes,
              updatedAt: new Date().toISOString(),
            }
            const validation = runValidation(nextFlow)
            return {
              flow: {
                ...nextFlow,
                nodes: nodes.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    valid: !validation.invalidNodeIds.includes(node.id),
                  },
                })),
              },
              validationErrors: validation.errors,
              isValid: validation.valid,
              isSimulating: false,
              simulatedNodeIds: [],
              simulatedEdgeIds: [],
            }
          })
        },
        setEdges: (edges) => {
          set((state) => {
            const nextFlow = {
              ...state.flow,
              edges,
              updatedAt: new Date().toISOString(),
            }
            const validation = runValidation(nextFlow)
            return {
              flow: {
                ...nextFlow,
                nodes: nextFlow.nodes.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    valid: !validation.invalidNodeIds.includes(node.id),
                  },
                })),
              },
              validationErrors: validation.errors,
              isValid: validation.valid,
              isSimulating: false,
              simulatedNodeIds: [],
              simulatedEdgeIds: [],
            }
          })
        },
        addNode: (kind, x, y) => {
          const newNode = createFlowNode(kind, x, y)
          set((state) => {
            const nextFlow = {
              ...state.flow,
              nodes: [...state.flow.nodes, newNode],
              updatedAt: new Date().toISOString(),
            }
            const validation = runValidation(nextFlow)
            return {
              flow: {
                ...nextFlow,
                nodes: nextFlow.nodes.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    valid: !validation.invalidNodeIds.includes(node.id),
                  },
                })),
              },
              selectedNodeId: newNode.id,
              validationErrors: validation.errors,
              isValid: validation.valid,
              isSimulating: false,
              simulatedNodeIds: [],
              simulatedEdgeIds: [],
            }
          })
          return newNode.id
        },
        removeNode: (nodeId) => {
          if (nodeId === 'start' || nodeId === 'end') {
            return
          }

          set((state) => {
            const nextNodes = state.flow.nodes.filter((node) => node.id !== nodeId)
            const nextEdges = state.flow.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
            const nextFlow = {
              ...state.flow,
              nodes: nextNodes,
              edges: nextEdges,
              updatedAt: new Date().toISOString(),
            }
            const validation = runValidation(nextFlow)
            return {
              flow: {
                ...nextFlow,
                nodes: nextNodes.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    valid: !validation.invalidNodeIds.includes(node.id),
                  },
                })),
              },
              selectedNodeId: state.selectedNodeId === nodeId ? undefined : state.selectedNodeId,
              validationErrors: validation.errors,
              isValid: validation.valid,
              isSimulating: false,
              simulatedNodeIds: [],
              simulatedEdgeIds: [],
            }
          })
        },
        updateNodeConfig: (nodeId, config) => {
          set((state) => {
            const nextNodes = state.flow.nodes.map((node) => {
              if (node.id !== nodeId) {
                return node
              }

              const nextLabel =
                node.data.kind === 'statusChange'
                  ? `Mudar para ${String((config as { nextStatus?: string }).nextStatus ?? 'InTriage')}`
                  : node.data.kind === 'condition'
                    ? `Se ${String((config as { field?: string }).field ?? 'campo')} ${String((config as { operator?: string }).operator ?? 'equals')} ${String((config as { value?: string }).value ?? 'valor')}`
                    : node.data.kind === 'approval'
                      ? `Aprovacao: ${String((config as { approverValue?: string }).approverValue ?? 'definir aprovador')}`
                      : node.data.kind === 'assign'
                        ? `Atribuir (${String((config as { mode?: string }).mode ?? 'area')})`
                        : node.data.kind === 'wait'
                          ? `Aguardar ${String((config as { minutes?: number }).minutes ?? 0)} min`
                          : node.data.kind === 'notification'
                            ? `Notificar (${String((config as { channel?: string }).channel ?? 'email')})`
                            : getDefaultNodeLabel(node.data.kind)

              return {
                ...node,
                data: {
                  ...node.data,
                  config,
                  label: nextLabel,
                },
              }
            })

            const nextFlow = {
              ...state.flow,
              nodes: nextNodes,
              updatedAt: new Date().toISOString(),
            }
            const validation = runValidation(nextFlow)

            return {
              flow: {
                ...nextFlow,
                nodes: nextNodes.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    valid: !validation.invalidNodeIds.includes(node.id),
                  },
                })),
              },
              validationErrors: validation.errors,
              isValid: validation.valid,
              isSimulating: false,
              simulatedNodeIds: [],
              simulatedEdgeIds: [],
            }
          })
        },
        addEdge: (source, target, sourceHandle) => {
          const edge = createFlowEdge(source, target, sourceHandle)
          set((state) => {
            const nextFlow = {
              ...state.flow,
              edges: [...state.flow.edges, edge],
              updatedAt: new Date().toISOString(),
            }
            const validation = runValidation(nextFlow)
            return {
              flow: {
                ...nextFlow,
                nodes: nextFlow.nodes.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    valid: !validation.invalidNodeIds.includes(node.id),
                  },
                })),
              },
              validationErrors: validation.errors,
              isValid: validation.valid,
              isSimulating: false,
              simulatedNodeIds: [],
              simulatedEdgeIds: [],
            }
          })
        },
        addNodeBetween: (edgeId, kind) => {
          set((state) => {
            const edge = state.flow.edges.find((item) => item.id === edgeId)
            if (!edge) {
              return state
            }

            const sourceNode = state.flow.nodes.find((node) => node.id === edge.source)
            const targetNode = state.flow.nodes.find((node) => node.id === edge.target)
            if (!sourceNode || !targetNode) {
              return state
            }

            const x = (sourceNode.position.x + targetNode.position.x) / 2
            const y = (sourceNode.position.y + targetNode.position.y) / 2
            const insertedNode = createFlowNode(kind, x, y)
            const keptEdges = state.flow.edges.filter((item) => item.id !== edgeId)
            const edgeToInserted = createFlowEdge(edge.source, insertedNode.id, edge.sourceHandle)
            const edgeFromInserted = createFlowEdge(insertedNode.id, edge.target)

            const nextFlow = {
              ...state.flow,
              nodes: [...state.flow.nodes, insertedNode],
              edges: [...keptEdges, edgeToInserted, edgeFromInserted],
              updatedAt: new Date().toISOString(),
            }
            const validation = runValidation(nextFlow)

            return {
              flow: {
                ...nextFlow,
                nodes: nextFlow.nodes.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    valid: !validation.invalidNodeIds.includes(node.id),
                  },
                })),
              },
              selectedNodeId: insertedNode.id,
              validationErrors: validation.errors,
              isValid: validation.valid,
              isSimulating: false,
              simulatedNodeIds: [],
              simulatedEdgeIds: [],
            }
          })
        },
        saveDraft: () => {
          set((state) => ({
            flow: {
              ...state.flow,
              status: 'Draft',
              updatedAt: new Date().toISOString(),
            },
          }))
        },
        publish: () => {
          const state = get()
          const validation = validateFlow(state.flow.nodes, state.flow.edges)
          if (!validation.valid) {
            set((innerState) => ({
              flow: {
                ...innerState.flow,
                status: 'Draft',
              },
              isValid: false,
              validationErrors: validation.errors,
            }))
            return false
          }

          set((innerState) => ({
            flow: {
              ...innerState.flow,
              status: 'Published' as FlowStatus,
              updatedAt: new Date().toISOString(),
            },
            isValid: true,
            validationErrors: [],
          }))
          return true
        },
        testFlow: () => {
          const state = get()
          const validation = validateFlow(state.flow.nodes, state.flow.edges)
          if (!validation.valid) {
            return { success: false, message: 'Fluxo invalido para simulacao.' }
          }
          return { success: true, message: 'Simulacao fake executada com sucesso.' }
        },
        runVisualSimulation: () => {
          const state = get()
          const validation = validateFlow(state.flow.nodes, state.flow.edges)
          if (!validation.valid) {
            set({
              isSimulating: false,
              simulatedNodeIds: [],
              simulatedEdgeIds: [],
            })
            return { success: false, message: 'Fluxo invalido para simulacao.' }
          }

          const sequence = buildSimulationSequence(state.flow.nodes, state.flow.edges)
          if (sequence.nodes.length === 0) {
            set({
              isSimulating: false,
              simulatedNodeIds: [],
              simulatedEdgeIds: [],
            })
            return { success: false, message: 'Nao foi possivel gerar trilha de execucao.' }
          }

          clearSimulationTimers()
          set({
            isSimulating: true,
            simulatedNodeIds: [],
            simulatedEdgeIds: [],
          })

          const stepMs = 520
          for (let index = 0; index < sequence.nodes.length; index += 1) {
            const timer = setTimeout(() => {
              const innerState = get()
              const nextNodes = Array.from(new Set([...innerState.simulatedNodeIds, sequence.nodes[index]]))
              const edgeAtIndex = sequence.edges[index - 1]
              const nextEdges = edgeAtIndex
                ? Array.from(new Set([...innerState.simulatedEdgeIds, edgeAtIndex]))
                : innerState.simulatedEdgeIds

              set({
                simulatedNodeIds: nextNodes,
                simulatedEdgeIds: nextEdges,
              })
            }, index * stepMs)

            simulationTimers.push(timer)
          }

          const finishTimer = setTimeout(() => {
            set({
              isSimulating: false,
            })
          }, sequence.nodes.length * stepMs + 120)
          simulationTimers.push(finishTimer)

          const clearTimer = setTimeout(() => {
            set({
              simulatedNodeIds: [],
              simulatedEdgeIds: [],
            })
          }, sequence.nodes.length * stepMs + 1800)
          simulationTimers.push(clearTimer)

          return { success: true, message: 'Simulacao visual em execucao.' }
        },
        clearSimulation: () => {
          clearSimulationTimers()
          set({
            isSimulating: false,
            simulatedNodeIds: [],
            simulatedEdgeIds: [],
          })
        },
        markDraft: () => {
          set((state) => ({
            flow: {
              ...state.flow,
              status: 'Draft',
            },
          }))
        },
      }
    },
    {
      name: 'flow-builder-store-v1',
      partialize: (state) => ({
        flow: state.flow,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }
        const validation = validateFlow(state.flow.nodes, state.flow.edges)
        state.validationErrors = validation.errors
        state.isValid = validation.valid
        state.isSimulating = false
        state.simulatedNodeIds = []
        state.simulatedEdgeIds = []
        state.flow.nodes = state.flow.nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            valid: !validation.invalidNodeIds.includes(node.id),
          },
        }))
      },
    },
  ),
)
