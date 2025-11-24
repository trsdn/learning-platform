/**
 * Hook for managing Text Input task state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task, TextInputContent } from '@core/types/services';

interface TextInputState {
  answer: string;
}

interface TextInputActions {
  setAnswer: (value: string) => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

export type UseTextInputReturn = TextInputState & TextInputActions;

/**
 * Custom hook for Text Input task logic
 */
export function useTextInput(
  task: Task | null,
  showFeedback: boolean
): UseTextInputReturn {
  const [answer, setAnswer] = useState<string>('');

  // Reset state when task changes
  useEffect(() => {
    if (!task || task.type !== 'text-input') {
      setAnswer('');
      return;
    }

    setAnswer('');
  }, [task]);

  /**
   * Check if user can submit (has typed an answer)
   */
  const canSubmit = useCallback((): boolean => {
    return answer.trim().length > 0;
  }, [answer]);

  /**
   * Check if answer is correct
   */
  const checkAnswer = useCallback((): boolean => {
    if (!answer.trim() || !task || task.type !== 'text-input') {
      return false;
    }

    const content = task.content as TextInputContent;
    const caseSensitive = content.caseSensitive || false;

    const userAnswer = caseSensitive ? answer.trim() : answer.trim().toLowerCase();
    const correctAnswer = caseSensitive
      ? content.correctAnswer
      : content.correctAnswer.toLowerCase();
    const alternatives = (content.alternatives || []).map((a) =>
      caseSensitive ? a : a.toLowerCase()
    );

    return userAnswer === correctAnswer || alternatives.includes(userAnswer);
  }, [answer, task]);

  /**
   * Reset all state
   */
  const resetState = useCallback(() => {
    setAnswer('');
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
