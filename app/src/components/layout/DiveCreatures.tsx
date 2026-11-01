// Silhouettes for the dive background, solid currentColor, facing left; app.css mirrors the ones
// that swim right and fades each animal as a whole, so parts that overlap never darken. Parts are
// separate paths: inside one path, overlapping parts drawn the other way round would leave holes.

export function SmallFish() {
  return (
    <svg viewBox="0 0 64 32" fill="currentColor" fillRule="evenodd">
      <path d="M2 16C12 4 34 2 48 13L62 4 57 16l5 12-14-9C34 30 12 28 2 16Zm11-3a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z" />
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
