import { Link } from 'react-router-dom'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, type PageKey } from '../../i18n/pages'
import { pageTitle } from '../../i18n/pageTitles'
import { buildYear } from '../../lib/env'
import { mailHref, siteConfig, telHref } from '../../lib/siteConfig'

const EXPLORE: readonly PageKey[] = ['diving', 'lifeguard', 'seaKayak', 'outdoor', 'transport', 'shop']
const COMPANY: readonly PageKey[] = ['about', 'blog', 'contact', 'diveSites', 'privacy', 'terms']

const SOCIAL = [
  { label: 'Instagram', href: siteConfig.social.instagram },
  { label: 'Facebook', href: siteConfig.social.facebook },
  { label: 'YouTube', href: siteConfig.social.youtube },
  { label: 'LinkedIn', href: siteConfig.social.linkedin },
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
      <div className="bg-brand-green-dark text-white">
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

      {/* Sign-off under the green part, on the dive background (UBT, 01.11.2026). The mobile bottom
          padding keeps it clear of the fixed action bar and the depth gauge above it. */}
      <div className="container-page flex flex-col items-center gap-4 pt-12 pb-40 text-center md:py-16">
        <img
          src="/brand/dragoman-logo-480.webp"
          srcSet="/brand/dragoman-logo-480.webp 480w, /brand/dragoman-logo-960.webp 960w"
          sizes="(min-width: 48rem) 32rem, 75vw"
          width={960}
          height={416}
          alt="Dragoman"
          loading="lazy"
          decoding="async"
          className="h-auto w-3/4 max-w-lg"
        />
        <p className="font-display text-2xl font-semibold tracking-wide text-brand-orange-ink md:text-4xl">{ui.brand.slogan}</p>
      </div>
    </footer>
  )
}
