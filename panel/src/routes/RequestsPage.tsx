import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useStaff } from '../auth/AuthProvider'
import { PageHeading } from '../components/PageHeading'
import { RequestDetailView } from '../components/requests/RequestDetailView'
import { RequestTable } from '../components/requests/RequestTable'
import { Button, Loading, Notice } from '../components/ui'
import { loadInbox } from '../data/requests'
import { listStaffDirectory } from '../data/staff'
import { staffNamer } from '../lib/activity'
import { can } from '../lib/permissions'
import { parseTab, REQUEST_TABS, TAB_PAGE_SIZE, truncationNotice, type RequestTab } from '../lib/requestTabs'
import type { StaffMember } from '../lib/types'
import { useAsyncData } from '../lib/useAsyncData'

const NO_PEOPLE: readonly StaffMember[] = []
const NO_COUNTS: Record<RequestTab, number> = { pending: 0, in_progress: 0, mine: 0 }

/** Roles without requests.read get a notice and no queries (RLS would only return empty sets). */
export function RequestsPage() {
  const me = useStaff()
  if (!can(me, 'requests.read')) {
    return (
      <div className="space-y-4">
        <PageHeading title="Talepler" description="Siteden gelen talepleri işleme alın, devredin ve takip edin." help="talepler" />
        <Notice tone="info">Rolünüz talepleri görmeyi kapsamıyor.</Notice>
      </div>
    )
  }
  return <Inbox myId={me.id} />
}

/**
 * Tab and selected request live in the query string (?sekme=…&talep=…), so views can be shared.
 * Each tab is queried and counted on the server; a cut-off tab says so and can load more.
 */
function Inbox({ myId }: { myId: string }) {
  const [params] = useSearchParams()
  const tab = parseTab(params.get('sekme'))
  const selectedId = params.get('talep')
  const [more, setMore] = useState<{ tab: RequestTab; limit: number }>({ tab, limit: TAB_PAGE_SIZE })
  const limit = more.tab === tab ? more.limit : TAB_PAGE_SIZE

  const load = useCallback(
    () => Promise.all([loadInbox(tab, myId, limit), listStaffDirectory()]),
    [tab, myId, limit],
  )
  const { state, reload } = useAsyncData(`inbox:${tab}:${myId}:${limit}`, load)
  const [announcement, setAnnouncement] = useState<string | null>(null)

  const [inbox, people] = state.value ?? [null, NO_PEOPLE]
  const name = useMemo(() => staffNamer(people), [people])

  const counts = inbox?.counts ?? NO_COUNTS
  // While another tab loads, the last value belongs to the old tab: show loading, not its rows.
  const visible = inbox && inbox.tab === tab ? inbox.rows : null
  const cutOff = visible ? truncationNotice(visible.length, counts[tab]) : null
  const tabLabel = REQUEST_TABS.find((item) => item.id === tab)?.label ?? ''
  const showMore = () => setMore({ tab, limit: limit + TAB_PAGE_SIZE })
  const hrefFor = (nextTab: RequestTab, requestId?: string) =>
    `?${new URLSearchParams({ sekme: nextTab, ...(requestId ? { talep: requestId } : {}) }).toString()}`

  const changed = (message: string) => {
    setAnnouncement(message)
    reload()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading title="Talepler" description="Siteden gelen talepleri işleme alın, devredin ve takip edin." help="talepler" />
        <Button variant="secondary" onClick={reload} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Yenileniyor…' : 'Listeyi yenile'}
        </Button>
      </div>

      <nav aria-label="Talep sekmeleri">
        <ul className="flex flex-wrap gap-2">
          {REQUEST_TABS.map((item) => (
            <li key={item.id}>
              <Link
                to={hrefFor(item.id)}
                aria-current={item.id === tab ? 'page' : undefined}
                className={`inline-block rounded-md border px-3 py-2 text-sm font-semibold ${
                  item.id === tab ? 'border-brand-green bg-brand-green text-white' : 'border-line-strong bg-white'
                }`}
              >
                {item.label} <span aria-label={`${counts[item.id]} talep`}>({counts[item.id]})</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {announcement && <Notice tone="success">{announcement}</Notice>}
      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
      {!visible && state.status === 'loading' && <Loading label="Talepler yükleniyor…" />}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {visible && (
          <div className="space-y-3">
            <RequestTable
              caption={`${tabLabel} talepler`}
              rows={visible}
              selectedId={selectedId}
              linkFor={(id) => hrefFor(tab, id)}
              name={name}
            />
            {cutOff && (
              <div className="flex flex-wrap items-center gap-3">
                <Notice tone="info">{cutOff}</Notice>
                <Button variant="secondary" onClick={showMore} disabled={state.status === 'loading'}>
                  {state.status === 'loading' ? 'Yükleniyor…' : 'Daha fazla göster'}
                </Button>
              </div>
            )}
          </div>
        )}
        {selectedId && state.value && (
          <RequestDetailView key={selectedId} requestId={selectedId} people={people} name={name} onChanged={changed} />
        )}
      </div>
    </div>
  )
}
