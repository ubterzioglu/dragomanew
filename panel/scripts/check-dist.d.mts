// Types for the pure part of check-dist.mjs, so the site's tests import it under strict TypeScript.
/** One line per problem in a built index.html; empty when the page is clean. */
export function distProblems(html: string): string[]
