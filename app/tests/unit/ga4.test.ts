// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cookieDomains, createGa4, expireGaCookies, GTAG_SCRIPT_URL, isWhatsAppLink } from '../../src/lib/analytics/ga4'

const ID = 'G-TEST12345'
const ORIGIN = window.location.origin
const gaWindow = window as unknown as { dataLayer?: IArguments[] } & Record<string, unknown>

const gaScripts = () => [...document.querySelectorAll('script')].filter((script) => script.src.startsWith(GTAG_SCRIPT_URL))
const commands = () => (gaWindow.dataLayer ?? []).map((entry) => Array.from(entry))
const events = () => commands().filter(([command]) => command === 'event')
const cookieNames = () => document.cookie.split('; ').filter(Boolean).map((cookie) => cookie.split('=')[0])

afterEach(() => {
  for (const script of gaScripts()) script.remove()
  delete gaWindow.dataLayer
  delete gaWindow[`ga-disable-${ID}`]
  for (const name of cookieNames()) document.cookie = `${name}=; Max-Age=0; Path=/`
  Reflect.deleteProperty(document, 'referrer')
})

describe('createGa4 before consent', () => {
  it('loads nothing, sets no cookie and records nothing', () => {
    const ga = createGa4(ID)
    ga.pageView('/en/', 'Home | Dragoman')
    ga.formSent('contact', 'en')
    ga.whatsappClick('en')
    expect(gaScripts()).toHaveLength(0)
    expect(gaWindow.dataLayer).toBeUndefined()
    expect(document.cookie).toBe('')
  })

  it('loads nothing when the visitor declines first', () => {
    const ga = createGa4(ID)
    ga.withdraw()
    expect(gaScripts()).toHaveLength(0)
    expect(gaWindow.dataLayer).toBeUndefined()
    expect(gaWindow[`ga-disable-${ID}`]).toBe(true)
  })
})

