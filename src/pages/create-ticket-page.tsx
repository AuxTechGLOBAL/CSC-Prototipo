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
  const kbSmartQuery = `${title} ${description}`.trim()
  const kbQuery = useKbQuery(kbSmartQuery || serviceId)

  const selectedService = useMemo(() => {
    return servicesQuery.data?.find((service) => service.id === serviceId)
  }, [serviceId, servicesQuery.data])

  const suggestedArticles = useMemo(() => {
    const normalized = `${title} ${description}`.toLowerCase()
    const terms = normalized.split(/\s+/).filter((term) => term.length >= 3)

    return (kbQuery.data ?? [])
      .map((article) => {
        const haystack = `${article.title} ${article.tags.join(' ')}`.toLowerCase()
        const matchScore = terms.reduce((acc, term) => (haystack.includes(term) ? acc + 1 : acc), 0)
        const serviceBoost = selectedService && article.serviceId === selectedService.id ? 2 : 0
        return { article, score: matchScore + serviceBoost }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.article)
      .slice(0, 4)
  }, [kbQuery.data, selectedService, title, description])

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
            {!serviceId && (
              <p className="mt-2 text-xs text-amber-300">Selecione um servico para habilitar a abertura do ticket.</p>
            )}
          </div>

          <div className="grid gap-2">
            <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Passo 2 - Formulario</p>
            <Input placeholder="Titulo" value={title} onChange={(event) => setTitle(event.target.value)} disabled={!serviceId} />
            <Textarea placeholder="Descricao" value={description} onChange={(event) => setDescription(event.target.value)} disabled={!serviceId} />
            <Input placeholder="Usuario impactado" value={impactedUser} onChange={(event) => setImpactedUser(event.target.value)} disabled={!serviceId} />

            <div className="grid gap-2 md:grid-cols-2">
              <Input
                value={selectedService ? `Impacto herdado: ${selectedService.impact}` : 'Impacto herdado do servico'}
                readOnly
              />
              <Input
                value={selectedService ? `Urgencia herdada: ${selectedService.urgency}` : 'Urgencia herdada do servico'}
                readOnly
              />
            </div>

            <Input
              type="file"
              multiple
              disabled={!serviceId}
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

            <Button onClick={submit} disabled={createMutation.isPending || !serviceId}>
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
          {!suggestedArticles.length && (
            <p className="text-xs text-[var(--text-soft)]">Digite titulo e descricao para receber sugestoes inteligentes.</p>
          )}
          {suggestedArticles.map((article) => (
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
