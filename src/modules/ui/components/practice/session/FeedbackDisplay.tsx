/**
 * FeedbackDisplay Component
 *
 * Displays feedback after answer submission.
 */

import type { Task } from '@core/types/services';
import { FeedbackCard } from '../../common/FeedbackCard';
import { AudioButton } from '../../audio-button';
import styles from '../../practice-session.module.css';

export interface FeedbackDisplayProps {
  /** Whether the answer is correct */
  isCorrect: boolean;
  /** The current task */
  currentTask: Task;
}

/**
 * Feedback display for practice session
 */
export function FeedbackDisplay({ isCorrect, currentTask }: FeedbackDisplayProps) {
  return (
    <div className={styles['practice-session__feedback']}>
      <FeedbackCard
        variant={isCorrect ? 'success' : 'error'}
        title={isCorrect ? 'Richtig!' : 'Nicht ganz richtig'}
      >
        {currentTask.content.explanation && (
          <p style={{ margin: 0 }}>{currentTask.content.explanation}</p>
        )}
        {/* Audio button in feedback for language learning */}
        {currentTask.audioUrl && currentTask.type === 'multiple-choice' && (
          <div
            style={{
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              Aussprache:
            </span>
            <AudioButton
              text={(currentTask.content as any).options[(currentTask.content as any).correctAnswer]}
              audioUrl={currentTask.audioUrl}
              size="small"
            />
          </div>
        )}
      </FeedbackCard>
    </div>
  );
}
