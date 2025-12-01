/**
 * Word Scramble Task Component
 *
 * Displays a scrambled word that the user must unscramble.
 */

import React from 'react';
import type { Task, WordScrambleContent } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { useWordScramble } from './use-word-scramble';
import styles from '../../../practice-session.module.css';

interface WordScrambleTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
}

export function WordScrambleTask({
  task,
  showFeedback,
  isCorrect,
  audioConfig: _audioConfig,
  onAnswerChange,
}: WordScrambleTaskProps) {
  const { answer, setAnswer, canSubmit, checkAnswer } = useWordScramble(
    task,
    showFeedback
  );

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  if (task.type !== 'word-scramble') return null;

  const content = task.content as WordScrambleContent;
  const isAnswerCorrect = checkAnswer();
  const hasAnswer = answer.trim() !== '';

  const inputClass = showFeedback
    ? isAnswerCorrect
      ? styles['practice-session__scramble-input--correct']
      : hasAnswer
        ? styles['practice-session__scramble-input--incorrect']
        : ''
    : '';

  return (
    <div className={styles['practice-session__scramble-container']}>
      <div className={styles['practice-session__scramble-display']}>
        <div className={styles['practice-session__scramble-label']}>
          Buchstabensalat:
        </div>
        <div className={styles['practice-session__scramble-word']}>
          {content.scrambledWord}
        </div>
        {content.showLength && (
          <div className={styles['practice-session__scramble-length']}>
            ({content.correctWord.length} Buchstaben)
          </div>
        )}
      </div>

      <div>
        <label className={styles['practice-session__scramble-input-label']}>
          Deine Lösung:
        </label>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={showFeedback}
          placeholder="Entschlüssle das Wort..."
          className={`${styles['practice-session__scramble-input']} ${inputClass}`}
        />
      </div>

      {showFeedback && !isCorrect && (
        <div className={styles['practice-session__scramble-feedback']}>
          <div className={styles['practice-session__scramble-feedback-label']}>
            Richtige Lösung:
          </div>
          <div className={styles['practice-session__scramble-feedback-word']}>
            {content.correctWord}
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export hook for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useWordScramble } from './use-word-scramble';
