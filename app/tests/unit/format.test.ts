import { afterEach, describe, expect, it } from 'vitest'
import { buildYear } from '../../src/lib/env'
import { formatDate } from '../../src/lib/format'
import { jumpToTarget } from '../../src/lib/inPageLink'
import { PAGE_KEYS } from '../../src/i18n/pages'
import { pageTitle } from '../../src/i18n/pageTitles'
import { getUi } from '../../src/i18n/ui'
import { LOCALES } from '../../src/i18n/locales'

describe('formatDate', () => {
  it('uses British day-month order for English, like the rest of the English copy', () => {
    expect(formatDate('2026-07-05', 'en')).toBe('5 July 2026')
  })

  it('formats the date in each language without shifting the day', () => {
    expect(formatDate('2026-07-05', 'tr')).toBe('5 Temmuz 2026')
    expect(formatDate('2026-07-05', 'fr')).toBe('5 juillet 2026')
    expect(formatDate('2026-07-05', 'de')).toBe('5. Juli 2026')
  })
})

describe('buildYear', () => {
  it('falls back to the current year when the build does not inject one', () => {
    expect(buildYear).toBe(new Date().getFullYear())
  })
})

describe('pageTitle', () => {
  it('gives every fixed page a non-empty title in every language', () => {
    for (const locale of LOCALES) {
      const ui = getUi(locale)
      for (const key of PAGE_KEYS) expect(pageTitle(ui, key).trim(), `${locale} ${key}`).not.toBe('')
    }
  })
})

// node environment: a minimal stand-in for the DOM pieces jumpToTarget touches.
describe('jumpToTarget', () => {
  const original = globalThis.document
  afterEach(() => {
    globalThis.document = original
  })

  function fakeTarget() {
    const attributes = new Map<string, string>()
    const calls: string[] = []
    return {
      calls,
      attributes,
      scrollIntoView: () => calls.push('scroll'),
      focus: (options?: { preventScroll?: boolean }) => calls.push(`focus:${options?.preventScroll}`),
      hasAttribute: (name: string) => attributes.has(name),
      setAttribute: (name: string, value: string) => attributes.set(name, value),
    }
  }

  function click(hash: string, modifiers: { ctrlKey?: boolean; button?: number } = {}) {
    let prevented = false
    const event = { currentTarget: { hash }, button: 0, defaultPrevented: false, ...modifiers, preventDefault: () => (prevented = true) }
    jumpToTarget(event as never)
    return prevented
  }

  it('lets Ctrl/Cmd-click and middle-click open the link natively', () => {
    const target = fakeTarget()
    globalThis.document = { getElementById: () => target } as never
    expect(click('#request', { ctrlKey: true })).toBe(false)
    expect(click('#request', { button: 1 })).toBe(false)
    expect(target.calls).toEqual([])
  })

  it('scrolls to the target, makes it focusable and focuses it without a second scroll', () => {
    const target = fakeTarget()
    globalThis.document = { getElementById: (id: string) => (id === 'request' ? target : null) } as never
    expect(click('#request')).toBe(true)
    expect(target.calls).toEqual(['scroll', 'focus:true'])
    expect(target.attributes.get('tabindex')).toBe('-1')
  })

  it('leaves the native link alone when the target is missing', () => {
    globalThis.document = { getElementById: () => null } as never
    expect(click('#missing')).toBe(false)
    expect(click('')).toBe(false)
  })
})
