import { bannerLevel } from '../../lib/content/translationView'
import type { DeeplUsage } from '../../lib/types'

const percent = (usage: DeeplUsage): number => Math.floor((usage.count / Math.max(1, usage.limit)) * 100)

/** Nothing below 80 %; a warning at 80 %, an alert at 100 % (no automatic paid upgrade, §2). */
export function DeeplBanner({ usage }: { usage: DeeplUsage }) {
  const level = bannerLevel(usage)
  if (level === 'ok') return null
  const critical = level === 'critical'
  return (
    <div
      role={critical ? 'alert' : 'status'}
      className={`border-b px-4 py-2 text-center text-sm font-semibold ${critical ? 'border-red-700 bg-red-50 text-red-900' : 'border-brand-orange bg-brand-orange-soft text-brand-orange-ink'}`}
    >
      {critical
        ? 'DeepL kotası doldu: bu ay yeni çeviri yapılamaz. Paket yükseltmeyi Dragoman onaylamalı.'
        : `DeepL kotasının %${percent(usage)} kadarı kullanıldı. Çevirileri gerekli olanlarla sınırlayın.`}
    </div>
  )
}
