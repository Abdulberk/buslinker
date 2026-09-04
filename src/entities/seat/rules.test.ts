import { describe, expect, it } from 'vitest'
import { DEFAULT_POLICY, type Seat, type SeatPick, type SeatPolicy } from './model'
import { allowedGenders, canAddToCart, maxSeatsFor, quote, seatLabel } from './rules'

const seat = (over: Partial<Seat> = {}): Seat => ({
  key: 'r0c0',
  number: 1,
  label: '1',
  availableFor: 'ALL',
  unavailableReason: null,
  occupiedBy: null,
  price: 950,
  isSingle: false,
  isWindow: true,
  note: null,
  ...over,
})

const pick = (over: Partial<SeatPick> = {}): SeatPick => ({
  key: 'x',
  number: 9,
  label: '9',
  gender: 'M',
  price: 950,
  isSingle: false,
  ...over,
})

const policy = (over: Partial<SeatPolicy> = {}): SeatPolicy => ({ ...DEFAULT_POLICY, ...over })

describe('maxSeatsFor', () => {
  it('caps at the industry ceiling of 4', () => {
    expect(maxSeatsFor(policy({ maxSeats: 4 }))).toBe(4)
    expect(maxSeatsFor(policy({ maxSeats: 2 }))).toBe(2)
  })
})

describe('canAddToCart — seat limit', () => {
  // The old code used `selectedSeats.length > 4`, which admitted a fifth seat.
  it('rejects the fifth seat, not the sixth', () => {
    const picks = [pick({ key: 'a' }), pick({ key: 'b' }), pick({ key: 'c' }), pick({ key: 'd' })]
    const result = canAddToCart(picks, seat({ key: 'e' }), 'M', policy())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('MAX_SEATS')
      expect(result.error.message).toBe('En fazla 4 koltuk seçebilirsiniz.')
    }
  })

  it('accepts the fourth seat', () => {
    const picks = [pick({ key: 'a' }), pick({ key: 'b' }), pick({ key: 'c' })]
    expect(canAddToCart(picks, seat({ key: 'd' }), 'M', policy()).ok).toBe(true)
  })

  it('honours a carrier limit below the ceiling', () => {
    const picks = [pick({ key: 'a' }), pick({ key: 'b' })]
    const result = canAddToCart(picks, seat({ key: 'c' }), 'M', policy({ maxSeats: 2 }))
    expect(result.ok).toBe(false)
    if (!result.ok && result.error.code === 'MAX_SEATS') expect(result.error.max).toBe(2)
  })
})

describe('canAddToCart — gender rule', () => {
  it('lets either gender take a free seat', () => {
    expect(canAddToCart([], seat({ availableFor: 'ALL' }), 'M', policy()).ok).toBe(true)
    expect(canAddToCart([], seat({ availableFor: 'ALL' }), 'F', policy()).ok).toBe(true)
  })

  it('blocks the wrong gender on a locked seat and names the allowed one', () => {
    const result = canAddToCart([], seat({ availableFor: 'F' }), 'M', policy())
    expect(result.ok).toBe(false)
    if (!result.ok && result.error.code === 'GENDER_BLOCKED') {
      expect(result.error.allowed).toBe('F')
      expect(result.error.message).toContain('yalnızca kadın')
    }
  })

  it('allows the matching gender on a locked seat', () => {
    expect(canAddToCart([], seat({ availableFor: 'F' }), 'F', policy()).ok).toBe(true)
  })

  it('ignores the gender rule entirely for carriers that do not use it', () => {
    const p = policy({ hasGenderSelection: false })
    const result = canAddToCart([], seat({ availableFor: 'F' }), 'M', p)
    expect(result.ok).toBe(true)
    // The pick is recorded as gender-less rather than as a male passenger.
    if (result.ok) expect(result.value.gender).toBe('S')
  })

  it('does not couple seats across the aisle — that is server state, not a rule here', () => {
    // A seat the server says is free stays free no matter who else is picked.
    const picks = [pick({ gender: 'F' })]
    expect(canAddToCart(picks, seat({ key: 'z', availableFor: 'ALL' }), 'M', policy()).ok).toBe(
      true,
    )
  })
})

