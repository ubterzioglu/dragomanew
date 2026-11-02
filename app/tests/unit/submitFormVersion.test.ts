import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { DEFAULT_FORM_DEFINITIONS, type FormDefinition, type FormField } from '../../src/shared/requests/forms'
import type { RequestKind, SubmitResponse } from '../../src/shared/requests/payload'
import { handleSubmit } from '../../../supabase/functions/submit-request/handler.ts'
import type { Deps, FormVersionRecord, MailMessage, NewRequest, RequestStore } from '../../../supabase/functions/submit-request/types.ts'

/** submit-request step 6 (dalga2-sozlesme §8, §11 E): form versions, free-field flags and custom answers. */

const ORIGIN = 'https://notyetbro.club'
const KEY = 'sb_publishable_test'
const BUSINESS = 'info@dragoman.example'

const withFields = (kind: RequestKind, patch: (field: FormField) => FormField, extra: FormField[] = []): FormDefinition => ({
  format: 1,
  fields: [...DEFAULT_FORM_DEFINITIONS[kind].fields.map(patch), ...extra],
})

const BUDGET: FormField = {
  kind: 'custom',
  key: 'c_budget',
  type: 'select',
  required: true,
  label: { tr: 'Bütçe', en: 'Budget' },
  options: [
    { value: 'low', label: { tr: 'Düşük' } },
    { value: 'high', label: { tr: 'Yüksek' } },
  ],
}
const NEWSLETTER: FormField = { kind: 'custom', key: 'c_news', type: 'checkbox', required: false, label: { tr: 'Bülten' } }

/** v1: today's contact form. v2: phone required, subject hidden, two custom fields. */
const CONTACT_VERSIONS: FormVersionRecord[] = [
  { version: 1, definition: DEFAULT_FORM_DEFINITIONS.contact },
  {
    version: 2,
    definition: withFields(
      'contact',
      (field) => (field.key === 'phone' ? { ...field, required: true } : field.key === 'subject' ? { ...field, hidden: true } : field),
      [BUDGET, NEWSLETTER],
    ),
  },
]

function setup(versions: Partial<Record<RequestKind, FormVersionRecord[]>>, options: { withLookup?: boolean } = {}) {
  const requests: NewRequest[] = []
  const lookups: Array<[RequestKind, number | null]> = []
  const sent: MailMessage[] = []
  const store: RequestStore = {
    throttleSubmission: async () => true,
    findEvent: async () => null,
    saveRequest: async (row) => {
      requests.push(row)
      return { id: `req-${requests.length}`, reference: `DRG-${String(requests.length).padStart(6, '0')}`, created: true }
    },
    queueNotifications: async (rows) => rows.map((_, index) => index + 1),
    markNotification: async () => {},
    hasNotifications: async () => false,
    ...(options.withLookup === false
      ? {}
      : {
          findFormVersion: async (kind: RequestKind, version: number | null) => {
            lookups.push([kind, version])
            const list = versions[kind] ?? []
            if (version === null) return list.at(-1) ?? null
            return list.find((item) => item.version === version) ?? null
          },
        }),
  }
  const deps: Deps = {
    store,
    mailer: { send: async (message) => void sent.push(message) },
    clock: () => new Date('2026-11-02T10:00:00Z'),
    config: { allowedOrigins: [ORIGIN], publishableKeys: [KEY], businessEmail: BUSINESS, panelUrl: null, rateLimit: { max: 50, windowSeconds: 600 }, mailTimeoutMs: 50 },
    hashIp: async (ip) => `hash:${ip}`,
  }
  return { deps, requests, lookups, sent }
}

const contact = (values: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({
  kind: 'contact',
  locale: 'en',
  idempotencyKey: randomUUID(),
  values: { fullName: 'Ada Lovelace', email: 'ada@example.com', message: 'Is there a dive on Sunday?', ...values },
  ...extra,
})

const post = (body: unknown) =>
  new Request('http://localhost/functions/v1/submit-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, apikey: KEY, 'x-forwarded-for': '203.0.113.7' },
    body: JSON.stringify(body),
  })

