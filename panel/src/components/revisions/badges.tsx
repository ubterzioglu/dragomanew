import { STATUS_LABELS, urgencyTone, type RevisionStatus, type UrgencyTone } from '../../lib/revisions/model'

/** Full class strings (Tailwind only sees literal names; the panel's CSP allows no inline style). */
const URGENCY_CLASSES: Readonly<Record<UrgencyTone, string>> = {
  high: 'bg-red-50 text-red-800',
  medium: 'bg-brand-orange-soft text-brand-orange-ink',
  low: 'bg-brand-green-soft text-brand-green-dark',
}

const STATUS_CLASSES: Readonly<Record<RevisionStatus, string>> = {
  open: 'bg-amber-50 text-amber-900',
  in_progress: 'bg-sky-50 text-sea',
  done: 'bg-line/60 text-ink',
}

const BADGE = 'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold'

export function UrgencyBadge({ urgency }: { urgency: number }) {
  return <span className={`${BADGE} ${URGENCY_CLASSES[urgencyTone(urgency)]}`}>Aciliyet {urgency}/10</span>
}

export function StatusBadge({ status }: { status: RevisionStatus }) {
  return <span className={`${BADGE} ${STATUS_CLASSES[status]}`}>{STATUS_LABELS[status]}</span>
}
