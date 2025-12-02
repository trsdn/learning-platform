import { motion, useReducedMotion } from 'framer-motion';
import styles from './LoadingBar.module.css';

export type LoadingBarVariant = 'indeterminate' | 'shimmer' | 'pulse';
export type LoadingBarSize = 'small' | 'medium' | 'large';

export interface LoadingBarProps {
  /**
   * Visual variant of the loading bar
   */
  variant?: LoadingBarVariant;

  /**
   * Size of the loading bar
   */
  size?: LoadingBarSize;

  /**
   * Custom color for the loading indicator
   */
  color?: string;

  /**
   * Whether loading is active (controls animation)
   */
  isLoading?: boolean;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Loading Bar Component
 *
 * An animated loading indicator for indeterminate progress states.
 * Useful for API calls, answer checking, and AI explanation generation.
 *
 * @example
 * ```tsx
 * // Indeterminate (sliding bar)
 * <LoadingBar variant="indeterminate" />
 *
 * // Shimmer effect
 * <LoadingBar variant="shimmer" size="large" />
 *
 * // Pulse effect
 * <LoadingBar variant="pulse" color="var(--color-primary)" />
 * ```
 */
export function LoadingBar({
  variant = 'indeterminate',
  size = 'medium',
  color = 'var(--color-primary)',
  isLoading = true,
  ariaLabel = 'Laden...',
  className,
}: LoadingBarProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!isLoading) return null;

  const trackClasses = [
    styles['loading-bar__track'],
    styles[`loading-bar__track--${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Animation variants based on type
  const getAnimationProps = () => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0.6 },
        animate: { opacity: [0.6, 1, 0.6] },
        transition: { duration: 1.5, repeat: Infinity, ease: 'linear' as const },
      };
    }

    switch (variant) {
      case 'indeterminate':
        return {
          initial: { x: '-100%' },
          animate: { x: '200%' },
          transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'shimmer':
        return {
          initial: { x: '-100%', opacity: 0 },
          animate: { x: '200%', opacity: [0, 1, 0] },
          transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'pulse':
        return {
          initial: { opacity: 0.4, scaleX: 0.8 },
          animate: { opacity: [0.4, 1, 0.4], scaleX: [0.8, 1, 0.8] },
          transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' as const },
        };
      default:
        return {};
    }
  };

  const fillClasses = [styles['loading-bar__fill'], styles[`loading-bar__fill--${variant}`]]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={trackClasses}
      role="progressbar"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <motion.div
        className={fillClasses}
        // @ts-expect-error -- CSS custom properties not typed in MotionStyle
        // eslint-disable-next-line no-restricted-syntax -- Dynamic color via CSS custom property
        style={{ '--loading-bar-color': color }}
        {...getAnimationProps()}
      />
    </div>
  );
}

export default LoadingBar;
