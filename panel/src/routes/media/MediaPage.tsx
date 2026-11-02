import { useMemo, useState } from 'react'
import { MediaCard } from '../../components/media/MediaCard'
import { UploadForm } from '../../components/media/UploadForm'
import { PageHeading } from '../../components/PageHeading'
import { useCan } from '../../components/Shell'
import { Button, fieldClass, labelClass, Loading, Notice } from '../../components/ui'
import { listDrafts } from '../../data/content/entries'
import { listMedia, repoThumbnail, signedUrls } from '../../data/media/media'
import { contentErrorMessage } from '../../lib/content/messages'
import { mediaUsage } from '../../lib/media/whereUsed'
import { CONTENT_TYPES } from '../../shared/content/schema.ts'
import { useAsyncData } from '../../lib/useAsyncData'

async function loadLibrary() {
  const [media, drafts] = await Promise.all([listMedia(), listDrafts(CONTENT_TYPES)])
  const urls = await signedUrls(media.flatMap((item) => (item.storage === 'upload' && item.object_path ? [item.object_path] : [])))
  return { media, urls, usage: mediaUsage(drafts) }
}

const fold = (text: string): string => text.toLocaleLowerCase('tr-TR')

/** /panel/medya: grid, alt text in four languages, topic, rights box, where used, upload (§9). */
export function MediaPage() {
  const allowed = useCan()
  if (!allowed('content.edit') && !allowed('content.publish')) {
    return (
      <div className="space-y-4">
        <PageHeading title="Medya" />
        <Notice tone="info">Rolünüz medya kitaplığını kapsamıyor.</Notice>
      </div>
    )
  }
  return <Library canEdit={allowed('content.edit')} canTranslate={allowed('content.translate')} />
}

function Library({ canEdit, canTranslate }: { canEdit: boolean; canTranslate: boolean }) {
  const { state, reload } = useAsyncData('media-library', loadLibrary, contentErrorMessage)
  const [search, setSearch] = useState('')
  const [onlyUnconfirmed, setOnlyUnconfirmed] = useState(false)
  const [announcement, setAnnouncement] = useState<string | null>(null)

  const value = state.value
  const visible = useMemo(() => {
    if (!value) return []
    const needle = fold(search.trim())
    return value.media.filter(
      (item) =>
        (!onlyUnconfirmed || item.rights !== 'confirmed') &&
        (needle === '' || fold(item.id).includes(needle) || fold(item.topic).includes(needle) || fold(JSON.stringify(item.alt)).includes(needle)),
    )
  }, [value, search, onlyUnconfirmed])

  const changed = (message: string) => {
    setAnnouncement(message)
    reload()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading title="Medya" />
        <Button variant="secondary" onClick={reload} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Yenileniyor…' : 'Listeyi yenile'}
        </Button>
      </div>
      <p className="max-w-3xl text-sm text-ink-muted">
        Fotoğraf değişiklikleri bir sonraki yayınla siteye gider. Fotoğraf silme Dalga 2’de yok.
      </p>
      {announcement && <Notice tone="success">{announcement}</Notice>}
      {canEdit && value && <UploadForm takenIds={value.media.map((item) => item.id)} onUploaded={changed} />}

      <div className="flex flex-wrap items-end gap-4">
        <label className={`${labelClass} w-full max-w-sm`}>
          Ara (kısa ad, konu, açıklama)
          <input type="search" className={fieldClass} value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyUnconfirmed} onChange={(event) => setOnlyUnconfirmed(event.target.checked)} />
          Yalnız kullanım hakkı onaylanmamışlar
        </label>
      </div>

      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
      {!value && state.status === 'loading' && <Loading label="Fotoğraflar yükleniyor…" />}
      {value && visible.length === 0 && <Notice tone="info">Fotoğraf bulunamadı.</Notice>}
      {value && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <li key={`${item.id}:${item.revision}`}>
              <MediaCard
                asset={item}
                thumbnail={item.storage === 'upload' && item.object_path ? (value.urls[item.object_path] ?? null) : repoThumbnail(item.id)}
                usedBy={value.usage.get(item.id) ?? []}
                canEdit={canEdit}
                canTranslate={canTranslate}
                onChanged={changed}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
