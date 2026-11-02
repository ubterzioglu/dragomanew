const SVG_PREFIX = /^data:image\/svg\+xml;[^,]*,/

/**
 * Supabase returns the TOTP QR code as an SVG, either raw or as a data URI with the markup left
 * unencoded (a `#` in it would cut the URI short). Re-encode it so the <img> always renders, and
 * no third-party QR service ever sees the secret.
 */
export function qrImageSrc(qr: string): string {
  const trimmed = qr.trim()
  if (trimmed.startsWith('<')) return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`
  const match = SVG_PREFIX.exec(trimmed)
  if (match) {
    const body = trimmed.slice(match[0].length)
    if (body.startsWith('<')) return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(body)}`
  }
  return trimmed
}
