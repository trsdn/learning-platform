/**
 * Cloze Deletion Task Component
 *
 * Displays text with blanks that users must fill in.
 */

import React from 'react';
import type { Task, ClozeDeletionContent } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { Input } from '../../../forms';
import { useClozeDeletion } from './use-cloze-deletion';
import styles from '../../../practice-session.module.css';

interface ClozeDeletionTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
}

export function ClozeDeletionTask({
  task,
  showFeedback,
  isCorrect: _isCorrect,
  audioConfig: _audioConfig,
  onAnswerChange,
}: ClozeDeletionTaskProps) {
  const { blankAnswers, setBlankAnswer, canSubmit } = useClozeDeletion(
    task,
    showFeedback
  );

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  if (task.type !== 'cloze-deletion') return null;

  const content = task.content as ClozeDeletionContent;

  // Split text by {{blank}} markers
  const parts = content.text.split(/\{\{blank\}\}/g);

  return (
    <div className={styles['practice-session__cloze-container']}>
      <div className={styles['practice-session__cloze-text']}>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < content.blanks.length && (() => {
              const userAnswer = blankAnswers[i]?.trim().toLowerCase() || '';
              const blank = content.blanks[i]!;
              const isCorrectAnswer =
                userAnswer === blank.correctAnswer.toLowerCase() ||
                blank.alternatives
                  ?.map((a) => a.toLowerCase())
                  .includes(userAnswer);
              const hasAnswer = blankAnswers[i]?.trim() !== '';

              return (
                <Input
                  value={blankAnswers[i] || ''}
                  onChange={(e) => {
                    setBlankAnswer(i, e.target.value);
                  }}
                  disabled={showFeedback}
                  error={
                    showFeedback && hasAnswer && !isCorrectAnswer ? true : false
                  }
                  success={showFeedback && isCorrectAnswer ? true : false}
                  className={styles['practice-session__cloze-input']}
                />
              );
            })()}
          </span>
        ))}
      </div>
      {showFeedback && (
        <div className={styles['practice-session__cloze-feedback']}>
          <div className={styles['practice-session__cloze-feedback-title']}>
            Richtige Antworten:
          </div>
          {content.blanks.map((blank, i) => {
            const userAnswer = blankAnswers[i]?.trim().toLowerCase() || '';
            const isCorrectAnswer =
              userAnswer === blank.correctAnswer.toLowerCase() ||
              blank.alternatives
                ?.map((a) => a.toLowerCase())
                .includes(userAnswer);
            const answerClass = isCorrectAnswer
              ? styles['practice-session__cloze-answer--correct']
              : styles['practice-session__cloze-answer--neutral'];
            return (
              <div
                key={i}
                className={`${styles['practice-session__cloze-answer']} ${answerClass}`}
              >
                Lücke {i + 1}:{' '}
                <strong
                  className={styles['practice-session__cloze-answer-correct']}
                >
                  {blank.correctAnswer}
                </strong>
                {blank.alternatives && blank.alternatives.length > 0 && (
                  <span className={styles['practice-session__cloze-alternatives']}>
                    {' '}
                    (auch richtig: {blank.alternatives.join(', ')})
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Re-export hook for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useClozeDeletion } from './use-cloze-deletion';
