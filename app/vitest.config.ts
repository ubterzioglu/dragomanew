import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      // Pure logic modules (plan §8.1: ≥80%); components are covered by the E2E suite.
      include: [
        'src/lib/**/*.ts',
        'src/i18n/**/*.ts',
        'src/content/**/*.ts',
        'src/app/routeHandle.ts',
        'src/app/routePaths.ts',
        'src/features/forms/schemas.ts',
        'src/features/health/healthForms.ts',
      ],
      exclude: ['src/content/data/**'],
    },
  },
})
