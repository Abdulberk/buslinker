import { toast } from 'sonner'
import {
  buildTicketIcs,
  icsFilename,
  shareSummary,
  tripTitle,
  type TicketFacts,
} from './ticket-text'

/**
 * The ticket's side effects: clipboard, download and share sheet.
 *
 * Each one checks the capability instead of assuming it. A page served without
 * a secure context has no clipboard, desktop browsers mostly have no share
 * sheet, and in each case the traveller is told what happened rather than
 * left pressing a button that silently did nothing.
 */

interface CopyMessages {
  readonly success: string
  readonly successDescription?: string
  readonly failure: string
}

export async function copyText(text: string, messages: CopyMessages): Promise<boolean> {
  if (typeof navigator.clipboard?.writeText !== 'function') {
    toast.error(messages.failure, {
      description: 'Tarayıcınız kopyalamayı desteklemiyor. Bilgiyi elle not alabilirsiniz.',
    })
    return false
  }
  try {
    await navigator.clipboard.writeText(text)
    toast.success(
      messages.success,
      messages.successDescription ? { description: messages.successDescription } : undefined,
    )
    return true
  } catch {
    toast.error(messages.failure, { description: 'Bilgiyi elle not alabilirsiniz.' })
    return false
  }
}

export function copyPnr(pnr: string): Promise<boolean> {
  return copyText(pnr, { success: 'PNR kodu kopyalandı.', failure: 'PNR kodu kopyalanamadı.' })
}

export function downloadTicketIcs(facts: TicketFacts): void {
  const blob = new Blob([buildTicketIcs(facts)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = icsFilename(facts.pnr)
  document.body.append(link)
  link.click()
  link.remove()
  // Revoked a moment later rather than at once: Safari drops a download whose
  // object URL disappears in the same task that started it.
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
  toast.success('Takvim dosyası hazır.', {
    description: 'Dosyayı açtığınızda yolculuk takviminize eklenir.',
  })
}

/**
 * Hands the trip summary to the share sheet, or copies it where there is none.
 *
 * The summary carries no PNR and no link (see `shareSummary`), and the copy
 * toast says so, because "share my ticket" sounds like it sends the ticket.
 */
export async function shareTrip(facts: TicketFacts): Promise<void> {
  const text = shareSummary(facts)
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: tripTitle(facts), text })
      return
    } catch (error) {
      // Closing the sheet is a choice, not a failure: nothing to report.
      if (error instanceof DOMException && error.name === 'AbortError') return
      // Anything else (a refused permission, an unsupported payload) falls
      // through to the clipboard.
    }
  }
  await copyText(text, {
    success: 'Yolculuk özeti kopyalandı.',
    successDescription: 'Özette PNR kodu ve bilet bağlantısı yer almaz.',
    failure: 'Yolculuk özeti kopyalanamadı.',
  })
}
