import { defineConfig } from 'vitest/config'

/** Pure logic only; screens are thin and get checked by hand against the local stack. */
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
