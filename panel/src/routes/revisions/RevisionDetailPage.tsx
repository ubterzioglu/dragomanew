import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useStaff } from '../../auth/AuthProvider'
import { PageHeading } from '../../components/PageHeading'
import { useCan } from '../../components/permissionsContext'
import { StatusBadge, UrgencyBadge } from '../../components/revisions/badges'
import { CommentForm } from '../../components/revisions/CommentForm'
import { RevisionThread } from '../../components/revisions/RevisionThread'
import { Screenshots } from '../../components/revisions/Screenshots'
import { StatusActions } from '../../components/revisions/StatusActions'
import { Button, Card, Loading, Notice } from '../../components/ui'
import { loadRevision, notifyRevision, screenshotUrls, type RevisionDetail } from '../../data/revisions'
import { listStaffDirectory } from '../../data/staff'
import { staffNamer } from '../../lib/activity'
import { formatDateTime } from '../../lib/format'
import { notifyMessage, revisionErrorMessage } from '../../lib/revisions/messages'
import {
  buildThread,
  requestAttachments,
  statusChangedMessage,
  type RevisionAttachment,
  type RevisionStatus,
} from '../../lib/revisions/model'
import type { StaffMember } from '../../lib/types'
import { useAsyncData } from '../../lib/useAsyncData'
import { REVISIONS_DESCRIPTION, RevisionsNoAccess } from './RevisionsPage'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const NO_ATTACHMENTS: readonly RevisionAttachment[] = []

/** /revizyonlar/:id, the address the notification mails link to. */
export function RevisionDetailPage() {
  const allowed = useCan()
  const { id = '' } = useParams()
  if (!allowed('revisions.use')) return <RevisionsNoAccess />
  return <RevisionView key={id} id={id} />
}

interface Loaded {
  detail: RevisionDetail
  people: StaffMember[]
}

interface Saved {
  text: string
  problem: string | null
}

function BackLink() {
  return (
    <Link to="/revizyonlar" className="text-sm font-semibold text-brand-green-dark underline">
      ← Revizyonlar
    </Link>
  )
}

function RevisionView({ id }: { id: string }) {
  const me = useStaff()
  const load = useCallback(async (): Promise<Loaded | null> => {
    // Not an id at all (a mistyped address): nothing to ask the database.
    if (!UUID.test(id)) return null
    const [detail, people] = await Promise.all([loadRevision(id), listStaffDirectory().catch((): StaffMember[] => [])])
    return { detail, people }
  }, [id])
  const { state, reload } = useAsyncData(`revision:${id}`, load, revisionErrorMessage)
  const [saved, setSaved] = useState<Saved | null>(null)
  const [mailNote, setMailNote] = useState<string | null>(null)

  const attachments = state.value?.detail.attachments ?? NO_ATTACHMENTS
  const pathKey = attachments.map((attachment) => attachment.object_path).join('\n')
  const loadUrls = useCallback(() => screenshotUrls(pathKey ? pathKey.split('\n') : []), [pathKey])
  const urls = useAsyncData(`revision-screenshots:${pathKey}`, loadUrls, revisionErrorMessage)

  const people = state.value?.people
  const name = useMemo(() => staffNamer(people ?? []), [people])
  const detail = state.value?.detail
  const thread = useMemo(
    () => (detail ? buildThread(detail.comments, detail.changes, detail.attachments) : []),
    [detail],
  )

  if (state.status === 'error' && !state.value) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Notice tone="error">{state.message}</Notice>
        <Button variant="secondary" onClick={reload}>
          Tekrar dene
        </Button>
      </div>
    )
  }
  if (state.value === undefined) return <Loading label="Revizyon yükleniyor…" />
  const request = state.value?.detail.request ?? null
  if (!request) {
    return (
      <div className="space-y-4">
        <PageHeading title="Revizyon bulunamadı" />
        <Notice tone="info">Bu adreste bir revizyon isteği yok. Bağlantı eksik kopyalanmış olabilir.</Notice>
        <BackLink />
      </div>
    )
  }

  const announce = (text: string, problem: string | null = null) => {
    setSaved({ text, problem })
    setMailNote(null)
    reload()
  }

  const statusChanged = (to: RevisionStatus, changeId: string) => {
    announce(statusChangedMessage(request.number, to))
    if (to === 'done') void notifyRevision('done', changeId).then((answer) => setMailNote(notifyMessage(answer)))
  }

  const urlsFailed = urls.state.status === 'error'

  return (
    <div className="space-y-6">
      <BackLink />
      <PageHeading title={`Revizyon #${request.number}`} description={REVISIONS_DESCRIPTION} help="revizyonlar" />
      {saved && <Notice tone="success">{saved.text}</Notice>}
      {saved?.problem && <Notice tone="error">{saved.problem}</Notice>}
      {mailNote && <Notice tone="info">{mailNote}</Notice>}
      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={request.status} />
          <UrgencyBadge urgency={request.urgency} />
        </div>
        <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-ink-muted">İsteyen</dt>
          <dd>{name(request.requester_id)}</dd>
          <dt className="text-ink-muted">Açılış</dt>
          <dd>{formatDateTime(request.created_at)}</dd>
          <dt className="text-ink-muted">Son değişiklik</dt>
          <dd>{formatDateTime(request.updated_at)}</dd>
          {request.completed_at && (
            <>
              <dt className="text-ink-muted">Tamamlanma</dt>
              <dd>{formatDateTime(request.completed_at)}</dd>
            </>
          )}
        </dl>
        <section aria-labelledby="revizyon-aciklama" className="space-y-2">
          <h2 id="revizyon-aciklama" className="font-semibold">
            Açıklama
          </h2>
          <p className="whitespace-pre-wrap break-words text-sm text-ink">{request.description}</p>
          <Screenshots
            attachments={requestAttachments(attachments)}
            urls={urls.state.value}
            failed={urlsFailed}
            label="İsteğin ekran görüntüleri"
          />
        </section>
        <StatusActions request={request} isMainAdmin={me.role === 'main_admin'} onChanged={statusChanged} />
      </Card>

      <section aria-labelledby="revizyon-yazisma" className="space-y-3">
        <h2 id="revizyon-yazisma" className="text-lg font-bold text-ink">
          Yazışma
        </h2>
        <RevisionThread
          entries={thread}
          urls={urls.state.value}
          urlsFailed={urlsFailed}
          name={name}
          myId={me.id}
          onEdited={(message) => announce(message)}
        />
      </section>

      <CommentForm
        requestId={request.id}
        onPosted={(comment, problem) => {
          announce('Yorumunuz eklendi.', problem)
          void notifyRevision('commented', comment.id).then((answer) => setMailNote(notifyMessage(answer)))
        }}
      />
    </div>
  )
}
