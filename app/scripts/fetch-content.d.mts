import type { Redirect } from './lib/redirectMap.mjs'

export declare const OUTPUTS: {
  releaseDir: string
  releaseFile: string
  publicRelease: string
  redirectMap: string
  uploadMedia: string
}

export interface FetchContentModules {
  releaseSnapshotSchema: { safeParse(value: unknown): { success: true; data: unknown } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } } }
  validateContent(set: unknown): { code: string; recordType: string; recordId: string; path?: string; message: string }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the src/content/urls.ts builders, typed there
  eventPath: (...args: any[]) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- as above
  postPath: (...args: any[]) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- as above
  productPath: (...args: any[]) => string
  staticRouteSpecs(): { path: string }[]
  locales: readonly string[]
}

export interface FetchContentOptions {
  env?: Record<string, string | undefined>
  appDir?: string
  outDir?: string
  modules?: FetchContentModules
  fetchImpl?: typeof fetch
  log?: (line: string) => void
  retryDelayMs?: number
}

export declare function loadModules(appDir?: string): Promise<FetchContentModules>
export declare function fetchContent(options?: FetchContentOptions): Promise<{ source: 'fixture' | 'release'; releaseId?: number; redirects?: Redirect[] }>
