/**
 * Hook for managing Matching task state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task, MatchingContent } from '@core/types/services';

interface MatchingState {
  matchingAnswers: Record<number, number>;
  shuffledRightColumn: number[];
}

interface MatchingActions {
  setMatch: (leftIndex: number, rightIndex: number) => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

export type UseMatchingReturn = MatchingState & MatchingActions;

/**
 * Custom hook for Matching task logic
 */
export function useMatching(
  task: Task | null,
  _showFeedback: boolean
): UseMatchingReturn {
  const [matchingAnswers, setMatchingAnswers] = useState<Record<number, number>>({});
  const [shuffledRightColumn, setShuffledRightColumn] = useState<number[]>([]);

  // Initialize with shuffled right column when task changes
  useEffect(() => {
    if (!task || task.type !== 'matching') {
      setMatchingAnswers({});
      setShuffledRightColumn([]);
      return;
    }

    const content = task.content as MatchingContent;
    // Shuffle right column for matching (Fisher-Yates)
    const indices = content.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i]!, indices[j]!] = [indices[j]!, indices[i]!];
    }
    setShuffledRightColumn(indices);
    setMatchingAnswers({});
  }, [task]);

  /**
   * Set a match between left and right item
   */
  const setMatch = useCallback((leftIndex: number, rightIndex: number) => {
    setMatchingAnswers((prev) => ({
      ...prev,
      [leftIndex]: rightIndex,
    }));
  }, []);

  /**
   * Check if user can submit (all pairs matched)
   */
  const canSubmit = useCallback((): boolean => {
    if (!task || task.type !== 'matching') {
      return false;
    }

    const content = task.content as MatchingContent;
    return Object.keys(matchingAnswers).length === content.pairs.length;
  }, [matchingAnswers, task]);

  /**
   * Check if all matches are correct
   */
  const checkAnswer = useCallback((): boolean => {
    if (!task || task.type !== 'matching') {
      return false;
    }

    const content = task.content as MatchingContent;

    // All pairs must be matched correctly
    // matchingAnswers[leftIndex] stores the original pair index the user selected
    // For a correct match, the selected index should equal the left index
    return content.pairs.every((_pair, i) => matchingAnswers[i] === i);
  }, [matchingAnswers, task]);

  /**
   * Reset to initial state
   */
  const resetState = useCallback(() => {
    setMatchingAnswers({});
    setShuffledRightColumn([]);
  }, []);

  return {
    // State
    matchingAnswers,
    shuffledRightColumn,

    // Actions
    setMatch,
    canSubmit,
    checkAnswer,
    resetState,
  };
}
