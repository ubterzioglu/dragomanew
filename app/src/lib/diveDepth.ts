/** Depth the dive gauge shows at the bottom of the page (Kaş dives reach about 30 m). */
export const MAX_DIVE_DEPTH_M = 30

/** Whole metres "dived" at a scroll position: 0 at the top of the page, maxDepth at the bottom. */
export function diveDepth(scrollY: number, scrollable: number, maxDepth: number = MAX_DIVE_DEPTH_M): number {
  if (!(scrollable > 0) || !(scrollY > 0)) return 0
  return Math.round(Math.min(scrollY / scrollable, 1) * maxDepth)
}
