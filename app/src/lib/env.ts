/**
 * Stage A ships sample content only, which must never be indexed (V6 §4.8).
 * The flag defaults to false; nothing in Stage A sets it to true.
 */
export const isPublicRelease: boolean = import.meta.env.VITE_PUBLIC_RELEASE === 'true'

/** Copyright year, injected by vite.config.ts; tests (no define) use the current year. */
export const buildYear: number = Number(import.meta.env.VITE_BUILD_YEAR) || new Date().getFullYear()

/**
 * GA4 measurement id (VITE_GA4_ID); empty while analytics is off, as in Stage A. vite.config.ts
 * validates it (analytics/ga4Id.ts) and writes it in as a constant, so an empty one leaves the
 * analytics code out of the bundle.
 */
export const ga4Id: string = (import.meta.env.VITE_GA4_ID as string | undefined) ?? ''
