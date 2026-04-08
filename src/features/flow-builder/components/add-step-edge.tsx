import { Plus } from 'lucide-react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from 'reactflow'
import { useFlowBuilderStore } from '../store/use-flow-builder-store'

export function AddStepEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd }: EdgeProps) {
  const addNodeBetween = useFlowBuilderStore((state) => state.addNodeBetween)

  const [edgePath, centerX, centerY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: 'color-mix(in srgb, var(--brand-500) 75%, white)',
          strokeDasharray: '8 6',
        }}
      />
      <EdgeLabelRenderer>
        <button
          type="button"
          onClick={() => addNodeBetween(id, 'statusChange')}
          className="nodrag nopan absolute grid h-6 w-6 place-items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-strong)] shadow-[0_8px_18px_rgba(0,0,0,0.2)] transition hover:scale-105 hover:border-[var(--brand-500)]"
          style={{
            transform: `translate(-50%, -50%) translate(${centerX}px,${centerY}px)`,
          }}
          title="Inserir etapa"
        >
          <Plus size={14} />
        </button>
      </EdgeLabelRenderer>
    </>
  )
}
