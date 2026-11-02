import { hashSource, TARGET_LOCALES } from '../content/translation.ts'
import type { DeeplClient, GlossaryDictionary } from './client.ts'

/**
 * Names DeepL must leave as they are (dalga2-sozlesme "UBT'den gerekenler" 4, the suggested list).
 * One DeepL v3 glossary holds a TR→EN/FR/DE dictionary; app_settings.deepl_glossary keeps its id
 * and the hash of these terms, so editing the list recreates it. A glossary failure never blocks a
 * translation: it runs without one.
 */

export const GLOSSARY_NAME = 'dragoman-names'

/** Turkish term → the same term in every target language. */
export const GLOSSARY_TERMS: readonly string[] = ['Dragoman', 'Kaş', 'Kekova', 'Likya Yolu', 'Üçağız', 'Simena']

export function glossaryDictionaries(terms: readonly string[] = GLOSSARY_TERMS): GlossaryDictionary[] {
  const entries = terms.map((term) => `${term}\t${term}`).join('\n')
  return TARGET_LOCALES.map((locale) => ({ source_lang: 'tr', target_lang: locale, entries, entries_format: 'tsv' }))
}

export const glossaryHash = (terms: readonly string[] = GLOSSARY_TERMS): string => hashSource(glossaryDictionaries(terms))

export interface GlossarySetting {
  id: string
  hash: string
}

export interface GlossaryStore {
  readGlossary(): Promise<GlossarySetting | null>
  writeGlossary(setting: GlossarySetting): Promise<void>
}

/**
 * The glossary id to send, creating or recreating the glossary when the terms changed. Returns
 * undefined (translate without a glossary) on any failure, after reporting it.
 */
export async function ensureGlossary(
  client: DeeplClient,
  store: GlossaryStore,
  report: (context: string, error: unknown) => void,
  terms: readonly string[] = GLOSSARY_TERMS,
): Promise<string | undefined> {
  try {
    const hash = glossaryHash(terms)
    const current = await store.readGlossary()
    if (current && current.hash === hash) return current.id

    const id = await client.createGlossary(GLOSSARY_NAME, glossaryDictionaries(terms))
    await store.writeGlossary({ id, hash })
    // The old one is only clutter on the DeepL account; failing to delete it changes nothing.
    if (current) await client.deleteGlossary(current.id).catch((error: unknown) => report('translate-content: old glossary not deleted', error))
    return id
  } catch (error) {
    report('translate-content: glossary skipped', error)
    return undefined
  }
}
