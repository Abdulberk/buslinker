import { create } from 'zustand'
import type { Gender, Seat, SeatPick, SeatPolicy } from '@/entities/seat/model'
import { canAddToCart, quote, type CartError, type Quote } from '@/entities/seat/rules'

/**
 * The booking draft — the one piece of genuinely client-owned state.
 *
 * Search parameters live in the URL. Trips and seat maps live in the query
 * cache. What is left is the seats a person has picked but not yet paid for,
 * which belongs to neither: it is not addressable and it is not server state.
 *
 * Selection is scoped by trip id, so navigating to a different departure does
 * not silently carry seats across — a real defect class in booking flows.
 */

interface BookingState {
  tripId: string | null
  picks: SeatPick[]
  lastError: CartError | null
  /** Latest change, for the polite live region. Cleared once announced. */
  announcement: string | null

  startTrip: (tripId: string) => void
  addSeat: (seat: Seat, gender: Gender, policy: SeatPolicy) => boolean
  removeSeat: (key: string) => void
  clear: () => void
  clearError: () => void
  clearAnnouncement: () => void
}

export const useBookingStore = create<BookingState>((set, get) => ({
  tripId: null,
  picks: [],
  lastError: null,
  announcement: null,

  startTrip: (tripId) => {
    // Only reset when the trip actually changes, or every render of the seat
    // page would wipe the draft.
    if (get().tripId === tripId) return
    set({ tripId, picks: [], lastError: null, announcement: null })
  },

  addSeat: (seat, gender, policy) => {
    const result = canAddToCart(get().picks, seat, gender, policy)
    if (!result.ok) {
      set({ lastError: result.error, announcement: null })
      return false
    }
    const picks = [...get().picks, result.value].sort((a, b) => a.number - b.number)
    set({
      picks,
      lastError: null,
      announcement: `${seat.label} numaralı koltuk seçildi. ${picks.length} koltuk seçili.`,
    })
    return true
  },

  removeSeat: (key) => {
    const removed = get().picks.find((p) => p.key === key)
    const picks = get().picks.filter((p) => p.key !== key)
    set({
      picks,
      lastError: null,
      announcement: removed
        ? `${removed.label} numaralı koltuk seçimi kaldırıldı. ${picks.length} koltuk seçili.`
        : null,
    })
  },

  clear: () => set({ picks: [], lastError: null, announcement: null }),
  clearError: () => set({ lastError: null }),
  clearAnnouncement: () => set({ announcement: null }),
}))

/** Itemised total for the current draft. */
export function useQuote(policy: SeatPolicy): Quote {
  const picks = useBookingStore((s) => s.picks)
  return quote(picks, policy)
}
