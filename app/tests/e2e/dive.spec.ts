import { expect, test, type Page } from '@playwright/test'
import { localePath } from '../../src/i18n/pages'
import { gotoHydrated } from './helpers'

const LAYERS = ['.dive-water', '.dive-zone--shallow', '.dive-zone--mid', '.dive-zone--deep'] as const

/** Scrolls to a share of the page (0 top, 1 bottom). */
async function scrollToProgress(page: Page, progress: number): Promise<void> {
  await page.evaluate((share) => {
    const root = document.documentElement
    window.scrollTo(0, share * (root.scrollHeight - root.clientHeight))
  }, progress)
}

const opacity = (page: Page, selector: string) => page.locator(selector).evaluate((el) => getComputedStyle(el).opacity)

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

    await scrollToProgress(page, 1)
    await expect(water).toHaveCSS('opacity', '1')
    await expect(gauge).toHaveText('30 m')
  })

  test('each depth has its own sea life', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    await expect.poll(() => opacity(page, '.dive-zone--shallow')).toBe('1')
    await expect.poll(() => opacity(page, '.dive-zone--deep')).toBe('0')
    // A zone out of view is hidden too, so its animals are not drawn.
    await expect(page.locator('.dive-zone--deep')).toHaveCSS('visibility', 'hidden')
    await scrollToProgress(page, 0.5)
    await expect.poll(() => opacity(page, '.dive-zone--mid')).toBe('1')
    await expect.poll(() => opacity(page, '.dive-zone--shallow')).toBe('0')
    await expect(page.locator('.dive-zone--shallow')).toHaveCSS('visibility', 'hidden')
    await scrollToProgress(page, 1)
    await expect.poll(() => opacity(page, '.dive-zone--deep')).toBe('1')
    await expect.poll(() => opacity(page, '.dive-zone--mid')).toBe('0')
    await expect(page.locator('.dive-zone--deep')).toHaveCSS('visibility', 'visible')
  })

  test('without scroll timelines (Firefox) script gives the water and the zones the same opacity', async ({ page }) => {
    // Chromium has scroll timelines, so pretend it has not: the CSS animation still runs and wins on
    // screen, while the script writes its own value into each element's style. Both must agree.
    await page.addInitScript(() => {
      const supports = CSS.supports.bind(CSS) as (condition: string, value?: string) => boolean
      Object.defineProperty(CSS, 'supports', {
        value: (condition: string, value?: string) =>
          !condition.includes('animation-timeline') && (value === undefined ? supports(condition) : supports(condition, value)),
      })
    })
    await gotoHydrated(page, localePath('tr', 'home'))
    for (const progress of [0, 0.1, 0.35, 0.5, 0.7, 0.9, 1]) {
      await scrollToProgress(page, progress)
      for (const selector of LAYERS) {
        await expect
          .poll(() =>
            page.locator(selector).evaluate((el) => {
              const { style } = el as HTMLElement
              const computed = getComputedStyle(el)
              const sameVisibility = !style.visibility || style.visibility === computed.visibility
              return Math.abs(Number(style.opacity) - Number(computed.opacity)) < 0.03 && sameVisibility
            }),
          { message: `${selector} at ${progress}` })
          .toBe(true)
      }
    }
  })

  test('the gauge follows the page height, and steps aside for a keyboard focus', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    const gauge = page.locator('.dive-gauge')
    await scrollToProgress(page, 1)
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

  test('bubbles and animals move behind the content and never take clicks', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    await expect(page.locator('.dive-bubble').first()).toBeVisible()
    await expect(page.locator('.dive-swimmer').first()).toBeVisible()
    await expect(page.locator('.dive-bg')).toHaveCSS('pointer-events', 'none')
    await expect(page.locator('.dive-gauge')).toHaveCSS('pointer-events', 'none')
    expect(await page.evaluate(() => document.getAnimations().length)).toBeGreaterThan(10)
  })
})

test('reduced motion: no bubbles or animals, the gauge still reads the depth', async ({ page }) => {
  await gotoHydrated(page, localePath('tr', 'home'))
  await expect(page.locator('.dive-bubble').first()).toBeHidden()
  await expect(page.locator('.dive-swimmer').first()).toBeHidden()
  await scrollToProgress(page, 1)
  await expect(page.locator('.dive-gauge')).toHaveText('30 m')
})
