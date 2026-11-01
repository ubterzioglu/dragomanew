import { createContext, useContext, type ReactNode } from 'react'
import type { ContentRepository } from './repository'

const ContentContext = createContext<ContentRepository | null>(null)

export function ContentProvider({ repository, children }: { repository: ContentRepository; children: ReactNode }) {
  return <ContentContext.Provider value={repository}>{children}</ContentContext.Provider>
}

/** Templates read content only through this hook (swap the provider in Stage B). */
export function useContent(): ContentRepository {
  const repository = useContext(ContentContext)
  if (!repository) throw new Error('useContent() used outside <ContentProvider>')
  return repository
}
