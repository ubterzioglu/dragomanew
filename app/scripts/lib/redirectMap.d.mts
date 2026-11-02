export declare const REDIRECT_PATH: RegExp

export interface Redirect {
  from: string
  to: string
}

export interface RedirectInput {
  content: { events: readonly object[]; posts: readonly object[]; products: readonly object[] }
  slugHistory: readonly { type: 'event' | 'post' | 'product'; id: string; locale: string; slug: string; category?: string }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the src/content/urls.ts builders, typed there
  paths: { eventPath: (...args: any[]) => string; postPath: (...args: any[]) => string; productPath: (...args: any[]) => string }
  liveRoutes: Iterable<string>
}

export declare function buildRedirects(input: RedirectInput): { redirects: Redirect[]; skipped: { from: string; reason: string }[] }
export declare function renderRedirectMap(redirects: readonly Redirect[], header: string): string
