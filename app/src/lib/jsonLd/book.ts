import { absoluteUrl, type SocialImage } from '../socialImage'
import { imageObject, type JsonLdNode } from './graph'

export interface BookInput {
  path: string
  name: string
  description: string
  /** The edition line the page shows, e.g. "English edition". */
  edition: string
  image?: SocialImage
}

export const bookId = (path: string): string => `${absoluteUrl(path)}#book`

/**
 * No author (the content has none) and no inLanguage (the edition is free text, not a
 * language code). No Offer: shop prices are not confirmed (priceVerified: false).
 */
export function book(input: BookInput): JsonLdNode {
  return {
    '@type': 'Book',
    '@id': bookId(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    bookEdition: input.edition,
    ...(input.image ? { image: imageObject(input.image) } : {}),
  }
}
