import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { DEFAULT_LANGUAGE, LANGUAGES, LANGUAGE_STORAGE_KEY } from './config'
import { tr } from './locales/tr'
import { en } from './locales/en'

/**
 * The translation runtime.
 *
 * Bundles are imported rather than fetched: there are two of them, they are a
 * few kilobytes each, and a backend would make the first paint wait on a
 * network round trip for text that is already in the build. `init` is therefore
 * synchronous and nothing needs a Suspense boundary.
 *
 * Detection order is stored choice, then the browser's own languages. Anything
 * outside the catalogue falls back to Turkish, which is what the catalogue,
 * the terminals and the fares are written in.
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: LANGUAGES.map((l) => l.code),
    // Without this, a browser set to `en-US` asks for a bundle we do not have
    // and falls through to Turkish instead of matching `en`.
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: {
      // React escapes for us; letting i18next escape as well turns an
      // apostrophe in `Türkiye'nin` into an entity.
      escapeValue: false,
    },
    returnNull: false,
  })

export { i18n }
