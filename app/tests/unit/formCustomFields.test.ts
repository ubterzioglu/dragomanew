// @vitest-environment jsdom
import { act, createElement, type ComponentType, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { contentData } from '../../src/content/data'
import { LocaleProvider } from '../../src/i18n/LocaleContext'
import type { DragomanEvent } from '../../src/content/schema'
import type { SiteForm } from '../../src/features/forms/formDefinition'
import { DEFAULT_FORM_DEFINITIONS, type FormDefinition, type FormField } from '../../src/shared/requests/forms'
import { submitEnvelopeSchema, type RequestKind, type SubmitEnvelope } from '../../src/shared/requests/payload'
import { setUpFormHarness } from './formHarness'

/**
 * Site forms under an editable definition (dalga2-sozlesme §8): order, hidden and required free
 * fields, labels, custom fields, and `formVersion` for published versions only.
 */
const BASE_URL = 'http://127.0.0.1:54321'

type FormProps = { form?: SiteForm }
let ContactForm: ComponentType<FormProps>
let TransportForm: ComponentType<FormProps>
let LodgingForm: ComponentType<FormProps>
let EventRequestForm: ComponentType<FormProps & { event: DragomanEvent }>

beforeAll(async () => {
  vi.stubEnv('VITE_SUPABASE_URL', BASE_URL)
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test-key')
  ;({ ContactForm } = await import('../../src/features/forms/ContactForm'))
  ;({ TransportForm } = await import('../../src/features/forms/TransportForm'))
  ;({ LodgingForm } = await import('../../src/features/forms/LodgingForm'))
  ;({ EventRequestForm } = await import('../../src/features/forms/EventRequestForm'))
})

afterAll(() => {
  vi.unstubAllEnvs()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const form = setUpFormHarness()

function fakeFetch() {
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ok: true, reference: 'DRG-000900' }), { status: 200 }))
  vi.stubGlobal('fetch', fetchImpl)
  return fetchImpl
}

const sent = (fetchImpl: ReturnType<typeof fakeFetch>): SubmitEnvelope => {
  const call = fetchImpl.mock.calls[0] as unknown as [string, RequestInit] | undefined
  return submitEnvelopeSchema.parse(JSON.parse(String(call?.[1].body)))
}

const CITY: FormField = { kind: 'custom', key: 'c_city', type: 'text', required: true, label: { tr: 'Şehir', en: 'Home town' }, help: { tr: 'Yaşadığınız yer', en: 'Where you live' } }
const LEVEL: FormField = {
  kind: 'custom',
  key: 'c_level',
  type: 'select',
  required: false,
  label: { tr: 'Seviye' },
  options: [
    { value: 'new', label: { tr: 'Yeni', en: 'Beginner' } },
    { value: 'pro', label: { tr: 'Usta', en: 'Expert' } },
  ],
}

/** City first, then the contact form with phone required, subject hidden and a relabelled message. */
const CONTACT_V2: FormDefinition = {
  format: 1,
  fields: [
    CITY,
    ...DEFAULT_FORM_DEFINITIONS.contact.fields.map((field): FormField => {
      if (field.key === 'phone') return { ...field, required: true }
      if (field.key === 'subject') return { ...field, hidden: true }
      if (field.key === 'message') return { ...field, label: { tr: 'Sorunuz', en: 'Your question' } }
      return field
    }),
    LEVEL,
  ],
}

/** Visible labels; the honeypot's sits in an aria-hidden wrapper. */
const labels = () => Array.from(document.querySelectorAll('form label:not([aria-hidden] label)'), (label) => label.textContent?.trim())
/** Prerendered markup, as the static build writes it. */
const markup = (element: ReactElement) => renderToStaticMarkup(createElement(LocaleProvider, { locale: 'en', children: element }))

async function select(name: string, value: string) {
  const element = document.querySelector(`select[name="${name}"]`)
  if (!(element instanceof HTMLSelectElement)) throw new Error(`no select ${name}`)
  await act(async () => {
    element.value = value
    element.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

describe('site forms under a form definition', () => {
  it('render the built-in definition exactly like the built-in form', async () => {
    const event = contentData.events[0]
    if (!event) throw new Error('fixture has no event')
    const cases: Array<[RequestKind, (props: FormProps) => ReturnType<typeof createElement>]> = [
      ['contact', (props) => createElement(ContactForm, props)],
      ['transport', (props) => createElement(TransportForm, props)],
      ['lodging', (props) => createElement(LodgingForm, props)],
      ['event', (props) => createElement(EventRequestForm, { ...props, event })],
    ]
    for (const [kind, element] of cases) {
      const builtIn = markup(element({}))
      expect(builtIn).toContain('name="email"')
      expect(markup(element({ form: { version: 0, definition: DEFAULT_FORM_DEFINITIONS[kind] } })), kind).toBe(builtIn)
    }
  })

  it('follow the order, flags and labels of a published version and send its number', async () => {
    const fetchImpl = fakeFetch()
    await form.render(createElement(ContactForm, { form: { version: 2, definition: CONTACT_V2 } }))

    expect(labels()).toEqual(['Home town', 'Full name', 'Email', 'Phone', 'Your question', 'Seviye(optional)'])
    expect(form.has('[name="subject"]')).toBe(false)
    expect(document.querySelector('[name="phone"]')?.getAttribute('aria-required')).toBe('true')
    expect(document.body.textContent).toContain('Where you live')
    expect(Array.from(document.querySelectorAll('select[name="custom.c_level"] option'), (option) => option.textContent)).toEqual(['—', 'Beginner', 'Expert'])

    await form.type('fullName', 'Ada Lovelace')
    await form.type('email', 'ada@example.com')
    await form.type('message', 'Is there a dive on Sunday?')
    await form.clickSubmit()
    // Phone and the town are required in this version: nothing is sent yet.
    expect(fetchImpl).not.toHaveBeenCalled()

    await form.type('phone', '+90 555')
    await form.type('custom.c_city', 'Kaş')
    await select('custom.c_level', 'pro')
    await form.clickSubmit()

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const envelope = sent(fetchImpl)
    expect(envelope.formVersion).toBe(2)
    expect(envelope.values).toMatchObject({ phone: '+90 555', custom: { c_city: 'Kaş', c_level: 'pro' } })
    expect(envelope.values).not.toHaveProperty('subject')
  })

  it.each([
    ['the fixture form (version 0)', { version: 0, definition: DEFAULT_FORM_DEFINITIONS.contact }],
    ['a definition that does not validate', { version: 5, definition: { format: 1, fields: DEFAULT_FORM_DEFINITIONS.contact.fields.filter((field) => field.key !== 'email') } }],
  ] satisfies Array<[string, SiteForm]>)('send no formVersion for %s', async (_name, site) => {
    const fetchImpl = fakeFetch()
    await form.render(createElement(ContactForm, { form: site }))
    await form.type('fullName', 'Ada Lovelace')
    await form.type('email', 'ada@example.com')
    await form.type('message', 'Is there a dive on Sunday?')
    await form.clickSubmit()
    expect(sent(fetchImpl)).not.toHaveProperty('formVersion')
  })

  it('hide a free field of the transport form and drop its value', async () => {
    const definition: FormDefinition = {
      format: 1,
      fields: DEFAULT_FORM_DEFINITIONS.transport.fields.map((field) => (field.key === 'childSeat' ? { ...field, hidden: true } : field)),
    }
    await form.render(createElement(TransportForm, { form: { version: 3, definition } }))
    expect(form.has('[name="childSeat"]')).toBe(false)
    expect(form.has('[name="from"]')).toBe(true)
  })
})
