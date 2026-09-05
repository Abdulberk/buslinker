/**
 * Form validation for the auth screens.
 *
 * Deliberately permissive on email: the only reliable check is sending a
 * message, so this rejects the shapes that are certainly wrong (no @, no dot in
 * the domain, whitespace) and lets everything else through rather than
 * bouncing valid but unusual addresses.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(value: string): boolean {
  return EMAIL.test(value.trim())
}

// A phone validator used to live here: a regex for Turkish mobiles that
// rejected every other country and accepted numbers no operator issues.
// `shared/lib/phone` replaced it with the numbering plans themselves.

export interface PasswordCheck {
  readonly ok: boolean
  /** 0-4, for the strength meter. */
  readonly score: number
  readonly message: string | undefined
}

/**
 * Length carries most of the real strength, so it is the only hard gate; the
 * character-class rules only feed the meter. Blocking a long passphrase for
 * lacking a digit is security theatre that pushes people toward `Passw0rd!`.
 */
export function checkPassword(value: string): PasswordCheck {
  if (value.length === 0) return { ok: false, score: 0, message: 'Parola belirleyin.' }
  if (value.length < 8) {
    return { ok: false, score: 1, message: 'Parola en az 8 karakter olmalı.' }
  }

  let score = 1
  if (value.length >= 12) score += 1
  if (/[a-zçğıöşü]/.test(value) && /[A-ZÇĞİÖŞÜ]/.test(value)) score += 1
  if (/\d/.test(value) && /[^\w\s]/.test(value)) score += 1

  return { ok: true, score: Math.min(score, 4), message: undefined }
}

export const PASSWORD_LABELS = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü'] as const
