import { expect, test, type Page } from '@playwright/test'

/**
 * Opens a page and waits for hydration (RootLayout sets <html data-hydrated>). The app script
 * starts after the first paint, so anything that needs JavaScript (menus, form typing) waits.
 * Typing earlier races react-hook-form, which writes the default values back as it hydrates.
 */
export async function gotoHydrated(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', '')
  // Sample forms enable their submit buttons in the same render (useDemoSubmission).
  for (const submit of await page.locator('form button[type="submit"]').all()) await expect(submit).toBeEnabled()
}

/** Collects console errors and failed same-origin requests while a test runs. */
export function watchPage(page: Page) {
  const problems: string[] = []
  // The site under test: the local preview, or a deployed host (E2E_BASE_URL in playwright.config.ts).
  const siteHost = new URL(String(test.info().project.use.baseURL)).host
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  page.on('response', (response) => {
    const url = new URL(response.url())
    if (url.host === siteHost && response.status() >= 400) problems.push(`${response.status()} ${url.pathname}`)
  })
  return problems
}

/** True when the page scrolls sideways (layout broken by long text). */
export async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
}