describe('createGa4 after consent', () => {
  it('injects gtag.js once, with the data layer gtag.js reads', () => {
    const ga = createGa4(ID)
    ga.grant()
    ga.grant()
    const scripts = gaScripts()
    expect(scripts).toHaveLength(1)
    expect(scripts[0]?.src).toBe(`${GTAG_SCRIPT_URL}?id=${ID}`)
    expect(scripts[0]?.async).toBe(true)
    // gtag.js only runs Arguments objects from the data layer, as Google's snippet pushes them.
    for (const entry of gaWindow.dataLayer ?? []) expect(Object.prototype.toString.call(entry)).toBe('[object Arguments]')
    expect(commands().filter(([command]) => command === 'config')).toHaveLength(1)
    expect(gaWindow[`ga-disable-${ID}`]).toBe(false)
  })

  it('keeps ads off, sends no automatic page view, keeps cookies 13 months at most and strips the query from page and referrer', () => {
    Object.defineProperty(document, 'referrer', { value: 'https://mail.example.com/inbox/jane-smith/?q=dragoman+kas', configurable: true })
    window.history.replaceState(null, '', '/en/contact/?utm_source=mail#form')
    createGa4(ID).grant()
    expect(commands()[0]).toEqual(['consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }])
    expect(commands()[1]?.[0]).toBe('js')
    expect(commands()[2]).toEqual([
      'config',
      ID,
      {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        // 395 days, not renewed on each hit (CNIL's 13 months).
        cookie_expires: 34_128_000,
        cookie_update: false,
        page_location: `${ORIGIN}/en/contact/`,
        // Another site's path may name a person: only its origin is kept.
        page_referrer: 'https://mail.example.com/',
      },
    ])
    window.history.replaceState(null, '', '/')
  })

  it('never throws into the page, whatever a blocker did to the data layer', () => {
    gaWindow.dataLayer = {} as unknown as IArguments[]
    const ga = createGa4(ID)
    expect(() => {
      ga.grant()
      ga.pageView('/en/diving/', 'Diving | Dragoman')
      ga.formSent('contact', 'en')
      ga.whatsappClick('en')
      ga.withdraw()
    }).not.toThrow()
  })

  it('stops measuring at once on withdrawal and removes the GA cookies', () => {
    document.cookie = '_ga=GA1.1.123.456; Path=/'
    document.cookie = `_ga_${ID.slice(2)}=GS1.1.789; Path=/`
    document.cookie = 'kept=1; Path=/'
    const ga = createGa4(ID)
    ga.grant()
    ga.withdraw()
    expect(gaWindow[`ga-disable-${ID}`]).toBe(true)
    expect(commands().at(-1)).toEqual(['consent', 'update', { analytics_storage: 'denied' }])
    expect(cookieNames()).toEqual(['kept'])

    const before = commands().length
    ga.pageView('/en/', 'Home | Dragoman')
    ga.formSent('contact', 'en')
    ga.whatsappClick('en')
    expect(commands()).toHaveLength(before)
    expect(gaScripts()).toHaveLength(1)
  })

  it('measures again after a new consent without loading the script twice', () => {
    const ga = createGa4(ID)
    ga.grant()
    ga.withdraw()
    ga.grant()
    expect(gaWindow[`ga-disable-${ID}`]).toBe(false)
    expect(commands().at(-1)).toEqual(['consent', 'update', { analytics_storage: 'granted' }])
    expect(gaScripts()).toHaveLength(1)
    ga.pageView('/tr/', 'Ana sayfa | Dragoman')
    expect(events()).toHaveLength(1)
  })
})

describe('event payloads', () => {
  const ALLOWED: Readonly<Record<string, readonly string[]>> = {
    page_view: ['page_location', 'page_title'],
    generate_lead: ['form_kind', 'locale'],
    whatsapp_click: ['locale'],
  }

  it('carry only the allowed fields', () => {
    const ga = createGa4(ID)
    ga.grant()
    ga.pageView('/en/diving/?utm_source=x#top', 'Diving | Dragoman')
    ga.formSent('event-request', 'de')
    ga.whatsappClick('tr')
    expect(events()).toEqual([
      ['event', 'page_view', { page_location: `${ORIGIN}/en/diving/`, page_title: 'Diving | Dragoman' }],
      ['event', 'generate_lead', { form_kind: 'event-request', locale: 'de' }],
      ['event', 'whatsapp_click', { locale: 'tr' }],
    ])
    for (const [, name, params] of events()) {
      expect(Object.keys(params as object).sort(), String(name)).toEqual([...(ALLOWED[String(name)] ?? [])].sort())
      expect(JSON.stringify(params)).not.toMatch(/[?#@]/)
    }
  })

  it('point later events at the page the visitor is on', () => {
    const ga = createGa4(ID)
    ga.grant()
    ga.pageView('/fr/contact/', 'Contact | Dragoman')
    expect(commands().at(-2)).toEqual(['set', { page_location: `${ORIGIN}/fr/contact/` }])
  })

  it('report a participant-form page by the form root only, never the rest of its path', () => {
    const ga = createGa4(ID)
    ga.grant()
    ga.pageView('/tr/katilimci-formu/diving/kisiye-ozel-anahtar/', 'Sağlık formu | Dragoman')
    ga.pageView('/participant-form/outdoor/', 'Participant form | Dragoman')
    // The router matches case-insensitively and on the decoded path; so does the filter.
    ga.pageView('/tr/Katilimci-Formu/diving/anahtar/', 'Sağlık formu | Dragoman')
    ga.pageView('/tr/katilimci%2Dformu/diving/anahtar/', 'Sağlık formu | Dragoman')
    expect(events().map(([, , params]) => (params as { page_location: string }).page_location)).toEqual([
      `${ORIGIN}/tr/katilimci-formu/`,
      `${ORIGIN}/participant-form/`,
      `${ORIGIN}/tr/katilimci-formu/`,
      `${ORIGIN}/tr/katilimci-formu/`,
    ])
  })

  it('send nothing for the health form, whatever happens on its page', () => {
    const ga = createGa4(ID)
    ga.grant()
    ga.formSent('health', 'tr')
    expect(events()).toEqual([])
  })
})

describe('expireGaCookies', () => {
  it('expires every _ga cookie on the host and each parent domain, and nothing else', () => {
    const writes: string[] = []
    const jar = {
      get cookie() {
        return '_ga=GA1.1.1; _ga_ABC123=GS1.1.2; _gab=keep; session=keep'
      },
      set cookie(value: string) {
        writes.push(value)
      },
    }
    expireGaCookies(jar, 'www.dragoman-turkey.com')
    const expired = (name: string, domain?: string) => `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}`
    expect(writes.sort()).toEqual(
      [
        expired('_ga'),
        expired('_ga', 'www.dragoman-turkey.com'),
        expired('_ga', 'dragoman-turkey.com'),
        expired('_ga_ABC123'),
        expired('_ga_ABC123', 'www.dragoman-turkey.com'),
        expired('_ga_ABC123', 'dragoman-turkey.com'),
      ].sort(),
    )
  })

  it('lists the cookie domains from the host up to the registrable one', () => {
    expect(cookieDomains('www.dragoman-turkey.com')).toEqual(['www.dragoman-turkey.com', 'dragoman-turkey.com'])
    expect(cookieDomains('notyetbro.club')).toEqual(['notyetbro.club'])
    expect(cookieDomains('localhost')).toEqual([])
    expect(cookieDomains('127.0.0.1')).toEqual([])
  })
})

describe('isWhatsAppLink', () => {
  it('recognises WhatsApp chat links only', () => {
    expect(isWhatsAppLink('https://wa.me/905332901463', ORIGIN)).toBe(true)
    expect(isWhatsAppLink('https://api.whatsapp.com/send?phone=905332901463', ORIGIN)).toBe(true)
    for (const href of [null, '', '/en/contact/', 'https://example.com/wa.me/905332901463', 'mailto:info@dragoman-turkey.com', 'https://wa.me.example.com/']) {
      expect(isWhatsAppLink(href, ORIGIN), String(href)).toBe(false)
    }
  })
})
