import React from 'react';
/**
 * Matching Task Component
 *
 * Displays pairs where users must match left items with right items.
 */

import type { Task, MatchingContent } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { AudioButton } from '../../../audio-button';
import { Select } from '../../../forms';
import { useMatching } from './use-matching';
import styles from '../../../practice-session.module.css';

interface MatchingTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
}

export function MatchingTask({
  task,
  showFeedback,
  isCorrect,
  audioConfig: _audioConfig,
  onAnswerChange,
}: MatchingTaskProps) {
  const { matchingAnswers, shuffledRightColumn, setMatch, canSubmit } =
    useMatching(task, showFeedback);

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  if (task.type !== 'matching') return null;

  const content = task.content as MatchingContent;

  return (
    <div className={styles['practice-session__matching-container']}>
      <div className={styles['practice-session__matching-instruction']}>
        Ordne die passenden Paare zu
      </div>
      <div className={styles['practice-session__matching-grid']}>
        {content.pairs.map((pair, leftIndex) => {
          const isCorrectMatch =
            showFeedback && matchingAnswers[leftIndex] === leftIndex;
          const hasAnswer =
            matchingAnswers[leftIndex] !== undefined &&
            matchingAnswers[leftIndex] !== null;

          // Get audio URL for left item
          const leftAudioUrl = pair.leftAudio
            ? `${import.meta.env.BASE_URL}audio/${pair.leftAudio}`
            : null;

          return (
            <React.Fragment key={leftIndex}>
              <div className={styles['practice-session__matching-left-item']}>
                <span>{pair.left}</span>
                {leftAudioUrl && (
                  <AudioButton
                    text={pair.left}
                    audioUrl={leftAudioUrl}
                    size="small"
                  />
                )}
              </div>
              <Select
                value={matchingAnswers[leftIndex]?.toString() ?? ''}
                onChange={(value) => {
                  const numValue = parseInt(value);
                  setMatch(leftIndex, numValue);
                }}
                options={shuffledRightColumn.map((rightIndex) => ({
                  value: rightIndex.toString(),
                  label: content.pairs[rightIndex]!.right,
                }))}
                disabled={showFeedback}
                placeholder="Wähle..."
                error={showFeedback && hasAnswer && !isCorrectMatch}
                success={showFeedback && isCorrectMatch}
                fullWidth
              />
            </React.Fragment>
          );
        })}
      </div>
      {showFeedback && !isCorrect && (
        <div className={styles['practice-session__matching-feedback']}>
          <div className={styles['practice-session__matching-feedback-title']}>
            Richtige Zuordnungen:
          </div>
          {content.pairs.map((pair, i) => (
            <div
              key={i}
              className={styles['practice-session__matching-feedback-item']}
            >
              <strong>{pair.left}</strong> → <strong>{pair.right}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Re-export hook for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useMatching } from './use-matching';
