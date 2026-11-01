import { expect, test } from '@playwright/test'
import { localePath } from '../../src/i18n/pages'
import { gotoHydrated } from './helpers'

// The decorative dive background (UBT, 01.11.2026). Every other spec runs with reduced motion
// (playwright.config.ts), so the moving parts are checked here.
test.describe('dive background with motion', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('the water turns turquoise and the gauge counts down to 30 m', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    const water = page.locator('.dive-water')
    const gauge = page.locator('.dive-gauge')
    await expect(water).toHaveCSS('background-color', 'rgb(198, 239, 233)')
    await expect(water).toHaveCSS('opacity', '0')
    await expect(gauge).toHaveText('0 m')

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect(water).toHaveCSS('opacity', '1')
    await expect(gauge).toHaveText('30 m')
  })

  test('the gauge follows the page height, and steps aside for a keyboard focus', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    const gauge = page.locator('.dive-gauge')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect(gauge).toHaveText('30 m')
    // Doubling the page height without a scroll: the same position is now halfway down.
    await page.evaluate(() => {
      // A style property, not a class: the stylesheet build reads this file and would ship the class.
      const spacer = document.createElement('div')
      spacer.style.height = '200vh'
      document.body.append(spacer)
    })
    await expect(gauge).not.toHaveText('30 m')

    await expect(gauge).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(gauge).toBeHidden()
  })

  test('bubbles and fish move behind the content and never take clicks', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    await expect(page.locator('.dive-bubble').first()).toBeVisible()
    await expect(page.locator('.dive-fish').first()).toBeVisible()
    await expect(page.locator('.dive-bg')).toHaveCSS('pointer-events', 'none')
    await expect(page.locator('.dive-gauge')).toHaveCSS('pointer-events', 'none')
    expect(await page.evaluate(() => document.getAnimations().length)).toBeGreaterThan(10)
  })
})

test('reduced motion: no bubbles or fish, the gauge still reads the depth', async ({ page }) => {
  await gotoHydrated(page, localePath('tr', 'home'))
  await expect(page.locator('.dive-bubble').first()).toBeHidden()
  await expect(page.locator('.dive-fish').first()).toBeHidden()
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect(page.locator('.dive-gauge')).toHaveText('30 m')
})
