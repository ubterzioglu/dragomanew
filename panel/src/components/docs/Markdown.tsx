import { Children, createContext, isValidElement, useContext, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { Link } from 'react-router'
import remarkGfm from 'remark-gfm'
import { slugify } from '../../lib/docs/slug'

/**
 * Renders our own Markdown as React elements with Tailwind classes. No raw HTML (no rehype-raw),
 * no style attributes, so it stays inside the panel's CSP (style-src 'self'; script-src 'self').
 */

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return Children.toArray(node).map(textOf).join('')
}

/** Prefix for heading ids and #links, so two documents on one page never share an id. */
const PrefixContext = createContext('')

const HEADING_CLASSES = {
  2: 'mt-8 scroll-mt-24 text-lg font-bold text-ink first:mt-0',
  3: 'mt-6 scroll-mt-24 text-base font-semibold text-ink',
  4: 'mt-4 scroll-mt-24 text-sm font-semibold text-ink',
} as const

function Heading({ level, children }: { level: 2 | 3 | 4; children?: ReactNode }) {
  const idPrefix = useContext(PrefixContext)
  const id = `${idPrefix}${slugify(textOf(children))}`
  const Tag = `h${level}` as const
  return (
    <Tag id={id} className={HEADING_CLASSES[level]}>
      {children}
    </Tag>
  )
}

const LINK_CLASS = 'font-medium text-sea underline underline-offset-2 hover:text-brand-green'

function MarkdownLink({ href = '', children }: { href?: string; children?: ReactNode }) {
  const idPrefix = useContext(PrefixContext)
  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link to={href} className={LINK_CLASS}>
        {children}
      </Link>
    )
  }
  if (href.startsWith('#')) {
    return (
      <a href={`#${idPrefix}${href.slice(1)}`} className={LINK_CLASS}>
        {children}
      </a>
    )
  }
  return (
    <a href={href} className={LINK_CLASS} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  )
}

const COMPONENTS: Components = {
  // The page has its own <h1>; a `#` inside the Markdown is shown one level lower.
  h1: ({ children }) => <Heading level={2}>{children}</Heading>,
  h2: ({ children }) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }) => <Heading level={3}>{children}</Heading>,
  h4: ({ children }) => <Heading level={4}>{children}</Heading>,
  p: ({ children }) => <p className="mt-3 leading-relaxed first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1.5 pl-6 marker:text-brand-green">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mt-3 list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-brand-green">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  a: ({ href, children }) => <MarkdownLink href={href}>{children}</MarkdownLink>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mt-4 rounded-r-md border-l-4 border-brand-orange bg-brand-orange-soft px-4 py-3 text-ink">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className={`${className} font-mono text-[0.8125rem]`}>{children}</code>
    ) : (
      <code className="rounded bg-brand-green-soft px-1.5 py-0.5 font-mono text-[0.8125rem] text-brand-green-dark">
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-md bg-ink px-4 py-3 text-sm leading-relaxed text-white [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-white">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-line" />,
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-md border border-line">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-sand-deep">{children}</thead>,
  th: ({ children }) => <th className="border-b border-line px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-line px-3 py-2 align-top">{children}</td>,
}

const PLUGINS = [remarkGfm]

export function Markdown({ children, idPrefix = '' }: { children: string; idPrefix?: string }) {
  return (
    <PrefixContext.Provider value={idPrefix}>
      <div className="text-sm text-ink">
        <ReactMarkdown remarkPlugins={PLUGINS} components={COMPONENTS}>
          {children}
        </ReactMarkdown>
      </div>
    </PrefixContext.Provider>
  )
}
