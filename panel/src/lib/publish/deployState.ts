import type { SiteDeployRow } from '../types'

/**
 * What /panel/yayin says about a site_deploys row (§9): Sırada (countdown) / Kuruluyor / Sitede /
 * Tetiklenemedi, plus the delay warning when the live site is still behind 15 minutes after the
 * trigger. The live release comes from the site's own /release.json.
 */

export const DELAY_AFTER_TRIGGER_MS = 15 * 60 * 1000
export const DELAY_MESSAGE = 'Kurulum gecikti, ana yöneticiye haber verin'

export type DeployTone = 'waiting' | 'running' | 'done' | 'failed' | 'skipped'

export interface DeployView {
  label: string
  tone: DeployTone
  /** Seconds until a queued deploy is sent. */
  countdown: number | null
  delayed: boolean
}

const ms = (iso: string | null): number | null => {
  if (!iso) return null
  const value = Date.parse(iso)
  return Number.isNaN(value) ? null : value
}

export function deployView(row: SiteDeployRow, liveReleaseId: number | null, now: number): DeployView {
  const live = liveReleaseId !== null && row.release_id !== null && liveReleaseId >= row.release_id
  switch (row.status) {
    case 'queued': {
      const due = ms(row.not_before)
      return { label: 'Sırada', tone: 'waiting', countdown: due === null ? null : Math.max(0, Math.ceil((due - now) / 1000)), delayed: false }
    }
    case 'sending':
      return { label: 'Kuruluyor', tone: 'running', countdown: null, delayed: false }
    case 'triggered': {
      if (live) return { label: 'Sitede', tone: 'done', countdown: null, delayed: false }
      const triggered = ms(row.triggered_at)
      return {
        label: 'Kuruluyor',
        tone: 'running',
        countdown: null,
        delayed: triggered !== null && now - triggered > DELAY_AFTER_TRIGGER_MS,
      }
    }
    case 'failed':
      return { label: 'Tetiklenemedi', tone: 'failed', countdown: null, delayed: false }
    default:
      return { label: 'Atlandı (kurulum ayarlı değil)', tone: 'skipped', countdown: null, delayed: false }
  }
}

/** `/release.json` = `{releaseId, createdAt}`; anything else counts as unknown. */
export function parseLiveRelease(value: unknown): { releaseId: number; createdAt: string | null } | null {
  if (typeof value !== 'object' || value === null) return null
  const { releaseId, createdAt } = value as Record<string, unknown>
  if (typeof releaseId !== 'number' || !Number.isInteger(releaseId)) return null
  return { releaseId, createdAt: typeof createdAt === 'string' ? createdAt : null }
}

export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return minutes > 0 ? `${minutes} dk ${rest} sn` : `${rest} sn`
}

export const RELEASE_ACTION_LABELS: Readonly<Record<string, string>> = {
  seed: 'İlk içerik',
  publish: 'Yayınlandı',
  archive: 'Arşivlendi',
  unpublish: 'Yayından kaldırıldı',
  reorder: 'Sıra değişti',
  publish_form: 'Form yayınlandı',
}
