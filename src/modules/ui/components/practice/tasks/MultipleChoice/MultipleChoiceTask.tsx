/**
 * Multiple Choice Task Component
 *
 * Displays a multiple choice question with shuffled options.
 * Handles user selection and visual feedback.
 */

import React from 'react';
import type { Task } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { AudioButton } from '../../../audio-button';
import { useMultipleChoice } from './use-multiple-choice';
import styles from '../../../practice-session.module.css';

interface MultipleChoiceTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
}

export function MultipleChoiceTask({
  task,
  showFeedback,
  isCorrect,
  audioConfig,
  onAnswerChange,
}: MultipleChoiceTaskProps) {
  const {
    selectedAnswer,
    shuffledOptions,
    shuffledIndices,
    correctAnswerIndex,
    optionCursor,
    setSelectedAnswer,
    setOptionCursor,
    canSubmit,
  } = useMultipleChoice(task, showFeedback);

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  if (task.type !== 'multiple-choice') return null;

  const content = task.content as any;

  const handleOptionClick = (index: number) => {
    if (showFeedback) return;
    setOptionCursor(index);
    setSelectedAnswer(index);
  };

  return (
    <div className={styles['practice-session__mc-options']}>
      {shuffledOptions.map((option, index) => {
        const isFocused = !showFeedback && optionCursor === index;
        const isSelected = selectedAnswer === index;
        const isCorrectOption = index === correctAnswerIndex;
        const isIncorrectSelection = showFeedback && isSelected && !isCorrect;

        const optionClasses = [
          styles['practice-session__mc-option'],
          showFeedback && isCorrectOption && styles['practice-session__mc-option--correct'],
          isIncorrectSelection && styles['practice-session__mc-option--incorrect'],
          !showFeedback && isSelected && styles['practice-session__mc-option--selected'],
          isFocused && styles['practice-session__mc-option--focused'],
          showFeedback && styles['practice-session__mc-option--disabled'],
        ]
          .filter(Boolean)
          .join(' ');

        // Get the audio URL for this option if available
        // Use the original index from shuffledIndices to get the correct audio
        const originalIndex = shuffledIndices[index];
        const optionAudioUrl =
          content.optionsAudio &&
          originalIndex !== undefined &&
          content.optionsAudio[originalIndex]
            ? `${import.meta.env.BASE_URL}audio/${content.optionsAudio[originalIndex]}`
            : null;

        return (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            disabled={showFeedback}
            className={optionClasses}
            onMouseEnter={() => setOptionCursor(index)}
            aria-label={`Option ${index + 1}: ${option}`}
            aria-pressed={isSelected}
          >
            <span>{option}</span>
            {optionAudioUrl && (
              <AudioButton text={option} audioUrl={optionAudioUrl} size="small" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Re-export hook for convenience
export { useMultipleChoice } from './use-multiple-choice';
