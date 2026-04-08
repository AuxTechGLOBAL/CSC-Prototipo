import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useKbQuery } from '../hooks/use-csc-data'

export function KbPage() {
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const kbQuery = useKbQuery(query)

  const active = useMemo(() => {
    return kbQuery.data?.find((item) => item.id === activeId) ?? kbQuery.data?.[0]
  }, [kbQuery.data, activeId])

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Base de Conhecimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Buscar artigos" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="space-y-2">
            {(kbQuery.data ?? []).map((article) => (
              <button
                key={article.id}
                onClick={() => setActiveId(article.id)}
                className={`w-full rounded-md border p-2 text-left ${active?.id === article.id ? 'border-cyan-500/60 bg-cyan-500/10' : 'border-[var(--border-subtle)] bg-[var(--surface-2)]'}`}
              >
                <p className="text-sm font-semibold">{article.title}</p>
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
    </div>
  )
}
