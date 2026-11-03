import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type RefObject } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath } from '../../i18n/pages'
import { pageTitle } from '../../i18n/pageTitles'
import { isWhatsAppLink, type Ga4 } from '../../lib/analytics/ga4'
import { consentStore, type ConsentChoice } from '../../lib/consent/consentStore'
import { buttonClass } from '../ui/Button'

/** The server HTML and the hydration pass have no stored choice to show. */
const serverSnapshot = () => null

/**
 * Cookie banner and consent-gated GA4 (V6 decision 13/25), mounted only while VITE_GA4_ID is set
 * (RootLayout). Client-only: the prerendered HTML and the hydration pass render nothing, so content
 * never depends on consent (SEO-01) and the static page does not shift. The banner is fixed to the
 * bottom and not modal; the page stays readable and usable behind it.
 */
export function CookieConsent({ analytics }: { analytics: Ga4 }) {
  const state = useSyncExternalStore(consentStore.subscribe, consentStore.getSnapshot, serverSnapshot)
  const locale = useLocale()
  const { pathname } = useLocation()
  // 'pending' during hydration: nothing is read yet, so nothing is turned on or off.
  const measurement = state === null ? 'pending' : state.choice?.analytics ? 'on' : 'off'
  const granted = measurement === 'on'

  // Consent first, then the page view below: effects run in this order.
  useEffect(() => {
    if (measurement === 'on') analytics.grant()
    else if (measurement === 'off') analytics.withdraw()
  }, [analytics, measurement])

  useEffect(() => {
    if (!granted) return
    // The page head writes the new title in the next frame; the page view reads it after that.
    const frame = requestAnimationFrame(() => analytics.pageView(pathname, document.title))
    return () => cancelAnimationFrame(frame)
  }, [analytics, granted, pathname])

  useEffect(() => {
    if (!granted) return
    // One listener for every WhatsApp link, content links included; capture, so no handler can stop it.
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (link && isWhatsAppLink(link.getAttribute('href'), window.location.href)) analytics.whatsappClick(locale)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [analytics, granted, locale])

  if (!state || (state.choice && !state.reopened)) return null
  // Keyed, so reopening from the footer starts with the categories open and the stored choice ticked.
  return <ConsentBanner key={String(state.reopened)} choice={state.choice} reopened={state.reopened} />
}

interface ConsentBannerProps {
  choice: ConsentChoice | null
  reopened: boolean
}

function ConsentBanner({ choice, reopened }: ConsentBannerProps) {
  const ui = useUi()
  const locale = useLocale()
  const text = ui.consent
  const id = useId()
  const [managing, setManaging] = useState(reopened)
  const [analytics, setAnalytics] = useState(choice?.analytics ?? false)
  const [marketing, setMarketing] = useState(choice?.marketing ?? false)
  const regionRef = useRef<HTMLElement>(null)
  const analyticsRef = useRef<HTMLInputElement>(null)

  // Opened from the footer: focus moves into the banner. A first visit's banner leaves focus where it is.
  useEffect(() => {
    if (reopened) regionRef.current?.focus()
  }, [reopened])
  // "Manage preferences" gives way to the categories; focus goes to the first one that can be changed.
  useEffect(() => {
    if (managing && !reopened) analyticsRef.current?.focus()
  }, [managing, reopened])

  // The footer's "Cookie preferences" button (Footer.tsx) opened it; focus goes back there.
  const backToFooter = () => {
    if (reopened) document.querySelector<HTMLElement>('[data-consent-reopen]')?.focus()
  }
  const decide = (next: ConsentChoice) => {
    consentStore.save(next)
    // The clicked button unmounts: keyboard users go on in the page content (RootLayout's #main).
    if (reopened) backToFooter()
    else document.getElementById('main')?.focus()
  }
  // Escape leaves a reopened banner unchanged; a first visit still needs an answer.
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !choice) return
    event.stopPropagation()
    consentStore.close()
    backToFooter()
  }

  return (
    <section
      ref={regionRef}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      onKeyDown={onKeyDown}
      data-consent-banner=""
      className="fixed inset-x-0 bottom-0 z-40 max-h-[70dvh] overflow-y-auto border-t border-line bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-sm text-ink shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-green md:inset-x-auto md:right-6 md:bottom-6 md:w-full md:max-w-md md:rounded-card md:border md:pb-4"
    >
      <h2 id={`${id}-title`} className="font-display text-lg font-semibold uppercase tracking-wide text-brand-green">
        {text.title}
      </h2>
      <p className="mt-2">
        {text.body}{' '}
        <Link to={localePath(locale, 'privacy')} className="font-semibold text-brand-green underline">
          {pageTitle(ui, 'privacy')}
        </Link>
      </p>
      {managing && (
        <fieldset className="mt-4 space-y-3">
          <legend className="sr-only">{text.categories}</legend>
          <Category id={`${id}-necessary`} label={text.necessary} description={text.necessaryText} checked />
          <Category id={`${id}-analytics`} label={text.analytics} description={text.analyticsText} checked={analytics} onChange={setAnalytics} inputRef={analyticsRef} />
          <Category id={`${id}-marketing`} label={text.marketing} description={text.marketingText} checked={marketing} onChange={setMarketing} />
        </fieldset>
      )}
      {/* Accept and Reject side by side and alike: refusing is as easy as agreeing. */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className={buttonClass('primary')} onClick={() => decide({ analytics: true, marketing: true })}>
          {text.accept}
        </button>
        <button type="button" className={buttonClass('primary')} onClick={() => decide({ analytics: false, marketing: false })}>
          {text.reject}
        </button>
        {managing ? (
          <button type="button" className={buttonClass('secondary', 'col-span-2')} onClick={() => decide({ analytics, marketing })}>
            {text.save}
          </button>
        ) : (
          <button type="button" className={buttonClass('secondary', 'col-span-2')} onClick={() => setManaging(true)}>
            {text.manage}
          </button>
        )}
      </div>
    </section>
  )
}

interface CategoryProps {
  id: string
  label: string
  description: string
  checked: boolean
  /** Without one the category cannot be switched off (necessary storage). */
  onChange?: (checked: boolean) => void
  inputRef?: RefObject<HTMLInputElement | null>
}

function Category({ id, label, description, checked, onChange, inputRef }: CategoryProps) {
  return (
    <div className="flex gap-3">
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        checked={checked}
        disabled={!onChange}
        onChange={(event) => onChange?.(event.target.checked)}
        aria-describedby={`${id}-text`}
        className="mt-0.5 size-5 shrink-0 accent-brand-green"
      />
      <div>
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <p id={`${id}-text`} className="text-ink-muted">
          {description}
        </p>
      </div>
    </div>
  )
}
