/**
 * Stage A ships sample content only, which must never be indexed (V6 §4.8).
 * The flag defaults to false; nothing in Stage A sets it to true.
 */
export const isPublicRelease: boolean = import.meta.env.VITE_PUBLIC_RELEASE === 'true'

/** Copyright year, injected by vite.config.ts; tests (no define) use the current year. */
export const buildYear: number = Number(import.meta.env.VITE_BUILD_YEAR) || new Date().getFullYear()
