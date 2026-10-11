/**
 * The two hover recipes of the home page.
 *
 * Before these existed the page had three: the route cards lifted and turned
 * their border red, the campaigns only grew a shadow, and the destination
 * photos jumped twice as far as either. The same kind of object should answer
 * the pointer the same way, so every card below the hero now uses one of two.
 *
 * `linkCard` is for cards made of text on a surface (routes, operators). The
 * border warming toward brand is the cue that survives dark mode, where a
 * shadow on a near-black ground is close to invisible.
 *
 * `mediaCard` is for cards that are mostly a picture (campaigns, destinations).
 * A red rim around a photograph reads as a selection state, so these lift on
 * `--shadow-lift` — the token designed as the hover state of a resting card —
 * and only step the rim up to the control edge in dark mode, for the same
 * reason as above. The sunken ground is what a slow or failed photo shows
 * instead of a hole in the grid.
 *
 * Plain strings rather than components: each caller lays its card out
 * differently and only the interaction is meant to be shared.
 */
export const linkCard = [
  'rounded-xl border border-border bg-surface',
  'transition-[border-color,box-shadow,translate] duration-(--duration-base) ease-standard',
  'hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md',
].join(' ')

export const mediaCard = [
  'block overflow-hidden rounded-xl border border-border bg-surface-sunken',
  'transition-[border-color,box-shadow,translate] duration-(--duration-base) ease-standard',
  'hover:-translate-y-0.5 hover:shadow-lift dark:hover:border-border-strong',
].join(' ')
