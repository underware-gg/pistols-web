import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const tweenApi = vi.hoisted(() => ({ update: vi.fn() }))

vi.mock('@tweenjs/tween.js', () => ({
  update: tweenApi.update,
}))

import { startManagedTween } from './tweenScheduler'

describe('startManagedTween', () => {
  const frames: FrameRequestCallback[] = []

  beforeEach(() => {
    frames.length = 0
    tweenApi.update.mockReset()
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shares one animation frame scheduler across started tweens', () => {
    const firstTween = { start: vi.fn() }
    const secondTween = { start: vi.fn() }
    tweenApi.update.mockReturnValue(false)

    startManagedTween(firstTween as never)
    startManagedTween(secondTween as never)

    expect(firstTween.start).toHaveBeenCalledOnce()
    expect(secondTween.start).toHaveBeenCalledOnce()
    expect(requestAnimationFrame).toHaveBeenCalledOnce()

    frames.shift()?.(250)

    expect(tweenApi.update).toHaveBeenCalledWith(250)
  })
})
