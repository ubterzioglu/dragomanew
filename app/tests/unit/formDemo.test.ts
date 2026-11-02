// @vitest-environment jsdom
import { createElement, type ComponentType } from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { getUi } from '../../src/i18n/ui'
import { setUpFormHarness } from './formHarness'

/**
 * A Stage A build (no Supabase settings): forms show the sample result and keep what was typed.
 * The settings are blanked before the forms load, because Vitest also reads app/.env.local.
 */
const ui = getUi('en')
let ContactForm: ComponentType
const fetchImpl = vi.fn(async (): Promise<Response> => {
  throw new Error('a sample form must not call fetch')
})

beforeAll(async () => {
  vi.stubEnv('VITE_SUPABASE_URL', '')
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
  vi.stubGlobal('fetch', fetchImpl)
  ;({ ContactForm } = await import('../../src/features/forms/ContactForm'))
})

afterAll(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

afterEach(() => {
  fetchImpl.mockClear()
})

const form = setUpFormHarness()
const CONTACT = { fullName: 'Ada Lovelace', email: 'ada@example.com', message: 'Is there a dive on Sunday?' }

describe('sample forms (no Supabase settings)', () => {
  it('show the sample result, keep the values and take the next click', async () => {
    await form.render(createElement(ContactForm))
    for (const [name, value] of Object.entries(CONTACT)) await form.type(name, value)

    await form.clickSubmit()
    expect(form.statusText()).toContain(ui.forms.demoResult)
    expect({ fullName: form.valueOf('fullName'), email: form.valueOf('email'), message: form.valueOf('message') }).toEqual(CONTACT)
    expect(form.submitButton().disabled).toBe(false)

    await form.clickSubmit()
    expect(form.statusText()).toContain(ui.forms.demoResult)
    expect(form.valueOf('message')).toBe(CONTACT.message)
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
