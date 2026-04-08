import { Handle, Position, type NodeProps } from 'reactflow'
import { cn } from '../../../lib/utils'
import type { FlowNodeData } from '../types/flow-builder'

const nodeToneByKind: Record<FlowNodeData['kind'], string> = {
  start: 'border-emerald-500/40 bg-[linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.08))] text-emerald-100',
  end: 'border-emerald-500/40 bg-[linear-gradient(135deg,rgba(16,185,129,0.15),rgba(3,105,161,0.08))] text-emerald-100',
  statusChange: 'border-sky-500/40 bg-[linear-gradient(135deg,rgba(14,165,233,0.2),rgba(59,130,246,0.08))] text-sky-100',
  assign: 'border-sky-500/40 bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(14,165,233,0.08))] text-sky-100',
  wait: 'border-sky-500/40 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(2,132,199,0.08))] text-sky-100',
  notification: 'border-violet-500/40 bg-[linear-gradient(135deg,rgba(124,58,237,0.24),rgba(91,33,182,0.1))] text-violet-100',
  condition: 'border-amber-500/50 bg-[linear-gradient(135deg,rgba(245,158,11,0.22),rgba(217,119,6,0.1))] text-amber-100',
  approval: 'border-amber-500/50 bg-[linear-gradient(135deg,rgba(251,191,36,0.22),rgba(234,88,12,0.1))] text-amber-100',
}

function BranchLabel({ text, left }: { text: string; left?: boolean }) {
  return (
    <span
      className={cn(
        'absolute -bottom-7 rounded-md border border-white/20 bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold text-white/90',
        left ? 'left-0' : 'right-0',
      )}
    >
      {text}
    </span>
  )
}

export function FlowNodeComponent({ data, selected }: NodeProps<FlowNodeData>) {
  const isDecision = data.kind === 'condition' || data.kind === 'approval'

  return (
    <div
      className={cn(
        'min-w-[210px] rounded-xl border px-3 py-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.22)] transition-all',
        nodeToneByKind[data.kind],
        selected && 'ring-2 ring-white/80 shadow-[0_0_0_6px_rgba(56,189,248,0.22)]',
        data.active && 'flow-node-live',
        !data.valid && 'border-[var(--danger-500)] ring-2 ring-[var(--danger-500)]/30',
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-3 !w-3 !border !border-white/80 !bg-[var(--surface-1)]" />

      <div className="text-sm font-semibold leading-tight text-white">{data.label}</div>

      {isDecision ? (
        <>
          <Handle id={data.kind === 'condition' ? 'true' : 'approved'} type="source" position={Position.Bottom} className="!h-3 !w-3 !-translate-x-8 !border !border-white/80 !bg-[var(--surface-1)]" />
          <Handle id={data.kind === 'condition' ? 'false' : 'rejected'} type="source" position={Position.Bottom} className="!h-3 !w-3 !translate-x-8 !border !border-white/80 !bg-[var(--surface-1)]" />
          <BranchLabel text={data.kind === 'condition' ? 'TRUE' : 'Approved'} left />
          <BranchLabel text={data.kind === 'condition' ? 'FALSE' : 'Rejected'} />
        </>
      ) : (
        <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !border !border-white/80 !bg-[var(--surface-1)]" />
      )}
    </div>
  )
}
