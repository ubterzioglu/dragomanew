import { useUi } from '../../i18n/LocaleContext'
import type { UiStrings } from '../../i18n/ui'
import { DemoResult, ResultMessage } from './FormParts'
import type { SubmitErrorReason, SubmitResult } from './submission'

const ERROR_MESSAGE: Readonly<Record<SubmitErrorReason, keyof UiStrings['forms']['result']['errors']>> = {
  invalid: 'invalid',
  rate_limited: 'rateLimited',
  event_closed: 'eventClosed',
  unavailable: 'unavailable',
  network: 'network',
}

/**
 * What a site form shows after a submission: the sample notice while forms are not connected,
 * the stored request's reference, or what went wrong and what to do. Focused and announced like
 * DemoResult; the form keys it by submission count, so every attempt is announced again.
 */
export function FormResult({ result }: { result: SubmitResult }) {
  const ui = useUi()
  const strings = ui.forms.result
  switch (result.kind) {
    case 'demo':
      return <DemoResult />
    case 'sent':
      return (
        <ResultMessage tone="success" title={strings.sentTitle}>
          <p className="mt-1">
            {strings.referenceLabel}
            {ui.typography.labelSeparator}
            <strong className="font-mono">{result.reference}</strong>
          </p>
          <p className="mt-1 text-sm">{strings.sentDetail}</p>
        </ResultMessage>
      )
    case 'error':
      return (
        <ResultMessage tone="error" title={strings.errorTitle}>
          <p className="mt-1 text-sm">{strings.errors[ERROR_MESSAGE[result.reason]]}</p>
        </ResultMessage>
      )
  }
}
