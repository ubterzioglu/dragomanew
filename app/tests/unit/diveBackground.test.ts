import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DiveBackground } from '../../src/components/layout/DiveBackground'

// The server-rendered dive background (UBT, 01.11.2026). Rendered here as on the server: no CSS
// support check runs, so the scroll fallback stays idle and nothing writes a style.
const html = renderToStaticMarkup(createElement(DiveBackground))
const zone = (name: string) => html.slice(html.indexOf(`dive-zone--${name}`), html.indexOf('</div>', html.indexOf(`dive-zone--${name}`)))
const count = (haystack: string, needle: string) => haystack.split(needle).length - 1

describe('DiveBackground on the server', () => {
  it('carries no style attribute, so the strict page policy holds', () => {
    expect(html).not.toContain(' style=')
    expect(html).toContain('class="dive-bg"')
  })

  it('puts divers in mid and deep water, and in each zone after the animals already placed', () => {
    expect(count(zone('mid'), 'dive-swimmer--diver')).toBeGreaterThanOrEqual(1)
    expect(count(zone('deep'), 'dive-swimmer--diver')).toBeGreaterThanOrEqual(1)
    // app.css places the swimmers by nth-child, so the divers come last and the old indices hold.
    for (const name of ['shallow', 'mid', 'deep']) {
      const swimmers = zone(name).split('<span class="dive-swimmer').slice(1)
      const firstDiver = swimmers.findIndex((swimmer) => swimmer.includes('dive-swimmer--diver'))
      if (firstDiver === -1) continue
      expect(swimmers.slice(firstDiver).every((swimmer) => swimmer.includes('dive-swimmer--diver'))).toBe(true)
    }
  })

  it('gives every diver three or four exhaled bubbles', () => {
    const divers = html.split('dive-swimmer--diver').slice(1)
    expect(divers.length).toBeGreaterThanOrEqual(3)
    for (const diver of divers) {
      const bubbles = count(diver.slice(0, diver.indexOf('</svg>')), 'class="dive-exhale"')
      expect(bubbles).toBeGreaterThanOrEqual(3)
      expect(bubbles).toBeLessThanOrEqual(4)
    }
  })

  it('keeps some divers off the phone cast and some on it', () => {
    const divers = html.split('<span class="dive-swimmer').slice(1).filter((swimmer) => swimmer.startsWith(' dive-swimmer--diver'))
    expect(divers.some((diver) => diver.includes('dive-swimmer--phone-hidden'))).toBe(true)
    expect(divers.some((diver) => !diver.includes('dive-swimmer--phone-hidden'))).toBe(true)
  })
})
