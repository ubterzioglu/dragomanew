import { expect, test } from '@playwright/test'
import { localePath } from '../../src/i18n/pages'
import { formatTemplate, getUi } from '../../src/i18n/ui'
import { gotoHydrated } from './helpers'
import { events, eventUrl } from './targets'

// M6: keyboard paths a visitor uses without a mouse (skip link, menus, gallery, form errors).
const ui = getUi('tr')

test.describe('M6 keyboard, desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop viewport only')

  test('first Tab reaches the skip link, which moves focus to the content', async ({ page }) => {
    await gotoHydrated(page, eventUrl('tr', events.klasik))
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: ui.a11y.skipToContent })
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main')).toBeFocused()
  })

  test('submenu opens from its button, lets Tab reach the items and closes on Escape', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    const toggle = page.getByRole('button', { name: formatTemplate(ui.a11y.submenu, { label: ui.nav.diving }) })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Tab')
    const firstItem = page.locator(`#${await toggle.getAttribute('aria-controls')} a`).first()
    await expect(firstItem).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
  })

  test('submenu opened by hovering closes on Escape', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    const toggle = page.getByRole('button', { name: formatTemplate(ui.a11y.submenu, { label: ui.nav.diving }) })
    await toggle.hover()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('gallery buttons work from the keyboard and wrap at the ends', async ({ page }) => {
    await gotoHydrated(page, eventUrl('tr', events.klasik))
    const next = page.getByRole('button', { name: ui.a11y.nextImage })
    const previous = page.getByRole('button', { name: ui.a11y.previousImage })
    const track = page.locator('main section ul[tabindex="0"]').first()
    const end = await track.evaluate((el) => el.scrollWidth - el.clientWidth)
    await next.focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
    await previous.press('Enter')
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0)
    await previous.press('Enter')
    await expect.poll(() => track.evaluate((el) => Math.round(el.scrollLeft))).toBeGreaterThanOrEqual(Math.floor(end) - 1)
    await expect(previous).toBeFocused()
  })
})

test.describe('M6 keyboard, forms', () => {
  test('an empty submit moves focus to the first invalid field', async ({ page }) => {
    await gotoHydrated(page, eventUrl('tr', events.klasik))
    const form = page.locator('#request form')
    await form.getByRole('button', { name: ui.forms.submitRequest }).press('Enter')
    const name = form.getByLabel(ui.forms.fullName)
    await expect(name).toBeFocused()
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    // The label above the focused field stays clear of the sticky header (M6 finding 1).
    const [labelBox, headerBox] = await Promise.all([form.locator(`label[for="${await name.getAttribute('id')}"]`).boundingBox(), page.locator('header').boundingBox()])
    expect(labelBox && headerBox && labelBox.y >= headerBox.y + headerBox.height).toBe(true)
    // Fields use the site-wide orange focus outline, not a faint ring (M6 finding 2).
    expect(await name.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid')
  })

  test('a distribution that does not add up moves focus to the first option', async ({ page }) => {
    await gotoHydrated(page, eventUrl('tr', events.klasik))
    const form = page.locator('#request form')
    await form.getByLabel(ui.forms.fullName).fill('Örnek Ziyaretçi')
    await form.getByLabel(ui.forms.email).fill('ornek@example.com')
    await form.getByLabel(ui.forms.preferredDate).fill('2026-12-05')
    await form.getByRole('button', { name: ui.forms.submitRequest }).press('Enter')
    await expect(form.locator('fieldset [role="alert"]')).toBeVisible()
    await expect(form.locator('fieldset input[type="number"]').first()).toBeFocused()
    await expect(form.locator('fieldset input[aria-invalid="true"]')).toHaveCount(await form.locator('fieldset input[type="number"]').count())
  })
})

test.describe('M6 keyboard, mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile viewport only')

  test('open menu focuses the first link and Tab after the last link returns to the menu button', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'contact'))
    await page.getByRole('button', { name: ui.a11y.openMenu }).click()
    const close = page.getByRole('button', { name: ui.a11y.closeMenu })
    const links = page.locator(`#${await close.getAttribute('aria-controls')} a`)
    await expect(links.first()).toBeFocused()
    await links.last().focus()
    await page.keyboard.press('Tab')
    await expect(close).toBeFocused()
  })
})
