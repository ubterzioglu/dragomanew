import { ConflictError } from '../../lib/content/messages'
import {
  checkDimensions,
  hex,
  JPEG_QUALITY,
  MEDIA_BUCKET,
  objectPath,
  targetSize,
} from '../../lib/media/upload'
import type { TranslationMeta } from '../../shared/content/translation.ts'
import { db } from '../../lib/supabase'
import type { MediaAssetRow } from '../../lib/types'

/**
 * The media library (§5 media_assets, bucket media-originals). Uploads are re-encoded in the
 * browser to a JPEG master (no EXIF/GPS survives a canvas), hashed, stored under `<id>/<sha>.jpg`,
 * and only then is the row written. There is no delete in Dalga 2.
 */

const COLUMNS =
  'id, storage, object_path, sha256, widths, width, height, bytes, alt, topic, rights, placeholder, translation_meta, revision, updated_at'

export async function listMedia(): Promise<MediaAssetRow[]> {
  const { data, error } = await db().from('media_assets').select(COLUMNS).order('id', { ascending: true })
  if (error) throw error
  return (data ?? []) as MediaAssetRow[]
}

/** Signed thumbnails for uploads (private bucket), keyed by object path; one hour is plenty for a screen. */
export async function signedUrls(paths: readonly string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {}
  const { data, error } = await db().storage.from(MEDIA_BUCKET).createSignedUrls([...paths], 3600)
  if (error) throw error
  return Object.fromEntries((data ?? []).flatMap((item) => (item.path && item.signedUrl ? [[item.path, item.signedUrl]] : [])))
}

/** Repo media are served by the site itself. */
export const repoThumbnail = (id: string): string => `/media/${id}-480.webp`

export interface MediaPatch {
  alt: Readonly<Record<string, string>>
  topic: string
  rights: 'unverified' | 'confirmed'
  translation_meta: TranslationMeta
}

/** Optimistic like drafts: the trigger bumps `revision`, which translate-content also checks. */
export async function updateMedia(id: string, revision: number, patch: MediaPatch): Promise<number> {
  const { data, error } = await db()
    .from('media_assets')
    .update(patch)
    .eq('id', id)
    .eq('revision', revision)
    .select('revision')
  if (error) throw error
  const row = (data ?? [])[0] as { revision?: unknown } | undefined
  if (!row || typeof row.revision !== 'number') throw new ConflictError()
  return row.revision
}

export interface PreparedImage {
  blob: Blob
  width: number
  height: number
  sha256: string
  warnings: string[]
}

/** Thrown with a Turkish message the upload form shows as it is. */
export class UploadRefused extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadRefused'
  }
}

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new UploadRefused('Fotoğraf JPEG’e çevrilemedi.'))), 'image/jpeg', JPEG_QUALITY)
  })
}

/** Decode (EXIF orientation applied) → size rules → canvas JPEG 0.9, long edge ≤3000 → sha256. */
export async function prepareImage(file: File): Promise<PreparedImage> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new UploadRefused('Bu dosya tarayıcıda açılamadı. HEIC ise telefondan JPEG olarak paylaşıp tekrar deneyin.')
  }
  try {
    const check = checkDimensions(bitmap.width, bitmap.height)
    if (check.error) throw new UploadRefused(check.error)
    const size = targetSize(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const context = canvas.getContext('2d')
    if (!context) throw new UploadRefused('Tarayıcı fotoğrafı işleyemedi.')
    context.drawImage(bitmap, 0, 0, size.width, size.height)
    const blob = await toJpeg(canvas)
    const sha256 = hex(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()))
    return { blob, ...size, sha256, warnings: check.warnings }
  } finally {
    bitmap.close()
  }
}

export interface NewUpload {
  id: string
  image: PreparedImage
  altTr: string
  topic: string
}

/** Stores the master, then writes the row; rights are confirmed by the required box on the form. */
export async function uploadMedia({ id, image, altTr, topic }: NewUpload): Promise<void> {
  const path = objectPath(id, image.sha256)
  const { error: storageError } = await db()
    .storage.from(MEDIA_BUCKET)
    .upload(path, image.blob, { contentType: 'image/jpeg', upsert: false })
  // The same bytes uploaded again already sit at their content address.
  if (storageError && !/exists|duplicate/i.test(storageError.message)) throw storageError
  const file = { object_path: path, sha256: image.sha256, width: image.width, height: image.height, bytes: image.blob.size }
  const { error } = await db()
    .from('media_assets')
    .insert({ id, storage: 'upload', ...file, alt: { tr: altTr }, topic, rights: 'confirmed', placeholder: false, translation_meta: {} })
  if (error) throw error
}
