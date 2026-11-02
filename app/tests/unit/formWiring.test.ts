// @vitest-environment jsdom
import { act, createElement, type ComponentType } from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { contentData } from '../../src/content/data'
import type { DragomanEvent } from '../../src/content/schema'
import { getUi } from '../../src/i18n/ui'
import { needsDistribution } from '../../src/lib/options'
import { submitEnvelopeSchema, type SubmitEnvelope } from '../../src/shared/requests/payload'
import { setUpFormHarness } from './formHarness'

/**
 * The forms as visitors use them, against the real submitter: the build's Supabase settings are
 * stubbed to a local URL and fetch is faked, so nothing leaves the test. Modules that read the
 * settings are imported only after the stubs (beforeAll), never statically.
 */
const BASE_URL = 'http://127.0.0.1:54321'
const PUBLISHABLE_KEY = 'sb_publishable_test-key'
const ENDPOINT = `${BASE_URL}/functions/v1/submit-request`
const ui = getUi('en')

let ContactForm: ComponentType
let EventRequestForm: ComponentType<{ event: DragomanEvent }>
let TransportForm: ComponentType

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

/** Answers with the given responses in turn; an Error is thrown, like a dropped connection. */
function fakeFetch(...answers: Array<Response | Error>) {
  const queue = [...answers]
  const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
    const next = queue.shift()
    if (!next) throw new Error('fakeFetch: no answer left')
    if (next instanceof Error) throw next
    return next
  })
  vi.stubGlobal('fetch', fetchImpl)
  return fetchImpl
}

function sentEnvelope(fetchImpl: ReturnType<typeof fakeFetch>, call: number): SubmitEnvelope {
  const [url, init] = fetchImpl.mock.calls[call] ?? []
  expect(url).toBe(ENDPOINT)
  return submitEnvelopeSchema.parse(JSON.parse(String(init?.body)))
}

beforeAll(async () => {
  vi.stubEnv('VITE_SUPABASE_URL', BASE_URL)
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', PUBLISHABLE_KEY)
  ;({ ContactForm } = await import('../../src/features/forms/ContactForm'))
  ;({ EventRequestForm } = await import('../../src/features/forms/EventRequestForm'))
  ;({ TransportForm } = await import('../../src/features/forms/TransportForm'))
})

