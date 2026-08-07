import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import useWindowDimensions from './useWindowDimensions'

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
}

describe('useWindowDimensions', () => {
  beforeEach(() => {
    setViewport(1_280, 720)
  })

  afterEach(() => {
    setViewport(1_024, 768)
  })

  it('uses the current viewport and tracks resize events', () => {
    const { result } = renderHook(() => useWindowDimensions())

    expect(result.current).toEqual({ width: 1_280, height: 720 })

    act(() => {
      setViewport(390, 844)
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toEqual({ width: 390, height: 844 })
  })
})
