import { describe, expect, it } from 'vitest'
import { deferAppScript } from '../../src/lib/deferAppScript'

const page = (script: string) => `<html><head>${script}<link rel="stylesheet" href="/assets/app.css"></head><body></body></html>`
const APP = '<script type="module" crossorigin src="/assets/app-abc.js"></script>'
const FCP = 'first-contentful-paint'

interface FakeBrowser {
  hidden?: boolean
  paintTiming?: boolean
  readyState?: DocumentReadyState
  /** Entry types the fake PerformanceObserver lists as supported. */
  supportedEntryTypes?: string[]
  /** observe() throws, as in engines that only accept { entryTypes }. */
  observeThrows?: boolean
  /** The paint already happened before the loader ran: it is in the performance timeline. */
  paintedBefore?: boolean
}

type Callback = () => void
type PaintCallback = (list: { getEntriesByName: (name: string) => unknown[] }) => void

/**
 * Runs the generated inline loader against a fake browser and records when the bundle is appended.
 * Like Safari 14.1–15, the fake observer never delivers buffered entries: only paints after observe() reach it.
 */
function runLoader({
  hidden = false,
  paintTiming = true,
  readyState = 'interactive',
  supportedEntryTypes = ['paint'],
  observeThrows = false,
  paintedBefore = false,
}: FakeBrowser = {}) {
  const loader = /<script>([\s\S]*?)<\/script>/.exec(deferAppScript(page(APP)))?.[1]
  if (!loader) throw new Error('no inline loader in the output')
  const appended: Array<{ type?: string; src?: string }> = []
  const listeners = new Map<string, Callback[]>()
  const timers: Array<{ run: Callback; ms: number }> = []
  const frames: Callback[] = []
  const observers: Array<{ onPaint: PaintCallback; options?: unknown; disconnected: boolean }> = []
  const fakeDocument = {
    readyState,
    visibilityState: hidden ? 'hidden' : 'visible',
    head: { appendChild: (element: { type?: string; src?: string }) => appended.push(element) },
    createElement: () => ({}),
    addEventListener: (type: string, listener: Callback) => listeners.set(type, [...(listeners.get(type) ?? []), listener]),
  }
  const fakePerformance = { getEntriesByName: (name: string) => (paintedBefore && name === FCP ? [{ name }] : []) }
  class FakeObserver {
    static supportedEntryTypes = supportedEntryTypes
    private readonly entry: { onPaint: PaintCallback; options?: unknown; disconnected: boolean }
    constructor(onPaint: PaintCallback) {
      this.entry = { onPaint, disconnected: false }
      observers.push(this.entry)
    }
    observe(options: unknown) {
      if (observeThrows) throw new TypeError('unsupported observe() options')
      this.entry.options = options
    }
    disconnect() {
      this.entry.disconnected = true
    }
  }
  const fakeWindow = { PerformanceObserver: paintTiming ? FakeObserver : undefined }
  // The loader only touches these five globals, so they can be swapped for fakes.
  const run = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'setTimeout', loader) as (...args: unknown[]) => void
  run(fakeDocument, fakeWindow, fakePerformance, (frame: Callback) => frames.push(frame), (timer: Callback, ms = 0) => timers.push({ run: timer, ms }))

  return {
    appended,
    observers,
    fire: (type: string) => (listeners.get(type) ?? []).forEach((listener) => listener()),
    paint: (name: string) =>
      observers
        .filter((o) => !o.disconnected && o.options)
        .forEach((o) => o.onPaint({ getEntriesByName: (n) => (n === name ? [{ name }] : []) })),
    hide: () => {
      fakeDocument.visibilityState = 'hidden'
    },
    /** Runs pending frame callbacks, then timers due within `upToMs`. */
    advance: (upToMs: number) => {
      frames.splice(0).forEach((frame) => frame())
      timers.filter((t) => t.ms <= upToMs).forEach((t) => t.run())
    },
  }
}

describe('deferAppScript', () => {
  it('replaces the blocking module script with an inline loader and a low-priority modulepreload', () => {
    const html = deferAppScript(page(APP))
    expect(html).not.toContain('<script type="module"')
    expect(html).toContain('"/assets/app-abc.js"')
    expect(html).toContain('<link rel="modulepreload" crossorigin href="/assets/app-abc.js" fetchpriority="low">')
    expect(html).toContain('<link rel="stylesheet" href="/assets/app.css">')
  })

  it('accepts the serialized crossorigin="" form', () => {
    expect(deferAppScript(page('<script type="module" crossorigin="" src="/assets/app-x.js"></script>'))).toContain('"/assets/app-x.js"')
  })

  it('leaves pages without the app script unchanged', () => {
    const html = page('')
    expect(deferAppScript(html)).toBe(html)
  })

  it('waits for the first contentful paint, not for a frame callback', () => {
    const browser = runLoader()
    browser.advance(0)
    browser.paint('first-paint')
    expect(browser.appended).toHaveLength(0)
    browser.paint(FCP)
    expect(browser.appended).toEqual([{ type: 'module', crossOrigin: '', src: '/assets/app-abc.js' }])
    expect(browser.observers.every((o) => o.disconnected)).toBe(true)
  })

  it('observes buffered paint entries', () => {
    expect(runLoader().observers[0]?.options).toEqual({ type: 'paint', buffered: true })
  })

  it('loads at once when the paint already happened, even if buffered entries are never delivered (Safari 14.1–15)', () => {
    const browser = runLoader({ paintedBefore: true })
    expect(browser.appended).toHaveLength(1)
    expect(browser.observers.every((o) => o.disconnected)).toBe(true)
  })

  it('starts only once the document is parsed', () => {
    const browser = runLoader({ readyState: 'loading' })
    expect(browser.observers).toHaveLength(0)
    browser.fire('DOMContentLoaded')
    browser.paint(FCP)
    expect(browser.appended).toHaveLength(1)
  })

  it('loads right away in a tab opened in the background, which paints nothing', () => {
    expect(runLoader({ hidden: true }).appended).toHaveLength(1)
  })

  it('loads when the tab is hidden before the first paint', () => {
    const browser = runLoader()
    browser.hide()
    browser.fire('visibilitychange')
    expect(browser.appended).toHaveLength(1)
  })

  it('loads anyway when no paint is reported within three seconds', () => {
    const browser = runLoader()
    browser.advance(2999)
    expect(browser.appended).toHaveLength(0)
    browser.advance(3000)
    expect(browser.appended).toHaveLength(1)
  })

  it.each([
    ['without PerformanceObserver', { paintTiming: false }],
    ['when paint is not a supported entry type', { supportedEntryTypes: ['mark', 'measure'] }],
    ['when observe() throws', { observeThrows: true }],
  ])('falls back to the next frame %s', (_case, browserOptions: FakeBrowser) => {
    const browser = runLoader(browserOptions)
    expect(browser.appended).toHaveLength(0)
    browser.advance(0)
    expect(browser.appended).toHaveLength(1)
  })

  it('appends the bundle only once', () => {
    const browser = runLoader()
    browser.paint(FCP)
    browser.hide()
    browser.fire('visibilitychange')
    browser.advance(3000)
    expect(browser.appended).toHaveLength(1)
  })
})
