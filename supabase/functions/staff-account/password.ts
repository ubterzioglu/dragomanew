/**
 * Temporary passwords for staff, meant to be read out over the phone: 16 characters in four groups
 * of four, from an alphabet without look-alikes (I l 1, O o 0, L). 54 characters give about 92 bits.
 * Each draw holds an upper-case letter, a lower-case letter and a digit, so it passes any Auth
 * strength setting; the dashes count as symbols. Deno-free so vitest runs it.
 */

export const PASSWORD_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

const GROUPS = 4
const GROUP_LENGTH = 4
const LENGTH = GROUPS * GROUP_LENGTH
/** Bytes at or above this would favour the first characters of the alphabet, so they are skipped. */
const BYTE_LIMIT = 256 - (256 % PASSWORD_ALPHABET.length)

export type RandomFill = (bytes: Uint8Array<ArrayBuffer>) => Uint8Array

const cryptoFill: RandomFill = (bytes) => crypto.getRandomValues(bytes)

function randomIndex(fill: RandomFill): number {
  const byte = new Uint8Array(1)
  for (;;) {
    const value = fill(byte)[0] ?? 255
    if (value < BYTE_LIMIT) return value % PASSWORD_ALPHABET.length
  }
}

const hasEveryKind = (text: string): boolean => /[A-Z]/.test(text) && /[a-z]/.test(text) && /[0-9]/.test(text)

export function temporaryPassword(fill: RandomFill = cryptoFill): string {
  for (;;) {
    const chars = Array.from({ length: LENGTH }, () => PASSWORD_ALPHABET[randomIndex(fill)] ?? '')
    const text = chars.join('')
    if (!hasEveryKind(text)) continue
    const groups = Array.from({ length: GROUPS }, (_, index) => text.slice(index * GROUP_LENGTH, (index + 1) * GROUP_LENGTH))
    return groups.join('-')
  }
}
