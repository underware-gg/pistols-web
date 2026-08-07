import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MouseToolTip } from './MouseToolTip'

const frames: FrameRequestCallback[] = []

describe('MouseToolTip', () => {
  beforeEach(() => {
    frames.length = 0
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1_024 })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('uses the last pointer position when a tooltip appears without another mouse move', () => {
    const { rerender } = render(<MouseToolTip text={null} />)
    fireEvent.mouseMove(document, { clientX: 8, clientY: 80 })

    rerender(<MouseToolTip text="Mute" />)
    const anchor = document.querySelector('#MouseToolTipAnchor') as HTMLDivElement
    Object.defineProperty(anchor, 'offsetWidth', { configurable: true, value: 100 })
    Object.defineProperty(anchor, 'offsetHeight', { configurable: true, value: 20 })

    act(() => {
      frames.shift()?.(0)
      vi.advanceTimersByTime(30)
      frames.shift()?.(16)
    })

    expect(anchor.style.opacity).toBe('1')
    expect(anchor.style.transform).toBe('translate3d(16px, 50px, 0)')
    expect(anchor.style.getPropertyValue('--tooltip-arrow-left')).toBe('10%')
  })
})
