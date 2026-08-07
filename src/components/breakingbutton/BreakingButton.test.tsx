import { act, render, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BreakingButton } from './BreakingButton'

class PreloadImage {
  static sources: string[] = []
  onerror: (() => void) | null = null
  onload: (() => void) | null = null

  decode = vi.fn(() => Promise.resolve())

  set src(value: string) {
    PreloadImage.sources.push(value)
    queueMicrotask(() => this.onload?.())
  }
}

describe('BreakingButton', () => {
  beforeEach(() => {
    PreloadImage.sources = []
    vi.stubGlobal('Image', PreloadImage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('preloads every fragment before the one-shot break interaction', async () => {
    const ref = createRef<{ breakButton: () => void }>()
    const { container } = render(<BreakingButton ref={ref} title="Play" style={{}} onClick={vi.fn()} />)

    await waitFor(() => expect(PreloadImage.sources).toHaveLength(15))
    expect(PreloadImage.sources).toContain('/images/buttonpieces/button_broken.svg')
    expect(PreloadImage.sources).not.toContain('/images/buttonpieces/button.svg')

    act(() => ref.current?.breakButton())

    await waitFor(() => {
      expect(container.querySelector('img[alt="button_broken"]')).toBeInTheDocument()
      expect(container.querySelectorAll('img')).toHaveLength(31)
    })
  })
})
