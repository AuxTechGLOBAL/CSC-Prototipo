import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useKbQuery } from '../hooks/use-csc-data'
import { useServicesQuery } from '../hooks/use-csc-data'

function highlightMatch(text: string, query: string) {
  const term = query.trim()
  if (!term) return text
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'ig')
  return text.split(regex).map((chunk, index) => {
    const isMatch = chunk.toLowerCase() === term.toLowerCase()
    if (!isMatch) return <span key={`${chunk}-${index}`}>{chunk}</span>
    return (
      <mark key={`${chunk}-${index}`} className="rounded bg-amber-200/80 px-1 text-[var(--text-strong)]">
        {chunk}
      </mark>
    )
  })
}

export function KbPage() {
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const kbQuery = useKbQuery(query)
  const servicesQuery = useServicesQuery()

  const active = useMemo(() => {
    return kbQuery.data?.find((item) => item.id === activeId) ?? kbQuery.data?.[0]
  }, [kbQuery.data, activeId])

  const relatedService = servicesQuery.data?.find((service) => service.id === active?.serviceId)

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <p className="mb-2 text-center text-sm uppercase tracking-wide text-[var(--text-soft)]">Base de Conhecimento</p>
          <Input placeholder="Busque artigos, tags ou servicos" value={query} onChange={(event) => setQuery(event.target.value)} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {(kbQuery.data ?? []).map((article) => (
              <button
                key={article.id}
                onClick={() => setActiveId(article.id)}
                className={`w-full rounded-md border p-2 text-left ${active?.id === article.id ? 'border-[var(--brand-500)] bg-[color-mix(in_srgb,var(--brand-500)_12%,white)]' : 'border-[var(--border-subtle)] bg-[var(--surface-2)]'}`}
              >
                <p className="text-sm font-semibold">{highlightMatch(article.title, query)}</p>
                <p className="text-xs text-[var(--text-soft)]">{article.tags.join(', ')}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{active?.title ?? 'Selecione um artigo'}</CardTitle>
        </CardHeader>
        <CardContent>
          {active ? (
            <article className="max-w-none space-y-3 text-[var(--text-strong)]">
              <ReactMarkdown>{active.content}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-sm text-[var(--text-soft)]">Nenhum artigo encontrado.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contexto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-soft)]">Tags</p>
            <div className="flex flex-wrap gap-2">
              {(active?.tags ?? []).map((tag) => (
                <Badge key={tag} variant="neutral">#{tag}</Badge>
              ))}
              {!active?.tags.length && <p className="text-xs text-[var(--text-soft)]">Sem tags</p>}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-[var(--text-soft)]">Servico relacionado</p>
            {relatedService ? (
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2">
                <p className="text-sm font-semibold text-[var(--text-strong)]">{relatedService.name}</p>
                <p className="text-xs text-[var(--text-soft)]">{relatedService.description}</p>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-soft)]">Este artigo nao possui servico vinculado.</p>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
