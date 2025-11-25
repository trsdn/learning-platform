/**
 * Hook for managing MultipleSelect task state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task, MultipleSelectContent } from '@core/types/services';

interface MultipleSelectState {
  selectedOptions: Set<number>;
  cursor: number;
}

interface MultipleSelectActions {
  toggleOption: (index: number) => void;
  setCursor: (index: number) => void;
  moveCursor: (direction: 'up' | 'down') => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

export type UseMultipleSelectReturn = MultipleSelectState & MultipleSelectActions;

/**
 * Custom hook for MultipleSelect task logic
 */
export function useMultipleSelect(
  task: Task | null,
  showFeedback: boolean
): UseMultipleSelectReturn {
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
  const [cursor, setCursor] = useState<number>(0);

  // Reset state when task changes
  useEffect(() => {
    if (!task || task.type !== 'multiple-select') {
      setSelectedOptions(new Set());
      setCursor(0);
      return;
    }

    // Reset selections for new task
    setSelectedOptions(new Set());
    setCursor(0);
  }, [task]);

  /**
   * Toggle selection of an option
   */
  const toggleOption = useCallback(
    (index: number) => {
      if (showFeedback || !task || task.type !== 'multiple-select') return;

      setSelectedOptions((prev) => {
        const updated = new Set(prev);
        if (updated.has(index)) {
          updated.delete(index);
        } else {
          updated.add(index);
        }
        return updated;
      });
    },
    [showFeedback, task]
  );

  /**
   * Move cursor up or down
   */
  const moveCursor = useCallback(
    (direction: 'up' | 'down') => {
      if (!task || task.type !== 'multiple-select') return;

      const content = task.content as MultipleSelectContent;
      const optionCount = content.options.length;

      setCursor((prev) => {
        if (direction === 'up') {
          return prev > 0 ? prev - 1 : optionCount - 1;
        } else {
          return prev < optionCount - 1 ? prev + 1 : 0;
        }
      });
    },
    [task]
  );

  /**
   * Check if user can submit (at least one option selected)
   */
  const canSubmit = useCallback((): boolean => {
    return selectedOptions.size > 0;
  }, [selectedOptions]);

  /**
   * Check if selected options match correct answers
   */
  const checkAnswer = useCallback((): boolean => {
    if (!task || task.type !== 'multiple-select' || selectedOptions.size === 0) {
      return false;
    }

    const content = task.content as MultipleSelectContent;

    // Check if sets are equal: same size and all elements match
    if (content.correctAnswers.length !== selectedOptions.size) {
      return false;
    }

    return content.correctAnswers.every((ans) => selectedOptions.has(ans));
  }, [selectedOptions, task]);

  /**
   * Reset to initial state
   */
  const resetState = useCallback(() => {
    setSelectedOptions(new Set());
    setCursor(0);
  }, []);

  return {
    // State
    selectedOptions,
    cursor,

    // Actions
    toggleOption,
    setCursor,
    moveCursor,
    canSubmit,
    checkAnswer,
    resetState,
  };
}
