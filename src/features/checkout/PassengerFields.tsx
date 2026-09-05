import { Mail, User } from 'lucide-react'
import type { Gender, SeatPick } from '@/entities/seat/model'
import { isEmail } from '@/features/auth/validation'
import { GenderMark } from '@/features/seat-map/SeatGlyph'
import { cn } from '@/shared/lib/cn'
import { Checkbox } from '@/shared/ui/primitives'
import { Field } from '@/shared/ui/field'
import { PhoneField } from '@/shared/ui/phone-field'

/**
 * The passenger step of checkout.
 *
 * Only what a bus ticket actually needs: a name per seat, and one channel to
 * send the ticket to. No national id, no birth date, no card — a field that is
 * not collected is a field that cannot leak.
 */

export interface PassengerValues {
  firstName: string
  lastName: string
}

export interface ContactValues {
  /** WCAG 3.3.7: the contact person is usually the first passenger. */
  sameAsFirstPassenger: boolean
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface CheckoutValues {
  passengers: PassengerValues[]
  contact: ContactValues
}

/** Keyed by field name, so `#field-${key}` also addresses the input to focus. */
export type CheckoutErrors = Readonly<Record<string, string | undefined>>

export type PassengerPart = 'firstName' | 'lastName'
export type ContactPart = 'firstName' | 'lastName' | 'email' | 'phone'

export function passengerFieldKey(index: number, part: PassengerPart): string {
  return `passenger-${index + 1}-${part}`
}

export function contactFieldKey(part: ContactPart): string {
  return `contact-${part}`
}

export function emptyCheckoutValues(seatCount: number): CheckoutValues {
  return {
    passengers: Array.from({ length: seatCount }, () => ({ firstName: '', lastName: '' })),
    contact: {
      sameAsFirstPassenger: true,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  }
}

const EMPTY_PASSENGER: PassengerValues = { firstName: '', lastName: '' }

/** The contact person as the form finally means it, checkbox resolved. */
export function resolveContact(values: CheckoutValues): {
  firstName: string
  lastName: string
  email: string
  phone: string
} {
  const first = values.passengers[0] ?? EMPTY_PASSENGER
  const { contact } = values
  return {
    firstName: contact.sameAsFirstPassenger ? first.firstName : contact.firstName,
    lastName: contact.sameAsFirstPassenger ? first.lastName : contact.lastName,
    email: contact.email,
    phone: contact.phone,
  }
}

export interface ValidationResult {
  errors: CheckoutErrors
  /** The field to move focus to, or null when everything passes. */
  firstInvalidKey: string | null
}

/**
 * Validation lives next to the field keys rather than in the page, so a
 * renamed input cannot leave an error message pointing at nothing.
 */
export function validateCheckout(values: CheckoutValues, seatCount: number): ValidationResult {
  const errors: Record<string, string> = {}
  const order: string[] = []

  for (let index = 0; index < seatCount; index++) {
    const passenger = values.passengers[index] ?? EMPTY_PASSENGER
    const firstKey = passengerFieldKey(index, 'firstName')
    const lastKey = passengerFieldKey(index, 'lastName')
    order.push(firstKey, lastKey)

    if (passenger.firstName.trim().length < 2) errors[firstKey] = 'Yolcunun adını girin.'
    if (passenger.lastName.trim().length < 2) errors[lastKey] = 'Yolcunun soyadını girin.'
  }

  if (!values.contact.sameAsFirstPassenger) {
    const firstKey = contactFieldKey('firstName')
    const lastKey = contactFieldKey('lastName')
    order.push(firstKey, lastKey)
    if (values.contact.firstName.trim().length < 2) {
      errors[firstKey] = 'İletişim kişisinin adını girin.'
    }
    if (values.contact.lastName.trim().length < 2) {
      errors[lastKey] = 'İletişim kişisinin soyadını girin.'
    }
  }

  const emailKey = contactFieldKey('email')
  const phoneKey = contactFieldKey('phone')
  order.push(emailKey, phoneKey)

  if (!values.contact.email.trim()) errors[emailKey] = 'E-posta adresinizi girin.'
  else if (!isEmail(values.contact.email)) errors[emailKey] = 'Geçerli bir e-posta adresi girin.'

  if (!values.contact.phone) errors[phoneKey] = 'Numarayı ülke koduna uygun şekilde eksiksiz girin.'

  return { errors, firstInvalidKey: order.find((key) => errors[key]) ?? null }
}

const GENDER_LABEL: Record<Gender, string> = { M: 'Erkek', F: 'Kadın', S: 'Yolcu' }

export interface PassengerFieldsProps {
  picks: readonly SeatPick[]
  values: CheckoutValues
  /** `changedKeys` lets the page drop exactly the errors that were addressed. */
  onChange: (next: CheckoutValues, changedKeys: readonly string[]) => void
  errors: CheckoutErrors
  className?: string
}

export function PassengerFields({
  picks,
  values,
  onChange,
  errors,
  className,
}: PassengerFieldsProps) {
  // Normalised against `picks`, so a seat added or dropped upstream cannot
  // leave the form one row short of the order.
  const passengers = picks.map((_, index) => values.passengers[index] ?? EMPTY_PASSENGER)
  const contact = values.contact
  const resolved = resolveContact({ passengers, contact })
  const contactName = `${resolved.firstName} ${resolved.lastName}`.trim()

  const setPassenger = (index: number, part: PassengerPart, value: string) => {
    onChange(
      {
        contact,
        passengers: passengers.map((p, i) => (i === index ? { ...p, [part]: value } : p)),
      },
      [passengerFieldKey(index, part)],
    )
  }

  const setContact = (part: ContactPart, value: string) => {
    onChange({ passengers, contact: { ...contact, [part]: value } }, [contactFieldKey(part)])
  }

  const setSameAsFirst = (checked: boolean) => {
    onChange({ passengers, contact: { ...contact, sameAsFirstPassenger: checked } }, [
      contactFieldKey('firstName'),
      contactFieldKey('lastName'),
    ])
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {picks.map((pick, index) => {
        const passenger = passengers[index] ?? EMPTY_PASSENGER
        const genderText =
          pick.gender === 'S' ? 'Cinsiyet ayrımı yok' : `${GENDER_LABEL[pick.gender]} yolcu`

        return (
          <fieldset
            key={pick.key}
            className="rounded-xl border border-border bg-surface-raised p-4 shadow-sm sm:p-5"
          >
            <legend className="flex flex-wrap items-center gap-1.5 px-1.5 font-display text-sm font-semibold text-fg">
              <span data-numeric>{index + 1}. yolcu</span>
              <span className="text-fg-subtle" aria-hidden="true">
                ·
              </span>
              <span data-numeric>{pick.label}. koltuk</span>
              <span className="text-fg-subtle" aria-hidden="true">
                ·
              </span>
              <span className="flex items-center gap-1 font-sans font-medium text-fg-secondary">
                {pick.gender === 'S' ? null : <GenderMark gender={pick.gender} />}
                {genderText}
              </span>
            </legend>

            <div className="mt-3 grid gap-x-4 xs:grid-cols-2">
              <Field
                label="Ad"
                name={passengerFieldKey(index, 'firstName')}
                value={passenger.firstName}
                onChange={(event) => {
                  setPassenger(index, 'firstName', event.target.value)
                }}
                error={errors[passengerFieldKey(index, 'firstName')]}
                placeholder="Ayşe"
                autoComplete={`section-yolcu-${index + 1} given-name`}
                autoCapitalize="words"
                {...(index === 0 && { hint: 'Kimliğinizde yazdığı gibi girin.' })}
              />
              <Field
                label="Soyad"
                name={passengerFieldKey(index, 'lastName')}
                value={passenger.lastName}
                onChange={(event) => {
                  setPassenger(index, 'lastName', event.target.value)
                }}
                error={errors[passengerFieldKey(index, 'lastName')]}
                placeholder="Yılmaz"
                autoComplete={`section-yolcu-${index + 1} family-name`}
                autoCapitalize="words"
              />
            </div>
          </fieldset>
        )
      })}

      <fieldset className="rounded-xl border border-border bg-surface-raised p-4 shadow-sm sm:p-5">
        <legend className="px-1.5 font-display text-sm font-semibold text-fg">
          İletişim bilgileri
        </legend>

        <p className="mt-3 text-sm text-fg-secondary">
          Biletiniz bu e-posta adresine gönderilir; kalkış saatiyle ilgili bir değişiklik olursa bu
          numaradan bilgilendirilirsiniz.
        </p>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-fg-secondary">
          <Checkbox
            checked={contact.sameAsFirstPassenger}
            onCheckedChange={(checked) => {
              setSameAsFirst(checked === true)
            }}
            className="mt-0.5"
          />
          <span>İletişim bilgileri 1. yolcu ile aynı</span>
        </label>

        {contact.sameAsFirstPassenger ? (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-surface-sunken px-3 py-2.5 text-sm text-fg-secondary">
            <User className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
            {contactName ? (
              <span>
                İletişim kişisi: <strong className="font-semibold text-fg">{contactName}</strong>
              </span>
            ) : (
              <span className="text-fg-muted">
                1. yolcunun adını girdiğinizde iletişim kişisi burada görünür.
              </span>
            )}
          </p>
        ) : (
          <div className="mt-3 grid gap-x-4 xs:grid-cols-2">
            <Field
              label="İletişim kişisinin adı"
              name={contactFieldKey('firstName')}
              value={contact.firstName}
              onChange={(event) => {
                setContact('firstName', event.target.value)
              }}
              error={errors[contactFieldKey('firstName')]}
              placeholder="Ayşe"
              autoComplete="section-iletisim given-name"
              autoCapitalize="words"
            />
            <Field
              label="İletişim kişisinin soyadı"
              name={contactFieldKey('lastName')}
              value={contact.lastName}
              onChange={(event) => {
                setContact('lastName', event.target.value)
              }}
              error={errors[contactFieldKey('lastName')]}
              placeholder="Yılmaz"
              autoComplete="section-iletisim family-name"
              autoCapitalize="words"
            />
          </div>
        )}

        <div className="mt-3 grid gap-x-4 xs:grid-cols-2">
          <Field
            label="E-posta"
            name={contactFieldKey('email')}
            type="email"
            inputMode="email"
            value={contact.email}
            onChange={(event) => {
              setContact('email', event.target.value)
            }}
            error={errors[contactFieldKey('email')]}
            hint="Biletiniz bu adrese gönderilir."
            placeholder="ornek@eposta.com"
            icon={<Mail className="size-4" aria-hidden="true" />}
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <PhoneField
            label="Cep telefonu"
            name={contactFieldKey('phone')}
            value={contact.phone}
            onChange={(phone) => {
              setContact('phone', phone)
            }}
            error={errors[contactFieldKey('phone')]}
            hint="Yolculuk hatırlatmaları bu numaraya gider."
          />
        </div>
      </fieldset>
    </div>
  )
}
