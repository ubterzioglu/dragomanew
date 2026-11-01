import { useRef, type ComponentType } from 'react'
import { DIVE_ZONES, WATER_LAYERS, waterLayerOpacity, zoneOpacity, type DiveZone, type WaterLayer } from '../../lib/diveDepth'
import { Barracuda, FishSchool, Grouper, Jellyfish, Moray, Octopus, Ray, SmallFish, Turtle } from './DiveCreatures'
import { lacksScrollTimelines, useDiveScroll } from './useDiveScroll'

/** Must match the bubbles styled one by one (nth-child) in app.css. */
const BUBBLE_COUNT = 30

interface Swimmer {
  Shape: ComponentType
  /** fish: tail wiggle · glider: slow tilt (turtle, ray) · drifter: drifts and pulses (jellyfish, octopus). */
  kind: 'fish' | 'glider' | 'drifter'
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
    { Shape: Jellyfish, kind: 'drifter' },
    { Shape: FishSchool, kind: 'fish', right: true },
    { Shape: Jellyfish, kind: 'drifter', phoneHidden: true },
  ],
  mid: [
    { Shape: Turtle, kind: 'glider', right: true },
    { Shape: Barracuda, kind: 'fish', phoneHidden: true },
    { Shape: SmallFish, kind: 'fish', right: true },
    { Shape: Octopus, kind: 'drifter' },
    { Shape: FishSchool, kind: 'fish', phoneHidden: true },
  ],
  deep: [
    { Shape: Grouper, kind: 'fish' },
    { Shape: Ray, kind: 'glider', right: true },
    { Shape: Barracuda, kind: 'fish', right: true, phoneHidden: true },
    { Shape: Moray, kind: 'fish' },
    { Shape: Grouper, kind: 'fish', right: true, phoneHidden: true },
  ],
}

/** Opacity and visibility through the style object (CSSOM), which the page policy allows. */
function show(element: HTMLElement | null | undefined, opacity: number): void {
  if (!element) return
  element.style.opacity = String(opacity)
  element.style.visibility = opacity > 0 ? 'visible' : 'hidden'
}

/**
 * Decorative page background (UBT, 01.11.2026): the water darkens from white through turquoise and
 * blue to navy while scrolling down, with light from the surface, plankton, rising bubbles and the
 * sea life of each depth. A light veil behind the text column keeps the text readable on dark water.
 * All styled in app.css; the server renders no style attribute.
 */
export function DiveBackground() {
  const water = useRef<Partial<Record<WaterLayer, HTMLDivElement | null>>>({})
  const zones = useRef<Partial<Record<DiveZone, HTMLDivElement | null>>>({})
  const shade = useRef<HTMLDivElement>(null)
  useDiveScroll(
    lacksScrollTimelines()
      ? (progress) => {
          for (const layer of WATER_LAYERS) show(water.current[layer], waterLayerOpacity(layer, progress))
          for (const zone of DIVE_ZONES) show(zones.current[zone], zoneOpacity(zone, progress))
          show(shade.current, progress)
        }
      : null,
  )

  return (
    <div className="dive-bg" aria-hidden="true">
      {WATER_LAYERS.map((layer) => (
        <div
          key={layer}
          ref={(element) => {
            water.current[layer] = element
          }}
          className={`dive-water dive-water--${layer}`}
        />
      ))}
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
      <div className="dive-veil" />
    </div>
  )
}
