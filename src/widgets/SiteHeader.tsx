import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import {
  Bus,
  ChevronRight,
  Globe,
  LifeBuoy,
  Menu,
  Route as RouteIcon,
  Ticket,
  TicketX,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { LocaleDialog, useLocaleSummary } from '@/features/locale/LocaleDialog'
import { Flag } from '@/shared/ui/flag'
import { cn } from '@/shared/lib/cn'
import { useIsDesktop } from '@/shared/lib/use-media-query'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'
import { ThemePreferenceControl, ThemeToggle } from '@/shared/ui/theme-toggle'
import { Dialog, DialogContent, DialogTrigger } from '@/shared/ui/primitives'

interface NavItem {
  to: string
  labelKey: string
  Icon: LucideIcon
  /** Whether this item is "where you are" — wider than an exact path match. */
  isActive: (pathname: string) => boolean
}

/** `/bilet` matches `/bilet` and `/bilet/BK7J2M`, never `/bilet-iptal`. */
const under = (pathname: string, ...roots: string[]) =>
  roots.some((root) => pathname === root || pathname.startsWith(`${root}/`))

// The booking flow — results, a trip, its seats, checkout — all counts as
// "Otobüs Bileti". It is the tab the visitor set out from, and with no item
// lit across four steps of a purchase the header stopped saying where they were.
const TICKETS: NavItem = {
  to: '/',
  labelKey: 'nav.tickets',
  Icon: Bus,
  isActive: (p) => p === '/' || under(p, '/otobus-bileti', '/sefer', '/koltuk', '/odeme'),
}
const LOOKUP: NavItem = {
  to: '/bilet-sorgula',
  labelKey: 'nav.ticketLookup',
  Icon: Ticket,
  isActive: (p) => under(p, '/bilet-sorgula', '/bilet'),
}
const CANCEL: NavItem = {
  to: '/bilet-iptal',
  labelKey: 'nav.ticketCancel',
  Icon: TicketX,
  isActive: (p) => under(p, '/bilet-iptal'),
}
const MY_TRIPS: NavItem = {
  to: '/hesabim/seferlerim',
  labelKey: 'nav.myTrips',
  Icon: RouteIcon,
  isActive: (p) => under(p, '/hesabim/seferlerim'),
}
const HELP: NavItem = {
  to: '/yardim',
  labelKey: 'nav.help',
  Icon: LifeBuoy,
  isActive: (p) => under(p, '/yardim', '/sss'),
}

const DESKTOP_NAV = [TICKETS, LOOKUP, HELP]
const SHEET_NAV = [TICKETS, LOOKUP, CANCEL, MY_TRIPS, HELP]

const NAV_BASE = [
  'relative inline-flex h-10 items-center rounded-lg px-3',
  'text-sm font-medium transition-colors duration-(--duration-fast)',
].join(' ')

const NAV_IDLE = 'text-fg-secondary hover:bg-hover hover:text-fg'

// The active state is carried by weight and an underline bar as well as
// colour, so it survives a monochrome or high-contrast rendering.
const NAV_ACTIVE = [
  'font-semibold text-fg',
  'after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand',
].join(' ')

const SHEET_ITEM = [
  'relative flex min-h-12 items-center gap-3 rounded-lg px-3',
  'text-base font-medium text-fg-secondary transition-colors duration-(--duration-fast)',
  'hover:bg-hover hover:text-fg',
].join(' ')

// A solid bar at the start plus weight and the brand text colour. The red
// wash this replaces was so faint it read as a smudge on the row rather than
// as "you are here", and on its own it was colour alone.
const SHEET_ITEM_ACTIVE = [
  'font-semibold text-brand-fg hover:text-brand-fg',
  'before:absolute before:inset-y-2.5 before:start-0 before:w-[3px] before:rounded-full before:bg-brand',
].join(' ')

/**
 * The icon buttons on the phone bar: three equal tiles, no words.
 *
 * The first version put "Bilet Sorgula" in a labelled box with a control-grade
 * edge next to an equally hard-edged menu box. Two outlined blocks of
 * different widths outweighed the wordmark they sat beside, and the bar read
 * as a toolbar rather than as a header. Equal tiles on a soft fill keep the
 * logo the loudest thing on the bar, which is how the cleaner Turkish travel
 * sites (gidiyorum.com among them) lay it out.
 *
 * The icon identifies each control, so the tile needs no 3:1 edge of its own —
 * a hairline and a light fill only say "this is pressable". The box is 40px
 * and tap-44 widens the hit area to the project's 44, and the 8px gap keeps
 * neighbouring hit areas from overlapping. The fill is the hover layer at
 * reduced strength, which rises off the chrome in dark mode where a sunken
 * fill read as a hole.
 */
const PHONE_CONTROL = [
  'tap-44 inline-flex size-10 shrink-0 items-center justify-center rounded-xl',
  'border border-border bg-hover/60 text-fg-secondary',
  'transition-colors duration-(--duration-fast) ease-standard',
  'hover:bg-hover hover:text-fg',
  'aria-[current=page]:text-brand-fg',
].join(' ')

/**
 * The locale trigger. A hairline, not a fill: a sunken fill read as a hole in
 * the dark chrome, and a hard control edge around a small chip sitting between
 * the theme toggle and the sign-in link made it the heaviest thing in the
 * header, which it is not.
 */
const LOCALE_CHIP = [
  'inline-flex h-9 items-center gap-2 rounded-full border border-border py-1 pr-3.5 pl-1.5',
  'text-xs font-semibold text-fg-secondary',
  'transition-colors duration-(--duration-fast) ease-standard',
  'hover:bg-hover hover:text-fg',
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
  const isHome = pathname === '/'

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
  const lookupActive = LOOKUP.isActive(pathname)

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
          'sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)]',
          'transition-[background-color,border-color,box-shadow] duration-(--duration-base) ease-standard',
          // One opaque surface, `chrome`, which the browser bar is painted
          // with too — never a 90% glass: content sliding under a translucent
          // header turned its text into a smear over whatever passed beneath.
          scrolled
            ? 'border-border bg-chrome shadow-sm'
            : isHome
              ? // Home, at rest. On a phone the hero continues the chrome under
                // the bar and its search sheet rises out of it on rounded
                // corners, so the curve separates the two and a line here would
                // only cut the band in half. From sm up the hero is pulled up
                // underneath, so the bar is transparent and the hero's ground
                // runs to the top of the window.
                'border-transparent bg-chrome sm:bg-transparent'
              : 'border-border bg-chrome',
        )}
      >
        {/* The gutter takes the larger of the page gutter and the safe-area
            inset, so in landscape on a notched phone the logo and the menu
            clear the cut-out instead of sliding under it. */}
        <div className="mx-auto flex h-16 w-full max-w-app items-center gap-2 pr-[max(var(--app-pad),env(safe-area-inset-right))] pl-[max(var(--app-pad),env(safe-area-inset-left))] lg:h-18">
          <Link to="/" className="flex shrink-0 items-center rounded-lg text-logo">
            <Logo className="h-7 sm:h-8" />
          </Link>

          <nav aria-label={t('nav.main')} className="ml-6 hidden items-center gap-1 lg:flex">
            {DESKTOP_NAV.map((item) => {
              const active = item.isActive(pathname)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(NAV_BASE, active ? NAV_ACTIVE : NAV_IDLE)}
                >
                  {t(item.labelKey)}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {isDesktop ? (
              <>
                <ThemeToggle />
                <LocaleDialog>
                  <button
                    type="button"
                    className={LOCALE_CHIP}
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
                {/* Secondary, not brand: the header is not a decision context,
                    and a red outline here outshouted the search button below. */}
                <Button asChild variant="secondary" size="sm">
                  <Link to="/kayit">{t('common.signUp')}</Link>
                </Button>
              </>
            ) : (
              <>
                {/* The one task people come back to the site for, one tap away
                    instead of behind the menu. */}
                <Link
                  to={LOOKUP.to}
                  aria-current={lookupActive ? 'page' : undefined}
                  aria-label={t(LOOKUP.labelKey)}
                  className={PHONE_CONTROL}
                >
                  <Ticket className="size-5" aria-hidden="true" />
                </Link>

                <Link
                  to="/giris"
                  aria-current={pathname === '/giris' ? 'page' : undefined}
                  aria-label={t('common.signIn')}
                  className={PHONE_CONTROL}
                >
                  <UserRound className="size-5" aria-hidden="true" />
                </Link>

                <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className={PHONE_CONTROL} aria-label={t('common.menu')}>
                      <Menu className="size-5" aria-hidden="true" />
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    side="bottom"
                    title={t('common.menu')}
                    description={t('nav.sheetDescription')}
                  >
                    {/* One scroll region for the whole body, not just the list:
                        on a short phone a list that scrolled on its own hid
                        its last link behind the settings with nothing to say
                        there was more. Now the page simply runs on. */}
                    <div className="min-h-0 overflow-y-auto overscroll-contain">
                      <nav aria-label={t('nav.mobile')} className="p-3">
                        <ul className="flex flex-col gap-0.5">
                          {SHEET_NAV.map((item) => {
                            const active = item.isActive(pathname)
                            return (
                              <li key={item.to}>
                                <Link
                                  to={item.to}
                                  onClick={closeMenu}
                                  aria-current={active ? 'page' : undefined}
                                  className={cn(SHEET_ITEM, active && SHEET_ITEM_ACTIVE)}
                                >
                                  <item.Icon className="size-5 shrink-0" aria-hidden="true" />
                                  {t(item.labelKey)}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </nav>

                      <div className="flex flex-col gap-4 border-t border-border p-4">
                        <ThemePreferenceControl />

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
                            'hover:bg-hover',
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
                          <Button asChild variant="secondary" size="md" full>
                            <Link to="/kayit" onClick={closeMenu}>
                              {t('common.signUp')}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </header>

      <LocaleDialog open={localeOpen} onOpenChange={setLocaleOpen} />
    </>
  )
}
