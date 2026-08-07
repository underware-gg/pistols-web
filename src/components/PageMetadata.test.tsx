import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import PageMetadata from './PageMetadata'

vi.mock('next/head', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

describe('PageMetadata', () => {
  it('keeps canonical and social metadata aligned with the route', () => {
    render(
      <PageMetadata
        title="Pistols at Dawn: Discord Bot"
        description="Settle your disputes in Discord."
        canonicalUrl="https://pistols.gg/discord"
      />,
    )

    expect(document.title).toBe('Pistols at Dawn: Discord Bot')
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://pistols.gg/discord')
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://pistols.gg/discord')
    expect(document.querySelector('meta[name="twitter:url"]')).toHaveAttribute('content', 'https://pistols.gg/discord')
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Pistols at Dawn: Discord Bot')
    expect(document.querySelector('meta[name="twitter:description"]')).toHaveAttribute('content', 'Settle your disputes in Discord.')
  })
})
