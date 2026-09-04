import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { BellOff, Mail, MessageSquare, Moon, Smartphone } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/primitives'
import { cn } from '@/shared/lib/cn'
import { formatTime, pluralTr } from '@/shared/lib/tr'

type PrefId =
  | 'emailReminders'
  | 'emailReceipts'
  | 'emailCampaigns'
  | 'emailNewsletter'
  | 'smsDeparture'
  | 'smsChanges'
  | 'smsCancellation'
  | 'pushPrice'
  | 'pushBoarding'
  | 'pushAccount'

interface Preference {
  readonly id: PrefId
  readonly label: string
  readonly hint: string
}

interface Group {
  readonly id: 'email' | 'sms' | 'push'
  readonly title: string
  readonly description: string
  readonly Icon: typeof Mail
  readonly items: readonly Preference[]
}

const GROUPS: readonly Group[] = [
  {
    id: 'email',
    title: 'E-posta',
    description: 'Biletlerinize ve kampanyalara dair iletileri e-posta ile alın.',
    Icon: Mail,
    items: [
      {
        id: 'emailReminders',
        label: 'Sefer hatırlatmaları',
        hint: 'Kalkıştan bir gün önce peron ve saat bilgisini gönderelim.',
      },
      {
        id: 'emailReceipts',
        label: 'Bilet ve iade belgeleri',
        hint: 'Satın alma ve iptal sonrası belgeleriniz e-postanıza gelsin.',
      },
      {
        id: 'emailCampaigns',
        label: 'Kampanya duyuruları',
        hint: 'İndirimli seferler ve sezon fırsatlarından haberdar olun.',
      },
      {
        id: 'emailNewsletter',
        label: 'Aylık seyahat bülteni',
        hint: 'Popüler güzergâhlar ve yolculuk önerileri ayda bir kez gönderilir.',
      },
    ],
  },
  {
    id: 'sms',
    title: 'SMS',
    description: 'Yalnızca yolculuğunuzu doğrudan ilgilendiren kısa bildirimler.',
    Icon: MessageSquare,
    items: [
      {
        id: 'smsDeparture',
        label: 'Kalkış hatırlatması',
        hint: 'Kalkıştan iki saat önce tek bir hatırlatma mesajı gönderilir.',
      },
      {
        id: 'smsChanges',
        label: 'Peron ve saat değişiklikleri',
        hint: 'Seferinizde bir değişiklik olursa anında haber verelim.',
      },
      {
        id: 'smsCancellation',
        label: 'İptal ve iade bilgilendirmesi',
        hint: 'İptal talebiniz sonuçlandığında mesaj alın.',
      },
    ],
  },
  {
    id: 'push',
    title: 'Uygulama bildirimleri',
    description: 'Mobil uygulamada ekranınıza düşen anlık bildirimler.',
    Icon: Smartphone,
    items: [
      {
        id: 'pushPrice',
        label: 'Takip ettiğiniz güzergâhlarda fiyat düşüşü',
        hint: 'Kaydettiğiniz bir güzergâhta fiyat gerilediğinde bildirim alın.',
      },
      {
        id: 'pushBoarding',
        label: 'Biniş zamanı bildirimi',
        hint: 'Otobüsünüz perona yanaştığında hatırlatalım.',
      },
      {
        id: 'pushAccount',
        label: 'Hesap hareketleri',
        hint: 'Yeni cihazdan giriş ve parola değişikliği bildirimleri.',
      },
    ],
  },
]

const DEFAULT_PREFS: Record<PrefId, boolean> = {
  emailReminders: true,
  emailReceipts: true,
  emailCampaigns: true,
  emailNewsletter: false,
  smsDeparture: true,
  smsChanges: true,
  smsCancellation: false,
  pushPrice: true,
  pushBoarding: false,
  pushAccount: true,
}

const ALL_IDS = GROUPS.flatMap((group) => group.items.map((item) => item.id))

/**
 * The hour options for the quiet-hours pickers.
 *
 * Formatted through `formatTime` so the labels read exactly like every other
 * clock time on the site. That formatter renders in Europe/Istanbul (UTC+03,
 * no DST since 2016), so the instant is built three hours behind the hour it
 * should display — otherwise the labels would shift with the visitor's own
 * time zone.
 */
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour).padStart(2, '0'),
  label: formatTime(new Date(Date.UTC(2026, 0, 15, hour - 3))),
}))

