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
  /** The page has a fetchpriority="high" image whose decode() settles when the test says so. */
  priorityImage?: boolean
  /** Top of that 300 px tall image in the 800 px tall viewport. */
  imageTop?: number
  /** The engine has HTMLImageElement.decode() (Safari 11.1+, every current browser). */
  decodeSupported?: boolean
  /** The image carries elementtiming and the engine reports Element Timing entries (Chromium). */
  elementTiming?: boolean
}

type Callback = () => void
type EntryList = { getEntriesByName: (name: string) => unknown[]; getEntries: () => unknown[] }
type PaintCallback = (list: EntryList) => void
type ObserverRecord = { onPaint: PaintCallback; options?: { type?: string; buffered?: boolean }; disconnected: boolean }

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
  priorityImage = false,
  imageTop = 120,
  decodeSupported = true,
  elementTiming = false,
}: FakeBrowser = {}) {
  const loader = /<script>([\s\S]*?)<\/script>/.exec(deferAppScript(page(APP)))?.[1]
  if (!loader) throw new Error('no inline loader in the output')
  const appended: Array<{ type?: string; src?: string }> = []
  const listeners = new Map<string, Callback[]>()
  const timers: Array<{ run: Callback; ms: number }> = []
  const frames: Callback[] = []
  const observers: ObserverRecord[] = []
  let resolveDecode = (): void => undefined
  let rejectDecode = (_error: Error): void => undefined
  const decoding = new Promise<void>((resolve, reject) => {
    resolveDecode = resolve
    rejectDecode = reject
  })
  let top = imageTop
  const image = {
    decode: decodeSupported ? () => decoding : undefined,
    getBoundingClientRect: () => ({ top, bottom: top + 300 }),
    hasAttribute: (name: string) => elementTiming && name === 'elementtiming',
  }
  const fakeDocument = {
    readyState,
    visibilityState: hidden ? 'hidden' : 'visible',
    head: { appendChild: (element: { type?: string; src?: string }) => appended.push(element) },
    createElement: () => ({}),
    addEventListener: (type: string, listener: Callback) => listeners.set(type, [...(listeners.get(type) ?? []), listener]),
    querySelector: (selector: string) => (priorityImage && selector === 'img[fetchpriority=high]' ? image : null),
  }
  const fakePerformance = { getEntriesByName: (name: string) => (paintedBefore && name === FCP ? [{ name }] : []) }
  class FakeObserver {
    static supportedEntryTypes = elementTiming ? [...supportedEntryTypes, 'element'] : supportedEntryTypes
    private readonly entry: ObserverRecord
    constructor(onPaint: PaintCallback) {
      this.entry = { onPaint, disconnected: false }
      observers.push(this.entry)
    }
    observe(options: ObserverRecord['options']) {
      if (observeThrows) throw new TypeError('unsupported observe() options')
      this.entry.options = options
    }
    disconnect() {
      this.entry.disconnected = true
    }
  }
  const fakeWindow = { PerformanceObserver: paintTiming ? FakeObserver : undefined, innerHeight: 800 }
  // The loader only touches these five globals, so they can be swapped for fakes.
  const run = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'setTimeout', loader) as (...args: unknown[]) => void
  run(fakeDocument, fakeWindow, fakePerformance, (frame: Callback) => frames.push(frame), (timer: Callback, ms = 0) => timers.push({ run: timer, ms }))

  return {
    appended,
    observers,
    fire: (type: string) => (listeners.get(type) ?? []).forEach((listener) => listener()),
    paint: (name: string) =>
      observers
        .filter((o) => !o.disconnected && o.options?.type === 'paint')
        .forEach((o) => o.onPaint({ getEntriesByName: (n) => (n === name ? [{ name }] : []), getEntries: () => [{ name }] })),
    /** An element reaches the screen: its Element Timing entry (the priority image unless another is given). */
    paintImage: (element: unknown = image) =>
      observers
        .filter((o) => !o.disconnected && o.options?.type === 'element')
        .forEach((o) => o.onPaint({ getEntriesByName: () => [], getEntries: () => [{ element }] })),
    /** The page scrolls, moving the image's top edge to `imageTop`. */
    scrollImageTo: (imageTop: number) => {
      top = imageTop
    },
    hide: () => {
      fakeDocument.visibilityState = 'hidden'
    },
    /** Settles the priority image's decode() and lets its callbacks run. */
    decode: async (ok: boolean) => {
      if (ok) resolveDecode()
      else rejectDecode(new Error('EncodingError'))
      await decoding.catch(() => undefined)
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

  it('with a priority (LCP) image, also waits until it is decoded and its frame has run', async () => {
    const browser = runLoader({ priorityImage: true })
    browser.paint(FCP)
    browser.advance(0)
    expect(browser.appended).toHaveLength(0)
    await browser.decode(true)
    expect(browser.appended).toHaveLength(0)
    browser.advance(0)
    expect(browser.appended).toHaveLength(1)
  })

  it('a priority image that cannot be decoded does not hold the bundle back', async () => {
    const browser = runLoader({ priorityImage: true })
    browser.paint(FCP)
    await browser.decode(false)
    browser.advance(0)
    expect(browser.appended).toHaveLength(1)
  })

  // Both ways of learning about the paint reach the image wait, with or without Element Timing, so every combination
  // must keep the limit and the hidden-tab exit.
  describe.each([
    ['the observer reports the paint', false, false],
    ['the paint is already in the timeline', true, false],
    ['the observer reports the paint, with Element Timing', false, true],
    ['the paint is already in the timeline, with Element Timing', true, true],
  ])('with a priority image, when %s', (_case, paintedBefore: boolean, elementTiming: boolean) => {
    const start = () => {
      const browser = runLoader({ priorityImage: true, paintedBefore, elementTiming })
      if (!paintedBefore) browser.paint(FCP)
      return browser
    }

    it('loads after three seconds when the image never finishes', () => {
      const browser = start()
      browser.advance(2999)
      expect(browser.appended).toHaveLength(0)
      browser.advance(3000)
      expect(browser.appended).toHaveLength(1)
    })

    it('loads when the tab is hidden while the image decodes', () => {
      const browser = start()
      expect(browser.appended).toHaveLength(0)
      browser.hide()
      browser.fire('visibilitychange')
      expect(browser.appended).toHaveLength(1)
    })
  })

  describe('with Element Timing (Chromium)', () => {
    const start = (elementTiming = true) => {
      const browser = runLoader({ priorityImage: true, elementTiming })
      browser.paint(FCP)
      return browser
    }

    it("waits for the priority image's own paint entry, not for decode and a frame", async () => {
      const browser = start()
      expect(browser.observers.find((o) => o.options?.type === 'element')?.options).toEqual({ type: 'element', buffered: true })
      await browser.decode(true)
      browser.advance(0)
      expect(browser.appended).toHaveLength(0)
      browser.paintImage()
      expect(browser.appended).toHaveLength(1)
      expect(browser.observers.every((o) => o.disconnected)).toBe(true)
    })

    it('does not wait for a paint that cannot come: the image fails to decode', async () => {
      const browser = start()
      await browser.decode(false)
      expect(browser.appended).toHaveLength(1)
    })

    it('does not wait for a paint that cannot come: the image left the screen before it was decoded', async () => {
      const browser = start()
      browser.scrollImageTo(-2500)
      await browser.decode(true)
      expect(browser.appended).toHaveLength(1)
    })

    it("another element's entry does not start it", () => {
      const browser = start()
      browser.paintImage({})
      expect(browser.appended).toHaveLength(0)
    })

    it('still loads after three seconds when no entry arrives', () => {
      const browser = start()
      browser.advance(2999)
      expect(browser.appended).toHaveLength(0)
      browser.advance(3000)
      expect(browser.appended).toHaveLength(1)
    })

    it('an image without elementtiming falls back to decode and a frame', async () => {
      const browser = runLoader({ priorityImage: true, supportedEntryTypes: ['paint', 'element'] })
      browser.paint(FCP)
      expect(browser.observers.some((o) => o.options?.type === 'element')).toBe(false)
      await browser.decode(true)
      browser.advance(0)
      expect(browser.appended).toHaveLength(1)
    })
  })

  it.each([
    ['below the first screen', 800],
    ['above a restored scroll position', -2500],
  ])('does not wait for a priority image %s (not the LCP)', (_case, imageTop: number) => {
    const browser = runLoader({ priorityImage: true, imageTop, elementTiming: true })
    browser.paint(FCP)
    expect(browser.appended).toHaveLength(1)
  })

  it('does not wait for the image without HTMLImageElement.decode()', () => {
    const browser = runLoader({ priorityImage: true, decodeSupported: false })
    browser.paint(FCP)
    expect(browser.appended).toHaveLength(1)
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
