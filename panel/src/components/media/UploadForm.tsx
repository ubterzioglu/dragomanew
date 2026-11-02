import { useState } from 'react'
import { prepareImage, uploadMedia, UploadRefused, type PreparedImage } from '../../data/media/media'
import { contentErrorMessage } from '../../lib/content/messages'
import { ACCEPT_ATTRIBUTE, fileProblem, isMediaId, uniqueId } from '../../lib/media/upload'
import { slugify } from '../../shared/content/translation.ts'
import { Button, Card, fieldClass, labelClass, Notice } from '../ui'

interface UploadFormProps {
  takenIds: readonly string[]
  onUploaded: (message: string) => void
}

interface Picked {
  name: string
  image: PreparedImage
}

/**
 * Browser upload (§9): pick → decode with EXIF orientation → size rules → JPEG master (EXIF/GPS
 * stripped) → sha256 → media-originals/<id>/<sha>.jpg → row. Alt text, topic and the rights box
 * are required before the upload starts.
 */
export function UploadForm({ takenIds, onUploaded }: UploadFormProps) {
  const [picked, setPicked] = useState<Picked | null>(null)
  const [id, setId] = useState('')
  const [altTr, setAltTr] = useState('')
  const [topic, setTopic] = useState('')
  const [rights, setRights] = useState(false)
  const [busy, setBusy] = useState<'prepare' | 'upload' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const taken = new Set(takenIds)
  const idProblem = id && !isMediaId(id) ? 'Kısa ad yalnız küçük harf, rakam ve tire içerebilir.' : taken.has(id) ? 'Bu kısa ad kullanılıyor.' : null
  const ready = picked && id && !idProblem && altTr.trim() && topic.trim() && rights

  const choose = async (file: File | undefined) => {
    setPicked(null)
    setError(null)
    if (!file) return
    const problem = fileProblem(file)
    if (problem) {
      setError(problem)
      return
    }
    setBusy('prepare')
    try {
      const image = await prepareImage(file)
      setPicked({ name: file.name, image })
      setId(uniqueId(slugify(file.name.replace(/\.[^.]+$/, '')), taken))
    } catch (prepareError) {
      setError(prepareError instanceof UploadRefused ? prepareError.message : 'Fotoğraf işlenemedi.')
    } finally {
      setBusy(null)
    }
  }

  const upload = async () => {
    if (!picked || !ready) return
    setBusy('upload')
    setError(null)
    try {
      await uploadMedia({ id, image: picked.image, altTr: altTr.trim(), topic: topic.trim() })
      setPicked(null)
      setId('')
      setAltTr('')
      setTopic('')
      setRights(false)
      onUploaded(`${id} yüklendi.`)
    } catch (uploadError) {
      setError(contentErrorMessage(uploadError))
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Fotoğraf yükle</h2>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          void upload()
        }}
      >
        <label className={`${labelClass} md:col-span-2`}>
          Dosya (JPEG, PNG, WebP, AVIF, HEIC; en fazla 40 MB)
          <input
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            className={fieldClass}
            disabled={busy !== null}
            onChange={(event) => void choose(event.target.files?.[0])}
          />
        </label>
        {busy === 'prepare' && <p role="status" className="text-sm md:col-span-2">Fotoğraf hazırlanıyor…</p>}
        {picked && (
          <div className="space-y-1 text-sm md:col-span-2" role="status">
            <p>
              {picked.name}: {picked.image.width}×{picked.image.height} JPEG, {(picked.image.blob.size / 1024 / 1024).toFixed(1)} MB olarak
              yüklenecek (konum ve kamera bilgileri silindi).
            </p>
            {picked.image.warnings.map((warning) => (
              <p key={warning} className="text-brand-orange-ink">
                Uyarı: {warning}
              </p>
            ))}
          </div>
        )}
        <label className={labelClass}>
          Kısa ad
          <input className={fieldClass} value={id} aria-invalid={idProblem !== null} onChange={(event) => setId(event.target.value)} />
          {idProblem && <span className="mt-1 block text-xs text-red-800">{idProblem}</span>}
        </label>
        <label className={labelClass}>
          Konu (ör. dalış, kano, kaş)
          <input className={fieldClass} value={topic} onChange={(event) => setTopic(event.target.value)} />
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          Açıklama (Türkçe alt metin; diğer diller sonra çevrilir)
          <input className={fieldClass} value={altTr} onChange={(event) => setAltTr(event.target.value)} />
        </label>
        <label className="flex items-start gap-2 text-sm font-medium md:col-span-2">
          <input type="checkbox" className="mt-1" checked={rights} onChange={(event) => setRights(event.target.checked)} required />
          Kullanım hakkımız var (zorunlu)
        </label>
        {error && (
          <div className="md:col-span-2">
            <Notice tone="error">{error}</Notice>
          </div>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={!ready || busy !== null}>
            {busy === 'upload' ? 'Yükleniyor…' : 'Yükle'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
