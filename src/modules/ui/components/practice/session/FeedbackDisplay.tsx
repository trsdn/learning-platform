/**
 * FeedbackDisplay Component
 *
 * Displays feedback after answer submission with loading state support.
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { Task } from '@core/types/services';
import { FeedbackCard } from '../../common/FeedbackCard';
import { LoadingBar } from '../../common/LoadingBar';
import { AudioButton } from '../../audio-button';
import styles from '../../practice-session.module.css';

export interface FeedbackDisplayProps {
  /** Whether the answer is correct */
  isCorrect: boolean;
  /** The current task */
  currentTask: Task;
  /** Whether feedback is loading (e.g., checking answer or generating explanation) */
  isLoading?: boolean;
}

/**
 * Feedback display for practice session
 */
export function FeedbackDisplay({ isCorrect, currentTask, isLoading = false }: FeedbackDisplayProps) {
  const shouldReduceMotion = useReducedMotion();

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles['practice-session__feedback']}>
        <div className={styles['practice-session__feedback-loading']}>
          <p className={styles['practice-session__feedback-loading-text']}>
            Antwort wird geprüft...
          </p>
          <LoadingBar variant="shimmer" size="medium" ariaLabel="Antwort wird geprüft" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles['practice-session__feedback']}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }}
    >
      <FeedbackCard
        variant={isCorrect ? 'success' : 'error'}
        title={isCorrect ? 'Richtig!' : 'Nicht ganz richtig'}
      >
        {currentTask.content.explanation && (
          <p className={styles['practice-session__feedback-explanation']}>
            {currentTask.content.explanation}
          </p>
        )}
        {/* Audio button in feedback for language learning */}
        {currentTask.audioUrl && currentTask.type === 'multiple-choice' && (
          <div className={styles['practice-session__feedback-audio']}>
            <span className={styles['practice-session__feedback-audio-label']}>
              Aussprache:
            </span>
            <AudioButton
              text={((currentTask.content as unknown as Record<string, unknown>).options as string[])[(currentTask.content as unknown as Record<string, unknown>).correctAnswer as number] ?? ''}
              audioUrl={currentTask.audioUrl}
              size="small"
            />
          </div>
        )}
      </FeedbackCard>
    </motion.div>
  );
}
