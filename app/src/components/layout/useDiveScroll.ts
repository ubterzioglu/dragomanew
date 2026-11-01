import { useEffect, useRef } from 'react'
import { scrollProgress } from '../../lib/diveDepth'

/** Browsers without scroll-driven animations (Firefox): the dive's scroll effects run from script there. */
export function lacksScrollTimelines(): boolean {
  return typeof CSS !== 'undefined' && !CSS.supports('animation-timeline: scroll()')
}

/**
 * Calls onProgress with the share of the page scrolled (0 at the top, 1 at the bottom), once per
 * frame at most: on scroll, on resize and when the page grows or shrinks without a scroll (an
 * opened FAQ, late images). Pass null to stay idle.
 */
export function useDiveScroll(onProgress: ((progress: number) => void) | null): void {
  const callback = useRef(onProgress)
  useEffect(() => {
    callback.current = onProgress
  })
  const active = onProgress !== null

  useEffect(() => {
    if (!active) return
    const root = document.documentElement
    let frame = 0
    // clientHeight, like the CSS scroll() range (innerHeight changes with mobile URL bars).
    const update = () => {
      frame = 0
      callback.current?.(scrollProgress(window.scrollY, root.scrollHeight - root.clientHeight))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const resizes = new ResizeObserver(schedule)
    update()
    resizes.observe(document.body)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      resizes.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [active])
}
