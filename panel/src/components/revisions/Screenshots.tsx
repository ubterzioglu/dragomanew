import type { RevisionAttachment } from '../../lib/revisions/model'

interface ScreenshotsProps {
  attachments: readonly RevisionAttachment[]
  /** Signed addresses by object path; undefined while they load. */
  urls: Readonly<Record<string, string>> | undefined
  /** Signing failed: the tiles say so instead of loading forever. */
  failed: boolean
  /** Names the list for screen readers ("İsteğin ekran görüntüleri"). */
  label: string
}

const TILE = 'h-24 w-36 rounded-md border border-line bg-canvas'

/** Thumbnails of private screenshots; each opens full size (a signed address, valid for ten minutes). */
export function Screenshots({ attachments, urls, failed, label }: ScreenshotsProps) {
  if (attachments.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-3" aria-label={label}>
      {attachments.map((attachment, index) => {
        const url = urls?.[attachment.object_path]
        const name = `Ekran görüntüsü ${index + 1}`
        return (
          <li key={attachment.id}>
            {url ? (
              <a href={url} target="_blank" rel="noreferrer" className="block">
                <img src={url} alt={`${name} (tam boyutta açılır)`} loading="lazy" className={`${TILE} object-cover`} />
              </a>
            ) : (
              <div className={`${TILE} flex items-center justify-center px-2 text-center text-xs text-ink-muted`}>
                {failed || urls ? `${name} açılamadı` : 'Yükleniyor…'}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
