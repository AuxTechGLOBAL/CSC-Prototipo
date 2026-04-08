import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useFlowBuilderStore } from '../store/use-flow-builder-store'

export function ValidationBanner() {
  const isValid = useFlowBuilderStore((state) => state.isValid)
  const validationErrors = useFlowBuilderStore((state) => state.validationErrors)

  if (isValid) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-600/35 bg-emerald-500/12 px-3 py-2 text-sm text-emerald-100">
        <CheckCircle2 size={16} />
        Fluxo valido para publicacao.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-rose-600/35 bg-rose-500/12 px-3 py-2 text-sm text-rose-100">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle size={16} />
        Fluxo invalido
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-rose-200">
        {validationErrors.slice(0, 4).map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  )
}
