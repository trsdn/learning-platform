import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { motion, useReducedMotion } from 'framer-motion';
import 'react-circular-progressbar/dist/styles.css';
import styles from './CircularProgress.module.css';

export type CircularProgressSize = 'small' | 'medium' | 'large';

export interface CircularProgressProps {
  /**
   * Current progress value (0-100 by default, or 0-max if max is specified)
   */
  value: number;

  /**
   * Maximum value for progress calculation (default: 100)
   */
  max?: number;

  /**
   * Size preset or custom size in pixels
   */
  size?: CircularProgressSize | number;

  /**
   * Width of the progress stroke
   */
  strokeWidth?: number;

  /**
   * Color of the progress path
   */
  pathColor?: string;

  /**
   * Color of the background trail
   */
  trailColor?: string;

  /**
   * Whether to show the percentage value in center
   */
  showValue?: boolean;

  /**
   * Custom center content (overrides showValue)
   */
  children?: React.ReactNode;

  /**
   * Disable animation
   */
  disableAnimation?: boolean;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;

  /**
   * Additional CSS class name
   */
  className?: string;
}

const SIZE_MAP: Record<CircularProgressSize, number> = {
  small: 48,
  medium: 80,
  large: 120,
};

const STROKE_WIDTH_MAP: Record<CircularProgressSize, number> = {
  small: 10,
  medium: 8,
  large: 6,
};

/**
 * Returns the appropriate color based on progress percentage
 */
function getProgressColor(percentage: number): string {
  if (percentage >= 75) return 'var(--color-success)';
  if (percentage >= 50) return 'var(--color-warning)';
  return 'var(--color-error)';
}

/**
 * Circular Progress Component
 *
 * A circular progress indicator with smooth animations and customizable styling.
 * Uses react-circular-progressbar under the hood with Framer Motion for entrance.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CircularProgress value={75} />
 *
 * // With custom content
 * <CircularProgress value={3} max={10}>
 *   <span>3/10</span>
 * </CircularProgress>
 *
 * // Large size with custom color
 * <CircularProgress value={100} size="large" pathColor="var(--color-primary)" />
 * ```
 */
export function CircularProgress({
  value,
  max = 100,
  size = 'medium',
  strokeWidth,
  pathColor,
  trailColor = 'var(--color-bg-tertiary)',
  showValue = true,
  children,
  disableAnimation = false,
  ariaLabel,
  className,
}: CircularProgressProps) {
  const shouldReduceMotion = useReducedMotion();
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const resolvedSize = typeof size === 'number' ? size : SIZE_MAP[size];
  const resolvedStrokeWidth =
    strokeWidth ?? (typeof size === 'number' ? 8 : STROKE_WIDTH_MAP[size]);
  const resolvedPathColor = pathColor || getProgressColor(percentage);
  const skipAnimation = disableAnimation || shouldReduceMotion;

  // Compute actual color values from CSS variables for the library
  const computedStyles = buildStyles({
    pathColor: resolvedPathColor,
    trailColor,
    textColor: 'var(--color-text-primary)',
    pathTransitionDuration: skipAnimation ? 0.01 : 0.5,
    strokeLinecap: 'round',
  });

  const containerClasses = [styles['circular-progress'], className].filter(Boolean).join(' ');

  return (
    <motion.div
      className={containerClasses}
      // eslint-disable-next-line no-restricted-syntax -- Dynamic size from props
      style={{ width: resolvedSize, height: resolvedSize }}
      initial={skipAnimation ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        skipAnimation
          ? { duration: 0 }
          : { type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }
      }
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel || `Fortschritt: ${Math.round(percentage)}%`}
    >
      <CircularProgressbar
        value={percentage}
        text={!children && showValue ? `${Math.round(percentage)}%` : ''}
        strokeWidth={resolvedStrokeWidth}
        styles={computedStyles}
      />
      {children && <div className={styles['circular-progress__content']}>{children}</div>}
    </motion.div>
  );
}

export default CircularProgress;
