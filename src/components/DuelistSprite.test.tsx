import { act, render, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DuelistSprite, type DuelistSpriteHandle } from './DuelistSprite'

describe('DuelistSprite', () => {
  const originalImage = globalThis.Image

  beforeEach(() => {
    class ImmediatelyDecodedImage {
      src = ''
      decode() {
        return Promise.resolve()
      }
    }

    globalThis.Image = ImmediatelyDecodedImage as unknown as typeof Image
  })

  afterEach(() => {
    globalThis.Image = originalImage
  })

  it('updates atlas coordinates in place instead of replacing an image element', async () => {
    const ref = createRef<DuelistSpriteHandle>()
    const { container, getByRole } = render(
      <DuelistSprite ref={ref} alt="Female duelist" duelist="female" initialAnimation="idle" initialFrame={1} />,
    )

    act(() => ref.current?.setFrame('shoot', 999))

    const sprite = getByRole('img', { name: 'Female duelist' })
    expect(container.querySelectorAll('img')).toHaveLength(1)
    await waitFor(() => expect(sprite).toHaveAttribute('data-animation', 'shoot'))
    expect(sprite).toHaveAttribute('data-animation', 'shoot')
    expect(sprite).toHaveAttribute('data-frame', '1')
    expect((sprite as HTMLDivElement).style.backgroundImage).toContain('female-shoot.png')
    expect(ref.current?.getFrame()).toEqual({ animation: 'shoot', frame: 1 })
  })

  it('keeps the existing frame visible until a new atlas is decoded', async () => {
    const resolveDecodes = new Map<string, () => void>()

    class DelayedImage {
      private source = ''

      set src(source: string) {
        this.source = source
      }

      decode() {
        return new Promise<void>((resolve) => {
          resolveDecodes.set(this.source, resolve)
        })
      }
    }

    globalThis.Image = DelayedImage as unknown as typeof Image
    const ref = createRef<DuelistSpriteHandle>()
    const { getByRole } = render(
      <DuelistSprite ref={ref} alt="Female duelist" duelist="female" initialAnimation="idle" initialFrame={1} />,
    )

    const sprite = getByRole('img', { name: 'Female duelist' }) as HTMLDivElement
    act(() => ref.current?.setFrame('twosteps', 1))

    expect(sprite.style.backgroundImage).toContain('female-idle.png')
    expect(sprite).toHaveAttribute('data-animation', 'idle')

    await act(async () => resolveDecodes.get('/images/duelist/sprites/female-twosteps.png?v=2')?.())

    expect(sprite.style.backgroundImage).toContain('female-twosteps.png')
    expect(sprite).toHaveAttribute('data-animation', 'twosteps')
  })

  it('keeps an initial-frame poster over the sprite until the idle atlas is decoded', async () => {
    const resolveDecodes = new Map<string, () => void>()

    class DelayedImage {
      private source = ''

      set src(source: string) {
        this.source = source
      }

      decode() {
        return new Promise<void>((resolve) => {
          resolveDecodes.set(this.source, resolve)
        })
      }
    }

    globalThis.Image = DelayedImage as unknown as typeof Image
    const { getByRole, getByAltText } = render(
      <DuelistSprite alt="Female duelist" duelist="female" initialAnimation="idle" initialFrame={1} />,
    )

    const sprite = getByRole('img', { name: 'Female duelist' })
    const poster = getByAltText('') as HTMLImageElement
    expect(poster.src).toContain('/images/duelist/female/idle/frame_001.png')
    expect(poster.style.opacity).toBe('1')

    await act(async () => resolveDecodes.get('/images/duelist/sprites/female-idle.png?v=2')?.())

    await waitFor(() => expect(poster.style.opacity).toBe('0'))
    expect(sprite).toHaveAttribute('data-animation', 'idle')
  })
})
