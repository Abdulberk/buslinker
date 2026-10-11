import {
  acceptsGender,
  HARD_MAX_SEATS,
  isGenderLocked,
  isSold,
  type Gender,
  type Seat,
  type SeatPick,
  type SeatPolicy,
} from './model'

/**
 * Cart rules — the business logic of putting a seat in a booking.
 *
 * There is a deliberate split here, and it is the fix for the old code's
 * central bug:
 *
 *   SEAT-level sellability is server state. `seat.availableFor` already
 *   encodes the gender rule; the client never walks a seat's neighbours.
 *
 *   CART-level rules are these functions. How many seats, whether one booking
 *   may mix genders, what the total costs.
 *
 * The old `handleClick` mixed the two: it read the neighbour's `reserved` flag
 * only when the neighbour was already sold, never reset the restriction
 * between clicks (so a stale rule leaked onto the next seat), and capped at
 * `length > 4`, which let a fifth seat through.
 */

export type CartError =
  | { readonly code: 'SOLD'; readonly message: string }
  | { readonly code: 'GENDER_BLOCKED'; readonly message: string; readonly allowed: 'M' | 'F' }
  | { readonly code: 'UNAVAILABLE'; readonly message: string }
  | { readonly code: 'MAX_SEATS'; readonly message: string; readonly max: number }
  | { readonly code: 'MIXED_GENDERS'; readonly message: string }
  | { readonly code: 'ALREADY_PICKED'; readonly message: string }

export type Result<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: CartError }

const ok = <T>(value: T): Result<T> => ({ ok: true, value })
const err = (error: CartError): Result<never> => ({ ok: false, error })

/** The effective cap: a carrier may tighten the industry ceiling, never loosen it. */
export function maxSeatsFor(policy: SeatPolicy): number {
  return Math.min(policy.maxSeats, HARD_MAX_SEATS)
}

/**
 * Can this seat be added to the draft as `gender`?
 *
 * Pure: same inputs, same answer, no store access. Every branch is a test.
 */
export function canAddToCart(
  picks: readonly SeatPick[],
  seat: Seat,
  gender: Gender,
  policy: SeatPolicy,
): Result<SeatPick> {
  if (picks.some((p) => p.key === seat.key)) {
    return err({ code: 'ALREADY_PICKED', message: 'Bu koltuk zaten seçili.' })
  }

  if (isSold(seat)) {
    return err({
      code: 'SOLD',
      message: `${seat.label} numaralı koltuk dolu. Lütfen boş bir koltuk seçin.`,
    })
  }

  if (seat.availableFor === 'NO') {
    return err({
      code: 'UNAVAILABLE',
      message: `${seat.label} numaralı koltuk satışa kapalı.`,
    })
  }

  const max = maxSeatsFor(policy)
  if (picks.length >= max) {
    return err({
      code: 'MAX_SEATS',
      message: `En fazla ${max} koltuk seçebilirsiniz.`,
      max,
    })
  }

  if (policy.hasGenderSelection && !acceptsGender(seat, gender)) {
    const allowed = seat.availableFor === 'M' ? 'M' : 'F'
    return err({
      code: 'GENDER_BLOCKED',
      message:
        allowed === 'M'
          ? `${seat.label} numaralı koltuk, yanındaki yolcu erkek olduğu için yalnızca erkek yolculara satılabilir.`
          : `${seat.label} numaralı koltuk, yanındaki yolcu kadın olduğu için yalnızca kadın yolculara satılabilir.`,
      allowed,
    })
  }

  if (policy.hasGenderSelection && !policy.mixedGenders && picks.length > 0) {
    const existing = picks.find((p) => p.gender !== 'S')?.gender
    if (existing && existing !== gender) {
      return err({
        code: 'MIXED_GENDERS',
        message: 'Bu firmada tek bir biletle farklı cinsiyetteki yolcular için koltuk seçilemiyor.',
      })
    }
  }

  return ok({
    key: seat.key,
    number: seat.number,
    label: seat.label,
    gender: policy.hasGenderSelection ? gender : 'S',
    price: seat.price,
    isSingle: seat.isSingle,
  })
}

/** Which gender buttons a seat offers. Both false means the seat is unavailable. */
export function allowedGenders(seat: Seat, policy: SeatPolicy): { male: boolean; female: boolean } {
  if (!policy.hasGenderSelection || seat.availableFor === 'NO') {
    return { male: false, female: false }
  }
  return {
    male: acceptsGender(seat, 'M'),
    female: acceptsGender(seat, 'F'),
  }
}

/** One button in the gender chooser. */
export interface GenderOption {
  readonly gender: 'M' | 'F'
  /** Null when this answer can be added; otherwise the sentence shown beside the buttons. */
  readonly blockedBy: string | null
}

