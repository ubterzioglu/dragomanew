// Run from app/ via `npm run lint`. Lives here, next to its own node_modules,
// because typescript-eslint cannot load TypeScript 7 (see package.json).
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// With `-c`, ESLint resolves these patterns against the working directory (app/).
export default defineConfig([
  globalIgnores([
    'dist/',
    'coverage/',
    'test-results/',
    'playwright-report/',
    'public/',
    'tools/lint/node_modules/',
    '.vite-react-ssg-temp/',
    '.omc/',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Matches tsconfig's noUnusedLocals/noUnusedParameters, plus the `_` escape hatch.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
  },
]);
