import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
// Side-effect import: i18next must be initialised before any component reads a
// translation, and the formatters must know the locale before the first price
// is rendered.
import '@/shared/i18n'
import { initLocale } from '@/shared/i18n/use-locale'
import './styles/theme.css'

initLocale()

const container = document.getElementById('root')
if (!container) throw new Error('#root bulunamadı')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
