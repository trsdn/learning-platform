/**
 * SessionHeader Component
 *
 * Displays session title, task counter, progress bar, and cancel button.
 */

import type { Task } from '@core/types/services';
import styles from '../../practice-session.module.css';

export interface SessionHeaderProps {
  /** Current task index (0-based) */
  currentTaskIndex: number;
  /** Total number of tasks */
  totalTasks: number;
  /** Current task (for displaying ID) */
  currentTask: Task | null;
  /** Progress percentage (0-100) */
  progress: number;
  /** Callback when cancel button is clicked */
  onCancel: () => void;
}

/**
 * Header component for practice session
 */
export function SessionHeader({
  currentTaskIndex,
  totalTasks,
  currentTask,
  progress,
  onCancel,
}: SessionHeaderProps) {
  return (
    <div className={styles['practice-session__header']}>
      <div className={styles['practice-session__header-top']}>
        <div className={styles['practice-session__header-left']}>
          <h2 className={styles['practice-session__title']}>Übungssitzung</h2>
          <span className={styles['practice-session__task-counter']}>
            {currentTaskIndex + 1}/{totalTasks}
          </span>
          {currentTask && (
            <span className={styles['practice-session__task-id']}>
              ID: {currentTask.id}
            </span>
          )}
        </div>
        <button
          onClick={onCancel}
          className={styles['practice-session__cancel-btn']}
        >
          Abbrechen
        </button>
      </div>

      {/* Progress bar */}
      <div className={styles['practice-session__progress-bar']}>
        <div
          className={styles['practice-session__progress-fill']}
          // eslint-disable-next-line no-restricted-syntax -- Dynamic width based on progress
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
