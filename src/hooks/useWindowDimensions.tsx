import { useState, useEffect } from 'react';

function getWindowDimensions() {
  if (typeof window !== 'undefined') {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height
    };
  }

  return { width: 1200, height: 800 };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
