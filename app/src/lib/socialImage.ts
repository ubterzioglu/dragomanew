import { pick } from '../content/localize'
import type { MediaAsset } from '../content/schema'
import type { Locale } from '../i18n/locales'
import { siteConfig } from './siteConfig'

/** An image as social cards and JSON-LD need it: absolute URL plus its real pixel size. */
export interface SocialImage {
  url: string
  width: number
  height: number
  alt: string
}

export const absoluteUrl = (path: string): string => `${siteConfig.origin}${path}`

/**
 * The page's own photo (the JPEG Picture serves as its largest fallback), or the brand share image.
 * Placeholder photos are stand-ins, never a page's public face.
 */
export function socialImage(asset: MediaAsset | null | undefined, locale: Locale): SocialImage {
  if (asset && !asset.placeholder) {
    const largest = asset.widths[asset.widths.length - 1] ?? asset.width
    return {
      url: absoluteUrl(`/media/${asset.id}-${largest}.jpg`),
      width: largest,
      height: Math.round((largest * asset.height) / asset.width),
      alt: pick(asset.alt, locale).value,
    }
  }
  const { shareImage } = siteConfig.brand
  return { url: absoluteUrl(shareImage.path), width: shareImage.width, height: shareImage.height, alt: siteConfig.business.name }
}
