import { expect, test } from '@playwright/test'
import { localePath } from '../../src/i18n/pages'
import { events, eventUrl } from './targets'

// E04: FAQ opens by keyboard; answers are in the page itself.
test('E04: FAQ toggles with Enter and Space', async ({ page }) => {
  await page.goto(eventUrl('tr', events.withFaq))
  const first = page.locator('#faq ~ div details').first()
  const summary = first.locator('summary')
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(first).toHaveAttribute('open', '')
  await page.keyboard.press('Space')
  await expect(first).not.toHaveAttribute('open', '')
})

// SEO-01: the main content is in the first HTML response, without JavaScript.
test.describe('first HTML without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('event detail: title, summary, FAQ answer and internal links', async ({ page }) => {
    const event = events.withFaq
    await page.goto(eventUrl('tr', event))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(event.title.tr)
    await expect(page.getByText(event.summary.tr).first()).toBeVisible()
    const answer = event.faq[0]?.answer.tr ?? ''
    expect(await page.content()).toContain(answer.slice(0, 40))
    await expect(page.locator(`a[href="${localePath('tr', event.category)}"]`).first()).toBeAttached()
  })

  // Lighthouse counts every request that finished before the LCP paint, except low-priority images, toward LCP. On
  // phones the next hero tile peeks into view, so without the hint Chrome may raise it to high priority (session 8).
  // The app loader waits for the page's first img[fetchpriority=high], which must be the LCP tile.
  test('home hero: only the first tile is a high-priority image, the others stay low', async ({ page }) => {
    await page.goto(localePath('tr', 'home'))
    const tiles = page.locator('section[aria-labelledby="hero-title"] ul img')
    expect(await tiles.evaluateAll((images) => images.map((image) => image.getAttribute('fetchpriority')))).toEqual(['high', 'low', 'low'])
    await expect(page.locator('img[fetchpriority="high"]')).toHaveCount(1)
    // The loader waits for this image's Element Timing entry.
    await expect(page.locator('img[fetchpriority="high"]')).toHaveAttribute('elementtiming', 'lcp-image')
  })

  test('category page lists its activity cards', async ({ page }) => {
    await page.goto(localePath('en', 'seaKayak'))
    await expect(page.locator('main article')).not.toHaveCount(0)
  })
})