describe('canAddToCart — mixed genders', () => {
  it('blocks a second gender when the carrier forbids mixing', () => {
    const p = policy({ mixedGenders: false })
    const result = canAddToCart([pick({ gender: 'M' })], seat({ key: 'z' }), 'F', p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('MIXED_GENDERS')
  })

  it('allows the same gender when the carrier forbids mixing', () => {
    const p = policy({ mixedGenders: false })
    expect(canAddToCart([pick({ gender: 'M' })], seat({ key: 'z' }), 'M', p).ok).toBe(true)
  })

  it('allows mixing by default', () => {
    expect(canAddToCart([pick({ gender: 'M' })], seat({ key: 'z' }), 'F', policy()).ok).toBe(true)
  })
})

describe('canAddToCart — unavailable seats', () => {
  it('rejects a sold seat with a recovery hint', () => {
    const s = seat({ availableFor: 'NO', unavailableReason: 'SOLD', occupiedBy: 'M' })
    const result = canAddToCart([], s, 'M', policy())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('SOLD')
      expect(result.error.message).toContain('boş bir koltuk')
    }
  })

  it('rejects a structurally blocked seat distinctly from a sold one', () => {
    const s = seat({ availableFor: 'NO', unavailableReason: 'CREW' })
    const result = canAddToCart([], s, 'M', policy())
    if (!result.ok) expect(result.error.code).toBe('UNAVAILABLE')
  })

  it('rejects a seat already in the draft', () => {
    const result = canAddToCart([pick({ key: 'r0c0' })], seat({ key: 'r0c0' }), 'M', policy())
    if (!result.ok) expect(result.error.code).toBe('ALREADY_PICKED')
  })
})

describe('allowedGenders', () => {
  it('offers both on a free seat', () => {
    expect(allowedGenders(seat(), policy())).toEqual({ male: true, female: true })
  })

  it('offers one on a locked seat', () => {
    expect(allowedGenders(seat({ availableFor: 'M' }), policy())).toEqual({
      male: true,
      female: false,
    })
  })

  it('offers neither on a sold seat', () => {
    expect(allowedGenders(seat({ availableFor: 'NO' }), policy())).toEqual({
      male: false,
      female: false,
    })
  })

  it('offers neither when the carrier has no gender selection', () => {
    expect(allowedGenders(seat(), policy({ hasGenderSelection: false }))).toEqual({
      male: false,
      female: false,
    })
  })
})

describe('quote', () => {
  it('itemises seats and totals them', () => {
    const q = quote([pick({ price: 950 }), pick({ key: 'b', price: 950 })], policy())
    expect(q.subtotal).toBe(1900)
    expect(q.fees).toBe(0)
    expect(q.total).toBe(1900)
    expect(q.lines).toHaveLength(2)
  })

  it('adds the single-seat surcharge as its own reconcilable line', () => {
    const q = quote([pick({ price: 950, isSingle: true })], policy({ singleSeatFee: 50 }))
    expect(q.fees).toBe(50)
    expect(q.total).toBe(1000)
    expect(q.lines.at(-1)?.label).toBe('Tekli koltuk farkı')
  })

  it('charges the surcharge once per single seat', () => {
    const picks = [
      pick({ key: 'a', price: 900, isSingle: true }),
      pick({ key: 'b', price: 900, isSingle: true }),
      pick({ key: 'c', price: 900, isSingle: false }),
    ]
    const q = quote(picks, policy({ singleSeatFee: 50 }))
    expect(q.fees).toBe(100)
    expect(q.total).toBe(2800)
  })

  it('is empty for an empty draft', () => {
    const q = quote([], policy())
    expect(q.total).toBe(0)
    expect(q.lines).toEqual([])
  })
})

describe('seatLabel', () => {
  it('reads ordinal-first, as Turkish does', () => {
    expect(seatLabel(seat({ label: '12', isWindow: true }))).toBe(
      '12 numaralı koltuk, pencere kenarı, boş',
    )
  })

  it('names the occupant gender on a sold seat', () => {
    expect(seatLabel(seat({ label: '14', occupiedBy: 'F', availableFor: 'NO' }))).toContain(
      'dolu, kadın yolcu',
    )
  })

  it('explains a gender lock rather than just saying unavailable', () => {
    expect(seatLabel(seat({ label: '16', availableFor: 'F', isWindow: false }))).toBe(
      '16 numaralı koltuk, koridor kenarı, boş, yalnızca kadın yolcular seçebilir',
    )
  })

  it('calls a single seat what it is', () => {
    expect(seatLabel(seat({ label: '3', isSingle: true }))).toContain('tek koltuk')
  })

  // aria-selected already voices "seçili"; a label that changes on toggle gets
  // re-announced as a brand new element by some screen readers.
  it('never mentions selection', () => {
    expect(seatLabel(seat())).not.toContain('seçili')
    expect(seatLabel(seat())).not.toContain('seçildi')
  })
})
