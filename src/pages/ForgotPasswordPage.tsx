import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { MailCheck, RotateCw } from 'lucide-react'
import { AuthDemoNotice, AuthLayout } from '@/features/auth/AuthLayout'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { isEmail } from '@/features/auth/validation'
import { pluralTr } from '@/shared/lib/tr'

/** How long the resend button stays locked, in seconds. */
const RESEND_SECONDS = 30

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    document.title = 'Parolamı Unuttum | BusLinker'
  }, [])

  // Depending on the boolean rather than on `seconds` means one interval is
  // created when the countdown starts and cleared when it reaches zero,
  // instead of a new one being spun up on every tick.
  const counting = seconds > 0
  useEffect(() => {
    if (!counting) return
    const id = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [counting])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const value = email.trim()
    if (!value) {
      setError('E-posta adresinizi girin.')
      document.querySelector<HTMLInputElement>('#field-email')?.focus()
      return
    }
    if (!isEmail(value)) {
      setError('Geçerli bir e-posta adresi girin.')
      document.querySelector<HTMLInputElement>('#field-email')?.focus()
      return
    }

    setError(undefined)
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setSentTo(value)
      setSeconds(RESEND_SECONDS)
    }, 600)
  }

  const handleResend = () => {
    setSeconds(RESEND_SECONDS)
    toast.info('Bağlantıyı yeniden gönderme bu tanıtım sürümünde etkin değil.', {
      description: 'Hiçbir e-posta gönderilmez.',
    })
  }

  return (
    <AuthLayout
      title={sentTo ? 'Bağlantıyı gönderdik' : 'Parolanızı mı unuttunuz?'}
      subtitle={
        sentTo
          ? 'E-posta kutunuzu kontrol edin. Bağlantı 60 dakika boyunca geçerlidir.'
          : 'Hesabınızın e-posta adresini girin, parolanızı yenilemeniz için bir bağlantı gönderelim.'
      }
      footer={
        <>
          Parolanızı hatırladınız mı?{' '}
          <Link
            to="/giris"
            className="font-semibold text-brand-fg underline-offset-4 hover:underline"
          >
            Giriş yapın
          </Link>
        </>
      }
    >
      {sentTo ? (
        <div>
          <div className="rounded-xl border border-border bg-surface-raised p-5 shadow-sm">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full bg-success-tint text-success-fg"
            >
              <MailCheck className="size-6" />
            </span>

            {/* The copy must not confirm or deny that the address has an
                account: doing so turns this form into an account-enumeration
                oracle for anyone with a list of e-mail addresses. */}
            <p role="status" className="mt-4 text-base text-fg-secondary">
              Bu adres kayıtlıysa bir bağlantı gönderdik:{' '}
              <strong className="font-semibold break-all text-fg">{sentTo}</strong>
            </p>

            <p className="mt-2 text-sm text-fg-muted">
              Bağlantı yalnızca bir kez kullanılabilir. Gelen kutunuzda göremezseniz spam klasörünü
              de kontrol edin.
            </p>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-sm font-medium text-fg">E-postayı almadınız mı?</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResend}
                  disabled={counting}
                  aria-describedby={counting ? 'resend-countdown' : undefined}
                >
                  <RotateCw className="size-4" aria-hidden="true" />
                  Yeniden Gönder
                </Button>
                {/* Deliberately not a live region: a counter that re-announces
                    itself every second would talk over everything else on the
                    screen. It is wired to the button instead, so it is read
                    when the disabled control is reached. */}
                {counting ? (
                  <p id="resend-countdown" className="text-sm text-fg-muted">
                    <span data-numeric>{pluralTr(seconds, 'saniye')}</span> sonra yeniden
                    gönderebilirsiniz.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <Button asChild size="lg" full className="mt-6">
            <Link to="/giris">Giriş Sayfasına Dönün</Link>
          </Button>

          <AuthDemoNotice />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Field
            label="E-posta"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ornek@eposta.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              // Clearing on edit rather than on blur: an error that persists
              // while the user is fixing it reads as if the fix was rejected.
              setError(undefined)
            }}
            error={error}
            hint="Hesabınızı oluştururken kullandığınız adresi girin."
          />

          <Button type="submit" size="lg" full loading={submitting} className="mt-4">
            Sıfırlama Bağlantısı Gönder
          </Button>

          <AuthDemoNotice />
        </form>
      )}
    </AuthLayout>
  )
}
