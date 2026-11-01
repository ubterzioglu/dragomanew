import { expect, test } from '@playwright/test'
import { LOCALES } from '../../src/i18n/locales'
import { localePath } from '../../src/i18n/pages'
import { getUi } from '../../src/i18n/ui'
import { gotoHydrated, watchPage } from './helpers'

// E01: home → category → card → matching detail → request form, in every language.
for (const locale of LOCALES) {
  test(`E01 ${locale}: home → category → card → detail → request`, async ({ page }) => {
    const problems = watchPage(page)
    const ui = getUi(locale)

    await gotoHydrated(page, localePath(locale, 'home'))
    await page.locator(`main a[href="${localePath(locale, 'seaKayak')}"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`${localePath(locale, 'seaKayak')}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(ui.nav.seaKayak)

    const card = page.locator('main article h3 a').first()
    const cardTitle = (await card.textContent())?.trim() ?? ''
    await card.click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(cardTitle)

    await page.locator('a[href="#request"]:visible').first().click()
    await expect(page.locator('#request form')).toBeInViewport()
    await expect(page.locator('#request')).toContainText(cardTitle)

    expect(problems).toEqual([])
  })
}

// After a deploy or on a flaky network the next page's content JSON can fail to load;
// the prerendered page is then loaded directly instead of showing a broken app.
test('E01: a failed content fetch during client navigation still opens the page', async ({ page }) => {
  const ui = getUi('tr')
  await gotoHydrated(page, localePath('tr', 'home'))
  await page.route(/static-loader-data/, (route) => route.abort())
  await page.locator(`main a[href="${localePath('tr', 'seaKayak')}"]`).first().click()
  await expect(page).toHaveURL(new RegExp(`${localePath('tr', 'seaKayak')}$`))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(ui.nav.seaKayak)
  await expect(page.getByText('Unexpected Application Error')).toHaveCount(0)
})

test('E01: archived events have no page and no card', async ({ page }) => {
  const { events, eventUrl } = await import('./targets')
  const response = await page.goto(eventUrl('tr', events.archived))
  expect(response?.status()).not.toBe(500)
  await expect(page.getByText('404')).toBeVisible()
  await page.goto(localePath('tr', events.archived.category))
  await expect(page.locator(`a[href="${eventUrl('tr', events.archived)}"]`)).toHaveCount(0)
})
