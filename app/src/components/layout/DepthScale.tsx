import { useRef } from 'react'
import { MAX_DIVE_DEPTH_M } from '../../lib/diveDepth'
import { lacksScrollTimelines, useDiveScroll } from './useDiveScroll'

/** Labelled depths on the scale, every 5 m down to the full depth. */
const MARKS = Array.from({ length: MAX_DIVE_DEPTH_M / 5 + 1 }, (_, index) => index * 5)

/**
 * Decorative depth scale on the left (UBT, 01.11.2026): 0 m at the top of the page, 30 m at the
 * bottom, filling and with a marker sliding down as the page scrolls. Only where the margin left of
 * the text column can hold it (app.css); hidden from screen readers like the gauge on the right.
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
      <span className="dive-scale-track">
        <span ref={fill} className="dive-scale-fill" />
        <span ref={runner} className="dive-scale-runner">
          <span className="dive-scale-marker" />
        </span>
      </span>
      <ol className="dive-scale-labels">
        {MARKS.map((depth) => (
          <li key={depth}>{depth}</li>
        ))}
      </ol>
      <span className="dive-scale-unit">m</span>
    </div>
  )
}
