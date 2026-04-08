import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useCreateServiceMutation, useDeleteServiceMutation, useServicesQuery } from '../hooks/use-csc-data'

export function AdminPage() {
  const servicesQuery = useServicesQuery()
  const createService = useCreateServiceMutation()
  const deleteService = useDeleteServiceMutation()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [area, setArea] = useState('TI Operacoes')
  const [impact, setImpact] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [requiresApproval, setRequiresApproval] = useState('false')

  const create = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error('Preencha nome e descricao')
      return
    }

    await createService.mutateAsync({
      name,
      description,
      area,
      impact,
      urgency,
      requiresApproval: requiresApproval === 'true',
    })

    setName('')
    setDescription('')
    toast.success('Servico criado no catalogo')
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Novo servico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Nome" value={name} onChange={(event) => setName(event.target.value)} />
          <Input placeholder="Descricao" value={description} onChange={(event) => setDescription(event.target.value)} />
          <Select value={area} options={[{ label: 'TI Operacoes', value: 'TI Operacoes' }, { label: 'Financeiro', value: 'Financeiro' }, { label: 'RH', value: 'RH' }]} onChange={(event) => setArea(event.target.value)} />
          <Select value={impact} options={[{ label: 'Low', value: 'Low' }, { label: 'Medium', value: 'Medium' }, { label: 'High', value: 'High' }]} onChange={(event) => setImpact(event.target.value as 'Low' | 'Medium' | 'High')} />
          <Select value={urgency} options={[{ label: 'Low', value: 'Low' }, { label: 'Medium', value: 'Medium' }, { label: 'High', value: 'High' }]} onChange={(event) => setUrgency(event.target.value as 'Low' | 'Medium' | 'High')} />
          <Select value={requiresApproval} options={[{ label: 'Sem aprovacao', value: 'false' }, { label: 'Requer aprovacao', value: 'true' }]} onChange={(event) => setRequiresApproval(event.target.value)} />
          <Button onClick={create} disabled={createService.isPending}>
            Criar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catalogo de servicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(servicesQuery.data ?? []).map((service) => (
            <div key={service.id} className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
              <div>
                <p className="font-semibold">{service.name}</p>
                <p className="text-xs text-[var(--text-soft)]">{service.area} • impacto {service.impact} • urgencia {service.urgency}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await deleteService.mutateAsync(service.id)
                  toast.success('Servico removido')
                }}
              >
                Excluir
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
