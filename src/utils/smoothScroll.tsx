function smoothScrollToPercentage(targetPercentage: number, duration = 1000, onComplete: (() => void) | null = null) {
    const start = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight - windowHeight;
    const target = scrollHeight * targetPercentage;

    let startTime: number;

    function animation(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const nextScrollPosition = start + (target - start) * easeInOutQuart(progress);
      window.scrollTo({ top: nextScrollPosition, behavior: "instant"  });

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else if (onComplete) {
        onComplete();
      }
    }

    requestAnimationFrame(animation);
  }

  function easeInOutQuart(t: number) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  export { smoothScrollToPercentage }