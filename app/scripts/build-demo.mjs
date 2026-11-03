// Builds the site with its forms in demo mode, whatever app/.env.local holds (npm run build:demo).
// The E2E suite runs against this build: it submits every form, and a build with the Supabase
// settings would post those test requests to the configured project instead of showing the sample
// result. Values already in the environment win over the .env files, blank ones included.
import { spawnSync } from 'node:child_process'

// The demo build always renders the fixture, never a published release (dalga2-sozlesme §7), and never
// measures: with a GA4 id from .env.local the E2E runs would show the cookie banner and could send hits.
const DEMO_ENV = { VITE_SUPABASE_URL: '', VITE_SUPABASE_PUBLISHABLE_KEY: '', VITE_GA4_ID: '', CONTENT_SOURCE: 'fixture' }

// npm sets npm_execpath for its scripts; running it with this Node avoids spawning npm.cmd through a shell on Windows.
// Run directly (node scripts/build-demo.mjs), npm is found through the shell, given as one command line.
const npmCli = process.env.npm_execpath
const options = { stdio: 'inherit', env: { ...process.env, ...DEMO_ENV } }
const result = npmCli
  ? spawnSync(process.execPath, [npmCli, 'run', 'build'], options)
  : spawnSync('npm run build', { ...options, shell: true })
if (result.error) throw result.error
process.exit(result.status ?? 1)
