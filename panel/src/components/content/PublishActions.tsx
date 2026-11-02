import { useState } from 'react'
import { changeStatus, publishEntries } from '../../data/content/entries'
import type { DraftIssue } from '../../lib/content/draft'
import { contentErrorMessage, serverIssues, type ServerIssue } from '../../lib/content/messages'
import type { LocaleSummary } from '../../lib/content/translationView'
import type { ContentStatusValue } from '../../lib/types'
import { TARGET_LOCALES } from '../../shared/content/translation.ts'
import { Dialog } from '../Dialog'
import { Button, Notice } from '../ui'

interface PublishActionsProps {
  entryId: string
  revision: number
  status: ContentStatusValue
  issues: readonly DraftIssue[]
  summary: LocaleSummary
  dirty: boolean
  /** Types with a status column can be archived (events, posts, products). */
  canArchive: boolean
  canUnpublish: boolean
  onDone: (message: string) => void
}

type Pending = 'publish' | 'archive' | 'unpublish' | null

const LOCALE_NAMES = { en: 'İngilizce', fr: 'Fransızca', de: 'Almanca' } as const

const TITLES: Readonly<Record<Exclude<Pending, null>, string>> = {
  publish: 'Yayınla',
  archive: 'Arşivle',
  unpublish: 'Yayından kaldır',
}

/**
 * Yayınla publishes every language of the entry (no per-language approval, §2). It lists the
 * problems first: schema issues block it, missing or stale translations only warn (Q2: the
 * site shows Turkish with a note and keeps that page out of search).
 */
export function PublishActions(props: PublishActionsProps) {
  const { entryId, revision, status, issues, summary, dirty, canArchive, canUnpublish, onDone } = props
  const [pending, setPending] = useState<Pending>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromServer, setFromServer] = useState<ServerIssue[]>([])

  const gaps = TARGET_LOCALES.flatMap((locale) => {
    const { missing, stale } = summary[locale]
    const parts = [missing > 0 ? `${missing} eksik` : '', stale > 0 ? `${stale} güncellenmeli` : ''].filter(Boolean)
    return parts.length > 0 ? [`${LOCALE_NAMES[locale]}: ${parts.join(', ')}`] : []
  })

  const run = async () => {
    const action = pending
    if (!action) return
    setBusy(true)
    setError(null)
    setFromServer([])
    try {
      const result =
        action === 'publish' ? await publishEntries([{ id: entryId, draftRevision: revision }]) : await changeStatus(action, [entryId])
      setPending(null)
      const verb = action === 'publish' ? 'Yayınlandı' : action === 'archive' ? 'Arşivlendi' : 'Yayından kaldırıldı'
      onDone(`${verb} (yayın #${result.releaseId}). Site birkaç dakika içinde güncellenir; durumu Yayın sayfasında izleyin.`)
    } catch (actionError) {
      setError(contentErrorMessage(actionError))
      setFromServer(serverIssues(actionError))
    } finally {
      setBusy(false)
    }
  }

  const blocked = pending === 'publish' && (issues.length > 0 || dirty)

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setPending('publish')}>Yayınla</Button>
        {canArchive && status !== 'archived' && (
          <Button variant="secondary" onClick={() => setPending('archive')}>
            Arşivle
          </Button>
        )}
        {canUnpublish && status === 'published' && (
          <Button variant="danger" onClick={() => setPending('unpublish')}>
            Yayından kaldır
          </Button>
        )}
      </div>

      <Dialog open={pending !== null} title={pending ? TITLES[pending] : ''} onClose={() => setPending(null)}>
        <div className="space-y-4 text-sm">
          {pending === 'publish' && (
            <>
              {dirty && <Notice tone="error">Kaydedilmemiş değişiklikler var. Önce kaydedin; yayınlanan, kaydedilmiş taslaktır.</Notice>}
              {issues.length > 0 ? (
                <div>
                  <p className="font-semibold text-red-800">Yayını engelleyen sorunlar:</p>
                  <ul className="list-disc pl-5">
                    {issues.map((issue, index) => (
                      <li key={index}>
                        {issue.label}: {issue.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>İçerik geçerli. Tüm diller birlikte yayınlanır.</p>
              )}
              {gaps.length > 0 && (
                <div>
                  <p className="font-semibold">Çeviri durumu:</p>
                  <ul className="list-disc pl-5">
                    {gaps.map((gap) => (
                      <li key={gap}>{gap}</li>
                    ))}
                  </ul>
                  <p className="mt-1 text-ink-muted">
                    Eksik dillerde Türkçe metin kısa bir notla görünür ve o sayfa arama motorlarına kapalı kalır.
                  </p>
                </div>
              )}
            </>
          )}
          {pending === 'archive' && <p>Arşivlenen içerik sitede görünmez ve talep almaz. Silinmez; yeniden yayınlanabilir.</p>}
          {pending === 'unpublish' && <p>İçerik siteden kalkar, adresi 404 döner. Taslak korunur.</p>}
          {error && <Notice tone="error">{error}</Notice>}
          {fromServer.length > 0 && (
            <ul className="list-disc pl-5 text-red-800">
              {fromServer.map((issue, index) => (
                <li key={index}>
                  {issue.recordId && <strong>{issue.recordId}</strong>} {issue.path} {issue.message}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-3">
            <Button variant={pending === 'unpublish' ? 'danger' : 'primary'} onClick={() => void run()} disabled={busy || blocked}>
              {busy ? 'Gönderiliyor…' : pending ? TITLES[pending] : ''}
            </Button>
            <Button variant="secondary" onClick={() => setPending(null)}>
              Vazgeç
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
