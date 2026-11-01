import { expect, test, type Page } from '@playwright/test'
import { localePath } from '../../src/i18n/pages'
import { getUi } from '../../src/i18n/ui'
import { gotoHydrated } from './helpers'

const WATER = ['.dive-water--surface', '.dive-water--mid', '.dive-water--deep'] as const
const ZONES = ['.dive-zone--shallow', '.dive-zone--mid', '.dive-zone--deep'] as const

/** Scrolls to a share of the page (0 top, 1 bottom). */
async function scrollToProgress(page: Page, progress: number): Promise<void> {
  await page.evaluate((share) => {
    const root = document.documentElement
    window.scrollTo(0, share * (root.scrollHeight - root.clientHeight))
  }, progress)
}

const opacity = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => Number(getComputedStyle(el).opacity))

// The decorative dive background (UBT, 01.11.2026). Every other spec runs with reduced motion
// (playwright.config.ts), so the moving parts are checked here.
test.describe('dive background with motion', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('the water darkens to navy under a light text veil, and the gauge counts down to 30 m', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    const gauge = page.locator('.dive-gauge')
    await expect(page.locator('.dive-water--deep')).toHaveCSS('background-color', 'rgb(10, 37, 64)')
    for (const layer of WATER) await expect.poll(() => opacity(page, layer)).toBe(0)
    await expect(gauge).toHaveText('0 m')

    await scrollToProgress(page, 0.25)
    await expect.poll(() => opacity(page, '.dive-water--surface')).toBe(1)
    await expect.poll(() => opacity(page, '.dive-water--deep')).toBe(0)

    await scrollToProgress(page, 1)
    for (const layer of WATER) await expect.poll(() => opacity(page, layer)).toBe(1)
    await expect(gauge).toHaveText('30 m')
    await expect(page.locator('.dive-veil')).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.85)')
  })

  test('each depth has its own sea life', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    await expect.poll(() => opacity(page, '.dive-zone--shallow')).toBe(1)
    await expect.poll(() => opacity(page, '.dive-zone--deep')).toBe(0)
    // A zone out of view is hidden too, so its animals are not drawn.
    await expect(page.locator('.dive-zone--deep')).toHaveCSS('visibility', 'hidden')
    await scrollToProgress(page, 0.5)
    await expect.poll(() => opacity(page, '.dive-zone--mid')).toBe(1)
    await expect.poll(() => opacity(page, '.dive-zone--shallow')).toBe(0)
    await expect(page.locator('.dive-zone--shallow')).toHaveCSS('visibility', 'hidden')
    await scrollToProgress(page, 1)
    await expect.poll(() => opacity(page, '.dive-zone--deep')).toBe(1)
    await expect.poll(() => opacity(page, '.dive-zone--mid')).toBe(0)
    await expect(page.locator('.dive-zone--deep')).toHaveCSS('visibility', 'visible')
  })

  test('without scroll timelines (Firefox) script gives the water and the zones the same opacity', async ({ page, isMobile }) => {
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
    for (const progress of [0, 0.1, 0.35, 0.5, 0.65, 0.7, 0.9, 1]) {
      await scrollToProgress(page, progress)
      for (const selector of [...WATER, ...ZONES]) {
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
      // The depth scale (shown on wide screens only; a hidden element runs no CSS animation).
      if (isMobile) continue
      await expect
        .poll(() =>
          page.locator('.dive-scale-fill').evaluate((el) => {
            const fromScript = new DOMMatrix((el as HTMLElement).style.transform || 'none').d
            const fromCss = new DOMMatrix(getComputedStyle(el).transform).d
            return Math.abs(fromScript - fromCss) < 0.03
          }),
        { message: `.dive-scale-fill at ${progress}` })
        .toBe(true)
    }
  })

  test('the gauge follows the page height, and steps aside for a keyboard focus', async ({ page }) => {
    await gotoHydrated(page, localePath('tr', 'home'))
    const gauge = page.locator('.dive-gauge')
    await scrollToProgress(page, 1)
    await expect(gauge).toHaveText('30 m')
    // Doubling the page height without a scroll: the same position is now halfway down.
    await page.evaluate(() => {
      // A style property, not a class: a class written here would never reach the stylesheet.
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

test('the depth scale on the left fills down to 30 m, beside the text column and never over it', async ({ page, isMobile }) => {
  await gotoHydrated(page, localePath('tr', 'home'))
  const scale = page.locator('.dive-scale')
  if (isMobile) {
    await expect(scale).toBeHidden()
    return
  }
  await expect(scale).toBeVisible()
  await expect(scale.locator('li')).toHaveText(['0', '5', '10', '15', '20', '25', '30'])
  const fill = () => page.locator('.dive-scale-fill').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d)
  await expect.poll(fill).toBe(0)
  await scrollToProgress(page, 1)
  await expect.poll(fill).toBe(1)
  const [scaleBox, columnBox] = await Promise.all([scale.boundingBox(), page.locator('main .container-page').first().boundingBox()])
  expect(scaleBox && columnBox && scaleBox.x + scaleBox.width <= columnBox.x).toBe(true)
})

test('the thumbs-up button appears a screen down and takes the page back to the top', async ({ page }) => {
  await gotoHydrated(page, localePath('tr', 'home'))
  const ascend = page.getByRole('button', { name: getUi('tr').a11y.ascend })
  await expect(ascend).toHaveCount(0)
  await scrollToProgress(page, 0.5)
  await expect(ascend).toBeVisible()
  // It sits above the gauge, not on it.
  const [ascendBox, gaugeBox] = await Promise.all([ascend.boundingBox(), page.locator('.dive-gauge').boundingBox()])
  expect(ascendBox && gaugeBox && ascendBox.y + ascendBox.height <= gaugeBox.y).toBe(true)

  await ascend.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  // Keyboard users carry on from the logo; the button goes away at the surface.
  await expect(page.locator('header a').first()).toBeFocused()
  await expect(ascend).toHaveCount(0)
})

test('reduced motion: the water still darkens with the scroll, a change of colour rather than motion', async ({ page }) => {
  // The base rule shortens every animation to 0.01ms; a scroll timeline must not care.
  await gotoHydrated(page, localePath('tr', 'home'))
  await scrollToProgress(page, 1)
  await expect.poll(() => opacity(page, '.dive-water--deep')).toBe(1)
  await scrollToProgress(page, 0)
  await expect.poll(() => opacity(page, '.dive-water--surface')).toBe(0)
})

test('reduced motion: no bubbles or animals, the gauge still reads the depth', async ({ page }) => {
  await gotoHydrated(page, localePath('tr', 'home'))
  await expect(page.locator('.dive-bubble').first()).toBeHidden()
  await expect(page.locator('.dive-swimmer').first()).toBeHidden()
  await scrollToProgress(page, 1)
  await expect(page.locator('.dive-gauge')).toHaveText('30 m')
})
