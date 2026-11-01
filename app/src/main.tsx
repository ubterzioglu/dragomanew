import { ViteReactSSG } from 'vite-react-ssg'
import { z } from 'zod'
import { routes } from './app/routes'
import './styles/app.css'

// Form validation must not probe `new Function`: the Content-Security-Policy has no 'unsafe-eval',
// and browsers report the blocked probe as a violation even though zod falls back silently.
z.config({ jitless: true })

export const createRoot = ViteReactSSG({ routes })
