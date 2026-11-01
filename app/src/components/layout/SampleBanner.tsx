import { useUi } from '../../i18n/LocaleContext'

/** Visible on every page while Stage A sample content is shown (V6 §4.8). */
export function SampleBanner() {
  const ui = useUi()
  return (
    <div role="note" data-sample-banner="" className="bg-brand-orange-soft px-4 py-1.5 text-center text-xs font-semibold text-brand-orange-ink">
      {ui.sample.banner}
    </div>
  )
}
