/**
 * Hook for managing ClozeDeletion task state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task, ClozeDeletionContent } from '@core/types/services';

interface ClozeDeletionState {
  blankAnswers: string[];
}

interface ClozeDeletionActions {
  setBlankAnswer: (index: number, value: string) => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

export type UseClozeDeletionReturn = ClozeDeletionState & ClozeDeletionActions;

/**
 * Custom hook for ClozeDeletion task logic
 */
export function useClozeDeletion(
  task: Task | null,
  _showFeedback: boolean
): UseClozeDeletionReturn {
  const [blankAnswers, setBlankAnswers] = useState<string[]>([]);

  // Initialize blank answers array when task changes
  useEffect(() => {
    if (!task || task.type !== 'cloze-deletion') {
      setBlankAnswers([]);
      return;
    }

    const content = task.content as ClozeDeletionContent;
    setBlankAnswers(new Array(content.blanks.length).fill(''));
  }, [task]);

  /**
   * Set answer for a specific blank
   */
  const setBlankAnswer = useCallback((index: number, value: string) => {
    setBlankAnswers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  /**
   * Check if user can submit (all blanks filled)
   */
  const canSubmit = useCallback((): boolean => {
    return blankAnswers.every((a) => a.trim().length > 0);
  }, [blankAnswers]);

  /**
   * Check if all blanks are correct (case-insensitive)
   */
  const checkAnswer = useCallback((): boolean => {
    if (!task || task.type !== 'cloze-deletion') {
      return false;
    }

    const content = task.content as ClozeDeletionContent;

    // All blanks must be filled
    if (!blankAnswers.every((a) => a.trim().length > 0)) {
      return false;
    }

    // Check each blank
    return blankAnswers.every((userAnswer, i) => {
      const blank = content.blanks[i];
      if (!blank) return false;

      const normalizedUserAnswer = userAnswer.trim().toLowerCase();
      const normalizedCorrect = blank.correctAnswer.toLowerCase();

      // Check if matches correct answer
      if (normalizedUserAnswer === normalizedCorrect) {
        return true;
      }

      // Check if matches any alternative
      if (blank.alternatives) {
        return blank.alternatives
          .map((a) => a.toLowerCase())
          .includes(normalizedUserAnswer);
      }

      return false;
    });
  }, [blankAnswers, task]);

  /**
   * Reset to initial state
   */
  const resetState = useCallback(() => {
    setBlankAnswers([]);
  }, []);

  return {
    // State
    blankAnswers,

    // Actions
    setBlankAnswer,
    canSubmit,
    checkAnswer,
    resetState,
  };
}
