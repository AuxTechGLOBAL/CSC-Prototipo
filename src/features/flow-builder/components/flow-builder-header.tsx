import { FlaskConical, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { useFlowBuilderStore } from '../store/use-flow-builder-store'

export function FlowBuilderHeader() {
  const flow = useFlowBuilderStore((state) => state.flow)
  const isSimulating = useFlowBuilderStore((state) => state.isSimulating)
  const setFlowName = useFlowBuilderStore((state) => state.setFlowName)
  const saveDraft = useFlowBuilderStore((state) => state.saveDraft)
  const publish = useFlowBuilderStore((state) => state.publish)
  const runVisualSimulation = useFlowBuilderStore((state) => state.runVisualSimulation)

  const onSave = () => {
    saveDraft()
    toast.success('Draft salvo localmente')
  }

  const onPublish = () => {
    if (publish()) {
      toast.success('Fluxo publicado (modo fake)')
      return
    }
    toast.error('Fluxo invalido: ajuste os erros antes de publicar')
  }

  const onTest = () => {
    const result = runVisualSimulation()
    if (result.success) {
      toast.success(result.message)
      return
    }
    toast.error(result.message)
  }

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-1)_88%,transparent),color-mix(in_srgb,var(--surface-2)_90%,transparent))] p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={flow.name}
          onChange={(event) => setFlowName(event.target.value)}
          placeholder="Nome do fluxo"
          className="h-10 max-w-xl rounded-xl border-[var(--border-subtle)] bg-[var(--surface-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        />

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Badge variant={flow.status === 'Published' ? 'success' : 'warning'}>
            {flow.status === 'Published' ? 'Publicado' : 'Nao publicado'}
          </Badge>
          <Button variant="secondary" size="sm" onClick={onSave}>
            <Save size={14} />
            Salvar
          </Button>
          <Button size="sm" onClick={onPublish}>
            <Upload size={14} />
            Publicar
          </Button>
          <Button variant="secondary" size="sm" onClick={onTest} disabled={isSimulating}>
            <FlaskConical size={14} />
            {isSimulating ? 'Simulando...' : 'Testar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
