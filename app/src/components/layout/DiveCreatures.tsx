// Silhouettes for the dive background, solid currentColor, facing left; app.css mirrors the ones
// that swim right and fades each animal as a whole, so parts that overlap never darken. Parts are
// separate paths: inside one path, overlapping parts drawn the other way round would leave holes.
// The divers' limbs are thick round-capped strokes: bolder than outlines at the 7–9rem they get.

/** The small fish's outline, also used for the shoal. */
const SMALL_FISH = 'M2 16C12 4 34 2 48 13L62 4 57 16l5 12-14-9C34 30 12 28 2 16Z'

export function SmallFish() {
  return (
    <svg viewBox="0 0 64 32" fill="currentColor" fillRule="evenodd">
      <path d={`${SMALL_FISH}m11-3a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z`} />
    </svg>
  )
}

/** A shoal of five small fish swimming together. */
export function FishSchool() {
  return (
    <svg viewBox="0 0 160 90" fill="currentColor">
      <path d={SMALL_FISH} transform="translate(0 20) scale(0.8)" />
      <path d={SMALL_FISH} transform="translate(46 0) scale(0.7)" />
      <path d={SMALL_FISH} transform="translate(56 44) scale(0.75)" />
      <path d={SMALL_FISH} transform="translate(104 18) scale(0.65)" />
      <path d={SMALL_FISH} transform="translate(100 62) scale(0.6)" />
    </svg>
  )
}

/** Octopus: a round head and six curling arms. */
export function Octopus() {
  return (
    <svg viewBox="0 0 48 56" fill="currentColor">
      <path d="M24 2c9 0 15 7 15 15 0 6-3 10-6 12H15c-3-2-6-6-6-12C9 9 15 2 24 2Z" />
      <path d="M16 27c-2 8-7 14-13 15 1 2 4 2 7 0 4-3 7-8 8-14Z" />
      <path d="M19 28c-1 9-3 16-8 22 2 1 5-1 7-4 3-5 4-11 4-18Z" />
      <path d="M22 29c0 9 0 17-3 24 2 0 4-2 5-5 1-6 1-12 1-19Z" />
      <path d="M26 29c0 7 0 13 1 19 1 3 3 5 5 5-3-7-3-15-3-24Z" />
      <path d="M29 28c0 7 1 13 4 18 2 3 5 5 7 4-5-6-7-13-8-22Z" />
      <path d="M32 27c1 6 4 11 8 14 3 2 6 2 7 0-6-1-11-7-13-15Z" />
    </svg>
  )
}

/** Moray eel: a long body in waves. */
export function Moray() {
  return (
    <svg viewBox="0 0 120 26" fill="currentColor" fillRule="evenodd">
      <path d="M2 13C6 7 12 6 18 7c10 2 16-4 26-4s16 7 26 7 16-6 26-5c8 1 14 3 22 2v4c-8 2-14 1-22 0s-16 7-26 7-16-7-26-7-16 6-26 6c-6 0-12 0-16-4Zm7-3a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0Z" />
    </svg>
  )
}

/** Long and slender with a forked tail. */
export function Barracuda() {
  return (
    <svg viewBox="0 0 96 24" fill="currentColor" fillRule="evenodd">
      <path d="M1 12 12 8C30 6 62 6 78 9L94 2l-6 10 6 10-16-7C62 18 30 18 12 16ZM9 10.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0Z" />
    </svg>
  )
}

/** Dusky grouper: heavy body, big head, round tail. */
export function Grouper() {
  return (
    <svg viewBox="0 0 80 44" fill="currentColor">
      <path d="M2 22C4 10 22 4 40 5c12 1 20 5 24 11l12-8c4 6 4 22 0 28l-12-8c-4 6-12 10-24 11C22 40 4 34 2 22Z" />
      <path d="M26 6c6-6 20-5 28 3L42 7Z" />
    </svg>
  )
}

