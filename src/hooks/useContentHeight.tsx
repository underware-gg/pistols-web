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
    const element = ref.current;
    if (!element) return;

    const updateDimensions = () => {
      const width = element.offsetWidth;
      const height = element.offsetHeight;

      setDimensions(current => (
        current.width === width && current.height === height
          ? current
          : { width, height }
      ));
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return dimensions;
};

export default useContentDimensions;
