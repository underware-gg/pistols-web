import { act, render } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { DuelistSprite, type DuelistSpriteHandle } from './DuelistSprite'

describe('DuelistSprite', () => {
  it('updates atlas coordinates in place instead of replacing an image element', () => {
    const ref = createRef<DuelistSpriteHandle>()
    const { container, getByRole } = render(
      <DuelistSprite ref={ref} alt="Female duelist" duelist="female" initialAnimation="idle" initialFrame={1} />,
    )

    act(() => ref.current?.setFrame('shoot', 999))

    const sprite = getByRole('img', { name: 'Female duelist' })
    expect(container.querySelectorAll('img')).toHaveLength(0)
    expect(sprite).toHaveAttribute('data-animation', 'shoot')
    expect(sprite).toHaveAttribute('data-frame', '1')
    expect((sprite as HTMLDivElement).style.backgroundImage).toContain('female-shoot.png')
    expect(ref.current?.getFrame()).toEqual({ animation: 'shoot', frame: 1 })
  })
})
