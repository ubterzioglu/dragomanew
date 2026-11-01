/** Depth the dive gauge shows at the bottom of the page (Kaş dives reach about 30 m). */
export const MAX_DIVE_DEPTH_M = 30

/** The dive-deeper keyframes in app.css: the water's opacity at 15 % of the page. Keep both in step. */
const WATER_STOP = 0.15
const WATER_AT_STOP = 0.43

/** Share of the page scrolled: 0 at the top, 1 at the bottom, 0 on a page that does not scroll. */
export function scrollProgress(scrollY: number, scrollable: number): number {
  if (!(scrollable > 0) || !(scrollY > 0)) return 0
  return Math.min(scrollY / scrollable, 1)
}

/** Whole metres "dived" at a scroll progress: 0 at the top of the page, maxDepth at the bottom. */
export function diveDepth(progress: number, maxDepth: number = MAX_DIVE_DEPTH_M): number {
  return Math.round(Math.min(Math.max(progress, 0), 1) * maxDepth)
}

/** Depth bands of the dive background, each with its own sea life. */
export type DiveZone = 'shallow' | 'mid' | 'deep'
export const DIVE_ZONES: readonly DiveZone[] = ['shallow', 'mid', 'deep']

interface ZoneFade {
  /** Scroll progress where the zone's animation range starts and ends. */
  start: number
  end: number
  /** Share of that range spent fading in at its start and out at its end; 0 keeps the zone shown past that edge. */
  fadeIn: number
  fadeOut: number
}

/** app.css gives the same numbers as animation ranges and zone-* keyframes. Keep both in step. */
const ZONE_FADES: Record<DiveZone, ZoneFade> = {
  shallow: { start: 0, end: 0.45, fadeIn: 0, fadeOut: 0.3 },
  mid: { start: 0.25, end: 0.8, fadeIn: 0.25, fadeOut: 0.25 },
  deep: { start: 0.6, end: 1, fadeIn: 0.4, fadeOut: 0 },
}

/** Opacity of a zone's animals at a scroll progress: the shallow ones near the top, the deep ones at the bottom. */
export function zoneOpacity(zone: DiveZone, progress: number): number {
  const { start, end, fadeIn, fadeOut } = ZONE_FADES[zone]
  const t = (progress - start) / (end - start)
  if (t < fadeIn) return t <= 0 ? (fadeIn > 0 ? 0 : 1) : t / fadeIn
  if (t > 1 - fadeOut) return t >= 1 ? (fadeOut > 0 ? 0 : 1) : (1 - t) / fadeOut
  return 1
}

/** Opacity of the turquoise water at a scroll progress, as the CSS keyframes give it where scroll timelines exist. */
export function waterOpacity(progress: number): number {
  const p = Math.min(Math.max(progress, 0), 1)
  if (p <= WATER_STOP) return (p / WATER_STOP) * WATER_AT_STOP
  return WATER_AT_STOP + ((p - WATER_STOP) / (1 - WATER_STOP)) * (1 - WATER_AT_STOP)
}
