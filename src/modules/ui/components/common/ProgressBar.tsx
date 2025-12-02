import { motion, useReducedMotion } from 'framer-motion';
import styles from './ProgressBar.module.css';

export type ProgressBarVariant = 'default' | 'gradient' | 'striped' | 'animated-striped';
export type ProgressBarSize = 'small' | 'medium' | 'large';
export type ProgressBarLabelPosition = 'inside' | 'outside' | 'top';

export interface ProgressBarProps {
  /**
   * Current progress value (0-100 by default, or 0-max if max is specified)
   */
  value: number;

  /**
   * Maximum value for progress calculation (default: 100)
   */
  max?: number;

  /**
   * Visual variant of the progress bar
   */
  variant?: ProgressBarVariant;

  /**
   * Size of the progress bar track
   */
  size?: ProgressBarSize;

  /**
   * Custom color for the progress fill (overrides auto-color)
   */
  color?: string;

  /**
   * Whether to show the percentage label
   */
  showLabel?: boolean;

  /**
   * Position of the label
   */
  labelPosition?: ProgressBarLabelPosition;

  /**
   * Custom label format function
   */
  formatLabel?: (value: number, max: number) => string;

  /**
   * Disable animation (useful for reduced motion preferences)
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

/**
 * Returns the appropriate color based on progress percentage
 */
function getProgressColor(percentage: number): string {
  if (percentage >= 75) return 'var(--color-success)';
  if (percentage >= 50) return 'var(--color-warning)';
  return 'var(--color-error)';
}

/**
 * Animated Progress Bar Component
 *
 * A versatile progress bar with smooth animations, multiple variants,
 * and full accessibility support.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ProgressBar value={75} />
 *
 * // With label
 * <ProgressBar value={5} max={10} showLabel labelPosition="top" />
 *
 * // Striped variant
 * <ProgressBar value={60} variant="striped" size="large" />
 *
 * // Custom color
 * <ProgressBar value={100} color="var(--color-primary)" />
 * ```
 */
export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'medium',
  color,
  showLabel = false,
  labelPosition = 'outside',
  formatLabel,
  disableAnimation = false,
  ariaLabel,
  className,
}: ProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const fillColor = color || getProgressColor(percentage);
  const skipAnimation = disableAnimation || shouldReduceMotion;

  const defaultFormatLabel = (val: number, maxVal: number) => {
    if (maxVal === 100) return `${Math.round(val)}%`;
    return `${val}/${maxVal}`;
  };

  const label = formatLabel ? formatLabel(value, max) : defaultFormatLabel(value, max);

  const trackClasses = [
    styles['progress-bar__track'],
    styles[`progress-bar__track--${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const fillClasses = [
    styles['progress-bar__fill'],
    variant !== 'default' && styles[`progress-bar__fill--${variant}`],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['progress-bar']}>
      {showLabel && labelPosition === 'top' && (
        <div className={styles['progress-bar__label-top']}>
          <span>{label}</span>
        </div>
      )}

      <div className={styles['progress-bar__container']}>
        {showLabel && labelPosition === 'outside' && (
          <span className={styles['progress-bar__label-outside']}>{label}</span>
        )}

        <div
          className={trackClasses}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={ariaLabel || `Fortschritt: ${label}`}
        >
          <motion.div
            className={fillClasses}
            initial={skipAnimation ? { width: `${percentage}%` } : { width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={
              skipAnimation
                ? { duration: 0 }
                : { type: 'spring', stiffness: 100, damping: 15, mass: 1 }
            }
            // eslint-disable-next-line no-restricted-syntax -- Dynamic color from props
            style={{ backgroundColor: fillColor }}
          >
            {showLabel && labelPosition === 'inside' && percentage > 15 && (
              <span className={styles['progress-bar__label-inside']}>{label}</span>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
