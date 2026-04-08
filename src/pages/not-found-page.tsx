import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">404</p>
        <h1 className="text-3xl font-semibold">Pagina nao encontrada</h1>
        <Link to="/">
          <Button>Voltar ao dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
