import { absoluteUrl, type SocialImage } from '../socialImage'
import { imageObject, type JsonLdNode } from './graph'
import { ORGANIZATION_REF } from './organization'

export interface TripStop {
  name: string
  description: string
}

export interface TouristTripInput {
  path: string
  name: string
  description: string
  image?: SocialImage
  itinerary: readonly TripStop[]
}

export const touristTripId = (path: string): string => `${absoluteUrl(path)}#trip`

/**
 * No Offer: prices are unconfirmed (priceVerified / source prices, SEO-12) until the Wave 2
 * price approval. No Event either: trips run on request, without fixed dates.
 */
export function touristTrip(input: TouristTripInput): JsonLdNode {
  return {
    '@type': 'TouristTrip',
    '@id': touristTripId(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    ...(input.image ? { image: imageObject(input.image) } : {}),
    provider: ORGANIZATION_REF,
    ...(input.itinerary.length > 0
      ? {
          itinerary: {
            '@type': 'ItemList',
            numberOfItems: input.itinerary.length,
            itemListElement: input.itinerary.map((stop, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: stop.name,
              description: stop.description,
            })),
          },
        }
      : {}),
  }
}
