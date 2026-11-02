import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FormResult } from '../../src/features/forms/FormResult'
import { HoneypotField } from '../../src/features/forms/HoneypotField'
import { DemoResult, type SubmitErrorReason, type SubmitResult } from '../../src/features/forms/submission'
import { LocaleProvider } from '../../src/i18n/LocaleContext'
import type { Locale } from '../../src/i18n/locales'
import { getUi, type UiStrings } from '../../src/i18n/ui'

/** Markup as the prerender writes it; text is compared escaped the same way React escapes it. */
const markup = (locale: Locale, result: SubmitResult) =>
  renderToStaticMarkup(createElement(LocaleProvider, { locale, children: createElement(FormResult, { result }) }))

const escaped = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

const REASON_TEXT: Readonly<Record<SubmitErrorReason, (ui: UiStrings) => string>> = {
  invalid: (ui) => ui.forms.result.errors.invalid,
  rate_limited: (ui) => ui.forms.result.errors.rateLimited,
  event_closed: (ui) => ui.forms.result.errors.eventClosed,
  unavailable: (ui) => ui.forms.result.errors.unavailable,
  network: (ui) => ui.forms.result.errors.network,
}
const REASONS = Object.keys(REASON_TEXT) as SubmitErrorReason[]

describe.each(['tr', 'en'] as const)('FormResult (%s)', (locale) => {
  const ui = getUi(locale)

  it('shows the reference of a stored request as a success', () => {
    const html = markup(locale, { kind: 'sent', reference: 'DRG-000123' })
    expect(html).toContain('role="status"')
    expect(html).toContain(escaped(ui.forms.result.sentTitle))
    expect(html).toContain(escaped(ui.forms.result.referenceLabel))
    expect(html).toContain('<strong class="font-mono">DRG-000123</strong>')
    expect(html).toContain(escaped(ui.forms.result.sentDetail))
    expect(html).not.toContain(escaped(ui.forms.result.errorTitle))
  })

  it.each(REASONS)('explains the reason "%s" with its own text only', (reason) => {
    const html = markup(locale, { kind: 'error', reason })
    expect(html).toContain(escaped(ui.forms.result.errorTitle))
    expect(html).toContain(escaped(REASON_TEXT[reason](ui)))
    for (const other of REASONS.filter((candidate) => candidate !== reason)) {
      expect(html).not.toContain(escaped(REASON_TEXT[other](ui)))
    }
  })

  it('gives every reason a different text', () => {
    expect(new Set(REASONS.map((reason) => REASON_TEXT[reason](ui))).size).toBe(REASONS.length)
  })

  it('keeps the sample result exactly as before', () => {
    const html = markup(locale, { kind: 'demo' })
    expect(html).toBe(renderToStaticMarkup(createElement(LocaleProvider, { locale, children: createElement(DemoResult) })))
    expect(html).toContain(escaped(ui.forms.demoResult))
    expect(html).toContain(escaped(ui.forms.demoResultDetail))
  })
})

describe('HoneypotField', () => {
  const html = renderToStaticMarkup(createElement(HoneypotField, { ref: null }))
  const input = /<input[^>]*>/.exec(html)?.[0] ?? ''

  it('hides the whole field from screen readers on its wrapper', () => {
    expect(html).toMatch(/^<div aria-hidden="true" class="[^"]+">/)
  })

  // HTML attribute names are case-insensitive, and React writes some of them in camel case (autoComplete).
  it.each([
    ['the envelope’s website field', /\sname="website"/i],
    ['a plain text input', /\stype="text"/i],
    ['out of the tab order', /\stabindex="-1"/i],
    ['away from autofill', /\sautocomplete="off"/i],
    ['empty', /\svalue=""/i],
  ])('is %s', (_label, attribute) => {
    expect(input).toMatch(attribute)
  })

  it('is labelled, and stays visible to bots: no style attribute (CSP) and no hidden attribute', () => {
    const id = /id="([^"]+)"/.exec(input)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`<label for="${id}">`)
    expect(html).not.toContain('style=')
    expect(html).not.toMatch(/\shidden[\s=>]/)
  })
})
