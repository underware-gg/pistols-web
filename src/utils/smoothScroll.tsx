function smoothScrollToPercentage(targetPercentage: number, duration = 1000, onComplete: (() => void) | null = null) {
  const start = window.scrollY;
  const windowHeight = window.innerHeight;
  const scrollHeight = document.documentElement.scrollHeight - windowHeight;
  const target = scrollHeight * targetPercentage;

  let animationFrameId: number | null = null;
  let startTime: number | null = null;
  let cancelled = false;

  function complete() {
    if (!cancelled) onComplete?.();
  }

  function animation(currentTime: number) {
    if (cancelled) return;
    if (startTime === null) startTime = currentTime;

    const timeElapsed = currentTime - startTime;
    const progress = duration <= 0 ? 1 : Math.min(timeElapsed / duration, 1);
    const nextScrollPosition = start + (target - start) * easeInOutQuart(progress);
    window.scrollTo({ top: nextScrollPosition, behavior: "instant" });

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animation);
    } else {
      animationFrameId = null;
      complete();
    }
  }

  animationFrameId = requestAnimationFrame(animation);

  return () => {
    cancelled = true;
    if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  };
}

function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export { smoothScrollToPercentage };
