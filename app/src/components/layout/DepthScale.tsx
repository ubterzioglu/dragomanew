import { Waves } from 'lucide-react'
import { useRef } from 'react'
import { MAX_DIVE_DEPTH_M } from '../../lib/diveDepth'
import { lacksScrollTimelines, useDiveScroll } from './useDiveScroll'

/** Labelled depths on the scale, every 5 m down to the full depth. */
const MARKS = Array.from({ length: MAX_DIVE_DEPTH_M / 5 + 1 }, (_, index) => index * 5)

/** A tick every metre; the labelled ones are longer. */
const TICKS = Array.from({ length: MAX_DIVE_DEPTH_M + 1 }, (_, depth) => depth)

/**
 * Decorative depth scale on the left (UBT, 01.11.2026), drawn like a dive instrument: 0 m at the top
 * of the page, 30 m at the bottom, filling and with a needle sliding down as the page scrolls. Only
 * where the margin left of the text column can hold it (app.css); hidden from screen readers like
 * the gauge on the right.
 */
export function DepthScale() {
  const fill = useRef<HTMLSpanElement>(null)
  const runner = useRef<HTMLSpanElement>(null)
  // Scroll timelines move both in CSS; elsewhere script does, through the style object (CSSOM).
  useDiveScroll(
    lacksScrollTimelines()
      ? (progress) => {
          if (fill.current) fill.current.style.transform = `scaleY(${progress})`
          if (runner.current) runner.current.style.transform = `translateY(${progress * 100}%)`
        }
      : null,
  )

  return (
    <div aria-hidden="true" className="dive-scale">
      <Waves className="dive-scale-surface" />
      <div className="dive-scale-body">
        <span className="dive-scale-track">
          <span ref={fill} className="dive-scale-fill" />
        </span>
        {/* Stretched to the body's height; the strokes stay one pixel thick. */}
        <svg className="dive-scale-ticks" viewBox={`0 0 10 ${MAX_DIVE_DEPTH_M}`} preserveAspectRatio="none" overflow="visible">
          {TICKS.map((depth) => {
            const labelled = depth % 5 === 0
            return (
              <line
                key={depth}
                className={labelled ? 'dive-scale-tick-major' : undefined}
                x1="0"
                x2={labelled ? 10 : 5}
                y1={depth}
                y2={depth}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>
        <ol className="dive-scale-labels">
          {MARKS.map((depth) => (
            <li key={depth}>{depth}</li>
          ))}
        </ol>
        <span ref={runner} className="dive-scale-runner">
          <span className="dive-scale-marker" />
        </span>
      </div>
      <span className="dive-scale-unit">m</span>
    </div>
  )
}
