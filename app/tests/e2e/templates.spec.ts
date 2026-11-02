import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { loadEnv } from 'vite'
import { LOCALES } from '../../src/i18n/locales'
import { localePath } from '../../src/i18n/pages'
import { getUi } from '../../src/i18n/ui'
import { hasHorizontalOverflow, watchPage } from './helpers'
import { events, eventUrl, templatePages } from './targets'

// E03: every template group renders in all four languages, with short/long texts,
// without sideways scrolling, console errors or silent translation fallbacks.
for (const locale of LOCALES) {
  for (const { name, path } of templatePages(locale)) {
    test(`E03 ${locale} ${name}`, async ({ page }) => {
      const problems = watchPage(page)
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      // After hydration, so hydration errors reach the console check below.
      await expect(page.locator('html')).toHaveAttribute('data-hydrated', '')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(await hasHorizontalOverflow(page)).toBe(false)
      await expect(page.locator('[data-i18n-fallback]')).toHaveCount(0)
      expect(problems).toEqual([])
    })
  }
}

test('E03: empty optional sections are not shown at all', async ({ page }) => {
  await page.goto(eventUrl('tr', events.bare))
  for (const id of ['faq', 'itinerary', 'includes', 'excludes', 'meeting', 'conditions']) {
    await expect(page.locator(`#${id}`)).toHaveCount(0)
  }
  await expect(page.locator('#overview')).toBeVisible()
})

test('E03: multi-day itinerary is shown in day order', async ({ page }) => {
  await page.goto(eventUrl('tr', events.multiDay))
  const days = page.locator('#itinerary ~ div ol > li h3')
  await expect(days).toHaveCount(events.multiDay.itinerary.length)
  await expect(days.first()).toHaveText(events.multiDay.itinerary[0]?.title.tr ?? '')
})

test('E03/E04: no extra activity filters on category pages', async ({ page }) => {
  for (const key of ['diving', 'seaKayak', 'outdoor'] as const) {
    await page.goto(localePath('tr', key))
    await expect(page.locator('main select, main input[type="search"], main [role="search"]')).toHaveCount(0)
  }
})

// The flag of the build under test, read like check-dist.mjs does (process.env, then app/.env*).
const isPublicRelease = loadEnv('production', fileURLToPath(new URL('../../', import.meta.url)), 'VITE_').VITE_PUBLIC_RELEASE === 'true'

test('Stage A pages carry the sample banner and noindex; a release has neither', async ({ page }) => {
  await page.goto(localePath('de', 'home'))
  const robots = page.locator('meta[name="robots"]')
  if (isPublicRelease) {
    await expect(page.locator('[data-sample-banner]')).toHaveCount(0)
    await expect(robots).toHaveCount(0)
    return
  }
  await expect(page.getByText(getUi('de').sample.banner)).toBeVisible()
  await expect(robots).toHaveAttribute('content', 'noindex,nofollow')
})
