import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import generateCloudComponents from './Cloud'

/* eslint-disable @next/next/no-img-element -- Test double for Semantic UI's image wrapper. */

vi.mock('semantic-ui-react', () => ({
  Image: ({ alt, className, draggable, src }: { alt: string; className?: string; draggable?: boolean; src: string }) => (
    <img alt={alt} className={className} draggable={draggable} src={src} />
  ),
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('generateCloudComponents', () => {
  it('creates one CSS-animated cloud per requested slot without runtime listeners', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const { container } = render(
      <>{generateCloudComponents(3, { min: 10, max: 20 }, { min: 100, max: 200 }, { min: 5, max: 15 }, { min: 1, max: 3 }, { min: 0.2, max: 0.8 })}</>,
    )

    const clouds = container.querySelectorAll('.LandingCloud')
    expect(clouds).toHaveLength(3)
    expect(Array.from(container.querySelectorAll('img'), (image) => image.getAttribute('src'))).toEqual([
      '/images/cloud_1.png',
      '/images/cloud_2.png',
      '/images/cloud_3.png',
    ])
    const style = clouds[0].getAttribute('style') ?? ''
    expect(style).toContain('width: 150px')
    expect(style).toContain('top: 10vh')
    expect(style).toContain('z-index: 2')
    expect(style).toContain('--cloud-duration: 15s')
    expect(style).toContain('--cloud-x-6: calc(0px + 100vw)')
  })
})
