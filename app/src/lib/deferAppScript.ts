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
 * When the page has a priority image (the LCP image, fetchpriority="high") on its
 * first screen, the bundle also waits until that image has been painted: the first
 * paint is often text, and Lighthouse puts every script that runs before the LCP
 * paint, with its download, on the LCP path (home page 4–5 s instead of 1.7 s on a
 * host with real request latency, session 8). Chromium reports the image's own
 * paint through Element Timing (Picture sets elementtiming); "decoded plus one
 * frame" was not enough there, because with software raster the frame reaches the
 * screen hundreds of ms later. Other engines wait for decode() and one frame. A
 * broken image does not hold the bundle back. A priority image off the screen (a
 * detail page's gallery under the price card on phones, or above a restored scroll
 * position) is not the LCP, so the bundle does not wait for it.
 * Without Paint Timing it falls back to the next frame. A tab opened or hidden
 * in the background paints nothing, so it loads the bundle right away.
 * React DOM (a dynamic import of the bundle) is deliberately not preloaded: in
 * Lighthouse it pushed the home page's LCP to ~2.8 s in half the runs (session 7).
 */
export function deferAppScript(html: string): string {
  const match = APP_SCRIPT.exec(html)
  if (!match) return html
  const src = JSON.stringify(match[1])
  // l: load the bundle once · r: after the next frame · v: the image is on the screen (a restored scroll position can
  // put it above; Chromium paints nothing that far off screen) · g: after the first paint, wait for an on-screen
  // priority image: its Element Timing entry where supported (buffered, so a paint before observe() counts; a failed
  // decode, or an image scrolled off screen by then, means no paint is coming), else decode() and one frame · f: once
  // the document is parsed, wait for the first
  // contentful paint. The hidden-tab listener and the timeout are set before either paint path can reach g(), so an
  // image that never paints waits at most the timeout. The timeline check after observe() covers Safari 14.1–15,
  // which never delivers buffered paint entries (WebKit bug 225305), so a paint that happened before
  // DOMContentLoaded would otherwise wait for the timeout.
  const loader =
    `<script>(function(){var d=document,w=window,P=w.PerformanceObserver,F="first-contentful-paint",n=0;` +
    `function l(){if(n++)return;var s=d.createElement("script");s.type="module";s.crossOrigin="";s.src=${src};d.head.appendChild(s)}` +
    `function r(){requestAnimationFrame(function(){setTimeout(l)})}` +
    `function v(i){var b=i.getBoundingClientRect();return b.top<w.innerHeight&&b.bottom>0}` +
    `function g(){var i=d.querySelector("img[fetchpriority=high]");` +
    `if(!i||!i.decode||!v(i))return l();` +
    `if(i.hasAttribute("elementtiming")&&P.supportedEntryTypes.indexOf("element")>=0){` +
    `var t=new P(function(e){if(e.getEntries().some(function(x){return x.element===i})){t.disconnect();l()}});` +
    `t.observe({type:"element",buffered:true});return i.decode().then(function(){if(!v(i))l()},l)}` +
    `i.decode().then(r,r)}` +
    `function f(){if(d.visibilityState==="hidden")return l();` +
    `if(!P||!P.supportedEntryTypes||P.supportedEntryTypes.indexOf("paint")<0)return r();` +
    `var o;try{o=new P(function(e){if(e.getEntriesByName(F).length){o.disconnect();g()}});o.observe({type:"paint",buffered:true})}catch(x){return r()}` +
    `d.addEventListener("visibilitychange",function(){if(d.visibilityState==="hidden")l()});setTimeout(l,${PAINT_TIMEOUT_MS});` +
    `if(performance.getEntriesByName(F).length){o.disconnect();g()}}` +
    `if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",f);else f()})()</script>`
  // Download early at low priority (after the LCP image), run after the first paint.
  const preload = `<link rel="modulepreload" crossorigin href=${src} fetchpriority="low">`
  return html.replace(match[0], () => preload + loader)
}
