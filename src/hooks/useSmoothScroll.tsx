import { useRef } from 'react';

export default function useSmoothScroll() {
  const totalDistanceLeft = useRef(0);
  const isScrolling = useRef(false);
  const currentStep = useRef(0);

  const lastEventTime = useRef(Date.now());
  const accumulatedDeltaY = useRef(0);
  const scrollEvents = useRef<number[]>([]);

  function smoothScrollBy(event: any) {
    if (scrollEvents.current.length == 0) {
        accumulatedDeltaY.current = 0;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastEventTime.current;
      const directionChanged = accumulatedDeltaY.current * event.deltaY < 0;

      lastEventTime.current = currentTime;
      accumulatedDeltaY.current += event.deltaY;
      
      scrollEvents.current.push(event.deltaY);
      if (scrollEvents.current.length > 3) {
        scrollEvents.current.shift();
      }

      if (timeDiff > 500 || directionChanged) {
        scrollEvents.current = [];
        accumulatedDeltaY.current = event.deltaY;
      } else if (scrollEvents.current.length == 3) {
        const averageDeltaY = scrollEvents.current.reduce((a, b) => a + b, 0) / scrollEvents.current.length;
        smoothScroll(averageDeltaY * 2.2, directionChanged);
        
        scrollEvents.current = [];
      }
  }

  function smoothScroll(deltaY: number, directionChange: boolean = false) {
    if (directionChange) {
      totalDistanceLeft.current = 0;
    }
    totalDistanceLeft.current += deltaY;

    if (!isScrolling.current) {
      isScrolling.current = true;
      requestAnimationFrame(scrollStep);
    }
  }

  function scrollStep() {
    if (Math.abs(totalDistanceLeft.current) < Math.abs(currentStep.current)) {
      currentStep.current = totalDistanceLeft.current;
    } else {
      currentStep.current = totalDistanceLeft.current / 25;
    }

    window.scrollBy({ top: currentStep.current, behavior: 'instant' });
    totalDistanceLeft.current -= currentStep.current;

    if (Math.abs(totalDistanceLeft.current) > 1 && Math.abs(currentStep.current) > 0.1) {
      requestAnimationFrame(scrollStep);
    } else {
      isScrolling.current = false;
      totalDistanceLeft.current = 0;
      currentStep.current = 0;
    }
  }

  return smoothScrollBy;
};
