import type { Block } from '../../content/schema'

interface RichTextProps {
  blocks: readonly Block[]
  className?: string
}

/**
 * Renders structured body blocks as plain React elements. Content never carries
 * HTML, so there is nothing to sanitise and nothing that can inject markup.
 */
export function RichText({ blocks, className = '' }: RichTextProps) {
  return (
    <div className={`space-y-4 text-base leading-relaxed text-ink md:text-lg ${className}`}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`
        switch (block.type) {
          case 'p':
            return <p key={key}>{block.text}</p>
          case 'h2':
            return (
              <h2 key={key} className="pt-4 text-2xl font-bold text-brand-green md:text-3xl">
                {block.text}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={key} className="pt-2 text-xl font-semibold">
                {block.text}
              </h3>
            )
          case 'ul':
            return (
              <ul key={key} className="list-disc space-y-1.5 pl-6 marker:text-brand-orange">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
        }
      })}
    </div>
  )
}
