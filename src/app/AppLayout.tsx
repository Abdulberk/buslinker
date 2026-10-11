import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { useLocale } from '@/shared/i18n/use-locale'
import { isQuietNav } from '@/shared/lib/quiet-nav'
import { SiteHeader } from '@/widgets/SiteHeader'
import { SiteFooter } from '@/widgets/SiteFooter'
import { RouteTransition } from './RouteTransition'

export function AppLayout() {
  const location = useLocation()
  const { pathname } = location
  // react-router types navigation state as `any`; it is whatever the caller
  // passed, so it is read as unknown and narrowed by isQuietNav.
  const state: unknown = location.state
  const { t } = useTranslation()
  const { language, currency } = useLocale()
  const mainRef = useRef<HTMLElement>(null)
  // The path focus was last moved for. A "first render" flag is not enough:
  // StrictMode runs every effect twice on mount, so the flag was spent on the
  // first run and the second one focused <main> on page load.
  const focusedPath = useRef(pathname)

  // On a client-side navigation the browser does not move focus, so a screen
  // reader keeps reading the old page. Move it to the new <main> — but not on
  // first load, where focus belongs where the browser put it, and not on a
  // quiet navigation (another day in the date strip), where the user is still
  // working in the control they pressed.
  useEffect(() => {
    if (focusedPath.current === pathname) return
    focusedPath.current = pathname
    if (isQuietNav(state)) return
    mainRef.current?.focus()
  }, [pathname, state])

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <a
        href="#main"
        className="absolute top-2 left-2 z-200 -translate-y-20 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-transform focus-visible:translate-y-0"
      >
        {t('common.skipToContent')}
      </a>
      <SiteHeader />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        {/* Remounted when the locale changes. Translated components re-render
            on their own through react-i18next, but prices are formatted by
            plain functions that no component subscribes to, so a currency
            switch would otherwise leave every fare on screen stale. The header
            and footer stay mounted; only the page is rebuilt, and it reads its
            state from the URL. */}
        <Outlet key={`${language}-${currency}`} />
      </main>
      <SiteFooter />
      <ScrollRestoration />
      <RouteTransition />
    </div>
  )
}
