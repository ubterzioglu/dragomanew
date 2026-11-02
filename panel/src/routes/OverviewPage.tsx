import { ArrowRight, FileText, Inbox, Languages, Rocket, Sparkles, type LucideIcon } from 'lucide-react'
import { useCallback, type ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { useStaff } from '../auth/AuthProvider'
import { Markdown } from '../components/docs/Markdown'
import { PageHeading } from '../components/PageHeading'
import { useCan } from '../components/permissionsContext'
import { Loading, Notice } from '../components/ui'
import { deeplUsage, listEntries } from '../data/content/entries'
import { fetchLiveRelease, listDeploys, listReleases } from '../data/publish/publish'
import { countTab } from '../data/requests'
import { contentErrorMessage } from '../lib/content/messages'
import { bannerLevel } from '../lib/content/translationView'
import { CHANGELOG } from '../lib/docs/content'
import { formatChangelogDate, latestEntries } from '../lib/docs/changelog'
import { formatDateTime } from '../lib/format'
import { deployView } from '../lib/publish/deployState'
import { tabFilter } from '../lib/requestTabs'
import type { AsyncState } from '../lib/useAsyncData'
import { useAsyncData } from '../lib/useAsyncData'

/**
 * "/" — what needs attention, one card per area. Each card loads on its own, so one failing card
 * shows its own error while the others still work; a card shows only with the right permission.
 */
export function OverviewPage() {
  const { search } = useLocation()
  // Old links (mail, bookmarks) pointed the inbox at /panel/?sekme=…&talep=…; keep them working.
  const params = new URLSearchParams(search)
  if (params.has('sekme') || params.has('talep')) return <Navigate to={{ pathname: '/talepler', search }} replace />
  return <Overview />
}

function Overview() {
  const me = useStaff()
  const allowed = useCan()
  const content = allowed('content.edit') || allowed('content.publish')
  const firstName = me.full_name.split(/\s+/)[0] ?? me.full_name

  return (
    <div className="space-y-8">
      <PageHeading
        title="Genel bakış"
        description={`Merhaba ${firstName}. Bekleyen işler ve son durum burada.`}
        help="genel-bakis"
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {allowed('requests.read') && <RequestsCard staffId={me.id} />}
        {content && <DraftsCard />}
        {(content || allowed('site.deploy')) && <PublishCard />}
        {allowed('content.translate') && <DeeplCard />}
      </div>
      <ChangelogCard />
    </div>
  )
}

// ---------------------------------------------------------------------------------------------

interface OverviewCardProps {
  title: string
  icon: LucideIcon
  to: string
  linkLabel: string
  children: ReactNode
}

function OverviewCard({ title, icon: Icon, to, linkLabel, children }: OverviewCardProps) {
  return (
    <section className="flex flex-col rounded-card border border-line/70 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-green-soft text-brand-green">
          <Icon aria-hidden="true" className="size-[1.125rem]" />
        </span>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
      </div>
      <div className="mt-4 flex-1">{children}</div>
      <Link
        to={to}
        className="mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold text-brand-green hover:text-brand-green-dark hover:underline"
      >
        {linkLabel}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  )
}

/** Loading and error for one card; the body renders only with a value. */
function CardState<T>({ state, children }: { state: AsyncState<T>; children: (value: T) => ReactNode }) {
  if (state.status === 'error') return <Notice tone="error">{state.message}</Notice>
  if (state.value === undefined) return <Loading />
  return <>{children(state.value)}</>
}

function Stat({ value, label, to }: { value: number | string; label: string; to?: string }) {
  const body = (
    <>
      <span className="block text-2xl font-bold tabular-nums text-ink">{value}</span>
      <span className="block text-xs text-ink-muted">{label}</span>
    </>
  )
  return to ? (
    <Link to={to} className="block rounded-lg bg-canvas px-3 py-2.5 hover:bg-brand-green-soft">
      {body}
    </Link>
  ) : (
    <div className="rounded-lg bg-canvas px-3 py-2.5">{body}</div>
  )
}

// ---------------------------------------------------------------------------------------------

function RequestsCard({ staffId }: { staffId: string }) {
  const load = useCallback(() => {
    const count = (filter: ReturnType<typeof tabFilter>) => (filter ? countTab(filter) : Promise.resolve(0))
    return Promise.all([
      count(tabFilter('pending', staffId)),
      count(tabFilter('in_progress', staffId)),
      count(tabFilter('mine', staffId)),
    ])
  }, [staffId])
  const { state } = useAsyncData(`overview-requests:${staffId}`, load)

  return (
    <OverviewCard title="Talepler" icon={Inbox} to="/talepler" linkLabel="Taleplere git">
      <CardState state={state}>
        {([pending, inProgress, mine]) => (
          <div className="grid grid-cols-3 gap-2">
            <Stat value={pending} label="Bekliyor" to="/talepler?sekme=pending" />
            <Stat value={inProgress} label="İşlemde" to="/talepler?sekme=in_progress" />
            <Stat value={mine} label="Bana atanan" to="/talepler?sekme=mine" />
          </div>
        )}
      </CardState>
    </OverviewCard>
  )
}

const loadEntries = () => listEntries()

function DraftsCard() {
  const { state } = useAsyncData('overview-drafts', loadEntries, contentErrorMessage)
  return (
    <OverviewCard title="Yayınlanmamış değişiklikler" icon={FileText} to="/icerik" linkLabel="İçeriğe git">
      <CardState state={state}>
        {(rows) => {
          const changed = rows.filter((row) => row.has_changes && row.status !== 'archived')
          const neverPublished = rows.filter((row) => row.status === 'draft').length
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Stat value={changed.length} label="Değişikliği bekleyen kayıt" />
                <Stat value={neverPublished} label="Hiç yayınlanmamış" />
              </div>
              {changed.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {changed.slice(0, 3).map((row) => (
                    <li key={row.id} className="truncate">
                      <Link to={`/icerik/${row.type}/${row.id}`} className="text-sea hover:underline">
                        {row.title_tr || row.key}
                      </Link>
                      <span className="text-ink-muted"> · {formatDateTime(row.updated_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        }}
      </CardState>
    </OverviewCard>
  )
}

/** The clock is read with the data, so rendering stays pure. */
const loadPublish = () =>
  Promise.all([fetchLiveRelease(), listReleases(1), listDeploys(1)]).then((parts) => [...parts, Date.now()] as const)

function PublishCard() {
  const { state } = useAsyncData('overview-publish', loadPublish, contentErrorMessage)
  return (
    <OverviewCard title="Canlı yayın" icon={Rocket} to="/yayin" linkLabel="Yayına git">
      <CardState state={state}>
        {([live, releases, deploys, loadedAt]) => {
          const release = releases[0]
          const deploy = deploys[0]
          const view = deploy ? deployView(deploy, live?.releaseId ?? null, loadedAt) : null
          return (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Sitedeki yayın</dt>
                <dd className="text-right font-semibold">{live ? `#${live.releaseId}` : 'Bilinmiyor'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Son yayın</dt>
                <dd className="text-right">
                  {release ? (
                    <>
                      <span className="font-semibold">#{release.id}</span> · {formatDateTime(release.created_at)}
                    </>
                  ) : (
                    'Henüz yok'
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Son kurulum</dt>
                <dd className={`text-right ${view?.tone === 'failed' || view?.delayed ? 'font-semibold text-red-800' : ''}`}>
                  {view ? view.label : 'Henüz yok'}
                </dd>
              </div>
            </dl>
          )
        }}
      </CardState>
    </OverviewCard>
  )
}

const loadUsage = () => deeplUsage()

function DeeplCard() {
  const { state } = useAsyncData('overview-deepl', loadUsage, contentErrorMessage)
  return (
    <OverviewCard title="DeepL kotası" icon={Languages} to="/yayin" linkLabel="Ayrıntılar">
      <CardState state={state}>
        {(usage) => {
          const percent = Math.min(100, Math.floor((usage.count / Math.max(1, usage.limit)) * 100))
          const level = bannerLevel(usage)
          const bar = level === 'critical' ? 'bg-red-700' : level === 'warn' ? 'bg-brand-orange' : 'bg-brand-green'
          return (
            <div className="space-y-2">
              <p className="text-2xl font-bold tabular-nums text-ink">%{percent}</p>
              {/* Width comes from a class step, not a style attribute (CSP). */}
              <div
                role="progressbar"
                aria-label="DeepL kotası kullanımı"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="h-2 overflow-hidden rounded-full bg-line"
              >
                <div className={`h-full rounded-full ${bar} ${widthClass(percent)}`} />
              </div>
              <p className="text-xs text-ink-muted">
                {usage.count.toLocaleString('tr-TR')} / {usage.limit.toLocaleString('tr-TR')} karakter
              </p>
            </div>
          )
        }}
      </CardState>
    </OverviewCard>
  )
}

/** Tailwind needs whole class names in the source, so the bar moves in 10 % steps. */
const WIDTHS = ['w-0', 'w-1/10', 'w-2/10', 'w-3/10', 'w-4/10', 'w-5/10', 'w-6/10', 'w-7/10', 'w-8/10', 'w-9/10', 'w-full'] as const
const widthClass = (percent: number): string => WIDTHS[Math.round(percent / 10)] ?? 'w-full'

function ChangelogCard() {
  const entries = latestEntries(CHANGELOG, 3)
  return (
    <section className="rounded-card border border-line/70 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-orange-soft text-brand-orange-ink">
            <Sparkles aria-hidden="true" className="size-[1.125rem]" />
          </span>
          <h2 className="text-base font-semibold text-ink">Son güncellemeler</h2>
        </div>
        <Link
          to="/guncellemeler"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green hover:text-brand-green-dark hover:underline"
        >
          Tümünü gör
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Henüz güncelleme notu yok.</p>
      ) : (
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {entries.map((entry) => (
            <li key={entry.date} className="rounded-lg bg-canvas p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-orange-ink">
                <time dateTime={entry.date}>{formatChangelogDate(entry.date)}</time>
              </p>
              <ul className="mt-2 space-y-1.5">
                {entry.items.slice(0, 3).map((item) => (
                  <li key={item} className="text-sm">
                    <Markdown>{item}</Markdown>
                  </li>
                ))}
              </ul>
              {entry.items.length > 3 && (
                <p className="mt-2 text-xs text-ink-muted">ve {entry.items.length - 3} madde daha</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
