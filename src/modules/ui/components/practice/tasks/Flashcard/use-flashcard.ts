/**
 * Hook for managing Flashcard task state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@core/types/services';

interface FlashcardState {
  revealed: boolean;
  known: boolean | null;
}

interface FlashcardActions {
  setRevealed: (revealed: boolean) => void;
  setKnown: (known: boolean) => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

export type UseFlashcardReturn = FlashcardState & FlashcardActions;

/**
 * Custom hook for Flashcard task logic
 */
export function useFlashcard(
  task: Task | null,
  _showFeedback: boolean
): UseFlashcardReturn {
  const [revealed, setRevealed] = useState<boolean>(false);
  const [known, setKnown] = useState<boolean | null>(null);

  // Reset state when task changes
  useEffect(() => {
    if (!task || task.type !== 'flashcard') {
      setRevealed(false);
      setKnown(null);
      return;
    }

    setRevealed(false);
    setKnown(null);
  }, [task]);

  /**
   * Check if user can submit (has made a self-assessment)
   */
  const canSubmit = useCallback((): boolean => {
    return known !== null;
  }, [known]);

  /**
   * Check if user knew the flashcard
   * For flashcards, the "correct" answer is whether the user knew it
   */
  const checkAnswer = useCallback((): boolean => {
    return known === true;
  }, [known]);

  /**
   * Reset to initial state
   */
  const resetState = useCallback(() => {
    setRevealed(false);
    setKnown(null);
  }, []);

  return {
    // State
    revealed,
    known,

    // Actions
    setRevealed,
    setKnown,
    canSubmit,
    checkAnswer,
    resetState,
  };
}
