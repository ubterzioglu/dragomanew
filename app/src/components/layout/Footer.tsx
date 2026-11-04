import { Link } from 'react-router-dom'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, type PageKey } from '../../i18n/pages'
import { pageTitle } from '../../i18n/pageTitles'
import { consentStore } from '../../lib/consent/consentStore'
import { buildYear, ga4Id } from '../../lib/env'
import { mailHref, siteConfig, telHref } from '../../lib/siteConfig'
import { FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from './SocialIcons'

const EXPLORE: readonly PageKey[] = ['diving', 'lifeguard', 'seaKayak', 'outdoor', 'transport', 'shop']
const COMPANY: readonly PageKey[] = ['about', 'blog', 'contact', 'diveSites', 'privacy', 'terms']

const SOCIAL = [
  { label: 'Instagram', href: siteConfig.social.instagram, Icon: InstagramIcon },
  { label: 'Facebook', href: siteConfig.social.facebook, Icon: FacebookIcon },
  { label: 'YouTube', href: siteConfig.social.youtube, Icon: YouTubeIcon },
  { label: 'LinkedIn', href: siteConfig.social.linkedin, Icon: LinkedInIcon },
] as const

const headingClass = 'font-display text-lg font-semibold uppercase tracking-wide text-white'
// White focus ring: the global orange one is only 2.8:1 on the dark green footer.
const linkClass = 'text-white/80 hover:text-white hover:underline focus-visible:outline-white'

export function Footer() {
  const locale = useLocale()
  const ui = useUi()
  const { business, contact } = siteConfig
  const year = buildYear

  return (
    <footer>
      {/* Sign-off above the green part: its own full-width band on the soft green, so it reads as a
          section of its own rather than the tail of the page text (UBT, 01.11.2026: "ayrı section,
          biraz küçük"). */}
      <div className="relative border-t border-brand-green-dark/15 bg-brand-green-soft">
        <div className="container-page flex flex-col items-center gap-3 py-8 text-center md:py-10">
          <img
            src="/brand/dragoman-logo-480.webp"
            srcSet="/brand/dragoman-logo-480.webp 480w, /brand/dragoman-logo-960.webp 960w"
            sizes="(min-width: 48rem) 18rem, 50vw"
            width={960}
            height={590}
            alt="Dragoman"
            loading="lazy"
            decoding="async"
            className="h-auto w-1/2 max-w-72"
          />
          <p className="font-display text-lg font-semibold tracking-wide text-brand-orange-ink md:text-2xl">{ui.brand.slogan}</p>
          {/* Social accounts as icons under the slogan (UBT, 03.11.2026); the brand name is the link's
              accessible name. */}
          <ul aria-label={ui.footer.followHeading} className="mt-1 flex gap-3">
            {SOCIAL.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  className="flex size-11 items-center justify-center rounded-full bg-white text-brand-green-dark ring-1 ring-brand-green-dark/15 transition-colors hover:bg-brand-green-dark hover:text-white"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                >
                  <Icon aria-hidden="true" className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The green part ends the page. On phones the bottom padding keeps the copyright line clear of
          the fixed action bar and of the depth gauge and ascend button stacked above it. */}
      <div className="bg-brand-green-dark pb-48 text-white md:pb-0">
        <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className={headingClass}>
              {ui.footer.contactHeading}
            </h2>
            <address className="mt-4 space-y-2 text-sm not-italic text-white/80">
              <p className="font-semibold text-white">{business.name}</p>
              <p>
                {business.address.street}
                <br />
                {business.address.postalCode} {business.address.city} / {business.address.region}, {business.address.country}
              </p>
              <p>
                {ui.footer.phone}{ui.typography.labelSeparator}<a className={linkClass} href={telHref(contact.phone)}>{contact.phone}</a>
              </p>
              <p>
                {ui.footer.mobile}{ui.typography.labelSeparator}<a className={linkClass} href={telHref(contact.mobile)}>{contact.mobile}</a>
              </p>
              <p>
                {ui.footer.email}{ui.typography.labelSeparator}<a className={linkClass} href={mailHref(contact.email)}>{contact.email}</a>
              </p>
              <p>
                <a className={linkClass} href={contact.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {ui.footer.map}
                </a>
              </p>
            </address>
          </section>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className={headingClass}>
              {ui.footer.exploreHeading}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {EXPLORE.map((key) => (
                <li key={key}>
                  <Link className={linkClass} to={localePath(locale, key)}>
                    {pageTitle(ui, key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className={headingClass}>
              {ui.footer.companyHeading}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {COMPANY.map((key) => (
                <li key={key}>
                  <Link className={linkClass} to={localePath(locale, key)}>
                    {pageTitle(ui, key)}
                  </Link>
                </li>
              ))}
              {/* Reopens the cookie banner (CookieConsent); there is no banner while analytics is off. */}
              {ga4Id && (
                <li>
                  <button type="button" data-consent-reopen="" className={`${linkClass} cursor-pointer text-left`} onClick={() => consentStore.reopen()}>
                    {ui.consent.title}
                  </button>
                </li>
              )}
            </ul>
          </nav>

          <section aria-labelledby="footer-follow">
            <h2 id="footer-follow" className={headingClass}>
              {ui.footer.followHeading}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {SOCIAL.map((item) => (
                <li key={item.label}>
                  <a className={linkClass} href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="border-t border-white/15">
          <div className="container-page py-5 text-xs text-white/70">
            <p>
              © {year} {business.name} · {ui.footer.tursab} {business.tursab}. {ui.footer.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
