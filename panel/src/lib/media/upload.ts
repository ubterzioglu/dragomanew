/**
 * Browser upload rules for /panel/medya (dalga2-sozlesme §9). Pure so they are unit tested; the
 * canvas, createImageBitmap and crypto calls live in data/media.
 */

export const MAX_UPLOAD_BYTES = 40 * 1024 * 1024
export const MIN_LONG_EDGE = 800
export const GOOD_LONG_EDGE = 1920
export const MAX_LONG_EDGE = 3000
export const JPEG_QUALITY = 0.9
export const MIN_ASPECT = 0.5
export const MAX_ASPECT = 2.5
export const MEDIA_BUCKET = 'media-originals'

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'])
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp|avif|heic|heif)$/i

/** The file input's accept list. */
export const ACCEPT_ATTRIBUTE = 'image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif'

export interface FileFacts {
  name: string
  type: string
  size: number
}

/** A refusal message before decoding, or null when the file may be tried. */
export function fileProblem(file: FileFacts): string | null {
  // Some browsers report HEIC with an empty type, so the extension also counts.
  if (!ACCEPTED_TYPES.has(file.type.toLowerCase()) && !ACCEPTED_EXTENSIONS.test(file.name)) {
    return 'Yalnız JPEG, PNG, WebP, AVIF ya da HEIC fotoğraf yüklenebilir.'
  }
  if (file.size > MAX_UPLOAD_BYTES) return 'Dosya 40 MB’tan büyük olamaz.'
  if (file.size === 0) return 'Dosya boş.'
  return null
}

export interface DimensionCheck {
  /** Refused: the upload stops. */
  error: string | null
  /** Allowed, but the person should know. */
  warnings: string[]
}

export function checkDimensions(width: number, height: number): DimensionCheck {
  const longEdge = Math.max(width, height)
  if (longEdge < MIN_LONG_EDGE) {
    return { error: `Fotoğraf çok küçük (${width}×${height}). Uzun kenar en az ${MIN_LONG_EDGE} piksel olmalı.`, warnings: [] }
  }
  const warnings: string[] = []
  if (longEdge < GOOD_LONG_EDGE) warnings.push(`Uzun kenar ${longEdge} piksel; büyük ekranlarda bulanık görünebilir (önerilen en az ${GOOD_LONG_EDGE}).`)
  const aspect = width / height
  if (aspect < MIN_ASPECT || aspect > MAX_ASPECT) warnings.push('Fotoğraf çok uzun ya da çok dar; sayfalarda kırpılabilir.')
  return { error: null, warnings }
}

/** The JPEG master's size: long edge at most 3000 px, never enlarged. */
export function targetSize(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(1, MAX_LONG_EDGE / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

/** `media-originals/<id>/<sha>.jpg`, matching the bucket policy and `object_path` check. */
export function objectPath(id: string, sha256: string): string {
  return `${id}/${sha256}.jpg`
}

export function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const MEDIA_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const isMediaId = (value: string): boolean => MEDIA_ID.test(value) && value.length <= 80

/** A free id: `base`, or `base-2`, `base-3`… when taken. */
export function uniqueId(base: string, taken: ReadonlySet<string>): string {
  const root = base || 'foto'
  if (!taken.has(root)) return root
  let n = 2
  while (taken.has(`${root}-${n}`)) n += 1
  return `${root}-${n}`
}
