import { Link } from 'react-router'
import type { StaffNamer } from '../../lib/activity'
import { formatDateTime } from '../../lib/format'
import type { RevisionRequest } from '../../lib/revisions/model'
import { StatusBadge, UrgencyBadge } from './badges'

/** One request in the list; the whole card opens its detail. */
export function RevisionCard({ request, name }: { request: RevisionRequest; name: StaffNamer }) {
  return (
    <li>
      <Link
        to={`/revizyonlar/${request.id}`}
        className="block rounded-card border border-line/70 bg-white p-4 shadow-soft transition-colors hover:border-brand-green"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink">#{request.number}</span>
          <UrgencyBadge urgency={request.urgency} />
          <StatusBadge status={request.status} />
          <span className="text-xs text-ink-muted">
            {name(request.requester_id)} · {formatDateTime(request.created_at)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 break-words text-sm text-ink">{request.description}</p>
        {request.completed_at && <p className="mt-1 text-xs text-ink-muted">Tamamlandı: {formatDateTime(request.completed_at)}</p>}
      </Link>
    </li>
  )
}
