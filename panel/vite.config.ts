import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * The panel lives under /panel/ on the same host as the site, so every asset and route is based
 * there. Port 5175 keeps clear of the site's dev (5173) and preview (4173) servers. The dev host
 * is pinned to 127.0.0.1 to match auth.site_url in supabase/config.toml: "localhost" can bind to
 * ::1 only on Windows, and then the 127.0.0.1 address Supabase links back to would not answer.
 */
export default defineConfig({
  base: '/panel/',
  plugins: [react(), tailwindcss()],
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
