import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
// Side-effect import: i18next must be initialised before any component reads a
// translation, and the formatters must know the locale before the first price
// is rendered.
import '@/shared/i18n'
import { initLocale } from '@/shared/i18n/use-locale'
import { reloadForNewRelease } from './app/lazy-route'
import './styles/theme.css'

initLocale()

// Vite preloads a chunk's own dependencies — its stylesheet among them —
// before the import resolves, and reports a failure here first. A failed
// preload is the same stale release as a failed chunk, so it takes the same
// reload; only when the budget is spent does the error go on to the route.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewRelease()) event.preventDefault()
})

const container = document.getElementById('root')
if (!container) throw new Error('#root bulunamadı')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
