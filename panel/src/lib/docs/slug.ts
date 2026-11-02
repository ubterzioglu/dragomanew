const TURKISH: Readonly<Record<string, string>> = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u' }

/** `Nasıl kullanılır?` → `nasil-kullanilir`: a stable, readable anchor id. */
export function slugify(text: string): string {
  return text
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (char) => TURKISH[char.toLocaleLowerCase('tr')] ?? TURKISH[char] ?? char)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
