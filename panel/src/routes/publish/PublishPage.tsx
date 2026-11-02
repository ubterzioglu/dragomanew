import { useEffect, useMemo, useState } from 'react'
import { PageHeading } from '../../components/PageHeading'
import { useCan } from '../../components/Shell'
import { Button, Card, Loading, Notice } from '../../components/ui'
import { deeplUsage } from '../../data/content/entries'
import { fetchLiveRelease, listDeploys, listReleases, requestSiteDeploy } from '../../data/publish/publish'
import { listStaffDirectory } from '../../data/staff'
import { staffNamer } from '../../lib/activity'
import { contentErrorMessage } from '../../lib/content/messages'
import { bannerLevel } from '../../lib/content/translationView'
import { formatDateTime } from '../../lib/format'
import { DELAY_MESSAGE, deployView, formatCountdown, RELEASE_ACTION_LABELS, type DeployTone } from '../../lib/publish/deployState'
import { useAsyncData } from '../../lib/useAsyncData'

const loadPublish = () => Promise.all([listReleases(), listDeploys(), fetchLiveRelease(), listStaffDirectory()])

const TONES: Readonly<Record<DeployTone, string>> = {
  waiting: 'bg-line text-ink',
  running: 'bg-brand-orange-soft text-brand-orange-ink',
  done: 'bg-brand-green-soft text-brand-green-dark',
  failed: 'bg-red-50 text-red-900',
  skipped: 'bg-white text-ink-muted border border-line-strong',
}

const cell = 'border-b border-line px-3 py-2 text-left align-top'

/** A clock for countdowns; ticks only while something is queued. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [active])
  return now
}

/** /panel/yayin: releases, deploy rows, the live release, "Siteyi şimdi yeniden kur", DeepL usage (§9). */
export function PublishPage() {
  const allowed = useCan()
  if (!allowed('content.edit') && !allowed('content.publish') && !allowed('site.deploy')) {
    return (
      <div className="space-y-4">
        <PageHeading title="Yayın" />
        <Notice tone="info">Rolünüz yayın durumunu görmeyi kapsamıyor.</Notice>
      </div>
    )
  }
  return <Publish canDeploy={allowed('site.deploy')} canTranslate={allowed('content.translate')} />
}

function Publish({ canDeploy, canTranslate }: { canDeploy: boolean; canTranslate: boolean }) {
  const { state, reload } = useAsyncData('publish', loadPublish, contentErrorMessage)
  const [releases, deploys, live, people] = state.value ?? [[], [], null, []]
  const name = useMemo(() => staffNamer(people), [people])
  const now = useNow(deploys.some((row) => row.status === 'queued'))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const redeploy = async () => {
    setBusy(true)
    setMessage(null)
    try {
      await requestSiteDeploy()
      setMessage({ tone: 'success', text: 'Yeniden kurulum sıraya alındı.' })
      reload()
    } catch (error) {
      setMessage({ tone: 'error', text: contentErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading title="Yayın" />
        <div className="flex gap-2">
          {canDeploy && (
            <Button onClick={() => void redeploy()} disabled={busy}>
              {busy ? 'Gönderiliyor…' : 'Siteyi şimdi yeniden kur'}
            </Button>
          )}
          <Button variant="secondary" onClick={reload} disabled={state.status === 'loading'}>
            {state.status === 'loading' ? 'Yenileniyor…' : 'Yenile'}
          </Button>
        </div>
      </div>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
      {!state.value && state.status === 'loading' && <Loading label="Yayın durumu yükleniyor…" />}

      {state.value && (
        <>
          <Card className="space-y-1">
            <h2 className="text-lg font-semibold">Sitedeki yayın</h2>
            <p className="text-sm">
              {live
                ? `Yayın #${live.releaseId}${live.createdAt ? ` (${formatDateTime(live.createdAt)})` : ''}`
                : 'Site henüz bir yayından kurulmamış (örnek içerikle çalışıyor) ya da yayın bilgisi okunamadı.'}
            </p>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold">Kurulumlar</h2>
            {deploys.length === 0 ? (
              <p className="text-sm text-ink-muted">Henüz kurulum yok.</p>
            ) : (
              <ul className="space-y-2">
                {deploys.map((row) => {
                  const view = deployView(row, live?.releaseId ?? null, now)
                  return (
                    <li key={row.id} className="space-y-1 rounded-md border border-line px-3 py-2 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${TONES[view.tone]}`}>{view.label}</span>
                        <span>Yayın #{row.release_id ?? '—'}</span>
                        {view.countdown !== null && <span aria-live="off">{formatCountdown(view.countdown)} sonra gönderilecek</span>}
                        <span className="text-ink-muted">istendi {formatDateTime(row.first_requested_at)}</span>
                        {row.triggered_at && <span className="text-ink-muted">· tetiklendi {formatDateTime(row.triggered_at)}</span>}
                        {row.attempts > 1 && <span className="text-ink-muted">· {row.attempts}. deneme</span>}
                      </div>
                      {view.delayed && <Notice tone="error">{DELAY_MESSAGE}</Notice>}
                      {view.tone === 'failed' && <p className="text-red-800">Kurulum tetiklenemedi; otomatik olarak yeniden denenir. Sürerse UBT’ye haber verin.</p>}
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold">Son yayınlar</h2>
            {releases.length === 0 ? (
              <p className="text-sm text-ink-muted">Henüz yayın yok.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <caption className="sr-only">Son yayınlar</caption>
                  <thead>
                    <tr>
                      <th scope="col" className={cell}>No</th>
                      <th scope="col" className={cell}>İşlem</th>
                      <th scope="col" className={cell}>Kayıt</th>
                      <th scope="col" className={cell}>Kim, ne zaman</th>
                      <th scope="col" className={cell}>Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    {releases.map((row) => (
                      <tr key={row.id}>
                        <td className={cell}>#{row.id}</td>
                        <td className={cell}>{RELEASE_ACTION_LABELS[row.action] ?? row.action}</td>
                        <td className={cell}>{row.entry_ids?.length ?? 0}</td>
                        <td className={cell}>
                          {row.created_by ? name(row.created_by) : 'Sistem'} · {formatDateTime(row.created_at)}
                        </td>
                        <td className={cell}>{row.note ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {canTranslate && <DeeplUsageCard />}
    </div>
  )
}

function DeeplUsageCard() {
  const { state } = useAsyncData('deepl-usage', deeplUsage, contentErrorMessage)
  return (
    <Card className="space-y-1">
      <h2 className="text-lg font-semibold">DeepL kullanımı</h2>
      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
      {state.status === 'loading' && !state.value && <Loading label="DeepL kullanımı okunuyor…" />}
      {state.value && (
        <p className="text-sm">
          Bu dönem {state.value.count.toLocaleString('tr-TR')} / {state.value.limit.toLocaleString('tr-TR')} karakter (%
          {Math.floor(state.value.ratio * 100)}).{' '}
          {bannerLevel(state.value) === 'critical'
            ? 'Kota doldu.'
            : bannerLevel(state.value) === 'warn'
              ? 'Kotanın %80’i aşıldı.'
              : ''}
        </p>
      )}
    </Card>
  )
}
