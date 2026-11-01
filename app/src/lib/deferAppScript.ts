const APP_SCRIPT = /<script type="module" crossorigin(?:="")? src="([^"]+)"><\/script>/
/** Hydrate anyway when no first contentful paint is reported within this time. */
const PAINT_TIMEOUT_MS = 3000

/**
 * Starts the app bundle only after the prerendered page has been painted.
 * Every page is complete HTML (links work, forms stay disabled until hydrated),
 * so the first paint — including the LCP image — does not wait for the
 * bundle to download, run and hydrate. The signal is the browser's own
 * first-contentful-paint entry: a frame callback runs before a slow device has
 * rasterised that frame, which let the bundle compete with the first paint.
 * Without Paint Timing it falls back to the next frame. A tab opened or hidden
 * in the background paints nothing, so it loads the bundle right away.
 */
export function deferAppScript(html: string): string {
  const match = APP_SCRIPT.exec(html)
  if (!match) return html
  const src = JSON.stringify(match[1])
  // l: load the bundle once · r: after the next frame · f: once the document is parsed, wait for the first contentful paint.
  // The timeline check after observe() covers Safari 14.1–15, which never delivers buffered paint entries
  // (WebKit bug 225305), so a paint that happened before DOMContentLoaded would otherwise wait for the timeout.
  const loader =
    `<script>(function(){var d=document,P=window.PerformanceObserver,F="first-contentful-paint",n=0;` +
    `function l(){if(n++)return;var s=d.createElement("script");s.type="module";s.crossOrigin="";s.src=${src};d.head.appendChild(s)}` +
    `function r(){requestAnimationFrame(function(){setTimeout(l)})}` +
    `function f(){if(d.visibilityState==="hidden")return l();` +
    `if(!P||!P.supportedEntryTypes||P.supportedEntryTypes.indexOf("paint")<0)return r();` +
    `var o;try{o=new P(function(e){if(e.getEntriesByName(F).length){o.disconnect();l()}});o.observe({type:"paint",buffered:true})}catch(x){return r()}` +
    `if(performance.getEntriesByName(F).length){o.disconnect();return l()}` +
    `d.addEventListener("visibilitychange",function(){if(d.visibilityState==="hidden")l()});setTimeout(l,${PAINT_TIMEOUT_MS})}` +
    `if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",f);else f()})()</script>`
  // Download early at low priority (after the LCP image), run after the first paint.
  const preload = `<link rel="modulepreload" crossorigin href=${src} fetchpriority="low">`
  return html.replace(match[0], () => preload + loader)
}
