import { expect, test, type Locator, type Page } from '@playwright/test'
import { LOCALE_TAG, LOCALES } from '../../src/i18n/locales'
import { localePath } from '../../src/i18n/pages'
import { getUi } from '../../src/i18n/ui'
import { gotoHydrated, watchPage } from './helpers'
import { events, eventUrl, templatePages } from './targets'

/**
 * The 404 itself, as watchPage reports it: the response, and Chrome's console line for it. Over HTTP/2 and HTTP/3
 * there is no reason phrase, so a deployed host's line ends in "status of 404 ()".
 */
const isHost404 = (problem: string) => problem.startsWith('404 ') || /status of 404 \((Not Found)?\)$/.test(problem)

/**
 * Answers `url` the way deploy/nginx/dragoman.conf does for a missing page: that language's 404 HTML, status 404.
 * A deployed host (E2E_BASE_URL) answers for itself, so its real 404 is what gets checked there.
 */
async function serveAsHost404(page: Page, url: string, notFoundPage: string): Promise<void> {
  if (process.env.E2E_BASE_URL) return
  const body = await (await page.request.get(notFoundPage)).text()
  await page.route(url, (route) => route.fulfill({ status: 404, contentType: 'text/html; charset=utf-8', body }))
}

// U26: a missing address shows the 404 page in its own language and hydrates without a mismatch.
for (const locale of LOCALES) {
  const ui = getUi(locale)
  const notFoundPage = `${localePath(locale, 'home')}404/`

  test(`U26 ${locale}: missing pages get the ${notFoundPage} page`, async ({ page }) => {
    const problems = watchPage(page)
    const missingPages = [`${localePath(locale, 'home')}olmayan-sayfa/`, eventUrl(locale, events.archived)]
    for (const missing of missingPages) {
      await serveAsHost404(page, missing, notFoundPage)
      await gotoHydrated(page, missing)
      await expect(page.locator('html')).toHaveAttribute('lang', LOCALE_TAG[locale])
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(ui.notFound.title)
      await expect(page.getByRole('link', { name: ui.notFound.backHome })).toHaveAttribute('href', localePath(locale, 'home'))
    }
    // The 404 status is the point (and Chrome logs it); anything else, such as a hydration mismatch, is a problem.
    expect(problems.filter((p) => p.startsWith('404 '))).toEqual(missingPages.map((url) => `404 ${url}`))
    expect(problems.filter((p) => !isHost404(p))).toEqual([])
  })

  // React 19 keeps the server's attributes when hydrating. If the 404 tree marked the category link of
  // the missing address as current, the served HTML (nothing current) would stay, and the link would
  // then miss its highlight on the category page itself after a client navigation.
  test(`U26 ${locale}: after a missing detail page, the category link highlights on its page`, async ({ page, isMobile }) => {
    const missing = eventUrl(locale, events.archived)
    const category = localePath(locale, events.archived.category)
    const categoryLink = page.locator(`header nav[aria-label="${ui.a11y.mainNav}"] a[href="${category}"]:visible`).first()
    const openMenu = () => page.getByRole('button', { name: ui.a11y.openMenu }).click()
    await serveAsHost404(page, missing, notFoundPage)
    await gotoHydrated(page, missing)
    if (isMobile) await openMenu()
    await categoryLink.click()
    await expect(page).toHaveURL(new RegExp(`${category}$`))
    if (isMobile) await openMenu()
    await expect(categoryLink).toHaveAttribute('aria-current', 'page')
  })
}

// The host's files are case-sensitive and so is the router: /TR/ is a missing English address on both sides.
test('U26: a wrong-case address is a missing page, served and hydrated as the English 404', async ({ page }) => {
  const problems = watchPage(page)
  await serveAsHost404(page, '/TR/', '/404/')
  await gotoHydrated(page, '/TR/')
  await expect(page.locator('html')).toHaveAttribute('lang', LOCALE_TAG.en)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(getUi('en').notFound.title)
  expect(problems.filter((p) => !isHost404(p))).toEqual([])
})

