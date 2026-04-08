import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { useCreateTicketMutation, useKbQuery, useServicesQuery } from '../hooks/use-csc-data'
import { useAppStore } from '../store/app-store'

export function CreateTicketPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
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

  const pushFiles = (files: File[]) => {
    const incoming = files.map((file) => ({ name: file.name, sizeKb: Math.ceil(file.size / 1024) }))
    setAttachments((prev) => {
      const byName = new Map(prev.map((item) => [item.name, item]))
      incoming.forEach((item) => byName.set(item.name, item))
      return Array.from(byName.values())
    })
  }

  const canContinueFromStep1 = Boolean(serviceId)
  const canContinueFromStep2 = Boolean(serviceId && title.trim() && description.trim() && impactedUser.trim())

  const stepTitle = step === 1 ? 'Escolha do servico' : step === 2 ? 'Dados do ticket' : 'Revisao final'

  const serviceSlaLabel = useMemo(() => {
    if (!selectedService) return 'Selecione um servico para ver SLA estimado.'
    return selectedService.urgency === 'High' ? 'SLA estimado: 2 horas' : 'SLA estimado: 6 horas'
  }, [selectedService])

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Criar Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={step === 1 ? 'info' : 'neutral'}>1. Servico</Badge>
            <Badge variant={step === 2 ? 'info' : 'neutral'}>2. Dados</Badge>
            <Badge variant={step === 3 ? 'info' : 'neutral'}>3. Revisao</Badge>
          </div>

          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Etapa atual</p>
            <p className="text-sm font-semibold text-[var(--text-strong)]">{stepTitle}</p>
          </div>

          <div>
            {step === 1 && (
              <>
                <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-soft)]">Passo 1 - Selecao de servico</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {(servicesQuery.data ?? []).map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setServiceId(service.id)}
                      className={`rounded-lg border p-3 text-left transition ${service.id === serviceId ? 'border-[var(--brand-500)] bg-[color-mix(in_srgb,var(--brand-500)_12%,white)]' : 'border-[var(--border-subtle)] bg-[var(--surface-2)] hover:border-[var(--brand-500)]/40'}`}
                    >
                      <p className="font-semibold text-[var(--text-strong)]">{service.name}</p>
                      <p className="text-xs text-[var(--text-soft)]">{service.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="neutral">Area: {service.area}</Badge>
                        <Badge variant={service.requiresApproval ? 'warning' : 'success'}>
                          {service.requiresApproval ? 'Requer aprovacao' : 'Sem aprovacao'}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
                {!serviceId && (
                  <p className="mt-2 text-xs text-amber-600">Selecione um servico para habilitar a abertura do ticket.</p>
                )}
                {selectedService && (
                  <div className="mt-3 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3">
                    <p className="text-sm font-semibold">{selectedService.name}</p>
                    <p className="mt-1 text-sm text-[var(--text-soft)]">{selectedService.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="neutral">Impacto: {selectedService.impact}</Badge>
                      <Badge variant="neutral">Urgencia: {selectedService.urgency}</Badge>
                      <Badge variant={selectedService.requiresApproval ? 'warning' : 'success'}>
                        {selectedService.requiresApproval ? 'Vai para aprovacao' : 'Fluxo direto'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-soft)]">{serviceSlaLabel}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {step === 2 && (
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

              <div
                className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-2)] p-4"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  pushFiles(Array.from(event.dataTransfer.files ?? []))
                }}
              >
                <p className="text-sm font-medium text-[var(--text-strong)]">Anexos</p>
                <p className="text-xs text-[var(--text-soft)]">Arraste arquivos para ca ou use o seletor abaixo.</p>
                <Input
                  type="file"
                  multiple
                  disabled={!serviceId}
                  onChange={(event) => {
                    pushFiles(Array.from(event.target.files ?? []))
                  }}
                />
              </div>

              {attachments.length > 0 && (
                <ul className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-sm">
                  {attachments.map((attachment) => (
                    <li key={attachment.name} className="flex items-center justify-between gap-2">
                      <span>{attachment.name} ({attachment.sizeKb} KB)</span>
                      <Button size="sm" variant="ghost" onClick={() => setAttachments((prev) => prev.filter((item) => item.name !== attachment.name))}>
                        remover
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Passo 3 - Revisao</p>
              <p><span className="text-[var(--text-soft)]">Servico:</span> {selectedService?.name ?? '-'}</p>
              <p><span className="text-[var(--text-soft)]">Titulo:</span> {title}</p>
              <p><span className="text-[var(--text-soft)]">Descricao:</span> {description}</p>
              <p><span className="text-[var(--text-soft)]">Usuario impactado:</span> {impactedUser}</p>
              <p><span className="text-[var(--text-soft)]">Aprovacao:</span> {selectedService?.requiresApproval ? 'Sim' : 'Nao'}</p>
              <p><span className="text-[var(--text-soft)]">SLA esperado:</span> {serviceSlaLabel.replace('SLA estimado: ', '')}</p>
              <p><span className="text-[var(--text-soft)]">Anexos:</span> {attachments.length}</p>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-2">
            <Button size="sm" variant="secondary" onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev))} disabled={step === 1}>
              Voltar
            </Button>

            <div className="flex gap-2">
              {step < 3 && (
                <Button
                  size="sm"
                  onClick={() => setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev))}
                  disabled={(step === 1 && !canContinueFromStep1) || (step === 2 && !canContinueFromStep2)}
                >
                  Avancar
                </Button>
              )}
              {step === 3 && (
                <Button onClick={submit} disabled={createMutation.isPending || !canContinueFromStep2}>
                  {createMutation.isPending ? 'Criando...' : 'Criar ticket'}
                </Button>
              )}
            </div>
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
