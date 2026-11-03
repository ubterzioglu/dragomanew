// @vitest-environment jsdom
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Footer } from '../../src/components/layout/Footer'
import { LocaleProvider } from '../../src/i18n/LocaleContext'
import { getUi } from '../../src/i18n/ui'
import { siteConfig } from '../../src/lib/siteConfig'

const ui = getUi('tr')

function renderSignOff(): HTMLElement {
  const html = renderToString(createElement(MemoryRouter, null, createElement(LocaleProvider, { locale: 'tr', children: createElement(Footer) })))
  const container = document.createElement('div')
  container.innerHTML = html
  const signOff = container.querySelector<HTMLElement>('footer > div:first-child')
  if (!signOff) throw new Error('no sign-off band')
  return signOff
}

describe('footer sign-off social icons', () => {
  it('links every social account with an icon under the logo and slogan', () => {
    const signOff = renderSignOff()
    expect(signOff.querySelector('img[alt="Dragoman"]')).not.toBeNull()

    const list = signOff.querySelector(`ul[aria-label="${ui.footer.followHeading}"]`)
    expect(list).not.toBeNull()
    const links = [...(list?.querySelectorAll('a') ?? [])]
    expect(links.map((link) => [link.getAttribute('aria-label'), link.getAttribute('href')])).toEqual([
      ['Instagram', siteConfig.social.instagram],
      ['Facebook', siteConfig.social.facebook],
      ['YouTube', siteConfig.social.youtube],
      ['LinkedIn', siteConfig.social.linkedin],
    ])
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
      // The name comes from aria-label; the drawing itself stays out of the accessibility tree.
      expect(link.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
      expect(link.textContent).toBe('')
    }
  })
})
