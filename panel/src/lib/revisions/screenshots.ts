/**
 * Screenshot rules for /revizyonlar. The revision-screenshots bucket enforces the type and size
 * itself (PNG, JPEG, WebP; 5 MiB); checking here first only spares a failed upload.
 */

export const SCREENSHOT_BUCKET = 'revision-screenshots'
export const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024
/** Per new request or comment; the database allows 10 per request or comment. */
export const MAX_SCREENSHOTS = 5

const EXTENSIONS: Readonly<Record<string, string>> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

/** The file input's accept list. */
export const SCREENSHOT_ACCEPT = Object.keys(EXTENSIONS).join(',')

export interface FileFacts {
  name: string
  type: string
  size: number
}

export function screenshotProblem(file: FileFacts): string | null {
  if (!EXTENSIONS[file.type.toLowerCase()]) return `${file.name}: yalnız PNG, JPEG ya da WebP ekran görüntüsü eklenebilir.`
  if (file.size === 0) return `${file.name}: dosya boş.`
  if (file.size > SCREENSHOT_MAX_BYTES) return `${file.name}: dosya 5 MB'tan büyük olamaz.`
  return null
}

export interface Picked<F extends FileFacts> {
  files: F[]
  problems: string[]
}

/** Adds the chosen files that pass the rules, up to MAX_SCREENSHOTS; says why the others did not. */
export function addScreenshots<F extends FileFacts>(current: readonly F[], chosen: readonly F[]): Picked<F> {
  const files = [...current]
  const problems: string[] = []
  for (const file of chosen) {
    const problem = screenshotProblem(file)
    if (problem) problems.push(problem)
    else if (files.length >= MAX_SCREENSHOTS) problems.push(`En fazla ${MAX_SCREENSHOTS} ekran görüntüsü eklenebilir; ${file.name} eklenmedi.`)
    else files.push(file)
  }
  return { files, problems }
}

/** 0,4 MB / 120 KB, for the list of chosen files. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} MB`
  return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('tr-TR')} KB`
}

/** `<request id>/<file id>.<png|jpg|webp>`, the path the bucket policy and the attachment row expect. */
export function screenshotPath(requestId: string, fileId: string, type: string): string {
  const extension = EXTENSIONS[type.toLowerCase()]
  if (!extension) throw new Error(`unsupported screenshot type ${type}`)
  return `${requestId}/${fileId}.${extension}`
}
