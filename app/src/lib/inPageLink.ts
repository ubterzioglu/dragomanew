import type { MouseEvent } from 'react'

/**
 * Click handler for plain "#id" links (skip link, booking CTAs). Native hash
 * navigation creates a history entry without router state, so ScrollRestoration
 * would restore a stale position after client-side navigation. With JS we
 * scroll and move focus ourselves; without JS the href still works.
 */
export function jumpToTarget(event: MouseEvent<HTMLAnchorElement>): void {
  // Leave modified clicks (new tab/window) and already-handled events to the browser.
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const id = decodeURIComponent(event.currentTarget.hash.slice(1))
  const target = id ? document.getElementById(id) : null
  if (!target) return
  event.preventDefault()
  target.scrollIntoView({ block: 'start' })
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}
