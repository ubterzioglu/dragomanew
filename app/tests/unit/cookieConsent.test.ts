// @vitest-environment jsdom
import { act, createElement, type ComponentType } from 'react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { getUi } from '../../src/i18n/ui'
import { serializeConsent } from '../../src/lib/consent/consentStore'

/**
 * The layout as prerendered and then hydrated, with and without VITE_GA4_ID. The layout reads the
 * id when its modules load, so each test stubs it and imports them afresh (no static import).
 */
const ID = 'G-TEST12345'
const GTAG = 'https://www.googletagmanager.com/gtag/js'
const ui = getUi('en')
const gaWindow = window as unknown as { dataLayer?: IArguments[] } & Record<string, unknown>

let root: Root | null = null
let container: HTMLElement | null = null

beforeAll(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(async () => {
  await act(async () => root?.unmount())
  root = null
  container?.remove()
  container = null
  for (const script of document.querySelectorAll(`script[src^="${GTAG}"]`)) script.remove()
  delete gaWindow.dataLayer
  delete gaWindow[`ga-disable-${ID}`]
  window.localStorage.clear()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

async function loadLayout(id: string): Promise<ComponentType> {
  vi.resetModules()
  vi.stubEnv('VITE_GA4_ID', id)
  // The dive layout's scroll effects and the router's scroll restoration need these; jsdom lacks them.
  vi.stubGlobal('scrollTo', () => {})
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  return (await import('../../src/app/RootLayout')).RootLayout
}

const page = createElement(
  'div',
  null,
  createElement('h1', null, 'Page'),
  createElement('a', { href: 'https://wa.me/905332901463', target: '_blank', rel: 'noopener noreferrer' }, 'Chat on WhatsApp'),
)

function router(layout: ComponentType) {
  return createMemoryRouter([{ path: '/', element: createElement(layout), children: [{ index: true, element: page }] }], { initialEntries: ['/'] })
}

/** Server HTML first, then hydration in the browser, as the visitor gets the page. */
async function serveAndHydrate(layout: ComponentType) {
  const html = renderToString(createElement(RouterProvider, { router: router(layout) }))
  container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  const recoverable = vi.fn()
  await act(async () => {
    root = hydrateRoot(container as HTMLElement, createElement(RouterProvider, { router: router(layout) }), { onRecoverableError: recoverable })
  })
  expect(recoverable).not.toHaveBeenCalled()
  return html
}

const banner = () => document.querySelector<HTMLElement>('[data-consent-banner]')
const footerButton = () => [...document.querySelectorAll<HTMLButtonElement>('footer button')].find((button) => button.textContent === ui.consent.title) ?? null
const gaScripts = () => document.querySelectorAll(`script[src^="${GTAG}"]`)
const events = () => (gaWindow.dataLayer ?? []).map((entry) => Array.from(entry)).filter(([command]) => command === 'event')

function button(label: string): HTMLButtonElement {
  const found = [...(banner()?.querySelectorAll('button') ?? [])].find((candidate) => candidate.textContent === label)
  if (!found) throw new Error(`no banner button "${label}"`)
  return found
}

async function click(element: HTMLElement) {
  await act(async () => element.click())
}

/** Lets a requestAnimationFrame callback (the page view) run. */
async function nextFrames() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60))
  })
}

describe('layout without VITE_GA4_ID (analytics off)', () => {
  it('renders no banner and no footer link, on the server or after hydration', async () => {
    const html = await serveAndHydrate(await loadLayout(''))
    expect(html).not.toContain('data-consent-banner')
    expect(html).not.toContain(ui.consent.title)
    expect(banner()).toBeNull()
    expect(footerButton()).toBeNull()
    expect(gaScripts()).toHaveLength(0)
    expect(gaWindow.dataLayer).toBeUndefined()
  })
})

