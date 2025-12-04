/**
 * Error Detection Task Component
 *
 * Displays content with clickable words/phrases where users identify errors.
 * Supports multi-word error detection and partial credit scoring.
 */

import React from 'react';
import type { Task, ErrorDetectionContent } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { useErrorDetection } from './use-error-detection';
import styles from '../../../practice-session.module.css';

interface ErrorDetectionTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
}

export function ErrorDetectionTask({
  task,
  showFeedback,
  isCorrect: _isCorrect,
  audioConfig: _audioConfig,
  onAnswerChange,
}: ErrorDetectionTaskProps) {
  const {
    selectedIndices,
    segments,
    cursor,
    toggleSelection,
    moveCursor,
    canSubmit,
    getScore,
  } = useErrorDetection(task, showFeedback);

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [selectedIndices, canSubmit, onAnswerChange]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFeedback) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          moveCursor(1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          moveCursor(-1);
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (cursor >= 0 && cursor < segments.length) {
            toggleSelection(cursor);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, cursor, segments.length, moveCursor, toggleSelection]);

  if (task.type !== 'error-detection') return null;

  const content = task.content as ErrorDetectionContent;
  const showErrorCount = content.showErrorCount !== false; // Default true
  const errorCount = content.errors.length;
  const score = getScore();

  const getSegmentClassName = (index: number, segment: typeof segments[0]) => {
    const isSelected = selectedIndices.has(index);
    const isFocused = cursor === index;

    const classes = [styles['error-detection__segment']];

    if (!showFeedback) {
      // Interactive state
      if (isSelected) {
        classes.push(styles['error-detection__segment--selected']);
      }
      if (isFocused) {
        classes.push(styles['error-detection__segment--focused']);
      }
    } else {
      // Feedback state
      if (segment.isError && isSelected) {
        // Correctly identified error (hit)
        classes.push(styles['error-detection__segment--correct-hit']);
      } else if (segment.isError && !isSelected) {
        // Missed error
        classes.push(styles['error-detection__segment--missed-error']);
      } else if (!segment.isError && isSelected) {
        // False positive
        classes.push(styles['error-detection__segment--false-positive']);
      }
    }

    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className={styles['error-detection__container']}>
      {/* Instruction */}
      {showErrorCount && errorCount > 0 && !showFeedback && (
        <div className={styles['error-detection__instruction']}>
          Find {errorCount} error{errorCount !== 1 ? 's' : ''} in this text:
        </div>
      )}

      {/* Hint */}
      {content.hint && !showFeedback && (
        <div className={styles['error-detection__hint']}>
          {content.hint}
        </div>
      )}

      {/* Content with clickable segments */}
      <div
        className={styles['error-detection__content']}
        role="group"
        aria-label="Text content with clickable words"
      >
        {segments.map((segment, index) => (
          <React.Fragment key={index}>
            <span
              role="button"
              tabIndex={showFeedback ? -1 : 0}
              onClick={() => !showFeedback && toggleSelection(index)}
              onKeyDown={(e) => {
                if (showFeedback) return;
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  toggleSelection(index);
                }
              }}
              className={getSegmentClassName(index, segment)}
              aria-pressed={selectedIndices.has(index)}
              aria-label={`Word: ${segment.text}${selectedIndices.has(index) ? ', selected' : ''}`}
            >
              {segment.text}
            </span>
            {' '}
          </React.Fragment>
        ))}
      </div>

      {/* Selection counter (before submission) */}
      {!showFeedback && (
        <div className={styles['error-detection__counter']}>
          Selected: {selectedIndices.size}
          {showErrorCount && errorCount > 0 && ` / ${errorCount} errors`}
        </div>
      )}

      {/* Feedback section */}
      {showFeedback && (
        <div className={styles['error-detection__feedback']}>
          {/* Score summary */}
          <div className={styles['error-detection__score']}>
            {score.hits}/{score.totalErrors} errors found
            {score.falsePositives > 0 && (
              <span className={styles['error-detection__false-positives']}>
                , {score.falsePositives} false positive{score.falsePositives !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Corrections */}
          {content.errors.length > 0 && (
            <>
              <div className={styles['error-detection__corrections-title']}>
                Corrections:
              </div>
              <div className={styles['error-detection__corrections']}>
                {content.errors.map((error, i) => (
                  <div key={i} className={styles['error-detection__correction']}>
                    <span className={styles['error-detection__error-text']}>
                      {error.errorText}
                    </span>
                    <span className={styles['error-detection__arrow']}> → </span>
                    <span className={styles['error-detection__correct-text']}>
                      {error.correction}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Explanation */}
          {content.explanation && (
            <div className={styles['error-detection__explanation']}>
              {content.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Re-export hook for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useErrorDetection } from './use-error-detection';
