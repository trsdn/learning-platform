/**
 * Hook for managing Multiple Choice task state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@core/types/services';

interface MultipleChoiceState {
  selectedAnswer: number | null;
  shuffledOptions: string[];
  shuffledIndices: number[];
  correctAnswerIndex: number;
  optionCursor: number;
}

interface MultipleChoiceActions {
  setSelectedAnswer: (index: number) => void;
  setOptionCursor: (index: number) => void;
  moveCursor: (delta: number) => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

export type UseMultipleChoiceReturn = MultipleChoiceState & MultipleChoiceActions;

/**
 * Custom hook for Multiple Choice task logic
 */
export function useMultipleChoice(
  task: Task | null,
  showFeedback: boolean
): UseMultipleChoiceReturn {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  const [optionCursor, setOptionCursor] = useState<number>(0);

  // Initialize shuffle when task changes
  const resetState = useCallback(() => {
    setSelectedAnswer(null);
    setShuffledOptions([]);
    setShuffledIndices([]);
    setCorrectAnswerIndex(0);
    setOptionCursor(0);
  }, []);

  useEffect(() => {
    if (!task || task.type !== 'multiple-choice') {
      resetState();
      return;
    }

    const content = task.content as unknown as Record<string, unknown>;
    const originalOptions = [...(content.options as unknown[])];
    const originalCorrectAnswer = content.correctAnswer;

    // Determine the correct answer text
    // correctAnswer can be either a number (index) or the actual text
    let correctAnswerText: string;
    if (typeof originalCorrectAnswer === 'number') {
      correctAnswerText = originalOptions[originalCorrectAnswer] as string;
    } else {
      correctAnswerText = originalCorrectAnswer as string;
    }

    // Create array of indices to track original positions
    const indices = originalOptions.map((_, i) => i);

    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j]!, indices[i]!];
    }

    // Create shuffled options array based on shuffled indices
    const shuffled = indices.map((i) => originalOptions[i]!) as string[];

    // Find where the correct answer ended up
    const correctIndex = shuffled.indexOf(correctAnswerText);

    setShuffledOptions(shuffled);
    setShuffledIndices(indices);
    setCorrectAnswerIndex(correctIndex);
    setSelectedAnswer(null);
    setOptionCursor(0);
  }, [task, resetState]);

  // Adjust cursor when options change
  useEffect(() => {
    if (shuffledOptions.length > 0) {
      setOptionCursor((prev) => Math.min(prev, shuffledOptions.length - 1));
    } else {
      setOptionCursor(0);
    }
  }, [shuffledOptions.length]);

  /**
   * Move cursor up/down through options
   */
  const moveCursor = useCallback((delta: number) => {
    if (shuffledOptions.length === 0) return;
    setOptionCursor((prev) => {
      const next = (prev + delta + shuffledOptions.length) % shuffledOptions.length;
      if (!showFeedback) {
        setSelectedAnswer(next);
      }
      return next;
    });
  }, [shuffledOptions.length, showFeedback]);

  /**
   * Check if user can submit (has selected an answer)
   */
  const canSubmit = useCallback((): boolean => {
    return selectedAnswer !== null;
  }, [selectedAnswer]);

  /**
   * Check if selected answer is correct
   */
  const checkAnswer = useCallback((): boolean => {
    if (selectedAnswer === null) return false;
    return selectedAnswer === correctAnswerIndex;
  }, [selectedAnswer, correctAnswerIndex]);

  /**
   * Reset all state
   */
  // resetState is defined above and reused in the initialization effect

  return {
    // State
    selectedAnswer,
    shuffledOptions,
    shuffledIndices,
    correctAnswerIndex,
    optionCursor,

    // Actions
    setSelectedAnswer,
    setOptionCursor,
    moveCursor,
    canSubmit,
    checkAnswer,
    resetState,
  };
}
