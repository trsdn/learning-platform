/**
 * Slider Task Component
 *
 * Displays a slider for selecting a numeric value within a range.
 */

import React from 'react';
import type { Task, SliderContent } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { Slider } from '../../../forms';
import { useSlider } from './use-slider';
import styles from '../../../practice-session.module.css';

interface SliderTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
}

export function SliderTask({
  task,
  showFeedback,
  isCorrect: _isCorrect,
  audioConfig: _audioConfig,
  onAnswerChange,
}: SliderTaskProps) {
  const { value, setValue, canSubmit } = useSlider(task, showFeedback);

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  if (task.type !== 'slider') return null;

  const content = task.content as SliderContent;
  const step = content.step || 1;
  const tolerance = content.tolerance || 0;
  const isCorrectValue = Math.abs(value - content.correctValue) <= tolerance;

  const valueClass = showFeedback
    ? isCorrectValue
      ? styles['practice-session__slider-value--correct']
      : styles['practice-session__slider-value--incorrect']
    : '';

  return (
    <div className={styles['practice-session__slider-container']}>
      <div className={styles['practice-session__slider-value-display']}>
        <div
          className={`${styles['practice-session__slider-value']} ${valueClass}`}
        >
          {value}
          {content.unit || ''}
        </div>
      </div>

      <div className={styles['practice-session__slider-wrapper']}>
        <Slider
          value={value}
          onChange={setValue}
          min={content.min}
          max={content.max}
          step={step}
          disabled={showFeedback}
          unit={content.unit || ''}
          showValue={false}
          aria-label={`Slider from ${content.min} to ${content.max}`}
        />
      </div>

      {showFeedback && (
        <div className={styles['practice-session__slider-feedback']}>
          <div className={styles['practice-session__slider-feedback-text']}>
            Richtige Antwort:{' '}
            <strong className={styles['practice-session__slider-correct-value']}>
              {content.correctValue}
              {content.unit || ''}
            </strong>
            {tolerance > 0 && (
              <span className={styles['practice-session__slider-tolerance']}>
                {' '}
                (±{tolerance})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export hook for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useSlider } from './use-slider';
