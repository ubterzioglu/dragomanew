import { test } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LOCALES } from '../../src/i18n/locales'
import { localePath } from '../../src/i18n/pages'
import { gotoHydrated } from './helpers'
import { events, eventUrl, templatePages } from './targets'

/**
 * Screenshot matrix for the hand-over (plan Batch 8.2). Runs only through
 * `npm run screenshots` (or SCREENSHOTS=1) so normal test runs stay fast.
 */
const enabled = Boolean(process.env.SCREENSHOTS) || process.env.npm_lifecycle_event === 'screenshots'
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../tmp/docs/asama-a-teslim/ekran-goruntuleri')
const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
]

test.describe('screenshots', () => {
  test.skip(!enabled, 'run with npm run screenshots')
  test.skip(({ isMobile }) => isMobile, 'viewports are set explicitly')

  for (const viewport of VIEWPORTS) {
    test(`tr templates @${viewport.name}`, async ({ page }) => {
      test.setTimeout(180_000)
      await page.setViewportSize(viewport)
      // Hydrated first, so forms show their enabled state as visitors see it.
      for (const { name, path: url } of templatePages('tr')) {
        await gotoHydrated(page, url)
        await page.screenshot({ path: path.join(OUT, `${viewport.name}_tr_${name}.png`), fullPage: true })
      }
      // An archived activity has no page, so the host serves the prerendered 404.
      await gotoHydrated(page, eventUrl('tr', events.archived))
      await page.screenshot({ path: path.join(OUT, `${viewport.name}_tr_404.png`), fullPage: true })
    })
  }

  test('home and the longest activity in four languages @1440', async ({ page }) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width: 1440, height: 900 })
    for (const locale of LOCALES) {
      await gotoHydrated(page, localePath(locale, 'home'))
      await page.screenshot({ path: path.join(OUT, `1440_${locale}_home.png`), fullPage: true })
      await gotoHydrated(page, eventUrl(locale, events.longest))
      await page.screenshot({ path: path.join(OUT, `1440_${locale}_event-long.png`), fullPage: true })
    }
  })
})
