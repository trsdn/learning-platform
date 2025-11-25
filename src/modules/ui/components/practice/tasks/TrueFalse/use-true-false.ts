/**
 * Hook for managing True/False task state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task, TrueFalseContent } from '@core/types/services';

interface TrueFalseState {
  answer: boolean | null;
}

interface TrueFalseActions {
  setAnswer: (value: boolean) => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

export type UseTrueFalseReturn = TrueFalseState & TrueFalseActions;

/**
 * Custom hook for True/False task logic
 */
export function useTrueFalse(
  task: Task | null,
  _showFeedback: boolean
): UseTrueFalseReturn {
  const [answer, setAnswer] = useState<boolean | null>(null);

  // Reset state when task changes
  useEffect(() => {
    if (!task || task.type !== 'true-false') {
      setAnswer(null);
      return;
    }

    setAnswer(null);
  }, [task]);

  /**
   * Check if user can submit (has selected an answer)
   */
  const canSubmit = useCallback((): boolean => {
    return answer !== null;
  }, [answer]);

  /**
   * Check if selected answer is correct
   */
  const checkAnswer = useCallback((): boolean => {
    if (answer === null || !task || task.type !== 'true-false') {
      return false;
    }

    const content = task.content as TrueFalseContent;
    return answer === content.correctAnswer;
  }, [answer, task]);

  /**
   * Reset all state
   */
  const resetState = useCallback(() => {
    setAnswer(null);
  }, []);

  return {
    // State
    answer,

    // Actions
    setAnswer,
    canSubmit,
    checkAnswer,
    resetState,
  };
}
