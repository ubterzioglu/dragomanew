import { useState } from 'react'
import { Link } from 'react-router'
import { updateMedia } from '../../data/media/media'
import { isRecord } from '../../lib/content/docPath'
import { isEditableType, TYPE_CONFIG } from '../../lib/content/editorConfig'
import { contentErrorMessage } from '../../lib/content/messages'
import { parseMeta, statesByPointer, STATE_BADGES } from '../../lib/content/translationView'
import type { UsageEntry } from '../../lib/media/whereUsed'
import type { MediaAssetRow } from '../../lib/types'
import { markManualEdits, TARGET_LOCALES } from '../../shared/content/translation.ts'
import { TranslateControls } from '../content/TranslateControls'
import { Button, fieldClass, labelClass, Notice } from '../ui'

interface MediaCardProps {
  asset: MediaAssetRow
  thumbnail: string | null
  usedBy: readonly UsageEntry[]
  canEdit: boolean
  canTranslate: boolean
  onChanged: (message: string) => void
}

const LOCALES = ['tr', ...TARGET_LOCALES] as const

const altRecord = (alt: unknown): Record<string, string> =>
  isRecord(alt) ? Object.fromEntries(Object.entries(alt).filter((entry): entry is [string, string] => typeof entry[1] === 'string')) : {}

/** Alt text without empty languages (TR stays: the database requires it). */
const cleanAlt = (alt: Readonly<Record<string, string>>): Record<string, string> =>
  Object.fromEntries(LOCALES.flatMap((locale) => (locale === 'tr' || (alt[locale] ?? '').trim() !== '' ? [[locale, (alt[locale] ?? '').trim()]] : [])))

/**
 * One photo: alt text in four languages, topic and the required "kullanım hakkımız var" box.
 * Saved with the row's revision, like drafts; the translation doc is `{alt}` (meta path `/alt`).
 */
export function MediaCard({ asset, thumbnail, usedBy, canEdit, canTranslate, onChanged }: MediaCardProps) {
  const savedAlt = altRecord(asset.alt)
  const meta = parseMeta(asset.translation_meta)
  const [alt, setAlt] = useState<Record<string, string>>(savedAlt)
  const [topic, setTopic] = useState(asset.topic)
  const [confirmed, setConfirmed] = useState(asset.rights === 'confirmed')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextAlt = cleanAlt(alt)
  const dirty =
    JSON.stringify(nextAlt) !== JSON.stringify(cleanAlt(savedAlt)) || topic.trim() !== asset.topic || confirmed !== (asset.rights === 'confirmed')
  const states = statesByPointer({ alt: nextAlt }, meta).get('/alt') ?? {}
  const altMissing = (nextAlt.tr ?? '') === ''

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      const translationMeta = markManualEdits({ alt: savedAlt }, { alt: nextAlt }, meta, new Date().toISOString())
      await updateMedia(asset.id, asset.revision, {
        alt: nextAlt,
        topic: topic.trim(),
        rights: confirmed ? 'confirmed' : 'unverified',
        translation_meta: translationMeta,
      })
      onChanged(`${asset.id} kaydedildi.`)
    } catch (saveError) {
      setError(contentErrorMessage(saveError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="space-y-3 rounded-card border border-line bg-white p-4">
      {thumbnail ? (
        <img src={thumbnail} alt={savedAlt.tr ?? ''} loading="lazy" className="aspect-[3/2] w-full rounded-md bg-line object-cover" />
      ) : (
        <div className="flex aspect-[3/2] w-full items-center justify-center rounded-md bg-line text-sm text-ink-muted">Önizleme yok</div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <h2 className="font-semibold">{asset.id}</h2>
        <span className="text-ink-muted">
          {asset.width}×{asset.height} · {asset.storage === 'upload' ? 'yüklendi' : 'sitede'}
        </span>
        {asset.rights !== 'confirmed' && (
          <span className="rounded bg-brand-orange-soft px-2 py-0.5 text-xs font-semibold text-brand-orange-ink">hak onayı yok</span>
        )}
        {asset.placeholder && <span className="rounded bg-line px-2 py-0.5 text-xs font-semibold">yer tutucu</span>}
      </div>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
      >
        <fieldset disabled={!canEdit} className="space-y-3">
          <legend className="sr-only">{asset.id} bilgileri</legend>
          {LOCALES.map((locale) => {
            const state = locale === 'tr' ? undefined : states[locale]
            return (
              <label key={locale} className={labelClass}>
                Açıklama (alt metin) {locale.toUpperCase()}
                {state && state !== 'ok' && (
                  <span className="ml-2 rounded bg-brand-orange-soft px-2 py-0.5 text-xs font-semibold text-brand-orange-ink">{STATE_BADGES[state]}</span>
                )}
                <input
                  className={fieldClass}
                  aria-invalid={locale === 'tr' && altMissing}
                  value={alt[locale] ?? ''}
                  onChange={(event) => setAlt((current) => ({ ...current, [locale]: event.target.value }))}
                />
              </label>
            )
          })}
          <label className={labelClass}>
            Konu
            <input className={fieldClass} value={topic} onChange={(event) => setTopic(event.target.value)} />
          </label>
          <label className="flex items-start gap-2 text-sm font-medium">
            <input type="checkbox" className="mt-1" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            Kullanım hakkımız var (fotoğrafçı ya da Dragoman izin verdi)
          </label>
        </fieldset>
        {error && <Notice tone="error">{error}</Notice>}
        {canEdit && (
          <Button type="submit" variant="secondary" disabled={busy || !dirty || altMissing || topic.trim() === ''}>
            {busy ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        )}
      </form>

      {canTranslate && (
        <details>
          <summary className="cursor-pointer text-sm font-semibold">Açıklamayı DeepL ile çevir</summary>
          <div className="mt-2">
            <TranslateControls
              doc={{ alt: savedAlt }}
              meta={meta}
              revision={asset.revision}
              target={{ kind: 'media', id: asset.id }}
              dirty={dirty}
              onDone={onChanged}
            />
          </div>
        </details>
      )}

      <div className="text-sm">
        <p className="font-semibold">Nerede kullanılıyor</p>
        {usedBy.length === 0 ? (
          <p className="text-ink-muted">Hiçbir taslakta kullanılmıyor.</p>
        ) : (
          <ul className="list-disc pl-5">
            {usedBy.map((entry) => (
              <li key={entry.id}>
                {isEditableType(entry.type) ? (
                  <Link to={`/icerik/${entry.type}/${entry.id}`} className="underline">
                    {TYPE_CONFIG[entry.type].tab}: {entry.key}
                  </Link>
                ) : (
                  `${entry.type}: ${entry.key}`
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