const FORM_PAGES = [
  localePath('tr', 'transport'),
  localePath('tr', 'contact'),
  eventUrl('tr', events.klasik),
  localePath('tr', 'participantForm', ['diving']),
]

// Before hydration the fields are disabled (forms.spec.ts, "forms without JavaScript"); after it they take input.
test('forms take input once hydrated, and a picked trip type stays picked', async ({ page }) => {
  for (const url of FORM_PAGES) {
    await gotoHydrated(page, url)
    for (const form of await page.locator('main form').all()) await expect(form.locator(':scope > fieldset'), url).not.toHaveAttribute('disabled')
  }
  const ui = getUi('tr')
  await gotoHydrated(page, localePath('tr', 'transport'))
  await page.getByLabel(ui.forms.roundTrip).check()
  await expect(page.getByLabel(ui.forms.returnDateTime)).toBeVisible()
  await expect(page.getByLabel(ui.forms.roundTrip)).toBeChecked()
})

/** Records Content-Security-Policy violations from the very start of every document. */
async function watchCsp(page: Page): Promise<() => Promise<string[]>> {
  await page.addInitScript(() => {
    const seen: string[] = []
    Object.defineProperty(window, '__cspViolations', { value: seen })
    document.addEventListener('securitypolicyviolation', (event) => {
      seen.push(`${event.effectiveDirective} ${event.blockedURI || 'inline'} @ ${location.pathname}`)
    })
  })
  return () => page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations)
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * On a deployed host (E2E_BASE_URL) the forms post to the real function, so every post-deploy check
 * would store a request and send real e-mails. Filling the honeypot (HoneypotField, `website`) makes the
 * server discard it and answer a fake reference. The input is moved off screen and aria-hidden, so it is
 * filled by name, not by label. The local preview is a demo build whose forms send nothing; it stays as is.
 */
async function trapAsBot(form: Locator): Promise<void> {
  if (!process.env.E2E_BASE_URL) return
  await form.locator('input[name="website"]').fill('e2e-post-deploy-check', { force: true })
}

// L5: each page's own policy lets it hydrate, navigate and submit; nothing is blocked.
test('the Content-Security-Policy blocks nothing the site does', async ({ page }) => {
  test.setTimeout(120_000)
  const violations = await watchCsp(page)
  const problems = watchPage(page)
  const seen: string[] = []
  for (const { path: url } of templatePages('tr')) {
    await gotoHydrated(page, url)
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1)
    seen.push(...(await violations()))
  }

  // Client navigation fetches the next page's data and code.
  const ui = getUi('tr')
  await gotoHydrated(page, localePath('tr', 'home'))
  await page.locator(`main a[href="${localePath('tr', 'seaKayak')}"]`).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(ui.nav.seaKayak)
  seen.push(...(await violations()))

  await gotoHydrated(page, localePath('tr', 'contact'))
  const form = page.locator('main form')
  await form.getByLabel(ui.forms.fullName).fill('Örnek Ziyaretçi')
  await form.getByLabel(ui.forms.email).fill('ornek@example.com')
  await form.getByLabel(ui.forms.message).fill('Merhaba')
  await trapAsBot(form)
  await form.getByRole('button', { name: ui.forms.submit }).click()
  const status = form.getByRole('status')
  await expect(status).toBeVisible()
  // Locally the forms are samples; a deployed host answers the trapped request with a fake reference.
  await expect(status).toContainText(new RegExp(`${escapeRegExp(ui.forms.demoResult)}|${escapeRegExp(ui.forms.result.sentTitle)}`))
  if (process.env.E2E_BASE_URL) await expect(status.locator('strong')).toHaveText(/^DRG-\d+$/)
  seen.push(...(await violations()))

  expect(seen).toEqual([])
  expect(problems).toEqual([])
})
