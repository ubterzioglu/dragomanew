import { describe, expect, it } from 'vitest'
import { siteConfig, telHref, mailHref } from '../../src/lib/siteConfig'

describe('siteConfig contact data (E02/K2)', () => {
  it('uses the user-supplied business data', () => {
    expect(siteConfig.business.name).toBe('Dragoman Travel Agency')
    expect(siteConfig.business.tursab).toBe('A4615')
    expect(siteConfig.contact.email).toBe('info@dragoman-turkey.com')
    expect(siteConfig.contact.whatsappUrl).toBe('https://wa.me/905332901463')
  })

  it('builds the exact tel: and mailto: targets from the guide', () => {
    expect(telHref(siteConfig.contact.phone)).toBe('tel:+902428363614')
    expect(telHref(siteConfig.contact.mobile)).toBe('tel:+905332901463')
    expect(mailHref(siteConfig.contact.email)).toBe('mailto:info@dragoman-turkey.com')
  })
})
