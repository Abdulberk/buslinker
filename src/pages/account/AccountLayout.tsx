import { LayoutDashboard, LogOut, TicketCheck, UserRound, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'

/**
 * The signed-in demo account.
 *
 * There is no session and no backend, so the "user" is a constant every screen
 * in this area reads from. Keeping it here rather than in each page is what
 * stops the name on the greeting card from drifting from the name in the
 * profile form.
 */
export const DEMO_USER = {
  fullName: 'Ayşe Yılmaz',
  initials: 'AY',
  email: 'ayse.yilmaz@eposta.com',
  phone: '0532 000 00 00',
  birthDate: '1990-06-14',
} as const

interface AccountNavItem {
  to: string
  label: string
  Icon: typeof LayoutDashboard
  /** Only the index route matches exactly; otherwise it stays active everywhere. */
  end: boolean
}

const NAV_ITEMS: readonly AccountNavItem[] = [
  { to: '/hesabim', label: 'Genel Bakış', Icon: LayoutDashboard, end: true },
  {
    to: '/hesabim/seferlerim',
    label: 'Seferlerim',
    Icon: TicketCheck,
    end: false,
  },
  {
    to: '/hesabim/bilgilerim',
    label: 'Bilgilerim',
    Icon: UserRound,
    end: false,
  },
  {
    to: '/hesabim/kayitli-yolcular',
    label: 'Kayıtlı Yolcular',
    Icon: Users,
    end: false,
  },
]

function signOut() {
  toast.info('Çıkış yapma bu tanıtım sürümünde etkin değil.', {
    description: 'Tanıtım hesabı açık kalır.',
  })
}

/**
 * The account shell: the h1 and the navigation, with the page in the outlet.
 *
 * Child pages therefore start their own headings at h2 — the layout owns the
 * only h1 on every screen under `/hesabim`.
 */
export function AccountLayout() {
  return (
    <>
      <PageHeader
        title="Hesabım"
        lead="Biletlerinizi, iletişim bilgilerinizi ve sık seyahat eden yolcularınızı tek yerden yönetebilirsiniz."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            {/* Below lg the sidebar would eat the fold, so the same links become
                a scrollable tab strip with the sign-out action kept beside it. */}
            <div className="flex items-center gap-2 lg:hidden">
              <nav
                aria-label="Hesap menüsü"
                className="-mx-4 scrollbar-none min-w-0 flex-1 overflow-x-auto px-4"
              >
                <ul className="flex w-max items-center gap-2">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          cn(
                            'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm',
                            'transition-colors duration-(--duration-fast) ease-standard',
                            isActive
                              ? 'border-brand/40 bg-brand/8 font-semibold text-brand-fg'
                              : 'border-border text-fg-secondary hover:bg-surface-sunken hover:text-fg',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <item.Icon className="size-4" aria-hidden="true" />
                            {item.label}
                            {/* The active tab must not be signalled by colour
                                alone; the dot rides along with the weight. */}
                            {isActive ? (
                              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
                            ) : null}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <Button variant="ghost" size="sm" onClick={signOut} className="shrink-0">
                <LogOut className="size-4" aria-hidden="true" />
                <span className="sr-only xs:not-sr-only">Çıkış Yap</span>
              </Button>
            </div>

            <Card className="hidden lg:block">
              <nav aria-label="Hesap menüsü" className="p-2">
                <ul className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          cn(
                            'relative flex min-h-11 items-center gap-3 rounded-lg py-2.5 pr-3 pl-4 text-sm',
                            'transition-colors duration-(--duration-fast) ease-standard',
                            isActive
                              ? 'bg-brand/8 font-semibold text-brand-fg'
                              : 'text-fg-secondary hover:bg-surface-sunken hover:text-fg',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive ? (
                              <span
                                aria-hidden="true"
                                className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand"
                              />
                            ) : null}
                            <item.Icon className="size-4 shrink-0" aria-hidden="true" />
                            {item.label}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-border p-2">
                <Button variant="ghost" full onClick={signOut} className="justify-start gap-3 px-4">
                  <LogOut className="size-4" aria-hidden="true" />
                  Çıkış Yap
                </Button>
              </div>
            </Card>

            <p className="rounded-lg border border-info/25 bg-info-tint px-3 py-2.5 text-xs text-info-fg">
              Bu bir tanıtım hesabıdır. {DEMO_USER.fullName} adına oluşturulmuş örnek veriler
              gösterilir; hiçbir bilgi kaydedilmez veya gönderilmez.
            </p>
          </div>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}
