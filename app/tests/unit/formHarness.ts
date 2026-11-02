import { act, createElement, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach } from 'vitest'
import { LocaleProvider } from '../../src/i18n/LocaleContext'

/**
 * Mounts a site form in jsdom and drives it like a visitor (formWiring and formDemo tests).
 * Call it once at the top of a `@vitest-environment jsdom` file: it registers its own hooks.
 */
export function setUpFormHarness() {
  let root: Root | null = null
  let container: HTMLElement | null = null

  const mounted = (): HTMLElement => {
    if (!container) throw new Error('formHarness: no form mounted')
    return container
  }

  beforeAll(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  })

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
  })

  afterEach(async () => {
    await act(async () => root?.unmount())
    root = null
    container?.remove()
    container = null
  })

  const field = (name: string): HTMLInputElement | HTMLTextAreaElement => {
    const element = mounted().querySelector(`[name="${name}"]`)
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) throw new Error(`no field ${name}`)
    return element
  }

  const submitButton = (): HTMLButtonElement => {
    const button = mounted().querySelector('button[type="submit"]')
    if (!(button instanceof HTMLButtonElement)) throw new Error('no submit button')
    return button
  }

  return {
    async render(element: ReactElement) {
      root = createRoot(mounted())
      await act(async () => root?.render(createElement(LocaleProvider, { locale: 'en', children: element })))
    },
    /** Types like a visitor: the native setter bypasses React's value tracking, the input event reaches its onChange. */
    async type(name: string, value: string) {
      const target = field(name)
      await act(async () => {
        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), 'value')?.set?.call(target, value)
        target.dispatchEvent(new Event('input', { bubbles: true }))
      })
    },
    /** A real click, so checkboxes toggle and React sees the change. */
    async click(selector: string) {
      const element = mounted().querySelector(selector)
      if (!(element instanceof HTMLElement)) throw new Error(`nothing matches ${selector}`)
      await act(async () => element.click())
    },
    /** A click, as a visitor makes it: a disabled button does nothing. */
    async clickSubmit() {
      await act(async () => {
        submitButton().click()
        await settle()
      })
    },
    valueOf: (name: string) => field(name).value,
    has: (selector: string) => mounted().querySelector(selector) !== null,
    submitButton,
    statusText: () => mounted().querySelector('[role="status"]')?.textContent ?? '',
    referenceText: () => mounted().querySelector('[role="status"] strong')?.textContent ?? '',
  }
}

/** Lets the form's async validation, the submitter and the result's effects run to the end. */
async function settle() {
  for (let turn = 0; turn < 10; turn += 1) await new Promise((resolve) => setTimeout(resolve, 0))
}
