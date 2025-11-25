/**
 * Multiple Select Task Component
 *
 * Displays checkboxes for selecting multiple correct answers from a list of options.
 */

import React from 'react';
import type { Task, MultipleSelectContent } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { Checkbox } from '../../../forms';
import { useMultipleSelect } from './use-multiple-select';
import styles from '../../../practice-session.module.css';

interface MultipleSelectTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
}

export function MultipleSelectTask({
  task,
  showFeedback,
  isCorrect: _isCorrect,
  audioConfig: _audioConfig,
  onAnswerChange,
}: MultipleSelectTaskProps) {
  const { selectedOptions, cursor, toggleOption, setCursor, canSubmit } =
    useMultipleSelect(task, showFeedback);

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  if (task.type !== 'multiple-select') return null;

  const content = task.content as MultipleSelectContent;

  return (
    <div className={styles['practice-session__ms-container']}>
      <div className={styles['practice-session__ms-instruction']}>
        Wähle alle zutreffenden Antworten
      </div>
      <div className={styles['practice-session__ms-options']}>
        {content.options.map((option, index) => {
          const isSelected = selectedOptions.has(index);
          const isCorrectAnswer = content.correctAnswers.includes(index);
          const isFocused = !showFeedback && cursor === index;
          let statusIcon = '';

          if (showFeedback) {
            if (isCorrectAnswer) {
              statusIcon = isSelected ? '✓' : '○';
            } else if (isSelected && !isCorrectAnswer) {
              statusIcon = '✗';
            }
          }

          const optionClasses = [
            styles['practice-session__ms-option'],
            isFocused && styles['practice-session__ms-option--focused'],
            showFeedback &&
              isCorrectAnswer &&
              styles['practice-session__ms-option--correct'],
            showFeedback &&
              isSelected &&
              !isCorrectAnswer &&
              styles['practice-session__ms-option--incorrect'],
            !showFeedback &&
              isSelected &&
              styles['practice-session__ms-option--selected'],
          ]
            .filter(Boolean)
            .join(' ');

          const iconClass = isCorrectAnswer
            ? styles['practice-session__ms-status-icon--correct']
            : styles['practice-session__ms-status-icon--incorrect'];

          return (
            <div
              key={index}
              className={optionClasses}
              onMouseEnter={() => setCursor(index)}
            >
              <Checkbox
                checked={isSelected}
                onChange={() => {
                  toggleOption(index);
                  setCursor(index);
                }}
                disabled={showFeedback}
                label={
                  <span className={styles['practice-session__ms-option-label']}>
                    {option}
                  </span>
                }
                error={showFeedback && isSelected && !isCorrectAnswer}
                success={showFeedback && isCorrectAnswer && isSelected}
                style={{ flex: 1 }}
              />
              {showFeedback && statusIcon && (
                <span
                  className={`${styles['practice-session__ms-status-icon']} ${iconClass}`}
                >
                  {statusIcon}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Re-export hook for convenience
export { useMultipleSelect } from './use-multiple-select';
