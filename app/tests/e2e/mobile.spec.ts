import { expect, test } from '@playwright/test'
import { localePath } from '../../src/i18n/pages'
import { getUi } from '../../src/i18n/ui'
import { gotoHydrated } from './helpers'
import { events, eventUrl } from './targets'

// E02: mobile menu, language switcher, fixed WhatsApp/action bar, contact link targets.
test.describe('E02 mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile viewport only')
  const ui = getUi('tr')

  test('menu opens, closes with Escape and returns focus', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'diving'))
    const button = page.getByRole('button', { name: ui.a11y.openMenu })
    await button.click()
    await expect(page.getByRole('button', { name: ui.a11y.closeMenu })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('header nav').getByRole('link', { name: ui.nav.lifeguard })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: ui.a11y.openMenu })).toBeFocused()
  })

  test('language switcher keeps the same activity', async ({ page }) => {
    await page.goto(eventUrl('tr', events.klasik))
    // The header renders a desktop and a mobile switcher; only one is visible.
    await page.locator('header nav a[hreflang="fr-FR"]:visible').first().click()
    await expect(page).toHaveURL(new RegExp(`${eventUrl('fr', events.klasik)}$`))
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-FR')
  })

  test('fixed bar offers WhatsApp and the booking request, without covering the form', async ({ page }) => {
    await gotoHydrated(page, eventUrl('tr', events.klasik))
    const bar = page.locator('div.fixed.bottom-0')
    await expect(bar.getByRole('link', { name: ui.actions.whatsapp })).toHaveAttribute('href', 'https://wa.me/905332901463')
    await bar.getByRole('link', { name: ui.actions.requestBooking }).click()
    const submit = page.locator('#request button[type="submit"]')
    await submit.scrollIntoViewIfNeeded()
    const [buttonBox, barBox] = await Promise.all([submit.boundingBox(), bar.boundingBox()])
    expect(buttonBox && barBox && buttonBox.y + buttonBox.height <= barBox.y).toBe(true)
  })

  test('booking link reaches the form after client-side navigation', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'seaKayak'))
    await page.mouse.wheel(0, 600)
    await page.locator(`main a[href="${eventUrl('tr', events.klasik)}"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`${eventUrl('tr', events.klasik)}$`))
    await page.locator('div.fixed.bottom-0').getByRole('link', { name: ui.actions.requestBooking }).click()
    await expect(page.locator('#request')).toBeInViewport()
    await expect(page.locator('#request')).toBeFocused()
  })

  test('fixed bar does not cover the bottom of the footer', async ({ page }) => {
    await page.goto(localePath('tr', 'home'))
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const slogan = page.locator('footer').getByText(ui.brand.slogan)
    const [sloganBox, barBox] = await Promise.all([slogan.boundingBox(), page.locator('div.fixed.bottom-0').boundingBox()])
    expect(sloganBox && barBox && sloganBox.y + sloganBox.height <= barBox.y).toBe(true)
    // The footer, with its logo sign-off, reaches the end of the page: nothing below it.
    const gap = await page.evaluate(() => {
      const footer = document.querySelector('footer')?.getBoundingClientRect()
      return footer ? document.documentElement.scrollHeight - (window.scrollY + footer.bottom) : Infinity
    })
    expect(gap).toBeLessThanOrEqual(1)
  })

  test('transfer button opens the transfer form itself', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'transport'))
    await page.locator('div.fixed.bottom-0').getByRole('link', { name: ui.actions.requestTransfer }).click()
    const form = page.locator('#transport-request')
    await expect(form).toBeInViewport()
    await expect(form).toBeFocused()
  })

  test('contact links point at the supplied numbers and address (no call is made)', async ({ page }) => {
    await page.goto(localePath('tr', 'contact'))
    const main = page.locator('main')
    await expect(main.locator('a[href="tel:+902428363614"]')).toHaveCount(1)
    await expect(main.locator('a[href="tel:+905332901463"]')).toHaveCount(1)
    await expect(main.locator('a[href="mailto:info@dragoman-turkey.com"]')).toHaveCount(1)
    await expect(page.locator('footer a[href="tel:+902428363614"]')).toHaveCount(1)
    await expect(page.locator('footer')).toContainText('A4615')
  })
})
