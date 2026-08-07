import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { smoothScrollToPercentage } from './smoothScroll'

describe('smoothScrollToPercentage', () => {
  const frames: FrameRequestCallback[] = []
  const scrollTo = vi.fn()
  const onComplete = vi.fn()

  beforeEach(() => {
    frames.length = 0
    scrollTo.mockReset()
    onComplete.mockReset()

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 100 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 200 })
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2_200 })
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo })
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('eases to the requested scroll percentage and completes once', () => {
    smoothScrollToPercentage(0.5, 1_000, onComplete)

    frames.shift()?.(0)
    frames.shift()?.(500)
    frames.shift()?.(1_000)

    expect(scrollTo).toHaveBeenNthCalledWith(1, { top: 100, behavior: 'instant' })
    expect(scrollTo).toHaveBeenNthCalledWith(2, { top: 550, behavior: 'instant' })
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 1_000, behavior: 'instant' })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('cancels the scheduled animation without completing it', () => {
    const cancel = smoothScrollToPercentage(0.5, 1_000, onComplete)
    const scheduledFrame = frames[0]

    cancel()
    scheduledFrame(0)

    expect(cancelAnimationFrame).toHaveBeenCalledWith(1)
    expect(scrollTo).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
