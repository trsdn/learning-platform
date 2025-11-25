/**
 * SessionStats Component
 *
 * Displays session statistics (completed, correct, accuracy).
 */

import type { PracticeSession } from '@core/types/services';
import styles from '../../practice-session.module.css';

export interface SessionStatsProps {
  /** The current practice session */
  session: PracticeSession;
}

/**
 * Statistics display for practice session
 */
export function SessionStats({ session }: SessionStatsProps) {
  const accuracy =
    session.execution.completedCount > 0
      ? Math.round((session.execution.correctCount / session.execution.completedCount) * 100)
      : 0;

  return (
    <div className={styles['practice-session__stats']}>
      <div className={styles['practice-session__stat']}>
        <div
          className={`${styles['practice-session__stat-value']} ${styles['practice-session__stat-value--completed']}`}
        >
          {session.execution.completedCount}
        </div>
        <div className={styles['practice-session__stat-label']}>beantwortet</div>
      </div>
      <div className={styles['practice-session__stat']}>
        <div
          className={`${styles['practice-session__stat-value']} ${styles['practice-session__stat-value--correct']}`}
        >
          {session.execution.correctCount}
        </div>
        <div className={styles['practice-session__stat-label']}>richtig</div>
      </div>
      <div className={styles['practice-session__stat']}>
        <div
          className={`${styles['practice-session__stat-value']} ${styles['practice-session__stat-value--accuracy']}`}
        >
          {accuracy}%
        </div>
        <div className={styles['practice-session__stat-label']}>genau</div>
      </div>
    </div>
  );
}
