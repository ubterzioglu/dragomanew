import { defineConfig, loadEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { ViteReactSSGOptions } from 'vite-react-ssg'
import { addContentSecurityPolicyToPages, supabaseConnectSources } from './src/lib/contentSecurityPolicy'
import { deferAppScript } from './src/lib/deferAppScript'
import { resolveSiteOrigin } from './src/lib/siteOrigin'

// The head manager inserts page tags at the top of <head>, which pushes the
// charset declaration past the first 1024 bytes required by the HTML spec.
// Move it back to the very start of <head> on every prerendered page.
function charsetFirst(html: string): string {
  const withoutCharset = html.replace(/\s*<meta charset="UTF-8"\s*\/?>/i, '')
  return withoutCharset.replace(/<head>/i, '<head><meta charset="UTF-8">')
}

// Site URLs end with "/" (WordPress legacy). Render each page at that exact URL
// so active-link state in the static HTML matches the browser after hydration.
function withTrailingSlash(route: string): string {
  return route.endsWith('/') ? route : `${route}/`
}

/** `connectSources`: origins the forms may post to besides the site (the Supabase project, once configured). */
function ssgOptions(connectSources: readonly string[]): ViteReactSSGOptions {
  return {
    entry: 'src/main.tsx',
    dirStyle: 'nested',
    includedRoutes: (paths) => paths.filter((route) => !route.includes(':') && !route.includes('*')).map(withTrailingSlash),
    onPageRendered: (_route, html) => deferAppScript(charsetFirst(html)),
    // Each page's policy allows its inline scripts by hash, so it is added once every page is final.
    onFinished: async (outDir) => {
      await addContentSecurityPolicyToPages(outDir, connectSources)
    },
    // Critical-CSS inlining would add <style> blocks the policy does not allow.
    beastiesOptions: false,
  }
}

export default defineConfig(({ mode }): UserConfig & { ssgOptions: ViteReactSSGOptions } => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  // Validated here so a malformed origin fails the build rather than every canonical URL.
  const siteOrigin = resolveSiteOrigin(env.VITE_SITE_ORIGIN)
  // Empty while VITE_SUPABASE_URL is unset, so a Stage A build keeps connect-src 'self' only.
  const connectSources = supabaseConnectSources(env.VITE_SUPABASE_URL)
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Fixed at build time so prerendered HTML and hydration agree after New Year.
      'import.meta.env.VITE_BUILD_YEAR': JSON.stringify(String(new Date().getFullYear())),
      'import.meta.env.VITE_SITE_ORIGIN': JSON.stringify(siteOrigin),
    },
    ssgOptions: ssgOptions(connectSources),
  }
})
