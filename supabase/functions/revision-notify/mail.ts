import { escapeHtml, escapeMultiline, oneLine } from '../_shared/mail/escape.ts'
import type { MailMessage } from '../_shared/mail/types.ts'
import type { Recipient, RevisionEventRecord } from './types.ts'

/** Plain Turkish mails about one revision request; the HTML part repeats the text, nothing more. */

const TEXT_EXCERPT = 1_000
const SUBJECT_EXCERPT = 60
const FOOTER = 'Bu e-postayı panelde revizyon yetkiniz olduğu için alıyorsunuz.'

function excerpt(text: string, max: number): string {
  const trimmed = text.trim()
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed
}

/** The request's own screen: <PANEL_URL>/revizyonlar/<id>; null without a usable PANEL_URL. */
export function revisionLink(panelUrl: string | null, requestId: string): string | null {
  if (!panelUrl) return null
  try {
    const base = panelUrl.endsWith('/') ? panelUrl : `${panelUrl}/`
    return new URL(`revizyonlar/${encodeURIComponent(requestId)}`, base).toString()
  } catch {
    return null
  }
}

interface Parts {
  subject: string
  intro: string
  quote: string
  note: string | null
}

function partsOf(event: RevisionEventRecord): Parts {
  const ref = `#${event.number}`
  switch (event.event) {
    case 'created':
      return {
        subject: `Yeni revizyon isteği ${ref}: ${excerpt(oneLine(event.description), SUBJECT_EXCERPT)}`,
        intro: `${event.actorName} yeni bir revizyon isteği açtı (aciliyet ${event.urgency}/10):`,
        quote: excerpt(event.description, TEXT_EXCERPT),
        note: null,
      }
    case 'commented':
      return {
        subject: `Revizyon ${ref} için yeni yorum`,
        intro: `${event.actorName}, ${ref} numaralı revizyon isteğine yorum yazdı:`,
        quote: excerpt(event.comment ?? '', TEXT_EXCERPT),
        note: `İstek: ${excerpt(oneLine(event.description), 200)}`,
      }
    case 'done':
      return {
        subject: `Revizyon ${ref} tamamlandı`,
        intro: `${event.actorName}, ${ref} numaralı revizyon isteğini Tamamlandı olarak işaretledi:`,
        quote: excerpt(event.description, TEXT_EXCERPT),
        note: 'Sorun sürüyorsa isteği panelde açıp Yeniden aç düğmesine basın.',
      }
  }
}

export function revisionMail(event: RevisionEventRecord, recipient: Recipient, link: string | null): MailMessage {
  const { subject, intro, quote, note } = partsOf(event)
  const greeting = `Merhaba ${recipient.name},`
  const text = [greeting, intro, quote, note, link ? `İsteği panelde açın: ${link}` : null, FOOTER]
    .filter((part): part is string => part !== null && part !== '')
    .join('\n\n')
  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>${escapeHtml(intro)}</p>`,
    ...(quote ? [`<blockquote>${escapeMultiline(quote)}</blockquote>`] : []),
    ...(note ? [`<p>${escapeHtml(note)}</p>`] : []),
    ...(link ? [`<p><a href="${escapeHtml(link)}">İsteği panelde açın</a></p>`] : []),
    `<p>${escapeHtml(FOOTER)}</p>`,
  ].join('\n')
  return {
    to: recipient.email,
    subject: oneLine(subject),
    text,
    html: `<!doctype html>\n<html lang="tr">\n<body>\n${html}\n</body>\n</html>`,
  }
}
