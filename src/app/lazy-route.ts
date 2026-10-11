import { lazy, type ComponentType } from 'react'

const RELOAD_KEY = 'bl-chunk-reload'
const RELOAD_WINDOW_MS = 60_000
/** Reloads allowed inside one window before the error is shown instead. */
const RELOAD_BUDGET = 2

/**
 * True when an error is a code chunk that failed to load — in practice, a
 * chunk a deploy replaced. Each engine words it differently, and only the
 * import's rejection reaches the app, so the messages are matched as text.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  if (error.name === 'ChunkLoadError') return true
  return [
    'Failed to fetch dynamically imported module', // Chromium
    'Importing a module script failed', // WebKit, so every iPhone browser
    'error loading dynamically imported module', // Gecko
    'Unable to preload CSS', // Vite's own preload of a chunk's stylesheet
  ].some((text) => error.message.includes(text))
}

/**
 * Reloads the page to pick up a new release, unless that has already been
 * tried too often to be the fix.
 *
 * Every route is code-split, so an open tab holds an index.html that names
 * hashed chunks by exact filename. A deploy swaps those files and the next
 * navigation asks for one that no longer exists; recovering means loading the
 * new index.html. The budget is two reloads a minute, not one: on an iPhone a
 * tab restored from the back-forward cache can bring the old document back
 * once more after the first reload, and with a single reload allowed that
 * second miss surfaced the error page for what was only a stale tab. A chunk
 * that is genuinely gone still stops after two, instead of reloading forever.
 */
export function reloadForNewRelease(): boolean {
  // Offline, a reload swaps the app for the browser's network error page.
  // Better to surface the failure inside the app, where the shell survives.
  if (typeof navigator !== 'undefined' && !navigator.onLine) return false

  try {
    const now = Date.now()
    const raw = sessionStorage.getItem(RELOAD_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    const record =
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as { since?: unknown }).since === 'number' &&
      typeof (parsed as { count?: unknown }).count === 'number'
        ? (parsed as { since: number; count: number })
        : null
    const fresh = !record || now - record.since > RELOAD_WINDOW_MS
    const next = fresh ? { since: now, count: 1 } : { since: record.since, count: record.count + 1 }
    if (next.count > RELOAD_BUDGET) return false
    sessionStorage.setItem(RELOAD_KEY, JSON.stringify(next))
  } catch {
    return false
  }

  window.location.reload()
  return true
}

/**
 * Guards a lazy route against the chunk a deploy just replaced.
 *
 * React caches the rejection on the lazy payload, so the route is dead for the
 * life of the page and no in-app retry can revive it; only a reload can. When
 * the reload budget is spent the error goes on to the route's boundary, which
 * says what happened and offers the reload by hand.
 */
// React's own `lazy` is typed against `ComponentType<any>`; narrowing this
// wrapper any further stops it accepting the page modules.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyRoute<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() =>
    factory().catch((error: unknown) => {
      if (!reloadForNewRelease()) throw error
      // Hold Suspense open; the reload replaces this document.
      return new Promise<{ default: T }>(() => {})
    }),
  )
}
