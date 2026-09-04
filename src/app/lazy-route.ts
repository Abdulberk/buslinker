import { lazy, type ComponentType } from 'react'

const RELOAD_KEY = 'bl-chunk-reload-at'
const RELOAD_WINDOW_MS = 30_000

/**
 * Guards a lazy route against the chunk a deploy just replaced.
 *
 * Every route here is code-split, so an open tab holds an index.html that
 * names hashed chunks by exact filename. A deploy swaps those files, and the
 * next navigation asks for a chunk that no longer exists. Behind the SPA
 * rewrite it does not even 404 — the request falls through to index.html and
 * dies on the module MIME check.
 *
 * React caches the rejection on the lazy payload, so the route is dead for the
 * life of the page and no in-app retry can revive it. The error boundary lives
 * on the layout route, which means the whole shell — header, nav, footer —
 * unmounts too. Recovering the app means loading the new index.html, so this
 * reloads once.
 */
function shouldReload(): boolean {
  // Offline, a reload swaps the app for the browser's network error page.
  // Better to surface the failure inside the app, where the shell survives.
  if (typeof navigator !== 'undefined' && !navigator.onLine) return false

  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? '0')
    // A chunk that is genuinely gone would otherwise reload forever.
    if (Number.isFinite(last) && Date.now() - last < RELOAD_WINDOW_MS) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
    return true
  } catch {
    return false
  }
}

// React's own `lazy` is typed against `ComponentType<any>`; narrowing this
// wrapper any further stops it accepting the page modules.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyRoute<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() =>
    factory().catch((error: unknown) => {
      if (!shouldReload()) throw error
      window.location.reload()
      // Hold Suspense open; the reload replaces this document.
      return new Promise<{ default: T }>(() => {})
    }),
  )
}
