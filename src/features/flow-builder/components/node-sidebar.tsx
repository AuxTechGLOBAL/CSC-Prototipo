import { useMemo, type DragEvent } from 'react'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import type { FlowNodeType } from '../types/flow-builder'

interface SidebarNodeItem {
  kind: FlowNodeType
  label: string
  help: string
}

interface SidebarCategory {
  title: string
  items: SidebarNodeItem[]
}

const categories: SidebarCategory[] = [
  {
    title: 'Basicos',
    items: [
      { kind: 'start', label: 'Start', help: 'Inicio fixo do fluxo' },
      { kind: 'end', label: 'End', help: 'Final do processo' },
    ],
  },
  {
    title: 'Fluxo',
    items: [
      { kind: 'statusChange', label: 'Status Change', help: 'Move ticket para novo status' },
      { kind: 'assign', label: 'Assign', help: 'Define responsavel do ticket' },
      { kind: 'wait', label: 'Wait', help: 'Pausa por tempo definido' },
    ],
  },
  {
    title: 'Logica',
    items: [
      { kind: 'condition', label: 'Condition (if/else)', help: 'Cria bifurcacao TRUE/FALSE' },
      { kind: 'approval', label: 'Approval', help: 'Ramo aprovado/rejeitado' },
    ],
  },
  {
    title: 'Sistema',
    items: [{ kind: 'notification', label: 'Send Notification', help: 'Dispara notificacao simples' }],
  },
]

function getItemTone(kind: FlowNodeType) {
  if (kind === 'start' || kind === 'end') {
    return 'border-emerald-500/35 bg-emerald-500/12 text-emerald-100'
  }

  if (kind === 'condition' || kind === 'approval') {
    return 'border-amber-500/35 bg-amber-500/12 text-amber-100'
  }

  if (kind === 'notification') {
    return 'border-violet-500/35 bg-violet-500/14 text-violet-100'
  }

  return 'border-sky-500/35 bg-sky-500/12 text-sky-100'
}

export function NodeSidebar() {
  const grouped = useMemo(() => categories, [])

  const onDragStart = (event: DragEvent<HTMLButtonElement>, kind: FlowNodeType) => {
    event.dataTransfer.setData('application/csc-flow-node', kind)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Paleta de nodes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto p-4">
        {grouped.map((category) => (
          <section key={category.title} className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-soft)]">{category.title}</h4>
            <div className="space-y-2">
              {category.items.map((item) => (
                <button
                  key={item.kind}
                  type="button"
                  draggable={item.kind !== 'start' && item.kind !== 'end'}
                  onDragStart={(event) => onDragStart(event, item.kind)}
                  title={item.help}
                  className="flex w-full items-start justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-left text-sm text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:border-[var(--brand-500)]/50 hover:shadow-[0_8px_14px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={item.kind === 'start' || item.kind === 'end'}
                >
                  <span>
                    <span className="block font-semibold">{item.label}</span>
                    <span className="block text-xs text-[var(--text-soft)]">{item.help}</span>
                  </span>
                  <Badge className={getItemTone(item.kind)}>{item.kind}</Badge>
                </button>
              ))}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  )
}
