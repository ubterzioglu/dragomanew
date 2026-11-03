import { useId, useState } from 'react'
import { addScreenshots, formatBytes, MAX_SCREENSHOTS, SCREENSHOT_ACCEPT } from '../../lib/revisions/screenshots'
import { fieldClass, labelClass, Notice } from '../ui'

interface ScreenshotPickerProps {
  files: readonly File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

/** Picks up to five PNG / JPEG / WebP screenshots of at most 5 MB; the bucket checks the same again. */
export function ScreenshotPicker({ files, onChange, disabled = false }: ScreenshotPickerProps) {
  const id = useId()
  const [problems, setProblems] = useState<string[]>([])
  const full = files.length >= MAX_SCREENSHOTS

  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClass}>
        Ekran görüntüsü ekle (isteğe bağlı; PNG, JPEG ya da WebP, en fazla {MAX_SCREENSHOTS} dosya, her biri en fazla 5 MB)
      </label>
      <input
        id={id}
        type="file"
        multiple
        accept={SCREENSHOT_ACCEPT}
        disabled={disabled || full}
        className={fieldClass}
        onChange={(event) => {
          const picked = addScreenshots(files, [...(event.target.files ?? [])])
          setProblems(picked.problems)
          onChange(picked.files)
          // Lets the same file be chosen again after it was removed.
          event.target.value = ''
        }}
      />
      {problems.length > 0 && (
        <Notice tone="error">
          <ul className="space-y-1">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </Notice>
      )}
      {files.length > 0 && (
        <ul className="space-y-1 text-sm" aria-label="Eklenecek ekran görüntüleri">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 break-all">{file.name}</span>
              <span className="text-ink-muted">{formatBytes(file.size)}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((_, other) => other !== index))}
                className="text-sm font-semibold text-red-800 underline disabled:opacity-60"
              >
                Kaldır<span className="sr-only">: {file.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
