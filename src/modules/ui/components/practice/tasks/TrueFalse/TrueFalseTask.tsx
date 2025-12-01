/**
 * True/False Task Component
 *
 * Displays a statement and true/false buttons for user selection.
 */

import React from 'react';
import type { Task, TrueFalseContent } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { useTrueFalse } from './use-true-false';
import styles from '../../../practice-session.module.css';

interface TrueFalseTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
}

export function TrueFalseTask({
  task,
  showFeedback,
  isCorrect,
  audioConfig: _audioConfig,
  onAnswerChange,
}: TrueFalseTaskProps) {
  const { answer, setAnswer, canSubmit } = useTrueFalse(task, showFeedback);

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  if (task.type !== 'true-false') return null;

  const content = task.content as TrueFalseContent;

  const handleAnswerClick = (value: boolean) => {
    if (showFeedback) return;
    setAnswer(value);
  };

  return (
    <div className={styles['practice-session__tf-container']}>
      <div className={styles['practice-session__tf-statement']}>
        {content.statement}
      </div>
      <div className={styles['practice-session__tf-buttons']}>
        {[true, false].map((value) => {
          const isSelected = answer === value;
          const isCorrectAnswer = value === content.correctAnswer;
          const isIncorrectSelection = showFeedback && isSelected && !isCorrect;

          const btnClasses = [
            styles['practice-session__tf-button'],
            showFeedback &&
              isCorrectAnswer &&
              styles['practice-session__tf-button--correct'],
            isIncorrectSelection &&
              styles['practice-session__tf-button--incorrect'],
            !showFeedback &&
              isSelected &&
              styles['practice-session__tf-button--selected'],
            showFeedback && styles['practice-session__tf-button--disabled'],
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={value.toString()}
              onClick={() => handleAnswerClick(value)}
              disabled={showFeedback}
              className={btnClasses}
              aria-label={value ? 'Richtig' : 'Falsch'}
              aria-pressed={isSelected}
            >
              {value ? 'Richtig' : 'Falsch'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Re-export hook for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useTrueFalse } from './use-true-false';
