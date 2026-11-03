// @vitest-environment jsdom
import { createElement, type ComponentType } from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { Ga4 } from '../../src/lib/analytics/ga4'
import { setUpFormHarness } from './formHarness'

/**
 * The GA4 event of a site form, with analytics configured and granted: sent once the server has
 * stored the request, never for an error. The submitter's settings are stubbed to a local URL and
 * fetch is faked, so nothing leaves the test.
 */
const ID = 'G-TEST12345'
const gaWindow = window as unknown as { dataLayer?: IArguments[] } & Record<string, unknown>

let ContactForm: ComponentType
let analytics: Ga4 | null

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const events = () => (gaWindow.dataLayer ?? []).map((entry) => Array.from(entry)).filter(([command]) => command === 'event')

beforeAll(async () => {
  vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:54321')
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test-key')
  vi.stubEnv('VITE_GA4_ID', ID)
  ;({ ContactForm } = await import('../../src/features/forms/ContactForm'))
  ;({ siteAnalytics: analytics } = await import('../../src/lib/analytics/ga4'))
  analytics?.grant()
})

afterAll(() => {
  for (const script of document.querySelectorAll('script')) script.remove()
  delete gaWindow.dataLayer
  vi.unstubAllEnvs()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const form = setUpFormHarness()

async function sendContactForm(answer: Response) {
  vi.stubGlobal('fetch', vi.fn(async () => answer))
  await form.render(createElement(ContactForm))
  await form.type('fullName', 'Ada Lovelace')
  await form.type('email', 'ada@example.com')
  await form.type('message', 'Is there a dive on Sunday?')
  await form.clickSubmit()
}

describe('site form analytics', () => {
  it('is configured for the test', () => {
    expect(analytics).not.toBeNull()
  })

  it('records a stored request with the form kind and locale only', async () => {
    const before = events().length
    await sendContactForm(json(200, { ok: true, reference: 'DRG-000200' }))
    expect(form.referenceText()).toBe('DRG-000200')
    expect(events().slice(before)).toEqual([['event', 'generate_lead', { form_kind: 'contact', locale: 'en' }]])
  })

  it('records nothing when the request is not stored', async () => {
    const before = events().length
    await sendContactForm(json(503, { ok: false, error: 'server' }))
    expect(events()).toHaveLength(before)
  })
})
