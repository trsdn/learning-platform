/**
 * Text Input Task Component
 *
 * Displays a text input field for free-form text answers.
 */

import React from 'react';
import type { Task, TextInputContent } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { AudioButton } from '../../../audio-button';
import { Input } from '../../../forms';
import { useTextInput } from './use-text-input';
import styles from '../../../practice-session.module.css';

interface TextInputTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
  onSubmit?: () => void;
}

export function TextInputTask({
  task,
  showFeedback,
  isCorrect,
  audioConfig: _audioConfig,
  onAnswerChange,
  onSubmit,
}: TextInputTaskProps) {
  const { answer, setAnswer, canSubmit } = useTextInput(task, showFeedback);

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  if (task.type !== 'text-input') return null;

  const content = task.content as TextInputContent;

  const correctAnswerAudioUrl = (content as unknown as Record<string, unknown>).correctAnswerAudio
    ? `${import.meta.env.BASE_URL}audio/${(content as unknown as Record<string, unknown>).correctAnswerAudio}`
    : task.audioUrl;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSubmit() && !showFeedback) {
      onSubmit?.();
    }
  };

  return (
    <div className={styles['practice-session__text-input-container']}>
      <div className={styles['practice-session__text-input-wrapper']}>
        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={showFeedback}
          placeholder="Deine Antwort..."
          error={showFeedback && !isCorrect}
          success={showFeedback && isCorrect}
          fullWidth
          className={styles['practice-session__text-input']}
          aria-label="Text answer input"
        />

        {showFeedback && !isCorrect && (
          <div className={styles['practice-session__text-input-feedback']}>
            <div>
              <strong>Richtige Antwort:</strong> {content.correctAnswer}
            </div>
            {correctAnswerAudioUrl && (
              <AudioButton
                text={content.correctAnswer}
                audioUrl={correctAnswerAudioUrl}
                size="small"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export hook for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useTextInput } from './use-text-input';
