import { useEffect } from 'react'
import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'bl-theme'

function readInitial(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Private mode or blocked storage — fall through to the system preference.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // The class is applied either way for this session.
  }
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggle: () => void
}

/**
 * One shared store rather than per-component `useState`.
 *
 * With local state, every consumer got its own copy: the toggle in the header
 * would flip, while anything else reading the theme — the toast surface, for
 * one — kept a stale value and never re-rendered. A store means the theme has
 * exactly one source of truth no matter how many components read it.
 *
 * The initial `.dark` class is applied by an inline script in index.html
 * before first paint, so there is no flash; this only keeps the two in sync.
 */
const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readInitial(),
  setTheme: (theme) => {
    apply(theme)
    set({ theme })
  },
  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))

export function useTheme() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const toggle = useThemeStore((s) => s.toggle)

  // Reconcile once on mount, in case the pre-paint script and the store
  // disagreed (a second tab having changed the stored value, say).
  useEffect(() => {
    apply(theme)
  }, [theme])

  return { theme, setTheme, toggle }
}
