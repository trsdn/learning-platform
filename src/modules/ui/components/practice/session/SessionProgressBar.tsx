import { motion, useReducedMotion } from 'framer-motion';
import styles from './SessionProgressBar.module.css';

export type TaskResult = 'correct' | 'incorrect' | 'skipped' | 'pending';

export interface SessionProgressBarProps {
  /**
   * Current task index (0-based)
   */
  currentIndex: number;

  /**
   * Total number of tasks in the session
   */
  totalTasks: number;

  /**
   * Whether to show individual task markers
   */
  showTaskMarkers?: boolean;

  /**
   * Results for each task (for coloring markers)
   */
  taskResults?: TaskResult[];

  /**
   * Whether to animate the progress bar
   */
  animate?: boolean;

  /**
   * Callback when animation completes
   */
  onAnimationComplete?: () => void;

  /**
   * Additional CSS class name
   */
  className?: string;
}

const RESULT_COLORS: Record<TaskResult, string> = {
  correct: 'var(--color-success)',
  incorrect: 'var(--color-error)',
  skipped: 'var(--color-warning)',
  pending: 'var(--color-bg-tertiary)',
};

/**
 * Session Progress Bar Component
 *
 * An enhanced progress bar for practice sessions with task markers
 * and animated transitions.
 *
 * @example
 * ```tsx
 * <SessionProgressBar
 *   currentIndex={3}
 *   totalTasks={10}
 *   showTaskMarkers
 *   taskResults={['correct', 'correct', 'incorrect', 'pending', ...]}
 * />
 * ```
 */
export function SessionProgressBar({
  currentIndex,
  totalTasks,
  showTaskMarkers = false,
  taskResults = [],
  animate = true,
  onAnimationComplete,
  className,
}: SessionProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const skipAnimation = !animate || shouldReduceMotion;
  const progress = totalTasks > 0 ? ((currentIndex + 1) / totalTasks) * 100 : 0;

  const containerClasses = [styles['session-progress'], className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Main progress track */}
      <div
        className={styles['session-progress__track']}
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={0}
        aria-valuemax={totalTasks}
        aria-label={`Aufgabe ${currentIndex + 1} von ${totalTasks}`}
      >
        <motion.div
          className={styles['session-progress__fill']}
          initial={skipAnimation ? { width: `${progress}%` } : { width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={
            skipAnimation
              ? { duration: 0 }
              : { type: 'spring', stiffness: 100, damping: 20, mass: 1 }
          }
          {...(onAnimationComplete && { onAnimationComplete })}
        />
      </div>

      {/* Task markers */}
      {showTaskMarkers && totalTasks <= 20 && (
        <div className={styles['session-progress__markers']}>
          {Array.from({ length: totalTasks }, (_, index) => {
            const result = taskResults[index] || 'pending';
            const isCurrent = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <motion.div
                key={index}
                className={[
                  styles['session-progress__marker'],
                  isCurrent && styles['session-progress__marker--current'],
                  isCompleted && styles['session-progress__marker--completed'],
                ]
                  .filter(Boolean)
                  .join(' ')}
                // eslint-disable-next-line no-restricted-syntax -- Dynamic color based on task result
                style={{
                  backgroundColor: isCompleted ? RESULT_COLORS[result] : undefined,
                }}
                initial={skipAnimation ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={
                  skipAnimation ? { duration: 0 } : { delay: index * 0.05, type: 'spring' }
                }
                title={`Aufgabe ${index + 1}${isCompleted ? ` - ${result}` : ''}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SessionProgressBar;
