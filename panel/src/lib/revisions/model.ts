/**
 * Revision requests (/revizyonlar): row shapes of the revision tables
 * (supabase/migrations/20261103150000_revisions.sql) and the screen's rules: order, filters, the
 * thread and which status buttons someone gets. Pure, so it is unit tested; the database still
 * decides every write (set_revision_status, the policies).
 */

export const REVISION_STATUSES = ['open', 'in_progress', 'done'] as const
export type RevisionStatus = (typeof REVISION_STATUSES)[number]

export const STATUS_LABELS: Readonly<Record<RevisionStatus, string>> = {
  open: 'Açık',
  in_progress: 'Devam Ediyor',
  done: 'Tamamlandı',
}

export interface RevisionRequest {
  id: string
  number: number
  requester_id: string
  description: string
  urgency: number
  status: RevisionStatus
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface RevisionComment {
  id: string
  request_id: string
  author_id: string
  body: string
  created_at: string
  edited_at: string | null
}

export interface RevisionStatusChange {
  id: string
  request_id: string
  from_status: RevisionStatus
  to_status: RevisionStatus
  changed_by: string
  created_at: string
}

export interface RevisionAttachment {
  id: string
  request_id: string
  /** Null: a screenshot of the request itself. */
  comment_id: string | null
  object_path: string
  uploaded_by: string
  created_at: string
}

// ---------------------------------------------------------------------------------------------
// The list

export type ActiveFilter = 'all' | 'open' | 'in_progress'

export const ACTIVE_FILTERS: readonly { id: ActiveFilter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'open', label: STATUS_LABELS.open },
  { id: 'in_progress', label: STATUS_LABELS.in_progress },
]

export const parseFilter = (value: string | null): ActiveFilter =>
  ACTIVE_FILTERS.find((filter) => filter.id === value)?.id ?? 'all'

const time = (iso: string | null): number => (iso ? Date.parse(iso) || 0 : 0)

/** Most urgent first, then the newest. */
export const byUrgency = (a: RevisionRequest, b: RevisionRequest): number =>
  b.urgency - a.urgency || time(b.created_at) - time(a.created_at)

export interface RevisionGroups {
  /** Açık and Devam Ediyor under the chosen filter, most urgent first. */
  active: RevisionRequest[]
  /** Tamamlandı, most recently completed first. */
  done: RevisionRequest[]
  counts: Readonly<Record<ActiveFilter, number>>
}

export function groupRevisions(rows: readonly RevisionRequest[], filter: ActiveFilter): RevisionGroups {
  const open = rows.filter((row) => row.status === 'open')
  const inProgress = rows.filter((row) => row.status === 'in_progress')
  const shown = filter === 'open' ? open : filter === 'in_progress' ? inProgress : [...open, ...inProgress]
  return {
    active: [...shown].sort(byUrgency),
    done: rows.filter((row) => row.status === 'done').sort((a, b) => time(b.completed_at) - time(a.completed_at)),
    counts: { all: open.length + inProgress.length, open: open.length, in_progress: inProgress.length },
  }
}

export type UrgencyTone = 'high' | 'medium' | 'low'

/** 8–10 high, 4–7 medium, 1–3 low (the badge colour). */
export const urgencyTone = (urgency: number): UrgencyTone => (urgency >= 8 ? 'high' : urgency >= 4 ? 'medium' : 'low')

// ---------------------------------------------------------------------------------------------
// The new-request form

export const TEXT_MAX = 10_000
export const URGENCIES: readonly number[] = Array.from({ length: 10 }, (_, index) => index + 1)
export const DEFAULT_URGENCY = 5

/** Why the form cannot be sent yet, or null. The database checks the same (23514). */
export function newRequestProblem(description: string, urgency: number): string | null {
  if (description.trim() === '') return 'İsteğinizi yazın.'
  if (description.length > TEXT_MAX) return 'Açıklama en fazla 10.000 karakter olabilir.'
  if (!Number.isInteger(urgency) || urgency < 1 || urgency > 10) return 'Aciliyet 1 ile 10 arasında olmalı.'
  return null
}

export function commentProblem(body: string): string | null {
  if (body.trim() === '') return 'Yorumunuzu yazın.'
  if (body.length > TEXT_MAX) return 'Yorum en fazla 10.000 karakter olabilir.'
  return null
}

// ---------------------------------------------------------------------------------------------
// Status buttons (mirror of public.set_revision_status)

export interface StatusAction {
  to: RevisionStatus
  label: string
}

/**
 * main_admin may move a request to any other status; everyone else with revisions.use may only
 * reopen a done one.
 */
export function statusActions(isMainAdmin: boolean, current: RevisionStatus): StatusAction[] {
  const targets: readonly RevisionStatus[] = isMainAdmin
    ? REVISION_STATUSES.filter((status) => status !== current)
    : current === 'done'
      ? ['open']
      : []
  return targets.map((to) => ({ to, label: actionLabel(current, to) }))
}

function actionLabel(from: RevisionStatus, to: RevisionStatus): string {
  if (to === 'open') return from === 'done' ? 'Yeniden aç' : 'Açık yap'
  return to === 'done' ? 'Tamamlandı yap' : 'Devam Ediyor yap'
}

/** The line announced after a change. */
export function statusChangedMessage(number: number, to: RevisionStatus): string {
  return to === 'open' ? `#${number} yeniden Açık.` : `#${number} artık ${STATUS_LABELS[to]}.`
}

// ---------------------------------------------------------------------------------------------
// The thread

export type ThreadEntry =
  | { kind: 'comment'; at: string; comment: RevisionComment; attachments: RevisionAttachment[] }
  | { kind: 'status'; at: string; change: RevisionStatusChange }

/** Comments (with their screenshots) and status changes as one conversation, oldest first. */
export function buildThread(
  comments: readonly RevisionComment[],
  changes: readonly RevisionStatusChange[],
  attachments: readonly RevisionAttachment[],
): ThreadEntry[] {
  const entries: ThreadEntry[] = [
    ...comments.map((comment): ThreadEntry => ({
      kind: 'comment',
      at: comment.created_at,
      comment,
      attachments: attachments.filter((attachment) => attachment.comment_id === comment.id),
    })),
    ...changes.map((change): ThreadEntry => ({ kind: 'status', at: change.created_at, change })),
  ]
  return entries.sort((a, b) => time(a.at) - time(b.at))
}

/** Screenshots of the request itself (not of a comment). */
export const requestAttachments = (attachments: readonly RevisionAttachment[]): RevisionAttachment[] =>
  attachments.filter((attachment) => attachment.comment_id === null)

export function describeStatusChange(change: RevisionStatusChange, name: (id: string) => string): string {
  if (change.from_status === 'done' && change.to_status === 'open') return `${name(change.changed_by)} isteği yeniden açtı.`
  return `${name(change.changed_by)} durumu ${STATUS_LABELS[change.to_status]} yaptı.`
}
