import { Gauge } from 'lucide-react'
import { useState } from 'react'
import { diveDepth } from '../../lib/diveDepth'
import { useDiveScroll } from './useDiveScroll'

/**
 * Decorative dive-computer readout for the dive background (UBT, 01.11.2026): 0 m at the top of the
 * page, 30 m at the bottom. Hidden from screen readers; never takes clicks. On phones it sits above
 * the fixed action bar.
 */
export function DepthGauge() {
  const [depth, setDepth] = useState(0)
  useDiveScroll((progress) => setDepth(diveDepth(progress)))

  return (
    <div
      aria-hidden="true"
      className="dive-gauge pointer-events-none fixed right-3 bottom-24 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-sm font-semibold text-white tabular-nums md:right-6 md:bottom-6"
    >
      <Gauge className="size-4" />
      <span>{depth} m</span>
    </div>
  )
}
