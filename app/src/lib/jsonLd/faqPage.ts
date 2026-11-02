import { absoluteUrl } from '../socialImage'
import type { JsonLdNode } from './graph'
import { webPageId } from './webPage'

export interface FaqItem {
  question: string
  answer: string
}

/**
 * The questions the page shows in its FAQ section, and only those (V6 §4.7: visible content first).
 * Google no longer shows FAQ rich results (V6 §9), but other answer engines read the Q&A pairs.
 */
export function faqPage(path: string, items: readonly FaqItem[]): JsonLdNode {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    isPartOf: { '@id': webPageId(path) },
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}
