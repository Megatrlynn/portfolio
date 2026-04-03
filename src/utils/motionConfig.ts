/**
 * Motion configuration utility that respects user preferences
 * Provides safe motion timings and respects prefers-reduced-motion
 */

export const MOTION_DURATION = 0.6;
export const MOTION_DELAY = 0.2;
export const MOTION_STAGGER = 0.1;

/**
 * Check if user prefers reduced motion
 * Returns true if user has enabled reduced motion in system preferences
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get motion config based on user preferences
 * Returns minimal config if reduced motion is preferred, otherwise returns provided config
 */
export const getMotionConfig = (config: any = {}) => {
  if (typeof window === 'undefined') return config;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduced ? { duration: 0 } : config;
};

/**
 * Get safe transition config that respects reduced motion preference
 * For use in animations where you want instant/no animation if reduced motion is enabled
 */
export const getSafeTransition = (normalTransition: any = {}) => {
  if (typeof window === 'undefined') return normalTransition;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduced ? { duration: 0 } : normalTransition;
};

/**
 * Safe animation variants that respect reduced motion
 * Provides meaningful defaults for reduced motion users
 */
export const createSafeVariants = (variants: {
  hidden?: any;
  visible?: any;
}) => {
  if (typeof window === 'undefined') return variants;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
    };
  }
  
  return variants;
};
