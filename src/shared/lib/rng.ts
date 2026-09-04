/**
 * A seeded pseudo-random generator.
 *
 * The old app called `Math.random()` inside a `useEffect` to decide who was
 * sitting where, so every mount reshuffled the coach — the occupancy could not
 * be tested, deep-linked, or even trusted between two renders of the same
 * page. Everything the mock backend generates is derived from a string seed
 * instead, so a given trip always yields the same coach.
 *
 * mulberry32: small, fast, and good enough for fixtures. Not for crypto.
 */

export interface Rng {
  /** Float in [0, 1). */
  next(): number
  /** Integer in [min, max]. */
  int(min: number, max: number): number
  /** Float in [min, max). */
  float(min: number, max: number): number
  /** True with probability `p`. */
  chance(p: number): boolean
  /** One element of a non-empty array. */
  pick<T>(items: readonly T[]): T
  /** `count` distinct elements, or all of them if the array is shorter. */
  sample<T>(items: readonly T[], count: number): T[]
  /** A new array in a shuffled order; the input is untouched. */
  shuffle<T>(items: readonly T[]): T[]
}

/** FNV-1a — turns a seed string into the 32-bit integer mulberry32 wants. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function createRng(seed: string | number): Rng {
  let state = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed)

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1))

  return {
    next,
    int,
    float: (min, max) => min + next() * (max - min),
    chance: (p) => next() < p,
    pick: <T>(items: readonly T[]): T => {
      if (items.length === 0) throw new Error('rng.pick: empty array')
      return items[int(0, items.length - 1)]!
    },
    shuffle: <T>(items: readonly T[]): T[] => {
      const out = [...items]
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i)
        ;[out[i], out[j]] = [out[j]!, out[i]!]
      }
      return out
    },
    sample: <T>(items: readonly T[], count: number): T[] => {
      const out = [...items]
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i)
        ;[out[i], out[j]] = [out[j]!, out[i]!]
      }
      return out.slice(0, Math.min(count, out.length))
    },
  }
}
