/**
 * Hook for managing Slider task state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task, SliderContent } from '@core/types/services';

interface SliderState {
  value: number;
}

interface SliderActions {
  setValue: (value: number) => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

export type UseSliderReturn = SliderState & SliderActions;

/**
 * Custom hook for Slider task logic
 */
export function useSlider(
  task: Task | null,
  _showFeedback: boolean
): UseSliderReturn {
  const [value, setValue] = useState<number>(0);

  // Initialize value when task changes
  useEffect(() => {
    if (!task || task.type !== 'slider') {
      setValue(0);
      return;
    }

    const content = task.content as SliderContent;
    // Initialize to middle of range
    const initialValue = Math.floor((content.min + content.max) / 2);
    setValue(initialValue);
  }, [task]);

  /**
   * Check if user can submit (slider always has a value)
   */
  const canSubmit = useCallback((): boolean => {
    return true; // Slider always has a value
  }, []);

  /**
   * Check if slider value is within tolerance of correct answer
   */
  const checkAnswer = useCallback((): boolean => {
    if (!task || task.type !== 'slider') {
      return false;
    }

    const content = task.content as SliderContent;
    const tolerance = content.tolerance || 0;

    return Math.abs(value - content.correctValue) <= tolerance;
  }, [value, task]);

  /**
   * Reset to initial value
   */
  const resetState = useCallback(() => {
    setValue(0);
  }, []);

  return {
    // State
    value,

    // Actions
    setValue,
    canSubmit,
    checkAnswer,
    resetState,
  };
}
