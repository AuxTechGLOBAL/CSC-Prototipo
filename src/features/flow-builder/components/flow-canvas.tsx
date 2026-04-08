import { useCallback, useMemo, type DragEvent } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { createFlowEdge } from '../lib/defaults'
import { useFlowBuilderStore } from '../store/use-flow-builder-store'
import { AddStepEdge } from './add-step-edge'
import { FlowNodeComponent } from './flow-node'

const nodeTypes = {
  flowNode: FlowNodeComponent,
}

const edgeTypes = {
  addStepEdge: AddStepEdge,
}

export function FlowCanvas() {
  const nodes = useFlowBuilderStore((state) => state.flow.nodes)
  const edges = useFlowBuilderStore((state) => state.flow.edges)
  const selectedNodeId = useFlowBuilderStore((state) => state.selectedNodeId)
  const simulatedNodeIds = useFlowBuilderStore((state) => state.simulatedNodeIds)
  const simulatedEdgeIds = useFlowBuilderStore((state) => state.simulatedEdgeIds)
  const isSimulating = useFlowBuilderStore((state) => state.isSimulating)
  const setNodes = useFlowBuilderStore((state) => state.setNodes)
  const setEdges = useFlowBuilderStore((state) => state.setEdges)
  const selectNode = useFlowBuilderStore((state) => state.selectNode)
  const addNode = useFlowBuilderStore((state) => state.addNode)

  const decoratedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId,
      data: {
        ...node.data,
        active: simulatedNodeIds.includes(node.id),
      },
    }))
  }, [nodes, selectedNodeId, simulatedNodeIds])

  const decoratedEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      animated: true,
      label: edge.data?.label,
      className: simulatedEdgeIds.includes(edge.id) ? 'flow-edge-live' : undefined,
      style: {
        stroke: simulatedEdgeIds.includes(edge.id)
          ? 'color-mix(in srgb, #22d3ee 80%, white)'
          : 'color-mix(in srgb, var(--brand-500) 74%, white)',
        strokeWidth: simulatedEdgeIds.includes(edge.id) ? 3 : 2,
      },
    }))
  }, [edges, simulatedEdgeIds])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const nextNodes = applyNodeChanges(changes, nodes as Node[])
      setNodes(nextNodes)
    },
    [nodes, setNodes],
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const nextEdges = applyEdgeChanges(changes, edges as Edge[])
      setEdges(nextEdges)
    },
    [edges, setEdges],
  )

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return
      }

      const preparedEdge = createFlowEdge(connection.source, connection.target, connection.sourceHandle)
      const nextEdges = addEdge(preparedEdge, edges)
      setEdges(nextEdges)
    },
    [edges, setEdges],
  )

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const kind = event.dataTransfer.getData('application/csc-flow-node')
      if (!kind) {
        return
      }

      const wrapper = event.currentTarget.getBoundingClientRect()
      const x = Math.round((event.clientX - wrapper.left) / 24) * 24
      const y = Math.round((event.clientY - wrapper.top) / 24) * 24
      addNode(kind as Parameters<typeof addNode>[0], x, y)
    },
    [addNode],
  )

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-1)_92%,transparent),color-mix(in_srgb,var(--surface-2)_92%,transparent))] shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <ReactFlow
        fitView
        minZoom={0.4}
        maxZoom={1.6}
        nodes={decoratedNodes}
        edges={decoratedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(undefined)}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={[24, 24]}
        defaultEdgeOptions={{
          animated: isSimulating,
          style: {
            stroke: 'color-mix(in srgb, var(--brand-500) 74%, white)',
            strokeWidth: 2,
          },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="color-mix(in srgb, var(--text-soft) 32%, transparent)" />
        <MiniMap
          pannable
          zoomable
          className="!bg-[var(--surface-2)] !border !border-[var(--border-subtle)]"
          nodeColor={(node) => {
            if (node.data?.active) {
              return 'rgba(34,211,238,0.95)'
            }
            return node.data?.valid ? 'rgba(59,130,246,0.8)' : 'rgba(220,38,38,0.88)'
          }}
        />
        <Controls className="flow-controls" />
      </ReactFlow>
    </div>
  )
}
