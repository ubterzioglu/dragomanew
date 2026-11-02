import { fieldClass } from '../ui'
import { isRecord } from '../../lib/content/docPath'

/** Body blocks: paragraph, two heading levels and bullet lists, no HTML (§9). */

type BlockType = 'p' | 'h2' | 'h3' | 'ul'
export type EditorBlock = { type: 'p' | 'h2' | 'h3'; text: string } | { type: 'ul'; items: string[] }

const BLOCK_LABELS: Readonly<Record<BlockType, string>> = {
  p: 'Paragraf',
  h2: 'Ara başlık',
  h3: 'Alt başlık',
  ul: 'Madde listesi',
}

const smallButton = 'rounded border border-line-strong bg-white px-2 py-1 text-xs font-semibold disabled:opacity-50'

export function toBlocks(value: unknown): EditorBlock[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((block): EditorBlock[] => {
    if (!isRecord(block)) return []
    if (block.type === 'ul') return [{ type: 'ul', items: Array.isArray(block.items) ? block.items.map(String) : [] }]
    if (block.type === 'p' || block.type === 'h2' || block.type === 'h3') return [{ type: block.type, text: String(block.text ?? '') }]
    return []
  })
}

const linesOf = (block: EditorBlock): string => (block.type === 'ul' ? block.items.join('\n') : block.text)

function retype(block: EditorBlock, type: BlockType): EditorBlock {
  const text = linesOf(block)
  return type === 'ul' ? { type, items: text.split('\n') } : { type, text: text.replace(/\n+/g, ' ') }
}

interface BlocksInputProps {
  id: string
  value: unknown
  onChange: (blocks: EditorBlock[]) => void
  invalid: boolean
  describedBy?: string
}

export function BlocksInput({ id, value, onChange, invalid, describedBy }: BlocksInputProps) {
  const blocks = toBlocks(value)
  const replace = (index: number, block: EditorBlock) => onChange(blocks.map((item, i) => (i === index ? block : item)))
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    const a = blocks[index]
    const b = blocks[target]
    if (!a || !b) return
    onChange(blocks.map((item, i) => (i === index ? b : i === target ? a : item)))
  }

  return (
    <div id={id} className="space-y-3" aria-describedby={describedBy}>
      {blocks.map((block, index) => (
        <div key={index} className="rounded-md border border-line p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold">
              <span className="sr-only">{index + 1}. bloğun türü</span>
              <select
                className="rounded border border-line-strong bg-white px-2 py-1 text-xs"
                value={block.type}
                onChange={(event) => replace(index, retype(block, event.target.value as BlockType))}
              >
                {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
                  <option key={type} value={type}>
                    {BLOCK_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className={smallButton} disabled={index === 0} onClick={() => move(index, -1)}>
              Yukarı
            </button>
            <button type="button" className={smallButton} disabled={index === blocks.length - 1} onClick={() => move(index, 1)}>
              Aşağı
            </button>
            <button type="button" className={smallButton} onClick={() => onChange(blocks.filter((_, i) => i !== index))}>
              Sil
            </button>
          </div>
          <label className="block">
            <span className="sr-only">
              {index + 1}. blok: {BLOCK_LABELS[block.type]}
              {block.type === 'ul' ? ' (her satır bir madde)' : ''}
            </span>
            <textarea
              className={`${fieldClass} ${block.type === 'p' || block.type === 'ul' ? 'min-h-24' : 'font-semibold'}`}
              aria-invalid={invalid}
              rows={block.type === 'p' || block.type === 'ul' ? 4 : 1}
              value={linesOf(block)}
              onChange={(event) =>
                replace(index, block.type === 'ul' ? { type: 'ul', items: event.target.value.split('\n') } : { type: block.type, text: event.target.value })
              }
            />
          </label>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
          <button
            key={type}
            type="button"
            className={smallButton}
            onClick={() => onChange([...blocks, type === 'ul' ? { type, items: [''] } : { type, text: '' }])}
          >
            + {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  )
}

/** The Turkish source shown read-only next to a translation. */
export function BlocksPreview({ value }: { value: unknown }) {
  const blocks = toBlocks(value)
  if (blocks.length === 0) return <p className="italic">(boş)</p>
  return (
    <div className="space-y-2">
      {blocks.map((block, index) =>
        block.type === 'ul' ? (
          <ul key={index} className="list-disc pl-5">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={index} className={block.type === 'p' ? '' : 'font-semibold'}>
            {block.text}
          </p>
        ),
      )}
    </div>
  )
}
