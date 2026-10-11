import { useEffect } from 'react'
import { create } from 'zustand'

export type Theme = 'light' | 'dark'

/** What the visitor asked for. `system` follows the OS and is the default. */
export type ThemePreference = Theme | 'system'

const STORAGE_KEY = 'bl-theme'

/**
 * The sRGB value of `--app-chrome` in each theme (see theme.css).
 *
 * A phone paints its status and address bar from `<meta name="theme-color">`,
 * and the bar sits directly on top of the header. When the two differ the bar
 * reads as a second, red header — which is exactly what the brand-red value
 * that used to be here did. index.html carries the same two values for first
 * paint; keep the three in step.
 */
export const CHROME_HEX: Record<Theme, string> = {
  light: '#FFFFFF',
  dark: '#1A222A',
}

const systemQuery = () =>
  typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)')

function systemTheme(): Theme {
  return systemQuery()?.matches ? 'dark' : 'light'
}

function readPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Private mode or blocked storage — follow the system.
  }
  return 'system'
}

const resolve = (preference: ThemePreference): Theme =>
  preference === 'system' ? systemTheme() : preference

/** Paints the theme. Never writes storage: only an explicit choice does that. */
function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  // Both metas, not just the one whose media query matches: a visitor who
  // picked dark on a light OS is shown the light-media meta, so it has to
  // carry the dark value too.
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = CHROME_HEX[theme]
  }
}

function persist(preference: ThemePreference) {
  try {
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // The class is applied either way for this session.
  }
}

interface ThemeState {
  preference: ThemePreference
  theme: Theme
  setPreference: (preference: ThemePreference) => void
  setTheme: (theme: Theme) => void
  toggle: () => void
  /** The OS scheme changed; only matters while following the system. */
  syncSystem: () => void
}

/**
 * One shared store rather than per-component `useState`.
 *
 * With local state, every consumer got its own copy: the toggle in the header
 * would flip, while anything else reading the theme — the toast surface, for
 * one — kept a stale value and never re-rendered. A store means the theme has
 * exactly one source of truth no matter how many components read it.
 *
 * A first visit used to write the OS scheme into storage on mount, which
 * froze it: switching the phone to dark at night no longer reached the site,
 * and there was no way back. Storage now holds only an explicit choice, and
 * `system` clears it.
 *
 * The initial `.dark` class is applied by an inline script in index.html
 * before first paint, so there is no flash; this only keeps the two in sync.
 */
const useThemeStore = create<ThemeState>((set, get) => {
  const preference = readPreference()
  return {
    preference,
    theme: resolve(preference),
    setPreference: (next) => {
      persist(next)
      const theme = resolve(next)
      apply(theme)
      set({ preference: next, theme })
    },
    setTheme: (theme) => get().setPreference(theme),
    toggle: () => get().setPreference(get().theme === 'dark' ? 'light' : 'dark'),
    syncSystem: () => {
      if (get().preference !== 'system') return
      const theme = systemTheme()
      apply(theme)
      set({ theme })
    },
  }
})

export function useTheme() {
  const theme = useThemeStore((s) => s.theme)
  const preference = useThemeStore((s) => s.preference)
  const setTheme = useThemeStore((s) => s.setTheme)
  const setPreference = useThemeStore((s) => s.setPreference)
  const toggle = useThemeStore((s) => s.toggle)
  const syncSystem = useThemeStore((s) => s.syncSystem)

  // Reconcile on mount, in case the pre-paint script and the store disagreed
  // (a second tab having changed the stored value, say).
  useEffect(() => {
    apply(theme)
  }, [theme])

  useEffect(() => {
    const query = systemQuery()
    if (!query) return
    query.addEventListener('change', syncSystem)
    return () => query.removeEventListener('change', syncSystem)
  }, [syncSystem])

  return { theme, preference, setTheme, setPreference, toggle }
}
