import { Mail, MapPin, MessageCircle, Phone, Smartphone } from 'lucide-react'
import type { ReactNode } from 'react'
import { PageHero } from '../../components/layout/PageHero'
import { PageHead } from '../../components/seo/PageHead'
import { RichText } from '../../components/ui/RichText'
import { useContent } from '../../content/ContentContext'
import { pick } from '../../content/localize'
import { pageSeo } from '../../content/seo'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, pageAlternates } from '../../i18n/pages'
import { pageNodes } from '../../lib/jsonLd/pageNodes'
import { mailHref, siteConfig, telHref } from '../../lib/siteConfig'
import { ContactForm } from '../forms/ContactForm'

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    // A <div> inside <dl> may hold only <dt>/<dd>, so the icon lives inside the <dt>.
    <div className="relative py-3 pl-8">
      <dt className="text-sm text-ink-muted">
        <span className="absolute top-3.5 left-0 text-brand-orange">{icon}</span>
        {label}
      </dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  )
}

/** Contact page: shared business data from siteConfig (E02/K2) plus the sample contact form. */
export function ContactPage() {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  const page = content.richPage('contact')
  const { business, contact } = siteConfig
  const link = 'text-brand-green hover:underline'
  const icon = 'size-5'
  const summary = pick(page.summary, locale).value
  const seo = pageSeo(page.seo, locale, { title: ui.nav.contact, description: summary })
  const crumbs = [{ label: ui.nav.home, href: localePath(locale, 'home') }, { label: ui.nav.contact }]
  const jsonLd = pageNodes({ type: 'ContactPage', path: localePath(locale, 'contact'), name: ui.nav.contact, description: seo.description, locale, crumbs })

  return (
    <>
      <PageHead title={seo.title} description={seo.description} alternates={pageAlternates('contact')} jsonLd={jsonLd} />
      <PageHero title={ui.nav.contact} breadcrumbs={crumbs}>
        <p>{summary}</p>
      </PageHero>
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-labelledby="contact-details">
          <h2 id="contact-details" className="text-3xl font-bold">
            {ui.pages.contactDetails}
          </h2>
          {page.sections.map((section, index) => (
            <RichText key={index} blocks={pick(section.body, locale).value} className="mt-4 !text-base text-ink-muted" />
          ))}
          <dl className="mt-6 divide-y divide-line rounded-card border border-line px-5">
            <Row icon={<MapPin aria-hidden="true" className={icon} />} label={ui.footer.address}>
              {business.name}
              <br />
              {business.address.street}, {business.address.postalCode} {business.address.city} / {business.address.region}
              <br />
              <a className={`${link} text-sm font-normal`} href={contact.mapsUrl} target="_blank" rel="noopener noreferrer">
                {ui.footer.map}
              </a>
            </Row>
            <Row icon={<Phone aria-hidden="true" className={icon} />} label={ui.footer.phone}>
              <a className={link} href={telHref(contact.phone)}>{contact.phone}</a>
            </Row>
            <Row icon={<Smartphone aria-hidden="true" className={icon} />} label={ui.footer.mobile}>
              <a className={link} href={telHref(contact.mobile)}>{contact.mobile}</a>
            </Row>
            <Row icon={<MessageCircle aria-hidden="true" className={icon} />} label={ui.actions.whatsapp}>
              <a className={link} href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">{contact.mobile}</a>
            </Row>
            <Row icon={<Mail aria-hidden="true" className={icon} />} label={ui.footer.email}>
              <a className={link} href={mailHref(contact.email)}>{contact.email}</a>
            </Row>
          </dl>
          <p className="mt-4 text-sm text-ink-muted">
            {ui.footer.tursab} {business.tursab}
          </p>
        </section>
        <section aria-labelledby="contact-form" className="rounded-card border border-line p-6">
          <h2 id="contact-form" className="mb-5 text-3xl font-bold">
            {ui.pages.contactFormTitle}
          </h2>
          <ContactForm />
        </section>
      </div>
    </>
  )
}
