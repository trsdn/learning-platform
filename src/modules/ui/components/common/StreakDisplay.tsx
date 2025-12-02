import { motion, useReducedMotion } from 'framer-motion';
import { CircularProgress } from './CircularProgress';
import styles from './StreakDisplay.module.css';

export type StreakDisplaySize = 'compact' | 'standard' | 'large';

export interface StreakDisplayProps {
  /**
   * Current consecutive days streak
   */
  currentStreak: number;

  /**
   * Best streak achieved
   */
  bestStreak: number;

  /**
   * Next milestone to reach
   */
  nextMilestone: number;

  /**
   * Progress towards next milestone (0-100)
   */
  progressToMilestone: number;

  /**
   * Whether the streak is still active
   */
  isStreakActive?: boolean;

  /**
   * Display size variant
   */
  size?: StreakDisplaySize;

  /**
   * Whether to show milestone progress circle
   */
  showMilestoneProgress?: boolean;

  /**
   * Additional CSS class name
   */
  className?: string;
}

const SIZE_CONFIG = {
  compact: { circleSize: 48, fontSize: 'sm' },
  standard: { circleSize: 80, fontSize: 'md' },
  large: { circleSize: 120, fontSize: 'lg' },
} as const;

/**
 * Streak Display Component
 *
 * Shows the user's current learning streak with milestone progress.
 * Features a circular progress indicator and fire emoji animation.
 *
 * @example
 * ```tsx
 * <StreakDisplay
 *   currentStreak={15}
 *   bestStreak={23}
 *   nextMilestone={30}
 *   progressToMilestone={50}
 *   showMilestoneProgress
 * />
 * ```
 */
export function StreakDisplay({
  currentStreak,
  bestStreak,
  nextMilestone,
  progressToMilestone,
  isStreakActive = true,
  size = 'standard',
  showMilestoneProgress = true,
  className,
}: StreakDisplayProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = SIZE_CONFIG[size];

  const containerClasses = [
    styles['streak-display'],
    styles[`streak-display--${size}`],
    !isStreakActive && styles['streak-display--inactive'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const daysUntilMilestone = nextMilestone - currentStreak;

  return (
    <div className={containerClasses}>
      {/* Circular progress with streak count */}
      {showMilestoneProgress ? (
        <CircularProgress
          value={progressToMilestone}
          size={config.circleSize}
          pathColor={isStreakActive ? 'var(--color-warning)' : 'var(--color-text-secondary)'}
          disableAnimation={shouldReduceMotion ?? false}
        >
          <motion.span
            className={styles['streak-display__fire']}
            animate={
              shouldReduceMotion || !isStreakActive
                ? {}
                : {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }
            }
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            🔥
          </motion.span>
        </CircularProgress>
      ) : (
        <motion.span
          className={styles['streak-display__fire-large']}
          animate={
            shouldReduceMotion || !isStreakActive
              ? {}
              : {
                  scale: [1, 1.1, 1],
                }
          }
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          🔥
        </motion.span>
      )}

      {/* Streak info */}
      <div className={styles['streak-display__info']}>
        <span className={styles['streak-display__count']}>
          {currentStreak} {currentStreak === 1 ? 'Tag' : 'Tage'}
        </span>
        <span className={styles['streak-display__label']}>Tagesstreak</span>

        {showMilestoneProgress && daysUntilMilestone > 0 && (
          <span className={styles['streak-display__milestone']}>
            Noch {daysUntilMilestone} {daysUntilMilestone === 1 ? 'Tag' : 'Tage'} bis{' '}
            {nextMilestone} Tage!
          </span>
        )}

        {bestStreak > currentStreak && (
          <span className={styles['streak-display__best']}>
            🏆 Bester: {bestStreak} Tage
          </span>
        )}

        {!isStreakActive && currentStreak === 0 && (
          <span className={styles['streak-display__inactive']}>
            Starte heute deinen Streak!
          </span>
        )}

        {!isStreakActive && currentStreak > 0 && (
          <span className={styles['streak-display__inactive']}>
            Lerne heute um deinen Streak fortzusetzen!
          </span>
        )}
      </div>
    </div>
  );
}

export default StreakDisplay;
