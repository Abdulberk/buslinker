import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { IMAGE, VALUE_ICON } from '@/shared/config/assets'
import { Illustration } from '@/shared/ui/asset-icon'
import { Logo } from '@/shared/ui/logo'

/**
 * The shell both auth screens share.
 *
 * A split layout, with the form on the left and a brand panel on the right
 * that only appears from `lg`. The panel is the one place a full brand fill is
 * appropriate — it is decoration, not a decision — so the page's single
 * *actionable* brand fill is still the submit button.
 */
export interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  /** The "already have an account?" line under the form. */
  footer: ReactNode
}

const PANEL_POINTS = [
  { art: VALUE_ICON.cancelAnytime, text: 'Biletinizi tek tıkla iptal edin, ücret ödemeyin.' },
  { art: VALUE_ICON.securePayment, text: '3D Secure ile korunan güvenli ödeme.' },
  { art: VALUE_ICON.comfortableTravel, text: 'Koltuğunuzu otobüsün planı üzerinden seçin.' },
]

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="app-container py-10 sm:py-14 lg:py-20">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-flex rounded-lg text-brand-fg lg:hidden">
            <Logo className="h-7" />
          </Link>

          <h1 className="mt-6 text-2xl text-balance-tr sm:text-3xl lg:mt-0">{title}</h1>
          <p className="mt-2 text-base text-fg-secondary">{subtitle}</p>

          <div className="mt-7">{children}</div>

          <p className="mt-6 text-center text-sm text-fg-secondary">{footer}</p>
        </div>

        <aside
          aria-hidden="true"
          className="relative hidden overflow-hidden rounded-3xl border border-border p-10 lg:block"
          style={{
            background:
              'linear-gradient(155deg, color-mix(in oklab, var(--color-brand) 12%, var(--color-surface)) 0%, color-mix(in oklab, var(--color-info) 8%, var(--color-surface)) 100%)',
          }}
        >
          <p className="font-display text-xl font-bold text-balance-tr text-fg">
            Türkiye'nin dört bir yanına tek hesapla
          </p>

          <Illustration
            src={IMAGE.coach.src}
            alt=""
            width={IMAGE.coach.width}
            height={IMAGE.coach.height}
            className="mt-6 h-auto w-full drop-shadow-[0_20px_28px_oklch(0.32_0.05_248/0.22)]"
          />

          <ul className="mt-8 flex flex-col gap-4">
            {PANEL_POINTS.map((point) => (
              <li key={point.text} className="flex items-center gap-3">
                <Illustration src={point.art} alt="" width={80} height={80} className="size-9" />
                <span className="text-sm text-fg-secondary">{point.text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}

/**
 * The shared "this is a demo" notice.
 *
 * Neither screen posts anywhere. Saying so plainly is better than a form that
 * looks like it stores credentials and silently does not.
 */
export function AuthDemoNotice() {
  return (
    <p className="mt-4 rounded-lg border border-info/25 bg-info-tint px-3 py-2.5 text-xs text-info-fg">
      Bu bir tanıtım arayüzüdür. Girdiğiniz bilgiler hiçbir yere gönderilmez ve saklanmaz.
    </p>
  )
}
