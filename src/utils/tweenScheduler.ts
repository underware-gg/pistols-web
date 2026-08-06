import * as TWEEN from '@tweenjs/tween.js'

let animationFrameId: number | null = null

const scheduleUpdate = () => {
  if (animationFrameId !== null) return
  animationFrameId = requestAnimationFrame(updateTweens)
}

const updateTweens = (time: number) => {
  animationFrameId = null
  if (TWEEN.update(time)) scheduleUpdate()
}

export const startManagedTween = <T extends Record<string, unknown>>(tween: TWEEN.Tween<T>) => {
  tween.start()
  scheduleUpdate()
  return tween
}