const send = async (deps: Deps, body: unknown): Promise<[number, SubmitResponse]> => {
  const response = await handleSubmit(post(body), deps)
  return [response.status, (await response.json()) as SubmitResponse]
}

describe('submit-request: form versions', () => {
  it('refuses a version that does not exist on formVersion', async () => {
    const { deps, requests } = setup({ contact: CONTACT_VERSIONS })
    expect(await send(deps, contact({}, { formVersion: 7 }))).toEqual([400, { ok: false, error: 'invalid', fields: ['formVersion'] }])
    expect(requests).toHaveLength(0)
  })

  it('refuses any given version when the store knows no versions', async () => {
    const { deps } = setup({}, { withLookup: false })
    expect(await send(deps, contact({}, { formVersion: 1 }))).toEqual([400, { ok: false, error: 'invalid', fields: ['formVersion'] }])
  })

  it('still accepts an older version after a newer one is published, and stores its number', async () => {
    const { deps, requests } = setup({ contact: CONTACT_VERSIONS })
    const [status] = await send(deps, contact({ subject: 'Dives' }, { formVersion: 1 }))
    expect(status).toBe(200)
    expect(requests[0]).toMatchObject({ formVersion: 1, payload: { subject: 'Dives' } })
  })

  it('uses the latest published version when none is given', async () => {
    const { deps, requests, lookups } = setup({ contact: CONTACT_VERSIONS })
    // v2 requires a phone and the budget answer.
    expect(await send(deps, contact({}))).toEqual([400, { ok: false, error: 'invalid', fields: ['values.phone', 'values.custom'] }])
    const [status] = await send(deps, contact({ phone: '+90 555', custom: { c_budget: 'high' } }))
    expect(status).toBe(200)
    expect(lookups).toContainEqual(['contact', null])
    expect(requests[0]?.formVersion).toBe(2)
  })

  it('falls back to the built-in form, stored without a version, when nothing is published', async () => {
    const { deps, requests } = setup({})
    const [status] = await send(deps, contact({ subject: 'Dives' }))
    expect(status).toBe(200)
    expect(requests[0]).toMatchObject({ formVersion: null, payload: { subject: 'Dives' } })
  })
})

describe('submit-request: definitions are enforced on the server', () => {
  it('enforces a required toggle on a free field', async () => {
    const { deps } = setup({ contact: CONTACT_VERSIONS })
    const [status, body] = await send(deps, contact({ phone: ' ', custom: { c_budget: 'low' } }, { formVersion: 2 }))
    expect(status).toBe(400)
    expect(body).toEqual({ ok: false, error: 'invalid', fields: ['values.phone'] })
  })

  it('drops the value of a hidden field and checks custom answers', async () => {
    const { deps, requests } = setup({ contact: CONTACT_VERSIONS })
    const bad = await send(deps, contact({ phone: '+90 555', custom: { c_budget: 'medium' } }, { formVersion: 2 }))
    expect(bad).toEqual([400, { ok: false, error: 'invalid', fields: ['values.custom.c_budget'] }])

    const [status] = await send(deps, contact({ phone: '+90 555', subject: 'x'.repeat(5000), custom: { c_budget: 'low', c_news: true, c_other: 'no' } }, { formVersion: 2 }))
    expect(status).toBe(200)
    expect(requests[0]?.payload.subject).toBeUndefined()
    expect(requests[0]?.payload.custom).toEqual({ c_budget: 'low', c_news: true })
  })

  it('lists custom answers with their Turkish labels in the business mail only', async () => {
    const { deps, sent } = setup({ contact: CONTACT_VERSIONS })
    await send(deps, contact({ phone: '+90 555', custom: { c_budget: 'high', c_news: false } }, { formVersion: 2 }))
    const business = sent.find((message) => message.to === BUSINESS)
    const receipt = sent.find((message) => message.to === 'ada@example.com')
    expect(business?.text).toContain('Bütçe: Yüksek')
    expect(business?.text).toContain('Bülten: Hayır')
    expect(business?.html).toContain('Bütçe')
    expect(receipt?.text).not.toContain('Bütçe')
  })
})
