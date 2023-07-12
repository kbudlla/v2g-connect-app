import { useLayoutEffect, useMemo, useState } from 'react';

import { debounce } from 'lodash-es';

export const useResponsiveDimensions = (ref: React.RefObject<HTMLElement>, debounceInterval = 100) => {
  const [boundingBox, setBoundingBox] = useState<DOMRect | undefined>();
  const handleBoundingBoxSizeChange = useMemo(() => debounce(setBoundingBox, debounceInterval), [debounceInterval]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Save initial rect:
    setBoundingBox(element.getBoundingClientRect());

    // Callback for resizes
    const handleResize: ResizeObserverCallback = (entries) => {
      for (const entry of entries) {
        // Skip over any elements we don't watch
        if (entry.target != element) continue;
        handleBoundingBoxSizeChange(element.getBoundingClientRect());
      }
    };

    // Setup resize-observer
    const observer = new ResizeObserver(handleResize);
    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, []);

  return {
    boundingBox,
  };
};
