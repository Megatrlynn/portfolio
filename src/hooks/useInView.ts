import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  threshold?: number | number[];
  margin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to detect if an element is in the viewport
 * Useful for triggering animations only when section becomes visible
 */
export const useInView = (options: UseInViewOptions = {}) => {
  const { threshold = 0.2, margin = '0px', triggerOnce = false } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setHasBeenInView(true);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else {
          if (!triggerOnce) {
            setInView(false);
          }
        }
      },
      {
        threshold: typeof threshold === 'number' ? threshold : threshold,
        rootMargin: margin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, margin, triggerOnce]);

  return {
    ref,
    inView: triggerOnce ? hasBeenInView : inView,
    hasBeenInView,
  };
};
