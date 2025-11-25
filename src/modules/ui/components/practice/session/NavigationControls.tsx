/**
 * NavigationControls Component
 *
 * Displays action buttons for submitting answers and navigating tasks.
 */

import type { PracticeSession, Task } from '@core/types/services';
import styles from '../../practice-session.module.css';

export interface NavigationControlsProps {
  /** The current practice session */
  session: PracticeSession;
  /** The current task */
  currentTask: Task;
  /** Current task index (0-based) */
  currentTaskIndex: number;
  /** Whether feedback is being shown */
  showFeedback: boolean;
  /** Whether the user can submit their answer */
  canSubmit: boolean;
  /** Callback when answer is submitted */
  onSubmit: () => void;
  /** Callback when task is skipped */
  onSkip: () => void;
  /** Callback when next task is requested */
  onNext: () => void;
  /** Callback when session should be completed */
  onComplete: () => void;
}

/**
 * Navigation controls for practice session
 */
export function NavigationControls({
  session,
  currentTask,
  currentTaskIndex,
  showFeedback,
  canSubmit,
  onSubmit,
  onSkip,
  onNext,
  onComplete,
}: NavigationControlsProps) {
  const isLastTask = currentTaskIndex >= (session.execution.taskIds?.length || 0) - 1;

  return (
    <div className={styles['practice-session__actions']}>
      {!showFeedback ? (
        <>
          {/* Hide "Antwort überprüfen" for flashcards - they use self-assessment */}
          {currentTask?.type !== 'flashcard' && (
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className={
                canSubmit
                  ? `${styles['practice-session__btn-submit']} ${styles['practice-session__btn-submit--enabled']}`
                  : `${styles['practice-session__btn-submit']} ${styles['practice-session__btn-submit--disabled']}`
              }
            >
              Antwort überprüfen
            </button>
          )}
          <button onClick={isLastTask ? onComplete : onSkip} className={styles['practice-session__btn-skip']}>
            {isLastTask ? 'Sitzung beenden' : 'Überspringen →'}
          </button>
        </>
      ) : (
        /* Hide "Nächste Aufgabe" for flashcards - they auto-advance */
        currentTask?.type !== 'flashcard' && (
          <button onClick={isLastTask ? onComplete : onNext} className={styles['practice-session__btn-next']}>
            {isLastTask ? 'Sitzung beenden' : 'Nächste Aufgabe →'}
          </button>
        )
      )}
    </div>
  );
}
