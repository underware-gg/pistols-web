import { useState, useEffect, RefObject } from 'react';

/**
 * Hook to measure a component's rendered dimensions (width and height)
 * 
 * @param ref RefObject to the element being measured
 * @returns Object containing the width and height of the referenced element
 */
const useContentDimensions = <T extends HTMLElement>(ref: RefObject<T>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const updateDimensions = () => {
      if (!ref.current) return;
      
      const newWidth = ref.current.offsetWidth;
      const newHeight = ref.current.offsetHeight;
      
      if (newWidth !== dimensions.width || newHeight !== dimensions.height) {
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    // Initial measurement
    updateDimensions();

    // Set up resize observer to track size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(ref.current);

    // Also listen to window resize
    window.addEventListener('resize', updateDimensions);

    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, [ref, dimensions.width, dimensions.height]);

  return dimensions;
};

export default useContentDimensions;