import { useSyncExternalStore } from 'react'

/**
 * Reads a media query without the render-tearing that a useState+useEffect
 * pair produces. Returns false during SSR and in environments without
 * matchMedia rather than throwing.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () =>
      typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false,
    () => false,
  )
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsMobile = () => !useMediaQuery('(min-width: 768px)')
