import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ViewportVideo from './ViewportVideo'

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this)
  }

  disconnect = vi.fn()
  observe = vi.fn()
  takeRecords = vi.fn(() => [])
  unobserve = vi.fn()
  root = null
  rootMargin = '0px'
  thresholds = []
}

describe('ViewportVideo', () => {
  const load = vi.fn()
  const pause = vi.fn()
  const play = vi.fn(() => Promise.resolve())

  beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(load)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause)
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('loads near the viewport, plays while visible, and pauses when hidden', async () => {
    const { container } = render(<ViewportVideo src="/images/comick.mp4" aria-label="Comic" />)
    const video = container.querySelector('video')

    expect(video).toHaveAttribute('preload', 'none')
    expect(video).not.toHaveAttribute('src')
    expect(MockIntersectionObserver.instances).toHaveLength(2)
    expect(MockIntersectionObserver.instances[0].options).toEqual({ rootMargin: '200px 0px' })

    MockIntersectionObserver.instances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    MockIntersectionObserver.instances[1].callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)

    await waitFor(() => {
      expect(video).toHaveAttribute('src', '/images/comick.mp4')
      expect(load).toHaveBeenCalledTimes(1)
      expect(play).toHaveBeenCalledTimes(1)
    })

    MockIntersectionObserver.instances[1].callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver)

    await waitFor(() => expect(pause).toHaveBeenCalledTimes(1))
  })
})
