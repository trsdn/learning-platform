import { motion, useReducedMotion } from 'framer-motion';
import styles from './MasteryBar.module.css';

export interface MasteryBarProps {
  /**
   * Label displayed above the progress bar
   */
  label: string;

  /**
   * Count value displayed
   */
  count: number;

  /**
   * Color of the progress bar
   */
  color: string;

  /**
   * Maximum count for calculating percentage
   * If not provided, bar shows as full when count > 0
   */
  max?: number;

  /**
   * Whether to animate the progress bar on mount
   */
  animate?: boolean;
}

/**
 * Mastery Bar Component
 *
 * Displays a labeled progress indicator for mastery levels.
 * Used in the dashboard to show progress across different mastery categories.
 * Now with Framer Motion animations!
 *
 * @example
 * ```tsx
 * <MasteryBar
 *   label="Gemeistert"
 *   count={12}
 *   max={50}
 *   color={colors.success[500]}
 * />
 * ```
 */
export function MasteryBar({ label, count, color, max, animate = true }: MasteryBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const skipAnimation = !animate || shouldReduceMotion;
  const percentage = max && max > 0 ? (count / max) * 100 : count > 0 ? 100 : 0;

  return (
    <div className={styles['mastery-bar']}>
      <div className={styles['mastery-bar__header']}>
        <span className={styles['mastery-bar__label']}>
          {label}
        </span>
        <span className={styles['mastery-bar__count']}>
          {count}
        </span>
      </div>
      <div className={styles['mastery-bar__track']}>
        <motion.div
          className={styles['mastery-bar__fill']}
          initial={skipAnimation ? { width: `${percentage}%` } : { width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={
            skipAnimation
              ? { duration: 0 }
              : { type: 'spring', stiffness: 100, damping: 15, mass: 1 }
          }
          // @ts-expect-error -- CSS custom properties not typed in MotionStyle
          // eslint-disable-next-line no-restricted-syntax -- Dynamic color via CSS custom property
          style={{ '--mastery-bar-color': color }}
        />
      </div>
    </div>
  );
}

export default MasteryBar;
