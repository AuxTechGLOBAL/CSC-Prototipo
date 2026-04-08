import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { useCreateTicketMutation, useKbQuery, useServicesQuery } from '../hooks/use-csc-data'
import { useAppStore } from '../store/app-store'

export function CreateTicketPage() {
  const [serviceId, setServiceId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [impactedUser, setImpactedUser] = useState('')
  const [attachments, setAttachments] = useState<Array<{ name: string; sizeKb: number }>>([])

  const navigate = useNavigate()
  const currentUserId = useAppStore((state) => state.activeUserId)
  const servicesQuery = useServicesQuery()
  const createMutation = useCreateTicketMutation()
  const kbQuery = useKbQuery(serviceId)

  const selectedService = useMemo(() => {
    return servicesQuery.data?.find((service) => service.id === serviceId)
  }, [serviceId, servicesQuery.data])

  const submit = async () => {
    if (!serviceId || !title.trim() || !description.trim() || !impactedUser.trim()) {
      toast.error('Preencha os campos obrigatorios')
      return
    }

    try {
      const ticket = await createMutation.mutateAsync({
        serviceId,
        title,
        description,
        impactedUser,
        requesterId: currentUserId,
        attachments,
      })
      toast.success(`Ticket ${ticket.id} criado com sucesso`)
      navigate(`/tickets/${ticket.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao criar ticket')
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Criar Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-soft)]">Passo 1 - Selecao de servico</p>
            <div className="grid gap-2 md:grid-cols-2">
              {(servicesQuery.data ?? []).map((service) => (
                <button
                  key={service.id}
                  onClick={() => setServiceId(service.id)}
                  className={`rounded-lg border p-3 text-left transition ${service.id === serviceId ? 'border-cyan-400 bg-cyan-500/10' : 'border-[var(--border-subtle)] bg-[var(--surface-2)] hover:border-cyan-500/40'}`}
                >
                  <p className="font-semibold text-[var(--text-strong)]">{service.name}</p>
                  <p className="text-xs text-[var(--text-soft)]">{service.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Passo 2 - Formulario</p>
            <Input placeholder="Titulo" value={title} onChange={(event) => setTitle(event.target.value)} />
            <Textarea placeholder="Descricao" value={description} onChange={(event) => setDescription(event.target.value)} />
            <Input placeholder="Usuario impactado" value={impactedUser} onChange={(event) => setImpactedUser(event.target.value)} />

            <Input
              type="file"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                setAttachments(files.map((file) => ({ name: file.name, sizeKb: Math.ceil(file.size / 1024) })))
              }}
            />

            {attachments.length > 0 && (
              <ul className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-sm">
                {attachments.map((attachment) => (
                  <li key={attachment.name}>
                    {attachment.name} ({attachment.sizeKb} KB)
                  </li>
                ))}
              </ul>
            )}

            <Button onClick={submit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar ticket'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sugestoes de KB</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectedService && <p className="text-xs text-[var(--text-soft)]">Baseada no servico {selectedService.name}</p>}
          {(kbQuery.data ?? []).slice(0, 4).map((article) => (
            <div key={article.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2">
              <p className="text-sm font-semibold">{article.title}</p>
              <p className="text-xs text-[var(--text-soft)]">{article.tags.join(', ')}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
