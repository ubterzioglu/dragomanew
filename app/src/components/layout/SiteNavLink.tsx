import { createContext, useContext } from 'react'
import { NavLink, type NavLinkProps } from 'react-router-dom'

/**
 * True on a 404 page. The host serves the same 404 HTML for every missing address, and
 * React keeps the server's attributes when it hydrates, so on that page no link may count
 * as current by address: the highlight would otherwise stay wrong on the next page.
 */
const NotFoundPageContext = createContext(false)
export const NotFoundPageProvider = NotFoundPageContext.Provider

/**
 * NavLink for the site navigation. On a 404 page it matches only the exact address, case
 * included, which a missing address never is, so nothing shows as current. It stays the same
 * element either way, so a focused link keeps focus when the visitor leaves the 404 page.
 */
export function SiteNavLink({ end, caseSensitive, ...props }: NavLinkProps) {
  const onNotFoundPage = useContext(NotFoundPageContext)
  return <NavLink {...props} end={onNotFoundPage || end} caseSensitive={onNotFoundPage || caseSensitive} />
}
