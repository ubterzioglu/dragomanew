/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_PANEL_DEV_EMAIL_LOGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
