import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { BellRing, CalendarDays, Mail, Phone, UserRound } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'
import { Checkbox } from '@/shared/ui/primitives'
import { DEMO_USER } from './AccountLayout'

interface Preference {
  id: 'campaigns' | 'reminders' | 'sms'
  label: string
  hint: string
}

const PREFERENCES: readonly Preference[] = [
  {
    id: 'campaigns',
    label: 'Kampanya e-postaları',
    hint: 'İndirimli seferler ve sezon fırsatları hakkında e-posta alın.',
  },
  {
    id: 'reminders',
    label: 'Sefer hatırlatmaları',
    hint: 'Kalkıştan bir gün önce hatırlatma gönderilsin.',
  },
  {
    id: 'sms',
    label: 'SMS bildirimleri',
    hint: 'Peron ve saat değişikliklerini SMS ile öğrenin.',
  },
]

export default function ProfilePage() {
  useEffect(() => {
    document.title = 'Bilgilerim | BusLinker'
  }, [])

  // Annotated because `DEMO_USER` is `as const`: without it the state would
  // infer the seed strings as literal types and reject every edit.
  const [values, setValues] = useState<
    Record<'fullName' | 'email' | 'phone' | 'birthDate', string>
  >({
    fullName: DEMO_USER.fullName,
    email: DEMO_USER.email,
    phone: DEMO_USER.phone,
    birthDate: DEMO_USER.birthDate,
  })

  const [prefs, setPrefs] = useState<Record<Preference['id'], boolean>>({
    campaigns: true,
    reminders: true,
    sms: false,
  })

  const set = (key: keyof typeof values) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.info('Bilgileri kaydetme bu tanıtım sürümünde etkin değil.', {
      description: 'Girdiğiniz hiçbir bilgi gönderilmez veya saklanmaz.',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-bold text-fg">Bilgilerim</h2>

      <Card>
        <CardBody>
          <h3 className="font-display text-base font-bold text-fg">Kişisel bilgiler</h3>
          <p className="mt-1 text-sm text-fg-secondary">
            Bilet üzerinde görünen ad ve iletişim bilgilerinizdir. Tanıtım hesabında yaptığınız
            değişiklikler kaydedilmez.
          </p>

          <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
            <Field
              label="Ad Soyad"
              name="fullName"
              autoComplete="name"
              placeholder="Ad Soyad"
              icon={<UserRound className="size-4" aria-hidden="true" />}
              value={values.fullName}
              onChange={set('fullName')}
            />
            <Field
              label="E-posta"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ornek@eposta.com"
              icon={<Mail className="size-4" aria-hidden="true" />}
              value={values.email}
              onChange={set('email')}
            />
            <Field
              label="Cep Telefonu"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0500 000 00 00"
              icon={<Phone className="size-4" aria-hidden="true" />}
              value={values.phone}
              onChange={set('phone')}
            />
            <Field
              label="Doğum Tarihi"
              name="birthDate"
              type="date"
              autoComplete="bday"
              hint="Yaşa bağlı indirimler için kullanılır."
              icon={<CalendarDays className="size-4" aria-hidden="true" />}
              value={values.birthDate}
              onChange={set('birthDate')}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-fg">
            <BellRing className="size-4 text-fg-muted" aria-hidden="true" />
            Bildirim tercihleri
          </h3>
          <p className="mt-1 text-sm text-fg-secondary">
            Hangi konularda haber almak istediğinizi seçin.
          </p>

          <ul className="mt-4 flex flex-col gap-1">
            {PREFERENCES.map((preference) => (
              <li key={preference.id}>
                <label className="-mx-2 flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 transition-colors duration-(--duration-fast) hover:bg-surface-sunken">
                  <Checkbox
                    className="mt-0.5"
                    checked={prefs[preference.id]}
                    onCheckedChange={(checked) =>
                      setPrefs((current) => ({
                        ...current,
                        [preference.id]: checked === true,
                      }))
                    }
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-fg">{preference.label}</span>
                    <span className="block text-xs text-fg-muted">{preference.hint}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Button type="submit" size="lg" className="self-start">
        Değişiklikleri Kaydet
      </Button>
    </form>
  )
}
