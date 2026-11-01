import { useRef, type ComponentType } from 'react'
import { DIVE_ZONES, waterOpacity, zoneOpacity, type DiveZone } from '../../lib/diveDepth'
import { Barracuda, Grouper, Jellyfish, Ray, SmallFish, Turtle } from './DiveCreatures'
import { useDiveScroll } from './useDiveScroll'

/** Must match the bubbles styled one by one (nth-child) in app.css. */
const BUBBLE_COUNT = 20

interface Swimmer {
  Shape: ComponentType
  /** fish: tail wiggle · glider: slow tilt (turtle, ray) · jelly: drifts and pulses. */
  kind: 'fish' | 'glider' | 'jelly'
  right?: boolean
  /** Left out on phones, which get a smaller cast. */
  phoneHidden?: boolean
}

/** Sea life by depth (UBT, 01.11.2026); app.css places each one (nth-child within its zone). */
const ZONE_SWIMMERS: Record<DiveZone, readonly Swimmer[]> = {
  shallow: [
    { Shape: SmallFish, kind: 'fish' },
    { Shape: SmallFish, kind: 'fish', phoneHidden: true },
    { Shape: SmallFish, kind: 'fish', right: true },
    { Shape: SmallFish, kind: 'fish', right: true, phoneHidden: true },
    { Shape: Jellyfish, kind: 'jelly' },
  ],
  mid: [
    { Shape: Turtle, kind: 'glider', right: true },
    { Shape: Barracuda, kind: 'fish', phoneHidden: true },
    { Shape: SmallFish, kind: 'fish', right: true },
  ],
  deep: [
    { Shape: Grouper, kind: 'fish' },
    { Shape: Ray, kind: 'glider', right: true },
    { Shape: Barracuda, kind: 'fish', right: true, phoneHidden: true },
  ],
}

/** Browsers without scroll-driven animations (Firefox): the water and the zones follow the scroll from script. */
function lacksScrollTimelines(): boolean {
  return typeof CSS !== 'undefined' && !CSS.supports('animation-timeline: scroll()')
}

/**
 * Decorative page background (UBT, 01.11.2026): the water turns from white to turquoise while
 * scrolling down, with light from the surface, plankton, rising bubbles and the sea life of each
 * depth (all styled in app.css).
 */
export function DiveBackground() {
  const water = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const zones = useRef<Partial<Record<DiveZone, HTMLDivElement | null>>>({})
  // Opacity through the style object (CSSOM), which the page policy allows; the server renders no style.
  useDiveScroll(
    lacksScrollTimelines()
      ? (progress) => {
          if (water.current) water.current.style.opacity = String(waterOpacity(progress))
          if (shade.current) shade.current.style.opacity = String(progress)
          for (const zone of DIVE_ZONES) {
            const element = zones.current[zone]
            if (!element) continue
            const shown = zoneOpacity(zone, progress)
            element.style.opacity = String(shown)
            element.style.visibility = shown > 0 ? 'visible' : 'hidden'
          }
        }
      : null,
  )

  return (
    <div className="dive-bg" aria-hidden="true">
      <div ref={water} className="dive-water" />
      <div ref={shade} className="dive-shade" />
      <div className="dive-bubbles">
        {Array.from({ length: BUBBLE_COUNT }, (_, index) => (
          <span key={index} className="dive-bubble" />
        ))}
      </div>
      <div className="dive-school">
        {DIVE_ZONES.map((zone) => (
          <div
            key={zone}
            ref={(element) => {
              zones.current[zone] = element
            }}
            className={`dive-zone dive-zone--${zone}`}
          >
            {ZONE_SWIMMERS[zone].map(({ Shape, kind, right, phoneHidden }, index) => (
              <span
                key={index}
                className={[
                  'dive-swimmer',
                  `dive-swimmer--${kind}`,
                  right && 'dive-swimmer--right',
                  phoneHidden && 'dive-swimmer--phone-hidden',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Shape />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
