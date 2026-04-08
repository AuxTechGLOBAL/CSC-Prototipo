import { Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'
import { Textarea } from '../../../components/ui/textarea'
import { useFlowBuilderStore } from '../store/use-flow-builder-store'
import type { ApprovalConfig, AssignConfig, ConditionConfig, NotificationConfig, StatusChangeConfig, WaitConfig } from '../types/flow-builder'

const statusOptions = [
  { label: 'InTriage', value: 'InTriage' },
  { label: 'Assigned', value: 'Assigned' },
  { label: 'InProgress', value: 'InProgress' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'Closed', value: 'Closed' },
]

export function PropertiesPanel() {
  const selectedNodeId = useFlowBuilderStore((state) => state.selectedNodeId)
  const nodes = useFlowBuilderStore((state) => state.flow.nodes)
  const updateNodeConfig = useFlowBuilderStore((state) => state.updateNodeConfig)
  const removeNode = useFlowBuilderStore((state) => state.removeNode)

  const selectedNode = nodes.find((node) => node.id === selectedNodeId)

  if (!selectedNode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-soft)]">Selecione um node no canvas para configurar propriedades.</p>
        </CardContent>
      </Card>
    )
  }

  const config = selectedNode.data.config

  return (
    <Card>
      <CardHeader>
        <CardTitle>Properties: {selectedNode.data.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedNode.data.kind === 'start' || selectedNode.data.kind === 'end' ? (
          <p className="text-sm text-[var(--text-soft)]">Node fixo do fluxo, sem configuracao editavel.</p>
        ) : null}

        {selectedNode.data.kind === 'statusChange' ? (
          (() => {
            const statusConfig = config as StatusChangeConfig
            return (
          <label className="grid gap-1 text-xs text-[var(--text-soft)]">
            Novo status
            <Select
              value={statusConfig.nextStatus}
              options={statusOptions}
              onChange={(event) =>
                updateNodeConfig(selectedNode.id, {
                  ...statusConfig,
                  nextStatus: event.target.value as StatusChangeConfig['nextStatus'],
                })
              }
            />
          </label>
            )
          })()
        ) : null}

        {selectedNode.data.kind === 'assign' ? (
          (() => {
            const assignConfig = config as AssignConfig
            return (
          <>
            <label className="grid gap-1 text-xs text-[var(--text-soft)]">
              Tipo de atribuicao
              <Select
                value={assignConfig.mode}
                options={[
                  { label: 'Usuario especifico', value: 'specificUser' },
                  { label: 'Por area', value: 'area' },
                  { label: 'Quem pegar', value: 'pickup' },
                ]}
                onChange={(event) =>
                  updateNodeConfig(selectedNode.id, {
                    ...assignConfig,
                    mode: event.target.value as AssignConfig['mode'],
                  })
                }
              />
            </label>

            {assignConfig.mode === 'specificUser' ? (
              <label className="grid gap-1 text-xs text-[var(--text-soft)]">
                Usuario
                <Input
                  value={assignConfig.user ?? ''}
                  onChange={(event) =>
                    updateNodeConfig(selectedNode.id, {
                      ...assignConfig,
                      user: event.target.value,
                      area: undefined,
                    })
                  }
                  placeholder="ex.: joao.silva"
                />
              </label>
            ) : null}

            {assignConfig.mode === 'area' ? (
              <label className="grid gap-1 text-xs text-[var(--text-soft)]">
                Area
                <Input
                  value={assignConfig.area ?? ''}
                  onChange={(event) =>
                    updateNodeConfig(selectedNode.id, {
                      ...assignConfig,
                      area: event.target.value,
                      user: undefined,
                    })
                  }
                  placeholder="ex.: Financeiro"
                />
              </label>
            ) : null}
          </>
            )
          })()
        ) : null}

        {selectedNode.data.kind === 'condition' ? (
          (() => {
            const conditionConfig = config as ConditionConfig
            return (
          <>
            <label className="grid gap-1 text-xs text-[var(--text-soft)]">
              Campo
              <Select
                value={conditionConfig.field}
                options={[
                  { label: 'prioridade', value: 'priority' },
                  { label: 'tipo', value: 'type' },
                  { label: 'area', value: 'area' },
                ]}
                onChange={(event) =>
                  updateNodeConfig(selectedNode.id, {
                    ...conditionConfig,
                    field: event.target.value as ConditionConfig['field'],
                  })
                }
              />
            </label>
            <label className="grid gap-1 text-xs text-[var(--text-soft)]">
              Operador
              <Select
                value={conditionConfig.operator}
                options={[
                  { label: 'equals', value: 'equals' },
                  { label: 'greater than', value: 'greaterThan' },
                ]}
                onChange={(event) =>
                  updateNodeConfig(selectedNode.id, {
                    ...conditionConfig,
                    operator: event.target.value as ConditionConfig['operator'],
                  })
                }
              />
            </label>
            <label className="grid gap-1 text-xs text-[var(--text-soft)]">
              Valor
              <Input
                value={conditionConfig.value}
                onChange={(event) => updateNodeConfig(selectedNode.id, { ...conditionConfig, value: event.target.value })}
              />
            </label>
          </>
            )
          })()
        ) : null}

        {selectedNode.data.kind === 'approval' ? (
          (() => {
            const approvalConfig = config as ApprovalConfig
            return (
          <>
            <label className="grid gap-1 text-xs text-[var(--text-soft)]">
              Tipo de aprovador
              <Select
                value={approvalConfig.approverType}
                options={[
                  { label: 'Usuario', value: 'user' },
                  { label: 'Role', value: 'role' },
                ]}
                onChange={(event) =>
                  updateNodeConfig(selectedNode.id, {
                    ...approvalConfig,
                    approverType: event.target.value as ApprovalConfig['approverType'],
                  })
                }
              />
            </label>
            <label className="grid gap-1 text-xs text-[var(--text-soft)]">
              Aprovador
              <Input
                value={approvalConfig.approverValue}
                onChange={(event) => updateNodeConfig(selectedNode.id, { ...approvalConfig, approverValue: event.target.value })}
                placeholder="ex.: gestor.riscos"
              />
            </label>
            <label className="grid gap-1 text-xs text-[var(--text-soft)]">
              Timeout (min)
              <Input
                type="number"
                min={0}
                value={approvalConfig.timeoutMinutes ?? ''}
                onChange={(event) =>
                  updateNodeConfig(selectedNode.id, {
                    ...approvalConfig,
                    timeoutMinutes: event.target.value ? Number(event.target.value) : undefined,
                  })
                }
              />
            </label>
          </>
            )
          })()
        ) : null}

        {selectedNode.data.kind === 'wait' ? (
          (() => {
            const waitConfig = config as WaitConfig
            return (
          <label className="grid gap-1 text-xs text-[var(--text-soft)]">
            Tempo (min)
            <Input
              type="number"
              min={1}
              value={waitConfig.minutes}
              onChange={(event) => updateNodeConfig(selectedNode.id, { ...waitConfig, minutes: Number(event.target.value || 1) })}
            />
          </label>
            )
          })()
        ) : null}

        {selectedNode.data.kind === 'notification' ? (
          (() => {
            const notificationConfig = config as NotificationConfig
            return (
          <>
            <label className="grid gap-1 text-xs text-[var(--text-soft)]">
              Canal
              <Select
                value={notificationConfig.channel}
                options={[
                  { label: 'E-mail', value: 'email' },
                  { label: 'Slack', value: 'slack' },
                  { label: 'Sistema', value: 'system' },
                ]}
                onChange={(event) =>
                  updateNodeConfig(selectedNode.id, {
                    ...notificationConfig,
                    channel: event.target.value as NotificationConfig['channel'],
                  })
                }
              />
            </label>
            <label className="grid gap-1 text-xs text-[var(--text-soft)]">
              Mensagem
              <Textarea
                value={notificationConfig.message}
                onChange={(event) => updateNodeConfig(selectedNode.id, { ...notificationConfig, message: event.target.value })}
                placeholder="Mensagem enviada ao usuario"
              />
            </label>
          </>
            )
          })()
        ) : null}

        {selectedNode.data.kind !== 'start' && selectedNode.data.kind !== 'end' ? (
          <Button variant="destructive" size="sm" onClick={() => removeNode(selectedNode.id)}>
            <Trash2 size={14} />
            Excluir node
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