/**
 * What a click on a seat that is not yet picked should do.
 *
 *  - `commit` means there is nothing to ask. Either the carrier has no gender
 *    rule, or no answer could be added — the seat is sold, the limit is
 *    reached, or the seat's lock and the booking's single gender rule out both
 *    answers. Adding it at once lets `canAddToCart` explain the refusal before
 *    the traveller is asked a question whose every answer would be turned down.
 *  - `ask` means at least one answer works, and each option carries its own
 *    reason when it does not, so the chooser can show why instead of hinting.
 */
export type PickPlan =
  | { readonly kind: 'commit'; readonly gender: Gender }
  | { readonly kind: 'ask'; readonly options: readonly [GenderOption, GenderOption] }

export function planPick(picks: readonly SeatPick[], seat: Seat, policy: SeatPolicy): PickPlan {
  if (!policy.hasGenderSelection) return { kind: 'commit', gender: 'S' }

  const male = canAddToCart(picks, seat, 'M', policy)
  const female = canAddToCart(picks, seat, 'F', policy)

  if (!male.ok && !female.ok) {
    // Seat-level refusals read the same for either answer. When both refusals
    // are about gender, answering with the booking's own gender yields the
    // message that names this seat's lock — the part the traveller can act on.
    const party = picks.find((p) => p.gender !== 'S')?.gender
    return { kind: 'commit', gender: party === 'F' ? 'F' : 'M' }
  }

  // Seat-level checks run before the gender checks in `canAddToCart`, so a
  // refusal that reaches this point is always one of the two gender rules.
  return {
    kind: 'ask',
    options: [
      { gender: 'M', blockedBy: male.ok ? null : genderReason(male.error) },
      { gender: 'F', blockedBy: female.ok ? null : genderReason(female.error) },
    ],
  }
}

function genderReason(error: CartError): string {
  if (error.code === 'GENDER_BLOCKED') {
    const who = error.allowed === 'M' ? 'erkek' : 'kadın'
    return `Yan koltukta ${who} yolcu oturduğu için bu koltuk yalnızca ${who} yolculara satılabilir.`
  }
  return 'Bu firmada bir biletteki yolcuların hepsi aynı cinsiyetten olmalı.'
}

export interface PriceLine {
  readonly label: string
  readonly amount: number
  readonly kind: 'seat' | 'fee'
}

export interface Quote {
  readonly lines: readonly PriceLine[]
  readonly subtotal: number
  readonly fees: number
  readonly total: number
}

/**
 * Itemised total. The single-seat surcharge is its own line rather than being
 * folded into the fare, because a total that cannot be reconciled is the thing
 * travellers complain about most.
 */
export function quote(picks: readonly SeatPick[], policy: SeatPolicy): Quote {
  const lines: PriceLine[] = picks.map((p) => ({
    label: `${p.label} numaralı koltuk`,
    amount: p.price,
    kind: 'seat' as const,
  }))

  const singles = picks.filter((p) => p.isSingle).length
  if (singles > 0 && policy.singleSeatFee > 0) {
    lines.push({
      label: singles === 1 ? 'Tekli koltuk farkı' : `Tekli koltuk farkı (${singles} koltuk)`,
      amount: singles * policy.singleSeatFee,
      kind: 'fee',
    })
  }

  const subtotal = lines.filter((l) => l.kind === 'seat').reduce((s, l) => s + l.amount, 0)
  const fees = lines.filter((l) => l.kind === 'fee').reduce((s, l) => s + l.amount, 0)

  return { lines, subtotal, fees, total: subtotal + fees }
}

/**
 * Turkish screen-reader label for a seat.
 *
 * Reads ordinal-first ("12 numaralı koltuk"), which is how Turkish states it.
 * Selection is deliberately absent: `aria-selected` already voices "seçili",
 * and a label that mutates on toggle gets re-announced as a new element.
 */
export function seatLabel(seat: Seat): string {
  const parts = [`${seat.label} numaralı koltuk`]

  if (seat.isSingle) parts.push('tek koltuk')
  else if (seat.isWindow) parts.push('pencere kenarı')
  else parts.push('koridor kenarı')

  if (seat.occupiedBy === 'M') parts.push('dolu, erkek yolcu')
  else if (seat.occupiedBy === 'F') parts.push('dolu, kadın yolcu')
  else if (isGenderLocked(seat)) {
    parts.push(
      seat.availableFor === 'F'
        ? 'boş, yalnızca kadın yolcular seçebilir'
        : 'boş, yalnızca erkek yolcular seçebilir',
    )
  } else if (seat.availableFor === 'NO') parts.push('satışa kapalı')
  else parts.push('boş')

  return parts.join(', ')
}
