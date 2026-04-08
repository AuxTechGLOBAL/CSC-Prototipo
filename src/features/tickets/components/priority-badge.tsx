import { Badge } from '../../../components/ui/badge'
import type { Priority } from '../../../types/domain'

const styleByPriority: Record<Priority, Parameters<typeof Badge>[0]['variant']> = {
  Low: 'neutral',
  Medium: 'warning',
  High: 'danger',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={styleByPriority[priority]}>{priority}</Badge>
}
