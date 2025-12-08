import { motion, useReducedMotion } from 'framer-motion';
import type { LearningPath } from '@core/types/services';
import { ProgressBar } from './common/ProgressBar';
import styles from './LearningPathCard.module.css';

export interface LearningPathProgress {
  /**
   * Number of tasks completed
   */
  completedTasks: number;
  /**
   * Number of tasks mastered (efactor >= 2.5)
   */
  masteredTasks: number;
  /**
   * Overall accuracy percentage
   */
  accuracy: number;
}

export interface LearningPathCardProps {
  /**
   * The learning path data
   */
  learningPath: LearningPath;

  /**
   * Total number of tasks in the learning path
   */
  taskCount: number;

  /**
   * User's progress on this learning path (optional)
   */
  progress?: LearningPathProgress;

  /**
   * Callback when the card is clicked
   */
  onSelect: (pathId: string) => void;

  /**
   * Whether the card should animate on mount
   */
  animate?: boolean;

  /**
   * Animation delay index for staggered animations
   */
  animationIndex?: number;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Learning Path Card Component
 *
 * Displays a learning path with title, description,
 * task count, and optional progress indicator.
 *
 * @example
 * ```tsx
 * <LearningPathCard
 *   learningPath={path}
 *   taskCount={15}
 *   progress={{ completedTasks: 10, masteredTasks: 5, accuracy: 85 }}
 *   onSelect={(id) => startLearningPath(id)}
 * />
 * ```
 */
export function LearningPathCard({
  learningPath,
  taskCount,
  progress,
  onSelect,
  animate = true,
  animationIndex = 0,
  className,
}: LearningPathCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const skipAnimation = !animate || shouldReduceMotion;

  const hasProgress = progress && progress.completedTasks > 0;
  const completionPercentage = taskCount > 0 ? (progress?.completedTasks ?? 0) / taskCount * 100 : 0;
  const isCompleted = progress && progress.completedTasks >= taskCount;

  const cardClasses = [
    styles['learning-path-card'],
    isCompleted && styles['learning-path-card--completed'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    onSelect(learningPath.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(learningPath.id);
    }
  };

  return (
    <motion.div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${learningPath.title} - ${taskCount} Aufgaben`}
      initial={skipAnimation ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        skipAnimation
          ? { duration: 0 }
          : { type: 'spring', stiffness: 100, damping: 15, delay: animationIndex * 0.1 }
      }
      whileHover={skipAnimation ? {} : { scale: 1.02 }}
      whileTap={skipAnimation ? {} : { scale: 0.98 }}
    >
      {/* Header with completion badge */}
      {isCompleted && (
        <div className={styles['learning-path-card__header']}>
          <span className={styles['learning-path-card__completed-badge']}>
            ✓ Abgeschlossen
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className={styles['learning-path-card__title']}>{learningPath.title}</h3>

      {/* Description */}
      <p className={styles['learning-path-card__description']}>{learningPath.description}</p>

      {/* Meta info */}
      <div className={styles['learning-path-card__meta']}>
        <span className={styles['learning-path-card__task-count']}>
          📝 {taskCount} Aufgaben
        </span>
      </div>

      {/* Progress bar (only if user has started) */}
      {hasProgress && (
        <div className={styles['learning-path-card__progress']}>
          <div className={styles['learning-path-card__progress-header']}>
            <span className={styles['learning-path-card__progress-label']}>Fortschritt</span>
            <span className={styles['learning-path-card__progress-value']}>
              {progress.completedTasks}/{taskCount}
            </span>
          </div>
          <ProgressBar
            value={completionPercentage}
            size="small"
            showLabel={false}
            ariaLabel={`Fortschritt: ${Math.round(completionPercentage)}%`}
          />
          {progress.accuracy > 0 && (
            <span className={styles['learning-path-card__accuracy']}>
              Genauigkeit: {Math.round(progress.accuracy)}%
            </span>
          )}
        </div>
      )}

      {/* Start button indicator */}
      <div className={styles['learning-path-card__action']}>
        <span className={styles['learning-path-card__action-text']}>
          {hasProgress ? 'Fortsetzen' : 'Starten'} →
        </span>
      </div>
    </motion.div>
  );
}

export default LearningPathCard;
