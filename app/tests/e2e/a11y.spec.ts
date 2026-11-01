import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'
import { templatePages } from './targets'

// Automated WCAG 2.0–2.2 A/AA checks on every template (Turkish pages); any violation fails the test.
// Audited after hydration: axe skips disabled controls, and submit buttons are disabled until then.
for (const { name, path } of templatePages('tr')) {
  test(`axe ${name}`, async ({ page }) => {
    await gotoHydrated(page, path)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
    const violations = results.violations.map(
      (violation) => `${violation.id} [${violation.impact}] (${violation.nodes.length}): ${violation.nodes[0]?.target.join(' ')}`,
    )
    expect(violations).toEqual([])
  })
}
