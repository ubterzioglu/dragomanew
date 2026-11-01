import { Gauge } from 'lucide-react'
import { useEffect, useState } from 'react'
import { diveDepth } from '../../lib/diveDepth'

/**
 * Decorative dive-computer readout for the dive background (UBT, 01.11.2026): 0 m at the top of the
 * page, 30 m at the bottom. Hidden from screen readers; never takes clicks. On phones it sits above
 * the fixed action bar.
 */
export function DepthGauge() {
  const [depth, setDepth] = useState(0)

  useEffect(() => {
    const root = document.documentElement
    let frame = 0
    // clientHeight, like the CSS scroll() range the water colour follows (innerHeight changes with mobile URL bars).
    const update = () => {
      frame = 0
      setDepth(diveDepth(window.scrollY, root.scrollHeight - root.clientHeight))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    // The page also grows or shrinks without a scroll: an opened FAQ, late images, another route.
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
  }, [])

  return (
    <div
      aria-hidden="true"
      className="dive-gauge pointer-events-none fixed right-3 bottom-24 z-20 flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1.5 font-display text-sm font-semibold text-white tabular-nums shadow-md md:right-6 md:bottom-6"
    >
      <Gauge className="size-4" />
      <span>{depth} m</span>
    </div>
  )
}
