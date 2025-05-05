import { useEffect, useCallback, useState } from 'react'

export const useAspectSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const aspectWidth = useCallback((value: number) => {
    return value * windowSize.height / 100
  }, [windowSize.height])

  const aspectHeight = useCallback((value: number) => {
    return value * windowSize.height / 100
  }, [windowSize.height])

  return { aspectWidth, aspectHeight }
}