export default function NotificationsPage() {
  useEffect(() => {
    document.title = 'Bildirimler | BusLinker'
  }, [])

  const [prefs, setPrefs] = useState<Record<PrefId, boolean>>(DEFAULT_PREFS)
  const [quietEnabled, setQuietEnabled] = useState(false)
  const [quietFrom, setQuietFrom] = useState('23')
  const [quietTo, setQuietTo] = useState('08')

  const activeCount = ALL_IDS.filter((id) => prefs[id]).length

  const toggle = (id: PrefId, checked: boolean) => {
    setPrefs((current) => ({ ...current, [id]: checked }))
  }

  const muteGroup = (group: Group) => {
    setPrefs((current) => {
      const next = { ...current }
      for (const item of group.items) next[item.id] = false
      return next
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.info('Bildirim tercihlerini kaydetme bu tanıtım sürümünde etkin değil.', {
      description: 'Seçimleriniz hiçbir yere gönderilmez veya saklanmaz.',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-bold text-fg">Bildirimler</h2>
        <p className="text-sm text-fg-secondary">
          Hangi konularda, hangi kanaldan haber almak istediğinizi seçin. Bilet ve iade belgeleri
          dışındaki tüm bildirimleri istediğiniz zaman kapatabilirsiniz.
        </p>
        <p role="status" className="text-sm text-fg-muted">
          <span data-numeric>{pluralTr(ALL_IDS.length, 'bildirim türünden')}</span>{' '}
          <span data-numeric>{pluralTr(activeCount, 'tanesi')}</span> açık.
        </p>
      </div>

      {GROUPS.map((group) => {
        const groupActive = group.items.filter((item) => prefs[item.id]).length

        return (
          <Card key={group.id}>
            <CardBody>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 font-display text-base font-bold text-fg">
                    <group.Icon className="size-4 text-fg-muted" aria-hidden="true" />
                    {group.title}
                  </h3>
                  <p className="mt-1 text-sm text-fg-secondary">{group.description}</p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => muteGroup(group)}
                  disabled={groupActive === 0}
                  aria-label={`${group.title} bildirimlerinin tümünü kapatın`}
                >
                  <BellOff className="size-4" aria-hidden="true" />
                  Tümünü Kapat
                </Button>
              </div>

              <ul className="mt-4 flex flex-col gap-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <label className="-mx-2 flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 transition-colors duration-(--duration-fast) hover:bg-surface-sunken">
                      <Checkbox
                        className="mt-0.5"
                        checked={prefs[item.id]}
                        onCheckedChange={(checked) => toggle(item.id, checked === true)}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-fg">{item.label}</span>
                        <span className="block text-xs text-fg-muted">{item.hint}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )
      })}

      <Card>
        <CardBody>
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-fg">
            <Moon className="size-4 text-fg-muted" aria-hidden="true" />
            Sessiz saatler
          </h3>
          <p className="mt-1 text-sm text-fg-secondary">
            Belirlediğiniz aralıkta hiçbir SMS veya uygulama bildirimi gönderilmez; birikenler
            ertesi sabah iletilir.
          </p>

          <label className="-mx-2 mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 transition-colors duration-(--duration-fast) hover:bg-surface-sunken">
            <Checkbox
              className="mt-0.5"
              checked={quietEnabled}
              onCheckedChange={(checked) => setQuietEnabled(checked === true)}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-fg">Sessiz saatleri kullanın</span>
              <span className="block text-xs text-fg-muted">
                Kapalıyken bildirimler günün her saatinde iletilir.
              </span>
            </span>
          </label>

          {/* The rule lives on the wrapper, not the fieldset: a browser cuts a
              notch out of a fieldset border wherever the legend sits. */}
          <div className="mt-4 border-t border-border pt-4">
            <fieldset>
              <legend
                className={cn(
                  'text-sm font-medium',
                  quietEnabled ? 'text-fg-secondary' : 'text-fg-subtle',
                )}
              >
                Bildirim almak istemediğiniz saatler
              </legend>

              <div className="mt-2 grid gap-3 xs:grid-cols-2 sm:max-w-sm">
                <HourSelect
                  label="Başlangıç"
                  name="quietFrom"
                  value={quietFrom}
                  onChange={setQuietFrom}
                  disabled={!quietEnabled}
                />
                <HourSelect
                  label="Bitiş"
                  name="quietTo"
                  value={quietTo}
                  onChange={setQuietTo}
                  disabled={!quietEnabled}
                />
              </div>

              <p className="mt-2 text-xs text-fg-muted">
                {quietEnabled
                  ? 'Aralık gece yarısını geçebilir; akşamdan ertesi sabaha uzanan bir seçim geçerlidir.'
                  : 'Saatleri değiştirmek için önce sessiz saatleri açın.'}
              </p>
            </fieldset>
          </div>
        </CardBody>
      </Card>

      <Button type="submit" size="lg" className="self-start">
        Tercihleri Kaydet
      </Button>
    </form>
  )
}

interface HourSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

function HourSelect({ label, name, value, onChange, disabled }: HourSelectProps) {
  const id = `field-${name}`

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={cn('text-xs font-medium', disabled ? 'text-fg-subtle' : 'text-fg-secondary')}
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        // Both attributes say the same thing on purpose: the control really is
        // inert, so nothing here promises an interaction it will not honour.
        aria-disabled={disabled}
        className={cn(
          'h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 text-base text-fg',
          'transition-colors duration-(--duration-fast) ease-standard',
          'focus-within:border-brand hover:border-border-strong',
          disabled && 'cursor-not-allowed border-border bg-surface-sunken text-fg-subtle',
        )}
      >
        {HOUR_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
