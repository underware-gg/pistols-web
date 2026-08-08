import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DuelistSprite, type DuelistSpriteHandle } from './DuelistSprite'

function installControlledDecode() {
  const resolveDecodes = new Map<HTMLImageElement, () => void>()

  vi.mocked(HTMLImageElement.prototype.decode).mockImplementation(function decode(this: HTMLImageElement) {
    return new Promise<void>((resolve) => {
      resolveDecodes.set(this, resolve)
    })
  })

  return {
    resolveDecode: (image: HTMLImageElement) => resolveDecodes.get(image)?.(),
  }
}

describe('DuelistSprite', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLImageElement.prototype, 'decode', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    })
  })

  afterEach(() => {
    delete (HTMLImageElement.prototype as Partial<HTMLImageElement>).decode
  })

  it('moves the rendered atlas in place for frames in the same animation', () => {
    const ref = createRef<DuelistSpriteHandle>()
    const { container, getByRole } = render(
      <DuelistSprite ref={ref} alt="Female duelist" duelist="female" initialAnimation="idle" initialFrame={1} />,
    )

    const sprite = getByRole('img', { name: 'Female duelist' })
    const atlasLayers = container.querySelectorAll<HTMLImageElement>('[data-duelist-atlas-layer]')
    const activeAtlas = atlasLayers[0]

    act(() => ref.current?.setFrame('idle', 2))

    expect(atlasLayers).toHaveLength(2)
    expect(activeAtlas.src).toContain('female-idle.png')
    expect(activeAtlas.style.transform).toContain('-25%')
    expect(sprite).toHaveAttribute('data-animation', 'idle')
    expect(sprite).toHaveAttribute('data-frame', '2')
    expect(ref.current?.getFrame()).toEqual({ animation: 'idle', frame: 2 })
  })

  it('keeps the rendered current atlas visible until the incoming layer itself loads and decodes', async () => {
    const imageDecode = installControlledDecode()
    const ref = createRef<DuelistSpriteHandle>()
    const { container, getByRole } = render(
      <DuelistSprite ref={ref} alt="Female duelist" duelist="female" initialAnimation="idle" initialFrame={1} />,
    )

    const sprite = getByRole('img', { name: 'Female duelist' })
    const [activeAtlas, stagingAtlas] = Array.from(
      container.querySelectorAll<HTMLImageElement>('[data-duelist-atlas-layer]'),
    )
    const poster = container.querySelector<HTMLImageElement>('[data-duelist-poster]')!

    act(() => ref.current?.setFrame('twosteps', 1))

    expect(activeAtlas.src).toContain('female-idle.png')
    expect(activeAtlas.style.opacity).toBe('1')
    expect(stagingAtlas.src).toContain('female-twosteps.png')
    expect(stagingAtlas.style.opacity).toBe('0')
    expect(sprite).toHaveAttribute('data-animation', 'idle')

    fireEvent.load(stagingAtlas)
    expect(activeAtlas.style.opacity).toBe('1')
    expect(stagingAtlas.style.opacity).toBe('0')

    await act(async () => imageDecode.resolveDecode(stagingAtlas))

    expect(activeAtlas.style.opacity).toBe('0')
    expect(stagingAtlas.style.opacity).toBe('1')
    expect(poster.style.opacity).toBe('0')
    expect(sprite).toHaveAttribute('data-animation', 'twosteps')
    expect(ref.current?.getFrame()).toEqual({ animation: 'twosteps', frame: 1 })
  })

  it('applies the latest requested frame when a pending atlas becomes ready', async () => {
    const imageDecode = installControlledDecode()
    const ref = createRef<DuelistSpriteHandle>()
    const { container, getByRole } = render(
      <DuelistSprite ref={ref} alt="Male duelist" duelist="male" initialAnimation="idle" initialFrame={1} />,
    )
    const [, stagingAtlas] = Array.from(
      container.querySelectorAll<HTMLImageElement>('[data-duelist-atlas-layer]'),
    )

    act(() => {
      ref.current?.setFrame('twosteps', 1)
      ref.current?.setFrame('twosteps', 4)
    })
    fireEvent.load(stagingAtlas)
    await act(async () => imageDecode.resolveDecode(stagingAtlas))

    expect(getByRole('img', { name: 'Male duelist' })).toHaveAttribute('data-frame', '4')
    expect(stagingAtlas.style.transform).toContain('-75%')
    expect(ref.current?.getFrame()).toEqual({ animation: 'twosteps', frame: 4 })
  })

  it('retries a staging atlas after its previous load failed', async () => {
    const ref = createRef<DuelistSpriteHandle>()
    const { container } = render(
      <DuelistSprite ref={ref} alt="Female duelist" duelist="female" initialAnimation="idle" initialFrame={1} />,
    )
    const [, stagingAtlas] = Array.from(
      container.querySelectorAll<HTMLImageElement>('[data-duelist-atlas-layer]'),
    )

    act(() => ref.current?.setFrame('twosteps', 1))
    fireEvent.error(stagingAtlas)
    await act(async () => {})
    Object.defineProperties(stagingAtlas, {
      complete: { configurable: true, value: true },
      naturalWidth: { configurable: true, value: 0 },
    })
    const removeAttribute = vi.spyOn(stagingAtlas, 'removeAttribute')

    act(() => ref.current?.setFrame('twosteps', 1))

    expect(removeAttribute).toHaveBeenCalledWith('src')
    expect(stagingAtlas.src).toContain('female-twosteps.png')
  })

  it('keeps an initial-frame poster until the rendered idle atlas decodes', async () => {
    const imageDecode = installControlledDecode()
    const { container, getByRole } = render(
      <DuelistSprite alt="Male duelist" duelist="male" initialAnimation="idle" initialFrame={1} />,
    )

    const sprite = getByRole('img', { name: 'Male duelist' })
    const activeAtlas = container.querySelector<HTMLImageElement>('[data-duelist-atlas-layer="active"]')!
    const poster = container.querySelector<HTMLImageElement>('[data-duelist-poster]')!
    expect(activeAtlas.src).toContain('/images/duelist/sprites/male-idle.png')
    expect(poster.src).toContain('/images/duelist/male/idle/frame_001.png')
    expect(poster.style.opacity).toBe('1')

    fireEvent.load(activeAtlas)
    expect(poster.style.opacity).toBe('1')

    await act(async () => imageDecode.resolveDecode(activeAtlas))

    await waitFor(() => expect(poster.style.opacity).toBe('0'))
    expect(sprite).toHaveAttribute('data-animation', 'idle')
  })
})
