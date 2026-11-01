/** Must match the bubbles and fish styled one by one (nth-child) in app.css. */
const BUBBLE_COUNT = 20
const FISH_COUNT = 6

/** A fish facing left; app.css mirrors the ones that swim right. */
function FishShape() {
  return (
    <svg viewBox="0 0 64 32" fill="currentColor" fillRule="evenodd">
      <path d="M2 16C12 4 34 2 48 13L62 4 57 16l5 12-14-9C34 30 12 28 2 16Zm11-3a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z" />
    </svg>
  )
}

/**
 * Decorative page background (UBT, 01.11.2026): the water turns from white to turquoise while
 * scrolling down, with light from the surface, plankton, rising bubbles and fish (all styled in app.css).
 */
export function DiveBackground() {
  return (
    <div className="dive-bg" aria-hidden="true">
      <div className="dive-water" />
      <div className="dive-shade" />
      <div className="dive-bubbles">
        {Array.from({ length: BUBBLE_COUNT }, (_, index) => (
          <span key={index} className="dive-bubble" />
        ))}
      </div>
      <div className="dive-school">
        {Array.from({ length: FISH_COUNT }, (_, index) => (
          <span key={index} className="dive-fish">
            <FishShape />
          </span>
        ))}
      </div>
    </div>
  )
}
