/**
 * Hook for managing WordScramble task state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task, WordScrambleContent } from '@core/types/services';

interface WordScrambleState {
  answer: string;
}

interface WordScrambleActions {
  setAnswer: (answer: string) => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

export type UseWordScrambleReturn = WordScrambleState & WordScrambleActions;

/**
 * Custom hook for WordScramble task logic
 */
export function useWordScramble(
  task: Task | null,
  _showFeedback: boolean
): UseWordScrambleReturn {
  const [answer, setAnswer] = useState<string>('');

  // Reset answer when task changes
  useEffect(() => {
    if (!task || task.type !== 'word-scramble') {
      setAnswer('');
      return;
    }

    setAnswer('');
  }, [task]);

  /**
   * Check if user can submit (has entered text)
   */
  const canSubmit = useCallback((): boolean => {
    return answer.trim().length > 0;
  }, [answer]);

  /**
   * Check if answer matches correct word (case-insensitive)
   */
  const checkAnswer = useCallback((): boolean => {
    if (!answer.trim() || !task || task.type !== 'word-scramble') {
      return false;
    }

    const content = task.content as WordScrambleContent;
    return answer.trim().toLowerCase() === content.correctWord.toLowerCase();
  }, [answer, task]);

  /**
   * Reset to initial state
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
