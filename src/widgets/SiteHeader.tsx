import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation } from 'react-router'
import { ChevronRight, Globe, LifeBuoy, Route as RouteIcon } from 'lucide-react'
import { LocaleDialog, useLocaleSummary } from '@/features/locale/LocaleDialog'
import { Flag } from '@/shared/ui/flag'
import { ICON } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { useIsDesktop } from '@/shared/lib/use-media-query'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Dialog, DialogContent, DialogTrigger } from '@/shared/ui/primitives'

const NAV_BASE = [
  'relative inline-flex h-10 items-center rounded-lg px-3',
  'text-sm font-medium transition-colors duration-(--duration-fast)',
].join(' ')

const NAV_IDLE = 'text-fg-secondary hover:bg-surface-sunken hover:text-fg'

// The active state is carried by weight and an underline bar as well as
// colour, so it survives a monochrome or high-contrast rendering.
const NAV_ACTIVE = [
  'font-semibold text-fg',
  'after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand',
].join(' ')

const SHEET_ITEM = [
  'flex min-h-11 items-center gap-3 rounded-lg px-3',
  'text-base font-medium text-fg-secondary transition-colors',
  'hover:bg-surface-sunken hover:text-fg',
].join(' ')

const SHEET_ITEM_ACTIVE = 'bg-brand/8 font-semibold text-brand-fg'

function navClass({ isActive }: { isActive: boolean }) {
  return cn(NAV_BASE, isActive ? NAV_ACTIVE : NAV_IDLE)
}

/**
 * The locale trigger. Filled rather than outlined: a hard ring around a small
 * chip sitting between the theme toggle and the sign-in link read as the
 * heaviest thing in the header, which it is not.
 */
const LOCALE_CHIP = [
  'inline-flex h-9 items-center gap-2 rounded-full bg-surface-sunken py-1 pr-3.5 pl-1.5',
  'text-xs font-semibold text-fg-secondary',
  'transition-colors duration-(--duration-fast) ease-standard',
  'hover:bg-border hover:text-fg',
].join(' ')

export function SiteHeader() {
  const { t } = useTranslation()
  const locale = useLocaleSummary()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  // Opened from inside the mobile sheet, which closes first: a dialog launched
  // from within another dialog stacks two focus traps.
  const [localeOpen, setLocaleOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop()
  const { pathname } = useLocation()

  // An 8px sentinel pinned to the document origin, watched by an observer:
  // the callback fires twice per session instead of on every scroll frame.
  // It is absolutely positioned, so making the header opaque costs no reflow
  // and shifts nothing.
  useEffect(() => {
    const node = sentinelRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) setScrolled(!entry.isIntersecting)
      },
      { threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Closing the menu on navigation is a state ADJUSTMENT, not a side effect.
  // Doing it in an effect renders the sheet once more over the new route
  // before closing it; comparing during render avoids that extra pass.
  const [menuPath, setMenuPath] = useState(pathname)
  if (menuPath !== pathname) {
    setMenuPath(pathname)
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-2 w-px"
      />
      <header
        role="banner"
        className={cn(
          'sticky top-0 z-30 border-b',
          'transition-[background-color,border-color,box-shadow] duration-(--duration-base) ease-standard',
          scrolled
            ? 'border-border bg-surface/90 shadow-sm backdrop-blur-md'
            : 'border-transparent bg-bg',
        )}
      >
        <div className="app-container flex h-16 items-center gap-2 lg:h-18">
          <Link to="/" className="flex shrink-0 items-center rounded-lg text-brand-fg">
            <Logo />
          </Link>

          <nav aria-label={t('nav.main')} className="ml-6 hidden items-center gap-1 lg:flex">
            <NavLink to="/" end className={navClass}>
              {t('nav.tickets')}
            </NavLink>
            <NavLink to="/hesabim/seferlerim" className={navClass}>
              {t('nav.myTrips')}
            </NavLink>
            <NavLink to="/sss" className={navClass}>
              {t('nav.help')}
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {isDesktop ? (
              <>
                <ThemeToggle />
                <LocaleDialog>
                  <button
                    type="button"
                    className={cn(LOCALE_CHIP, 'hidden xl:inline-flex')}
                    aria-label={`${t('locale.trigger')}: ${locale.aria}`}
                  >
                    <Flag code={locale.language} />
                    <span aria-hidden="true">{locale.currencyLabel}</span>
                  </button>
                </LocaleDialog>
                <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />
                <Button asChild variant="ghost" size="sm">
                  <Link to="/giris">{t('common.signIn')}</Link>
                </Button>
                <Button asChild variant="brand-outline" size="sm">
                  <Link to="/kayit">{t('common.signUp')}</Link>
                </Button>
              </>
            ) : (
              <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="tap-44"
                    aria-label={t('common.menu')}
                  >
                    <AssetIcon src={ICON.hamburger} className="size-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent
                  side="bottom"
                  title={t('common.menu')}
                  description={t('nav.sheetDescription')}
                >
                  <nav aria-label={t('nav.mobile')} className="overflow-y-auto p-3">
                    <ul className="flex flex-col gap-1">
                      <li>
                        <NavLink
                          to="/"
                          end
                          onClick={closeMenu}
                          className={({ isActive }) =>
                            cn(SHEET_ITEM, isActive && SHEET_ITEM_ACTIVE)
                          }
                        >
                          <AssetIcon src={ICON.bus} className="size-5" />
                          {t('nav.tickets')}
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/hesabim/seferlerim"
                          onClick={closeMenu}
                          className={({ isActive }) =>
                            cn(SHEET_ITEM, isActive && SHEET_ITEM_ACTIVE)
                          }
                        >
                          <RouteIcon className="size-5" aria-hidden="true" />
                          {t('nav.myTrips')}
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/sss"
                          onClick={closeMenu}
                          className={({ isActive }) =>
                            cn(SHEET_ITEM, isActive && SHEET_ITEM_ACTIVE)
                          }
                        >
                          <LifeBuoy className="size-5" aria-hidden="true" />
                          {t('nav.help')}
                        </NavLink>
                      </li>
                    </ul>
                  </nav>

                  <div className="mt-1 flex flex-col gap-3 border-t border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-fg-secondary">
                        {t('common.appearance')}
                      </span>
                      <ThemeToggle />
                    </div>

                    {/* The same dialog the desktop chip opens. */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setLocaleOpen(true)
                      }}
                      className={cn(
                        '-mx-3 flex min-h-11 items-center justify-between gap-4 rounded-lg px-3',
                        'text-sm transition-colors duration-(--duration-fast)',
                        'hover:bg-surface-sunken',
                      )}
                    >
                      <span className="flex items-center gap-2 font-medium text-fg-secondary">
                        <Globe className="size-4" aria-hidden="true" />
                        {t('locale.trigger')}
                      </span>
                      <span className="flex items-center gap-2 font-semibold text-fg">
                        <Flag code={locale.language} />
                        {locale.currencyLabel}
                        <ChevronRight className="size-4 text-fg-muted" aria-hidden="true" />
                      </span>
                    </button>
                    <div className="flex gap-3">
                      <Button asChild variant="secondary" size="md" full>
                        <Link to="/giris" onClick={closeMenu}>
                          {t('common.signIn')}
                        </Link>
                      </Button>
                      <Button asChild variant="brand-outline" size="md" full>
                        <Link to="/kayit" onClick={closeMenu}>
                          {t('common.signUp')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <LocaleDialog open={localeOpen} onOpenChange={setLocaleOpen} />
    </>
  )
}
