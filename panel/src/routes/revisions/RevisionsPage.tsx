import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { PageHeading } from '../../components/PageHeading'
import { AccessDenied, useCan } from '../../components/permissionsContext'
import { NewRevisionForm } from '../../components/revisions/NewRevisionForm'
import { RevisionCard } from '../../components/revisions/RevisionCard'
import { Button, Loading, Notice } from '../../components/ui'
import { listRevisions, notifyRevision } from '../../data/revisions'
import { listStaffDirectory } from '../../data/staff'
import { staffNamer } from '../../lib/activity'
import { notifyMessage, revisionErrorMessage } from '../../lib/revisions/messages'
import { ACTIVE_FILTERS, groupRevisions, parseFilter, type RevisionRequest } from '../../lib/revisions/model'
import type { StaffMember } from '../../lib/types'
import { useAsyncData } from '../../lib/useAsyncData'

export const REVISIONS_DESCRIPTION = 'Sitede ya da panelde değişmesini istediğiniz şeyler, aciliyete göre sıralı.'

/** Without revisions.use: a notice and no queries (RLS would only return empty sets). */
export function RevisionsNoAccess() {
  return (
    <div className="space-y-4">
      <PageHeading title="Revizyonlar" description={REVISIONS_DESCRIPTION} help="revizyonlar" />
      <Notice tone="info">Revizyonlar için revizyon yetkisi gerekir. Yetkiyi ana yönetici Kullanıcılar ekranından verir.</Notice>
    </div>
  )
}

/** /revizyonlar: active requests by urgency (filter in ?durum=), the finished ones below, "Yeni istek". */
export function RevisionsPage() {
  const allowed = useCan()
  if (!allowed('revisions.use')) {
    return (
      <AccessDenied>
        <RevisionsNoAccess />
      </AccessDenied>
    )
  }
  return <RevisionBoard />
}

const NO_ROWS: readonly RevisionRequest[] = []
const NO_PEOPLE: readonly StaffMember[] = []

// Names only decorate the cards; without them the requests must still show.
const loadBoard = () => Promise.all([listRevisions(), listStaffDirectory().catch((): StaffMember[] => [])])

interface Saved {
  text: string
  problem: string | null
}

function RevisionBoard() {
  const [params] = useSearchParams()
  const filter = parseFilter(params.get('durum'))
  const { state, reload } = useAsyncData('revisions', loadBoard, revisionErrorMessage)
  const [creating, setCreating] = useState(false)
  const [saved, setSaved] = useState<Saved | null>(null)
  const [mailNote, setMailNote] = useState<string | null>(null)

  const [rows, people] = state.value ?? [NO_ROWS, NO_PEOPLE]
  const name = useMemo(() => staffNamer(people), [people])
  const groups = useMemo(() => groupRevisions(rows, filter), [rows, filter])

  const created = (request: RevisionRequest, problem: string | null) => {
    setCreating(false)
    setSaved({ text: `İsteğiniz #${request.number} olarak kaydedildi.`, problem })
    setMailNote(null)
    reload()
    void notifyRevision('created', request.id).then((answer) => setMailNote(notifyMessage(answer)))
  }

  const startNew = () => {
    setCreating(true)
    setSaved(null)
    setMailNote(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeading title="Revizyonlar" description={REVISIONS_DESCRIPTION} help="revizyonlar" />
        <div className="flex flex-wrap gap-2">
          {!creating && <Button onClick={startNew}>Yeni istek</Button>}
          <Button variant="secondary" onClick={reload} disabled={state.status === 'loading'}>
            {state.status === 'loading' ? 'Yenileniyor…' : 'Listeyi yenile'}
          </Button>
        </div>
      </div>

      {creating && <NewRevisionForm onCancel={() => setCreating(false)} onCreated={created} />}
      {saved && <Notice tone="success">{saved.text}</Notice>}
      {saved?.problem && <Notice tone="error">{saved.problem}</Notice>}
      {mailNote && <Notice tone="info">{mailNote}</Notice>}

      {state.status === 'error' && (
        <div className="space-y-2">
          <Notice tone="error">{state.message}</Notice>
          <Button variant="secondary" onClick={reload}>
            Tekrar dene
          </Button>
        </div>
      )}

      {!state.value ? (
        state.status === 'loading' && <Loading label="Revizyonlar yükleniyor…" />
      ) : (
        <>
          <section aria-labelledby="revizyon-aktif" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="revizyon-aktif" className="text-lg font-bold text-ink">
                Açık ve devam eden istekler
              </h2>
              <nav aria-label="Durum süzgeci">
                <ul className="flex flex-wrap gap-2">
                  {ACTIVE_FILTERS.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.id === 'all' ? '/revizyonlar' : `/revizyonlar?durum=${item.id}`}
                        aria-current={item.id === filter ? 'page' : undefined}
                        className={`inline-block rounded-md border px-3 py-2 text-sm font-semibold ${
                          item.id === filter ? 'border-brand-green bg-brand-green text-white' : 'border-line-strong bg-white'
                        }`}
                      >
                        {item.label} <span aria-label={`${groups.counts[item.id]} istek`}>({groups.counts[item.id]})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            {groups.active.length === 0 ? (
              <p className="text-sm text-ink-muted">
                {groups.counts.all === 0 ? 'Açık ya da devam eden istek yok.' : 'Bu süzgece uyan istek yok.'}
              </p>
            ) : (
              <ul className="space-y-3">
                {groups.active.map((request) => (
                  <RevisionCard key={request.id} request={request} name={name} />
                ))}
              </ul>
            )}
          </section>

          <details className="rounded-card border border-line/70 bg-white p-4 shadow-soft">
            <summary className="cursor-pointer text-lg font-bold text-ink">Tamamlananlar ({groups.done.length})</summary>
            {groups.done.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">Henüz tamamlanan istek yok.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {groups.done.map((request) => (
                  <RevisionCard key={request.id} request={request} name={name} />
                ))}
              </ul>
            )}
          </details>
        </>
      )}
    </div>
  )
}
