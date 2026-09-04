import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Globe, LifeBuoy, Route as RouteIcon } from 'lucide-react'
import { ICON } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { useIsDesktop } from '@/shared/lib/use-media-query'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { Badge } from '@/shared/ui/badge'
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

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

          <nav aria-label="Ana menü" className="ml-6 hidden items-center gap-1 lg:flex">
            <NavLink to="/" end className={navClass}>
              Otobüs Bileti
            </NavLink>
            <NavLink to="/hesabim/seferlerim" className={navClass}>
              Seferlerim
            </NavLink>
            <NavLink to="/sss" className={navClass}>
              Yardım
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {isDesktop ? (
              <>
                <ThemeToggle />
                <Badge tone="outline" size="md" className="hidden xl:inline-flex">
                  <Globe aria-hidden="true" />
                  <span className="sr-only">Para birimi ve dil:</span>
                  TRY · TR
                </Badge>
                <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />
                <Button asChild variant="ghost" size="sm">
                  <Link to="/giris">Giriş Yap</Link>
                </Button>
                <Button asChild variant="brand-outline" size="sm">
                  <Link to="/kayit">Üye Ol</Link>
                </Button>
              </>
            ) : (
              <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="tap-44" aria-label="Menü">
                    <AssetIcon src={ICON.hamburger} className="size-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent side="bottom" title="Menü" description="Sayfalar ve hesap işlemleri">
                  <nav aria-label="Mobil menü" className="overflow-y-auto p-3">
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
                          Otobüs Bileti
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
                          Seferlerim
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
                          Yardım
                        </NavLink>
                      </li>
                    </ul>
                  </nav>

                  <div className="mt-1 flex flex-col gap-3 border-t border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-fg-secondary">Görünüm</span>
                      <ThemeToggle />
                    </div>
                    <div className="flex gap-3">
                      <Button asChild variant="secondary" size="md" full>
                        <Link to="/giris" onClick={closeMenu}>
                          Giriş Yap
                        </Link>
                      </Button>
                      <Button asChild variant="brand-outline" size="md" full>
                        <Link to="/kayit" onClick={closeMenu}>
                          Üye Ol
                        </Link>
                      </Button>
                    </div>
                    <p className="text-xs text-fg-muted">Para birimi ve dil: TRY · TR</p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
