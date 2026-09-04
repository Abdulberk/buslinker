import { z } from 'zod'

/**
 * The seat domain model.
 *
 * Field names deliberately mirror the contract Turkish ticketing platforms
 * already ship, so a real integration is a mapping exercise rather than a
 * redesign. The important shape decision is `availableFor`: sellability is
 * SERVER state, not something the client re-derives by looking at a seat's
 * neighbours. The old code inspected the adjacent seat on every click and got
 * it wrong in two directions at once.
 */

/** `M` erkek, `F` kadın, `S` for carriers that do not use gender rules. */
export const genderSchema = z.enum(['M', 'F', 'S'])
export type Gender = z.infer<typeof genderSchema>

/**
 * Who may buy this seat.
 *  - `ALL` free for anyone
 *  - `M` / `F` empty, but the pair partner is taken, so it is gender-locked
 *  - `NO` not sellable at all
 */
export const availabilitySchema = z.enum(['ALL', 'M', 'F', 'NO'])
export type Availability = z.infer<typeof availabilitySchema>

export const unavailableReasonSchema = z.enum([
  'SOLD',
  'GENDER_BLOCKED',
  'CREW',
  'ACCESSIBILITY',
  'BLOCKED',
])
export type UnavailableReason = z.infer<typeof unavailableReasonSchema>

/** Position notes a carrier surfaces as a disclaimer once the seat is picked. */
export const seatNoteSchema = z.enum(['backRow', 'nearDoor', 'frontRow'])
export type SeatNote = z.infer<typeof seatNoteSchema>

export const seatSchema = z.object({
  /** Geometry key — joins this record to a `PlacedCell`. */
  key: z.string(),
  number: z.number().int().positive(),
  /** Display label. Not guaranteed to equal `number`; some carriers use letters. */
  label: z.string().min(1).max(4),
  availableFor: availabilitySchema,
  /** Set only when `availableFor` is `NO`, or when the seat is gender-locked. */
  unavailableReason: unavailableReasonSchema.nullable(),
  /** Gender of the passenger already seated here, when the seat is sold. */
  occupiedBy: z.enum(['M', 'F']).nullable(),
  price: z.number().nonnegative(),
  isSingle: z.boolean(),
  isWindow: z.boolean(),
  note: seatNoteSchema.nullable(),
})
export type Seat = z.infer<typeof seatSchema>

/** Per-journey rules. Every field is optional upstream, so each one has a default. */
export const seatPolicySchema = z.object({
  maxSeats: z.number().int().min(1).max(4).catch(4),
  /** Whether one booking may contain both male and female passengers. */
  mixedGenders: z.boolean().catch(true),
  /** Whether this carrier applies the gender rule at all. */
  hasGenderSelection: z.boolean().catch(true),
  /** Whether a seat map exists; some carriers sell without one. */
  hasSeatSelection: z.boolean().catch(true),
  /** Surcharge for taking a single seat, in TRY. */
  singleSeatFee: z.number().nonnegative().catch(0),
})
export type SeatPolicy = z.infer<typeof seatPolicySchema>

export const DEFAULT_POLICY: SeatPolicy = {
  maxSeats: 4,
  mixedGenders: true,
  hasGenderSelection: true,
  hasSeatSelection: true,
  singleSeatFee: 0,
}

/** The industry-wide ceiling. A carrier may be stricter, never looser. */
export const HARD_MAX_SEATS = 4

export const seatMapSchema = z.object({
  tripId: z.string(),
  deckId: z.string(),
  policy: seatPolicySchema,
  seats: z.array(seatSchema),
  /** Which side the sun falls on — a small affordance travellers here expect. */
  sunSide: z.enum(['left', 'right', 'none']).catch('none'),
})
export type SeatMap = z.infer<typeof seatMapSchema>

/** One seat held in the booking draft, with the passenger's gender. */
export interface SeatPick {
  readonly key: string
  readonly number: number
  readonly label: string
  readonly gender: Gender
  readonly price: number
  readonly isSingle: boolean
}

// ---------------------------------------------------------------------------
// Derived predicates. Keep these the only place seat state is interpreted.
// ---------------------------------------------------------------------------

export function isSellable(seat: Seat): boolean {
  return seat.availableFor !== 'NO'
}

export function isSold(seat: Seat): boolean {
  return seat.availableFor === 'NO' && seat.unavailableReason === 'SOLD'
}

/** Empty, but restricted to one gender because the pair partner is taken. */
export function isGenderLocked(seat: Seat): boolean {
  return seat.availableFor === 'M' || seat.availableFor === 'F'
}

export function acceptsGender(seat: Seat, gender: Gender): boolean {
  if (seat.availableFor === 'NO') return false
  if (seat.availableFor === 'ALL') return true
  return seat.availableFor === gender
}

export type SeatVisualState =
  'available' | 'selected' | 'occupied-male' | 'occupied-female' | 'disabled'

export function seatVisualState(seat: Seat, selected: boolean): SeatVisualState {
  if (selected) return 'selected'
  if (seat.occupiedBy === 'M') return 'occupied-male'
  if (seat.occupiedBy === 'F') return 'occupied-female'
  // A seat locked to one gender by its taken partner looks like any other
  // free seat. The lock is enforced where it matters — the gender picker
  // only offers what the seat accepts — so marking it as well said the same
  // thing twice and made a sellable seat look like a problem.
  if (seat.availableFor === 'NO') return 'disabled'
  return 'available'
}
