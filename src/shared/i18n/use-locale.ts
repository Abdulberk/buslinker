import { create } from 'zustand'
import { setActiveLocale } from '@/shared/lib/tr'
import { i18n } from './index'
import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  isCurrencyCode,
  isLanguageCode,
  type CurrencyCode,
  type LanguageCode,
} from './config'

function readCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (isCurrencyCode(stored)) return stored
  } catch {
    // Private mode or blocked storage — the session default is fine.
  }
  return DEFAULT_CURRENCY
}

function readLanguage(): LanguageCode {
  // i18next has already run detection by the time this module is first read.
  const resolved = i18n.resolvedLanguage ?? i18n.language
  return isLanguageCode(resolved) ? resolved : DEFAULT_LANGUAGE
}

interface LocaleState {
  language: LanguageCode
  currency: CurrencyCode
  setLanguage: (language: LanguageCode) => void
  setCurrency: (currency: CurrencyCode) => void
}

/**
 * One store for both preferences.
 *
 * Language also lives in i18next, which is what re-renders translated
 * components; this store exists so that currency has the same shape, so that a
 * single subscription covers both, and so the formatting layer — which is
 * plain functions, not hooks — is pushed the new values from exactly one place.
 */
const useLocaleStore = create<LocaleState>((set, get) => ({
  language: readLanguage(),
  currency: readCurrency(),
  setLanguage: (language) => {
    if (language === get().language) return
    void i18n.changeLanguage(language)
    setActiveLocale(language, get().currency)
    if (typeof document !== 'undefined') document.documentElement.lang = language
    set({ language })
  },
  setCurrency: (currency) => {
    if (currency === get().currency) return
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
    } catch {
      // Held for this session either way.
    }
    setActiveLocale(get().language, currency)
    set({ currency })
  },
}))

/** Applied once at start-up, before the first render reads a formatter. */
export function initLocale() {
  const { language, currency } = useLocaleStore.getState()
  setActiveLocale(language, currency)
  if (typeof document !== 'undefined') document.documentElement.lang = language
}

export function useLocale() {
  const language = useLocaleStore((s) => s.language)
  const currency = useLocaleStore((s) => s.currency)
  const setLanguage = useLocaleStore((s) => s.setLanguage)
  const setCurrency = useLocaleStore((s) => s.setCurrency)
  return { language, currency, setLanguage, setCurrency }
}
