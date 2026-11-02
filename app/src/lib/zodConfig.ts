import { z } from 'zod'

// Form validation must not probe `new Function`: the Content-Security-Policy has no 'unsafe-eval',
// and browsers report the blocked probe as a violation even though zod falls back silently.
// A module of its own, imported first by main.tsx, so the setting is in place before any module
// that builds or runs a schema at load time is evaluated.
z.config({ jitless: true })
