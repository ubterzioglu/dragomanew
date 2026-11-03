import { createReadStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Site folders the dev server lends the panel; in production nginx serves them beside /panel/. */
const SITE_FOLDERS: Readonly<Record<string, string>> = {
  '/media': fileURLToPath(new URL('../app/public/media/', import.meta.url)),
  '/brand': fileURLToPath(new URL('../app/public/brand/', import.meta.url)),
}
const MEDIA_TYPES: Readonly<Record<string, string>> = {
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
}

/**
 * In production nginx serves the site's /media and /brand next to /panel/. In dev the panel has no
 * site beside it, so repo thumbnails (`/media/{id}-480.webp`) and the logo are read from the site's
 * public folder.
 */
function siteMediaInDev(): Plugin {
  return {
    name: 'site-media-in-dev',
    apply: 'serve',
    configureServer(server) {
      for (const [prefix, folder] of Object.entries(SITE_FOLDERS)) {
        server.middlewares.use(prefix, (req, res, next) => {
          const name = decodeURIComponent((req.url ?? '').split('?')[0] ?? '').replace(/^\/+/, '')
          const type = MEDIA_TYPES[path.extname(name)]
          const file = path.join(folder, name)
          if (!type || !/^[a-z0-9-]+\.[a-z]+$/.test(name) || !existsSync(file) || !statSync(file).isFile()) return next()
          res.setHeader('content-type', type)
          createReadStream(file).pipe(res)
        })
      }
    },
  }
}

/**
 * The panel lives under /panel/ on the same host as the site, so every asset and route is based
 * there. Port 5175 keeps clear of the site's dev (5173) and preview (4173) servers. The dev host
 * is pinned to 127.0.0.1 to match auth.site_url in supabase/config.toml: "localhost" can bind to
 * ::1 only on Windows, and then the 127.0.0.1 address Supabase links back to would not answer.
 */
export default defineConfig({
  base: '/panel/',
  plugins: [react(), tailwindcss(), siteMediaInDev()],
  server: { host: '127.0.0.1', port: 5175, strictPort: true },
  preview: { host: '127.0.0.1', port: 4175, strictPort: true },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Vendor code changes less often than the panel, so it gets its own long-cached chunks.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'supabase', test: /node_modules[\\/]@supabase/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
})
