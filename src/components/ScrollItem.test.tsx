import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CardItem from './CardItem'
import ListItem from './ListItem'

/* eslint-disable @next/next/no-img-element -- Test double for next/image. */

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

class AspectImage {
  static sources: string[] = []
  height = 100
  onload: (() => void) | null = null
  width = 200

  set src(value: string) {
    AspectImage.sources.push(value)
    this.onload?.()
  }
}

const itemProps = {
  height: 100,
  margin: 8,
  onMouseEnter: vi.fn(),
  onMouseLeave: vi.fn(),
  width: 120,
}

describe('scroll items', () => {
  beforeEach(() => {
    AspectImage.sources = []
    vi.stubGlobal('Image', AspectImage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each([
    ['card', CardItem],
    ['list', ListItem],
  ])('%s item refreshes its measured image when its source changes', (_name, Component) => {
    const { rerender } = render(<Component {...itemProps} image="/first.png" />)
    rerender(<Component {...itemProps} image="/second.png" />)

    expect(AspectImage.sources).toEqual(['/first.png', '/second.png'])
  })
})
