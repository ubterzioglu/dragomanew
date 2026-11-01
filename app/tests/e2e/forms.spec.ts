import { expect, test, type Page } from '@playwright/test'
import { localePath } from '../../src/i18n/pages'
import { getUi } from '../../src/i18n/ui'
import { gotoHydrated } from './helpers'
import { events, eventUrl } from './targets'

const ui = getUi('tr')

/** Counts every request the page makes after this call (sample forms must make none). */
function countRequests(page: Page) {
  const seen: string[] = []
  page.on('request', (request) => seen.push(`${request.method()} ${request.url()}`))
  return seen
}

async function fillContact(page: Page, scope: string) {
  await page.locator(`${scope} input[autocomplete="name"]`).fill('Örnek Ziyaretçi')
  await page.locator(`${scope} input[autocomplete="email"]`).fill('ornek@example.com')
}

test.describe('sample forms (guide §5–6)', () => {
  test('event request: 2 × 60 + 2 × 45 = 210 EUR, sum check, sample result, no network', async ({ page }) => {
    await gotoHydrated(page, eventUrl('tr', events.klasik))
    const form = page.locator('#request form')
    await form.getByLabel(ui.forms.partySize).fill('4')
    const optionInputs = form.locator('fieldset input[type="number"]')
    await optionInputs.nth(0).fill('2')
    await optionInputs.nth(1).fill('2')
    await expect(form.getByText(ui.forms.summaryTitle)).toBeVisible()
    await expect(form.locator('[aria-live="polite"]')).toContainText('210')

    await optionInputs.nth(1).fill('1')
    await fillContact(page, '#request')
    await form.getByLabel(ui.forms.preferredDate).fill('2026-12-05')
    await form.getByRole('button', { name: ui.forms.submitRequest }).click()
    await expect(form.getByText('Seçeneklerdeki kişi sayılarının toplamı 4 olmalı.')).toBeVisible()

    await optionInputs.nth(1).fill('2')
    const requests = countRequests(page)
    await form.getByRole('button', { name: ui.forms.submitRequest }).click()
    await expect(form.getByRole('status')).toContainText(ui.forms.demoResult)
    expect(requests).toEqual([])
  })

  test('price on request: no total is calculated', async ({ page }) => {
    await gotoHydrated(page, eventUrl('tr', events.onRequest))
    await expect(page.locator('main').getByText(ui.price.onRequest).first()).toBeVisible()
    await page.locator('#request').getByLabel(ui.forms.partySize).fill('3')
    await expect(page.locator('#request').getByText(ui.forms.summaryTitle)).toHaveCount(0)
  })

  test('required fields are reported next to the field', async ({ page }) => {
    await gotoHydrated(page, eventUrl('tr', events.klasik))
    const form = page.locator('#request form')
    await form.getByRole('button', { name: ui.forms.submitRequest }).click()
    await expect(form.getByText(ui.forms.errors.required).first()).toBeVisible()
    await expect(form.getByText(ui.forms.errors.email)).toBeVisible()
    await expect(form.getByRole('status')).toHaveCount(0)
  })

  test('transfer: return trip asks return time; child seat asks ages', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'transport'))
    const form = page.locator('#transport form')
    await expect(form.getByLabel(ui.forms.returnDateTime)).toHaveCount(0)
    await form.getByLabel(ui.forms.roundTrip).check()
    await expect(form.getByLabel(ui.forms.returnDateTime)).toBeVisible()
    await form.getByLabel(ui.forms.childSeat).check()
    await expect(form.getByLabel('1. çocuğun yaşı')).toBeVisible()
  })

  test('lodging: one age field per child, separate from the transfer form', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'transport'))
    const form = page.locator('#lodging form')
    await form.getByLabel(ui.forms.children).fill('2')
    await expect(form.getByLabel('2. çocuğun yaşı')).toBeVisible()
    await expect(page.locator('form')).toHaveCount(2)
  })

  // Removing age fields used to leave holes in the array, which blocked submit with no visible error.
  test('transfer: removing a child-seat age still lets the request go through', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'transport'))
    const form = page.locator('#transport form')
    await form.getByLabel(ui.forms.childSeat).check()
    await form.getByRole('button', { name: `+ ${ui.forms.addChild}` }).click()
    await form.getByLabel('1. çocuğun yaşı').fill('4')
    await form.getByLabel('2. çocuğun yaşı').fill('7')
    await form.getByRole('button', { name: `− ${ui.forms.removeChild}` }).click()
    await form.getByLabel(ui.forms.from).fill('Dalaman Havalimanı')
    await form.getByLabel(ui.forms.to).fill('Kaş')
    await form.getByLabel(ui.forms.dateTime).fill('2026-12-05T14:00')
    await fillContact(page, '#transport')
    await form.getByRole('button', { name: ui.forms.submitRequest }).click()
    await expect(form.getByRole('status')).toContainText(ui.forms.demoResult)
  })

  test('lodging: lowering the children count still lets the request go through', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'transport'))
    const form = page.locator('#lodging form')
    await form.getByLabel(ui.forms.checkIn).fill('2026-12-05')
    await form.getByLabel(ui.forms.checkOut).fill('2026-12-08')
    await form.getByLabel(ui.forms.children).fill('3')
    for (const n of [1, 2, 3]) await form.getByLabel(`${n}. çocuğun yaşı`).fill(String(n + 3))
    await form.getByLabel(ui.forms.children).fill('1')
    await fillContact(page, '#lodging')
    await form.getByRole('button', { name: ui.forms.submitRequest }).click()
    await expect(form.getByRole('status')).toContainText(ui.forms.demoResult)
  })

  test('health form: nothing preselected, blank is not "No", Yes asks for review', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'participantForm', ['diving']))
    const radios = page.locator('input[type="radio"]')
    await expect(radios).toHaveCount(70)
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0)

    await page.getByRole('button', { name: ui.health.submit }).click()
    await expect(page.getByText(ui.health.unanswered)).toHaveCount(35)

    const noOptions = page.locator('input[type="radio"][value="no"]')
    for (let i = 0; i < 35; i += 1) await noOptions.nth(i).check()
    await page.locator('input[type="radio"][value="yes"]').nth(25).check()
    await page.getByLabel(ui.health.participantName).fill('Örnek Katılımcı')
    const requests = countRequests(page)
    await page.getByRole('button', { name: ui.health.submit }).click()
    await expect(page.getByRole('status')).toContainText(ui.forms.demoResult)
    await expect(page.getByText(ui.health.reviewNotice)).toBeVisible()
    await expect(page.getByText(ui.health.signatureNotice)).toBeVisible()
    expect(requests).toEqual([])
    const stored = await page.evaluate(() => localStorage.length + sessionStorage.length)
    expect(stored).toBe(0)
  })
})

// Privacy: a prerendered form must never fall back to a native GET that writes answers into the URL.
test.describe('forms without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  const pages = [
    { name: 'event request', path: () => eventUrl('tr', events.klasik) },
    { name: 'transport + lodging', path: () => localePath('tr', 'transport') },
    { name: 'contact', path: () => localePath('tr', 'contact') },
    { name: 'health', path: () => localePath('tr', 'participantForm', ['diving']) },
  ]

  for (const target of pages) {
    test(`${target.name}: submit is inert and nothing reaches the URL`, async ({ page }) => {
      await page.goto(target.path())
      const submits = page.locator('form button[type="submit"]')
      await expect(submits).not.toHaveCount(0)
      for (const submit of await submits.all()) await expect(submit).toBeDisabled()

      const name = page.locator('form input:not([type]), form input[type="text"], form input[type="email"]').first()
      await name.fill('Örnek Ziyaretçi')
      await name.press('Enter')
      await page.waitForLoadState()
      expect(new URL(page.url()).search).toBe('')
      expect(page.url()).not.toContain('Ziyaret')
    })
  }
})