afterAll(() => {
  vi.unstubAllEnvs()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const form = setUpFormHarness()

const CONTACT = { fullName: 'Ada Lovelace', email: 'ada@example.com', message: 'Is there a dive on Sunday?' }

async function fillContactForm() {
  for (const [name, value] of Object.entries(CONTACT)) await form.type(name, value)
}

const contactValues = () => ({ fullName: form.valueOf('fullName'), email: form.valueOf('email'), message: form.valueOf('message') })

describe('site forms against the submit-request function', () => {
  it('sends the values with the locale, the page and what the honeypot holds', async () => {
    window.history.replaceState(null, '', '/en/contact/')
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000123' }))
    await form.render(createElement(ContactForm))
    await fillContactForm()
    await form.type('website', 'spam.example')

    await form.clickSubmit()

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(sentEnvelope(fetchImpl, 0)).toMatchObject({ kind: 'contact', locale: 'en', pagePath: '/en/contact/', website: 'spam.example', values: CONTACT })
  })

  it('leaves the honeypot out when a person sends the form', async () => {
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000124' }))
    await form.render(createElement(ContactForm))
    await fillContactForm()

    await form.clickSubmit()

    expect(sentEnvelope(fetchImpl, 0)).not.toHaveProperty('website')
  })

  it('keeps what was typed after an error and retries with the same key', async () => {
    const fetchImpl = fakeFetch(new TypeError('Failed to fetch'), json(503, { ok: false, error: 'server' }), json(200, { ok: true, reference: 'DRG-000125' }))
    await render(ContactForm)
    await fillContactForm()

    await form.clickSubmit()
    expect(form.statusText()).toContain(ui.forms.result.errors.network)
    expect(contactValues()).toEqual(CONTACT)
    expect(form.submitButton().disabled).toBe(false)
    const key = sentEnvelope(fetchImpl, 0).idempotencyKey

    await form.clickSubmit()
    expect(form.statusText()).toContain(ui.forms.result.errors.unavailable)
    expect(contactValues()).toEqual(CONTACT)
    expect(sentEnvelope(fetchImpl, 1).idempotencyKey).toBe(key)

    await form.clickSubmit()
    expect(form.referenceText()).toBe('DRG-000125')
    expect(sentEnvelope(fetchImpl, 2)).toMatchObject({ idempotencyKey: key, values: CONTACT })
  })

  it('renews the key once a field is edited after an error, and keeps it for an unedited retry', async () => {
    const fetchImpl = fakeFetch(
      json(503, { ok: false, error: 'server' }),
      json(503, { ok: false, error: 'server' }),
      json(503, { ok: false, error: 'server' }),
      json(200, { ok: true, reference: 'DRG-000131' }),
    )
    await render(ContactForm)
    await fillContactForm()

    await form.clickSubmit()
    const key = sentEnvelope(fetchImpl, 0).idempotencyKey

    // Nothing changed: the same request, so the same key.
    await form.clickSubmit()
    expect(sentEnvelope(fetchImpl, 1).idempotencyKey).toBe(key)

    // The server may already hold the first attempt under `key`; changed values must not reuse it.
    await form.type('message', 'Is there a dive on Saturday?')
    await form.clickSubmit()
    const renewed = sentEnvelope(fetchImpl, 2)
    expect(renewed.idempotencyKey).not.toBe(key)
    expect(renewed.values).toMatchObject({ message: 'Is there a dive on Saturday?' })

    // The renewed key is then kept across its own retries.
    await form.clickSubmit()
    expect(sentEnvelope(fetchImpl, 3).idempotencyKey).toBe(renewed.idempotencyKey)
    expect(form.referenceText()).toBe('DRG-000131')
  })

  it('labels the button as sending and marks the form busy while the request is in flight', async () => {
    let answer: (response: Response) => void = () => {}
    const pending = new Promise<Response>((resolve) => {
      answer = resolve
    })
    const fetchImpl = vi.fn(() => pending)
    vi.stubGlobal('fetch', fetchImpl)
    await render(ContactForm)
    await fillContactForm()
    const button = form.submitButton()
    expect(button.textContent).toBe(ui.forms.submit)
    expect(form.has('form[aria-busy="true"]')).toBe(false)

    // A click without settling: validation runs, fetch starts and stays pending.
    await act(async () => button.click())
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(button.textContent).toBe(ui.forms.sending)
    expect(button.disabled).toBe(true)
    expect(form.has('form[aria-busy="true"]')).toBe(true)

    answer(json(200, { ok: true, reference: 'DRG-000132' }))
    // The button is disabled, so this click sends nothing; it only lets the result settle.
    await form.clickSubmit()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(form.referenceText()).toBe('DRG-000132')
    expect(button.textContent).toBe(ui.forms.submit)
    expect(form.has('form[aria-busy="true"]')).toBe(false)
  })

  it('starts over once the request is stored, so a second click cannot store it twice', async () => {
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000126' }), json(200, { ok: true, reference: 'DRG-000127' }))
    await render(ContactForm)
    await fillContactForm()
    await form.type('phone', '+90 555 000 00 00')
    await form.type('website', 'spam.example')

    await form.clickSubmit()
    const key = sentEnvelope(fetchImpl, 0).idempotencyKey

    // Defaults back, honeypot empty; the success message keeps the reference.
    expect(contactValues()).toEqual({ fullName: '', email: '', message: '' })
    expect(form.valueOf('phone')).toBe('')
    expect(form.valueOf('website')).toBe('')
    expect(form.statusText()).toContain(ui.forms.result.sentTitle)
    expect(form.referenceText()).toBe('DRG-000126')

    // Further clicks send nothing until the visitor writes a new request.
    expect(form.submitButton().disabled).toBe(true)
    await form.clickSubmit()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(form.referenceText()).toBe('DRG-000126')

    await fillContactForm()
    expect(form.submitButton().disabled).toBe(false)
    await form.clickSubmit()
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    const next = sentEnvelope(fetchImpl, 1)
    expect(next.idempotencyKey).not.toBe(key)
    expect(next).not.toHaveProperty('website')
    expect(form.referenceText()).toBe('DRG-000127')
  })

  it('does not report the emptied form as invalid', async () => {
    fakeFetch(json(200, { ok: true, reference: 'DRG-000128' }))
    await render(ContactForm)
    await fillContactForm()
    await form.clickSubmit()

    // Validation is back to "on submit": typing a partial address shows no error yet.
    await form.type('email', 'ada@')
    expect(form.has('[aria-invalid="true"]')).toBe(false)
  })

  it('sends an event request with its event, then puts the party size back to its default', async () => {
    const event = contentData.events.find((candidate) => candidate.status === 'published' && !needsDistribution(candidate.options))
    if (!event) throw new Error('no published single-option event in the content')
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000129' }))
    await form.render(createElement(EventRequestForm, { event }))
    await form.type('fullName', 'Ada Lovelace')
    await form.type('email', 'ada@example.com')
    await form.type('preferredDate', '2026-12-05')
    await form.type('partySize', '3')

    await form.clickSubmit()

    expect(sentEnvelope(fetchImpl, 0)).toMatchObject({ kind: 'event', eventId: event.id, values: { partySize: 3, preferredDate: '2026-12-05' } })
    expect(form.referenceText()).toBe('DRG-000129')
    expect(form.valueOf('partySize')).toBe('2')
    expect(form.valueOf('preferredDate')).toBe('')
  })

  it('also resets the transfer form’s child seats', async () => {
    fakeFetch(json(200, { ok: true, reference: 'DRG-000130' }))
    await render(TransportForm)
    await form.click('input[name="childSeat"]')
    await form.click('button[type="button"]')
    await form.type('childSeatAges.0', '4')
    await form.type('childSeatAges.1', '7')
    for (const [name, value] of Object.entries({ from: 'Dalaman Airport', to: 'Kaş', dateTime: '2026-12-05T14:00', fullName: 'Ada Lovelace', email: 'ada@example.com' })) {
      await form.type(name, value)
    }

    await form.clickSubmit()
    expect(form.referenceText()).toBe('DRG-000130')
    expect(form.has('input[name="childSeatAges.0"]')).toBe(false)

    // A new request starts with one seat again, not the two of the last one.
    await form.click('input[name="childSeat"]')
    expect(form.has('input[name="childSeatAges.0"]')).toBe(true)
    expect(form.has('input[name="childSeatAges.1"]')).toBe(false)
  })
})

async function render(component: ComponentType) {
  await form.render(createElement(component))
}