describe('layout with VITE_GA4_ID', () => {
  it('keeps the banner out of the server HTML and shows it after hydration', async () => {
    const html = await serveAndHydrate(await loadLayout(ID))
    expect(html).not.toContain('data-consent-banner')
    expect(html).not.toContain(' style=')
    const region = banner()
    expect(region?.tagName).toBe('SECTION')
    expect(document.getElementById(region?.getAttribute('aria-labelledby') ?? '')?.textContent).toBe(ui.consent.title)
    for (const label of [ui.consent.accept, ui.consent.reject, ui.consent.manage]) expect(button(label)).toBeTruthy()
    expect(region?.querySelector('a[href="/privacy-policy/"]')).not.toBeNull()
    // Nothing from Google until the visitor agrees.
    expect(gaScripts()).toHaveLength(0)
    expect(gaWindow.dataLayer).toBeUndefined()
  })

  it('loads GA4 after Accept and sends the page view and WhatsApp clicks', async () => {
    await serveAndHydrate(await loadLayout(ID))
    await click(button(ui.consent.accept))
    expect(banner()).toBeNull()
    // The clicked button is gone; keyboard users continue in the page content, not at the top of <body>.
    expect(document.activeElement?.id).toBe('main')
    expect(JSON.parse(window.localStorage.getItem('dragoman.consent') ?? '{}')).toMatchObject({ analytics: true, marketing: true })
    expect(gaScripts()).toHaveLength(1)
    await nextFrames()
    expect(events()).toEqual([['event', 'page_view', { page_location: `${window.location.origin}/`, page_title: document.title }]])

    const whatsapp = document.querySelector<HTMLAnchorElement>('main a[href^="https://wa.me/"]')
    if (!whatsapp) throw new Error('no WhatsApp link')
    // jsdom cannot open the link; the visitor's click still reaches the site's listener first.
    window.addEventListener('click', (event) => event.preventDefault(), { once: true })
    await click(whatsapp)
    expect(events().at(-1)).toEqual(['event', 'whatsapp_click', { locale: 'en' }])
  })

  it('loads nothing after Reject', async () => {
    await serveAndHydrate(await loadLayout(ID))
    await click(button(ui.consent.reject))
    expect(banner()).toBeNull()
    expect(JSON.parse(window.localStorage.getItem('dragoman.consent') ?? '{}')).toMatchObject({ analytics: false, marketing: false })
    await nextFrames()
    expect(gaScripts()).toHaveLength(0)
    expect(gaWindow.dataLayer).toBeUndefined()
    expect(gaWindow[`ga-disable-${ID}`]).toBe(true)
  })

  it('shows the three categories separately, with only the necessary one on', async () => {
    await serveAndHydrate(await loadLayout(ID))
    await click(button(ui.consent.manage))
    const boxes = [...(banner()?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? [])]
    const labelled = (input: HTMLInputElement) => document.querySelector(`label[for="${input.id}"]`)?.textContent
    expect(boxes.map(labelled)).toEqual([ui.consent.necessary, ui.consent.analytics, ui.consent.marketing])
    expect(boxes.map((box) => [box.checked, box.disabled])).toEqual([
      [true, true],
      [false, false],
      [false, false],
    ])

    await click(boxes[2] as HTMLInputElement)
    await click(button(ui.consent.save))
    expect(JSON.parse(window.localStorage.getItem('dragoman.consent') ?? '{}')).toMatchObject({ analytics: false, marketing: true })
    expect(gaScripts()).toHaveLength(0)
  })

  it('asks no more once a choice is stored, and the footer link reopens it to change the choice', async () => {
    window.localStorage.setItem('dragoman.consent', serializeConsent({ analytics: true, marketing: false }, new Date('2026-11-03T10:00:00Z')))
    await serveAndHydrate(await loadLayout(ID))
    expect(banner()).toBeNull()
    expect(gaScripts()).toHaveLength(1)

    const link = footerButton()
    if (!link) throw new Error('no footer link')
    link.focus()
    await click(link)
    expect(banner()).not.toBeNull()
    expect(document.activeElement).toBe(banner())
    const analytics = [...(banner()?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? [])][1]
    expect(analytics?.checked).toBe(true)

    // Escape leaves without a change and puts focus back on the link.
    await act(async () => {
      banner()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
    expect(banner()).toBeNull()
    expect(document.activeElement).toBe(link)

    // Withdrawing stops measurement at once.
    await click(link)
    await click(button(ui.consent.reject))
    expect(gaWindow[`ga-disable-${ID}`]).toBe(true)
    expect((gaWindow.dataLayer ?? []).map((entry) => Array.from(entry)).at(-1)).toEqual(['consent', 'update', { analytics_storage: 'denied' }])
    expect(document.activeElement).toBe(link)
  })
})
