import { describe, expect, it, vi } from 'vitest'
import { CONSENT_VERSION, createConsentStore, parseStoredConsent, serializeConsent } from '../../src/lib/consent/consentStore'

const stored = (value: Record<string, unknown>) => JSON.stringify(value)
const VALID = { version: CONSENT_VERSION, analytics: true, marketing: false, savedAt: '2026-11-03T10:00:00.000Z' }

/** A Storage stand-in; `fail` makes every access throw, like a private window that blocks storage. */
function memoryStorage(initial: Record<string, string> = {}, fail = false): Storage {
  const data = new Map(Object.entries(initial))
  const guard = () => {
    if (fail) throw new DOMException('The operation is insecure.', 'SecurityError')
  }
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => {
      guard()
      return data.get(key) ?? null
    },
    setItem: (key, value) => {
      guard()
      data.set(key, value)
    },
    removeItem: (key) => data.delete(key),
  }
}

describe('parseStoredConsent', () => {
  it('reads a choice saved under the current version', () => {
    expect(parseStoredConsent(stored(VALID))).toEqual({ analytics: true, marketing: false })
  })

  it('asks again when nothing usable is stored', () => {
    for (const raw of [null, '', 'not json', '{', 'null', '[]', '"yes"', '42']) {
      expect(parseStoredConsent(raw), String(raw)).toBeNull()
    }
  })

  it('asks again after CONSENT_VERSION is bumped', () => {
    expect(parseStoredConsent(stored({ ...VALID, version: CONSENT_VERSION - 1 }))).toBeNull()
    expect(parseStoredConsent(stored({ ...VALID, version: String(CONSENT_VERSION) }))).toBeNull()
  })

  it('asks again when a field is missing or of the wrong type', () => {
    for (const field of ['version', 'analytics', 'marketing', 'savedAt'] as const) {
      const { [field]: _dropped, ...rest } = VALID
      expect(parseStoredConsent(stored(rest)), `without ${field}`).toBeNull()
    }
    expect(parseStoredConsent(stored({ ...VALID, analytics: 'true' }))).toBeNull()
    expect(parseStoredConsent(stored({ ...VALID, marketing: 1 }))).toBeNull()
  })
})

describe('serializeConsent', () => {
  it('records the consent text version and the time of the choice', () => {
    const raw = serializeConsent({ analytics: false, marketing: true }, new Date('2026-11-03T10:00:00Z'))
    expect(JSON.parse(raw)).toEqual({ version: CONSENT_VERSION, analytics: false, marketing: true, savedAt: '2026-11-03T10:00:00.000Z' })
    expect(parseStoredConsent(raw)).toEqual({ analytics: false, marketing: true })
  })
})

describe('createConsentStore', () => {
  it('starts with the stored choice, or none', () => {
    expect(createConsentStore(() => memoryStorage({ 'dragoman.consent': stored(VALID) })).getSnapshot()).toEqual({
      choice: { analytics: true, marketing: false },
      reopened: false,
    })
    expect(createConsentStore(() => memoryStorage()).getSnapshot()).toEqual({ choice: null, reopened: false })
  })

  it('keeps the same snapshot until something changes', () => {
    const store = createConsentStore(() => memoryStorage())
    expect(store.getSnapshot()).toBe(store.getSnapshot())
  })

  it('saves a choice, tells subscribers and closes the banner', () => {
    const storage = memoryStorage()
    const store = createConsentStore(() => storage)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    store.reopen()
    store.save({ analytics: true, marketing: false })
    expect(store.getSnapshot()).toEqual({ choice: { analytics: true, marketing: false }, reopened: false })
    expect(parseStoredConsent(storage.getItem('dragoman.consent'))).toEqual({ analytics: true, marketing: false })
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    store.reopen()
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('reopens and closes the banner without touching the choice', () => {
    const store = createConsentStore(() => memoryStorage({ 'dragoman.consent': stored(VALID) }))
    store.reopen()
    expect(store.getSnapshot()).toEqual({ choice: { analytics: true, marketing: false }, reopened: true })
    store.close()
    expect(store.getSnapshot()).toEqual({ choice: { analytics: true, marketing: false }, reopened: false })
  })

  it('follows a choice made in another tab, listening only while someone subscribes', () => {
    const storage = memoryStorage({ 'dragoman.consent': stored(VALID) })
    const tabs = new EventTarget()
    const add = vi.spyOn(tabs, 'addEventListener')
    const store = createConsentStore(() => storage, () => tabs)
    expect(add).not.toHaveBeenCalled()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    expect(store.getSnapshot().choice).toEqual({ analytics: true, marketing: false })

    storage.setItem('dragoman.consent', stored({ ...VALID, analytics: false }))
    tabs.dispatchEvent(Object.assign(new Event('storage'), { key: 'dragoman.consent' }))
    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot().choice).toEqual({ analytics: false, marketing: false })

    tabs.dispatchEvent(Object.assign(new Event('storage'), { key: 'something-else' }))
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    storage.setItem('dragoman.consent', stored(VALID))
    tabs.dispatchEvent(Object.assign(new Event('storage'), { key: 'dragoman.consent' }))
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('works for the page when storage throws (private window), and asks again next time', () => {
    const store = createConsentStore(() => memoryStorage({}, true))
    expect(store.getSnapshot().choice).toBeNull()
    expect(() => store.save({ analytics: false, marketing: false })).not.toThrow()
    expect(store.getSnapshot().choice).toEqual({ analytics: false, marketing: false })
    expect(createConsentStore(() => memoryStorage({}, true)).getSnapshot().choice).toBeNull()
  })

  it('survives a storage getter that throws', () => {
    const store = createConsentStore(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    })
    expect(store.getSnapshot().choice).toBeNull()
    expect(() => store.save({ analytics: true, marketing: true })).not.toThrow()
  })
})
