import React from 'react';
/**
 * Ordering Task Component
 *
 * Displays items that users must arrange in the correct order.
 */

import type { Task, OrderingContent } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { AudioButton } from '../../../audio-button';
import { useOrdering } from './use-ordering';
import styles from '../../../practice-session.module.css';

interface OrderingTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
}

export function OrderingTask({
  task,
  showFeedback,
  isCorrect,
  audioConfig: _audioConfig,
  onAnswerChange,
}: OrderingTaskProps) {
  const { orderedItems, moveItemUp, moveItemDown, canSubmit } = useOrdering(
    task,
    showFeedback
  );

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  if (task.type !== 'ordering') return null;

  const content = task.content as OrderingContent;

  return (
    <div className={styles['practice-session__ordering-container']}>
      <div className={styles['practice-session__ordering-instruction']}>
        Ordne die Elemente in die richtige Reihenfolge
      </div>
      <div className={styles['practice-session__ordering-items']}>
        {orderedItems.map((item, index) => {
          const originalIndex = content.items.indexOf(item);
          const isInCorrectPosition =
            showFeedback && content.correctOrder[index] === originalIndex;
          const shouldBeAtPosition = showFeedback
            ? content.correctOrder.indexOf(originalIndex)
            : -1;

          const itemClasses = [
            styles['practice-session__ordering-item'],
            showFeedback &&
              isInCorrectPosition &&
              styles['practice-session__ordering-item--correct'],
          ]
            .filter(Boolean)
            .join(' ');

          // Get audio URL for this item
          const itemAudioUrl =
            content.itemsAudio && content.itemsAudio[originalIndex]
              ? `${import.meta.env.BASE_URL}audio/${content.itemsAudio[originalIndex]}`
              : null;

          return (
            <div key={index} className={itemClasses}>
              <div className={styles['practice-session__ordering-item-number']}>
                {index + 1}.
              </div>
              <div className={styles['practice-session__ordering-item-text']}>
                <span className={styles['practice-session__ordering-word']}>
                  {item}
                </span>
                {itemAudioUrl && (
                  <AudioButton
                    text={item}
                    audioUrl={itemAudioUrl}
                    size="small"
                  />
                )}
                {showFeedback && !isInCorrectPosition && (
                  <span className={styles['practice-session__ordering-hint']}>
                    → Position {shouldBeAtPosition + 1}
                  </span>
                )}
              </div>
              {!showFeedback && (
                <div className={styles['practice-session__ordering-controls']}>
                  {index > 0 && (
                    <button
                      onClick={() => moveItemUp(index)}
                      className={styles['practice-session__ordering-btn']}
                    >
                      ↑
                    </button>
                  )}
                  {index < orderedItems.length - 1 && (
                    <button
                      onClick={() => moveItemDown(index)}
                      className={styles['practice-session__ordering-btn']}
                    >
                      ↓
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showFeedback && !isCorrect && (
        <div className={styles['practice-session__ordering-feedback']}>
          <div className={styles['practice-session__ordering-feedback-title']}>
            Richtige Reihenfolge:
          </div>
          {content.correctOrder.map((originalIndex, position) => (
            <div
              key={position}
              className={styles['practice-session__ordering-feedback-item']}
            >
              {position + 1}. <strong>{content.items[originalIndex]}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Re-export hook for convenience
export { useOrdering } from './use-ordering';