/** Loggerhead turtle from above: shell, head and four flippers. */
export function Turtle() {
  return (
    <svg viewBox="0 0 72 56" fill="currentColor">
      <path d="M22 28c0-12 10-18 20-18 12 0 20 8 20 18s-8 18-20 18c-10 0-20-6-20-18Z" />
      <path d="M25 28c-4-6-17-6-19 0 2 6 15 6 19 0Z" />
      <path d="M30 16C24 6 14 2 8 4c6 6 12 12 20 16Z" />
      <path d="M30 40c-6 10-16 14-22 12 6-6 12-12 20-16Z" />
      <path d="M56 18c4-6 10-8 14-6-4 4-8 8-12 10Z" />
      <path d="M56 38c4 6 10 8 14 6-4-4-8-8-12-10Z" />
      <path d="M61 26l9 1v2l-9 1Z" />
    </svg>
  )
}

/** Stingray from above: wide wings and a whip tail. */
export function Ray() {
  return (
    <svg viewBox="0 0 80 64" fill="currentColor">
      <path d="M6 32C14 22 26 6 34 4c6 8 12 18 16 26l28 1v2l-28 1c-4 8-10 18-16 26C26 58 14 42 6 32Z" />
    </svg>
  )
}

/**
 * Scuba diver in side view, swimming level to the left: mask and regulator in front, tank on the
 * back, one arm reaching forward, legs in a scissor kick with long fins. Drawn in a 128×62 box, the
 * body between y 22 and 60, so the exhaled bubbles have room to rise above the head. The arm hangs
 * clear of the regulator hose: close together they merged into one blob at 8rem.
 */
function DiverBody() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="23" cy="38" r="7.5" stroke="none" />
      <rect x="12" y="33.5" width="8" height="7" rx="1.5" stroke="none" />
      <rect x="11" y="42" width="7" height="4" rx="1.5" stroke="none" />
      <path d="M17 44c5 5 11 4 15-1" fill="none" strokeWidth="2" />
      <path d="M31 38h33" fill="none" strokeWidth="11" />
      <rect x="34" y="23.5" width="30" height="9.5" rx="4.5" stroke="none" />
      <rect x="30" y="25" width="5" height="5" rx="1" stroke="none" />
      <path d="M40 43l-9 12H17" fill="none" strokeWidth="5" />
      <path d="M64 37l18-5 18 4" fill="none" strokeWidth="6" />
      <path d="M98 32c12-3 22-4 29-1-3 6-15 9-28 9Z" stroke="none" />
      <path d="M64 40l16 6 16 4" fill="none" strokeWidth="6" />
      <path d="M94 46c12 2 22 5 31 9-7 3-19 2-31-1Z" stroke="none" />
    </g>
  )
}

/**
 * Three or four exhaled bubbles over the mask; app.css lets each one rise and fade in turn
 * (.dive-exhale), so the diver reads as breathing. Rings, like the big bubbles of the water.
 */
function Exhale() {
  return (
    <g className="dive-exhale-trail">
      <circle className="dive-exhale" cx="17" cy="29" r="2" />
      <circle className="dive-exhale" cx="21" cy="27.5" r="2.6" />
      <circle className="dive-exhale" cx="24" cy="28.5" r="1.6" />
      <circle className="dive-exhale" cx="19" cy="30.5" r="3" />
    </g>
  )
}

/** Diver swimming level. */
export function Diver() {
  return (
    <svg viewBox="0 0 128 62" fill="currentColor">
      <DiverBody />
      <Exhale />
    </svg>
  )
}

/**
 * Diver descending head first, the body tilted 22° down; the bubbles stay outside the tilt and rise
 * straight up, as they would in the water.
 */
export function DiverDescending() {
  return (
    <svg viewBox="0 0 130 82" fill="currentColor">
      <g transform="rotate(-22 69 40)">
        <DiverBody />
      </g>
      <g transform="translate(2 18)">
        <Exhale />
      </g>
    </svg>
  )
}

/** Jellyfish: a bell and four trailing tentacles. */
export function Jellyfish() {
  return (
    <svg viewBox="0 0 40 56" fill="currentColor">
      <path d="M4 22C4 8 36 8 36 22c-6-2-10 2-16 0-6 2-10-2-16 0Z" />
      <path d="M10 20c-2 10 2 18-1 28h1.5c3-10-1-18 1-28Z" />
      <path d="M17 20c-2 11 2 21-1 33h1.5c3-12-1-22 1-33Z" />
      <path d="M23 20c2 11-2 21 1 33h1.5c-3-12 1-22-1-33Z" />
      <path d="M29 20c2 10-2 18 1 28h1.5c-3-10 1-18-1-28Z" />
    </svg>
  )
}
