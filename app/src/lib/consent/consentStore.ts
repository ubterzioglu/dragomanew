/**
 * The visitor's cookie choice (V6 decision 13/25), kept in localStorage on this site only: no
 * server and no cookie of its own. Necessary storage is always on and not stored; analytics and
 * marketing stay off until granted. Marketing has no tags yet: it is recorded, nothing reads it.
 */

/** Version of the consent text. Bump it to ask every visitor again (new wording, category or tag). */
export const CONSENT_VERSION = 1

const STORAGE_KEY = 'dragoman.consent'

export interface ConsentChoice {
  readonly analytics: boolean
  readonly marketing: boolean
}

export interface ConsentState {
  /** null: nothing valid is stored, so the banner asks. */
  readonly choice: ConsentChoice | null
  /** The visitor opened the banner again from the footer to change the choice. */
  readonly reopened: boolean
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

/** The stored choice, or null to ask again: nothing stored, unreadable, another version or a field missing. */
export function parseStoredConsent(raw: string | null): ConsentChoice | null {
  if (!raw) return null
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(value) || value.version !== CONSENT_VERSION) return null
  const { analytics, marketing, savedAt } = value
  if (typeof analytics !== 'boolean' || typeof marketing !== 'boolean' || typeof savedAt !== 'string') return null
  return { analytics, marketing }
}

/** What is stored: the choice, the consent text version it answers and when it was made. */
export function serializeConsent(choice: ConsentChoice, savedAt: Date): string {
  return JSON.stringify({ version: CONSENT_VERSION, analytics: choice.analytics, marketing: choice.marketing, savedAt: savedAt.toISOString() })
}

export interface ConsentStore {
  subscribe(listener: () => void): () => void
  getSnapshot(): ConsentState
  save(choice: ConsentChoice): void
  reopen(): void
  close(): void
}

/**
 * `storage` is called on each access: the localStorage getter itself throws where site data is
 * blocked (some private windows). Then the choice holds for this page only and the next page asks again.
 * `tabs` delivers the `storage` events of other tabs, so a withdrawal there stops measuring here too;
 * it is listened to only while someone subscribes, so merely importing this module does nothing.
 */
export function createConsentStore(
  storage: () => Storage,
  tabs: () => EventTarget | null = () => (typeof window === 'undefined' ? null : window),
): ConsentStore {
  const listeners = new Set<() => void>()
  let state: ConsentState | null = null
  const onOtherTab = (event: Event) => {
    const { key } = event as StorageEvent
    // key null: the other tab cleared all site data.
    if (key === STORAGE_KEY || key === null) update({ choice: read(), reopened: current().reopened })
  }

  const read = (): ConsentChoice | null => {
    try {
      return parseStoredConsent(storage().getItem(STORAGE_KEY))
    } catch {
      return null
    }
  }
  const current = (): ConsentState => (state ??= { choice: read(), reopened: false })
  const update = (next: ConsentState) => {
    state = next
    for (const listener of listeners) listener()
  }

  return {
    subscribe(listener) {
      if (listeners.size === 0) tabs()?.addEventListener('storage', onOtherTab)
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) tabs()?.removeEventListener('storage', onOtherTab)
      }
    },
    getSnapshot: current,
    save(choice) {
      try {
        storage().setItem(STORAGE_KEY, serializeConsent(choice, new Date()))
      } catch {
        // Storage blocked: the choice still applies to this page (see above).
      }
      update({ choice, reopened: false })
    },
    reopen() {
      update({ ...current(), reopened: true })
    },
    close() {
      update({ ...current(), reopened: false })
    },
  }
}

/** The site's store; its first read happens in the browser, after hydration (CookieConsent). */
export const consentStore: ConsentStore = createConsentStore(() => window.localStorage)
