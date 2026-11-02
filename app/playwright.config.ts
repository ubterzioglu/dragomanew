import { defineConfig, devices } from '@playwright/test'

/** A deployed host to check instead of the local preview, e.g. E2E_BASE_URL=https://notyetbro.club. */
const deployedHost = process.env.E2E_BASE_URL || undefined

/**
 * E2E checks against the prerendered demo build (npm run build:demo first; global-setup refuses a
 * live one, whose forms would store the test requests).
 * Results feed tmp/docs/asama-a-teslim/kontrol-sonuclari.md; a deployed host's run stays out of them.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  retries: 0,
  reporter: deployedHost ? [['list']] : [['list'], ['json', { outputFile: 'test-results/e2e-results.json' }]],
  ...(deployedHost ? { outputDir: 'test-results/deployed-host' } : {}),
  use: {
    baseURL: deployedHost ?? 'http://localhost:4173',
    trace: 'retain-on-failure',
    // The dive background's endless animations, drawn without a GPU in a dozen parallel browsers,
    // starved the CPU (axe timeouts, session 11). Reduced motion stills them; dive.spec.ts covers them.
    reducedMotion: 'reduce',
  },
  webServer: deployedHost
    ? undefined
    : {
        command: 'npx vite preview --port 4173 --strictPort',
        url: 'http://localhost:4173/',
        reuseExistingServer: true,
        timeout: 60_000,
      },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
})
