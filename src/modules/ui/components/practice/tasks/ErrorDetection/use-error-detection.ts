/**
 * Hook for managing Error Detection task state and logic
 *
 * Handles:
 * - Parsing content into clickable segments
 * - Toggle selection of segments (user thinks are errors)
 * - Checking answers with partial credit scoring
 * - Keyboard navigation
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task, ErrorDetectionContent } from '@core/types/services';

/**
 * A segment is a clickable unit in the content
 */
export interface Segment {
  text: string;
  isError: boolean;
  errorIndex?: number; // Index in errors array if isError
}

/**
 * Score breakdown for partial credit
 */
export interface ScoreResult {
  hits: number; // Correctly identified errors
  falsePositives: number; // Non-errors selected by user
  missedErrors: number; // Errors not selected by user
  totalErrors: number; // Total errors in content
  score: number; // (hits - falsePositives) / totalErrors, clamped 0-1
}

interface ErrorDetectionState {
  selectedIndices: Set<number>;
  segments: Segment[];
  cursor: number;
}

interface ErrorDetectionActions {
  toggleSelection: (index: number) => void;
  moveCursor: (delta: number) => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  getScore: () => ScoreResult;
  getUserAnswer: () => string[];
  resetState: () => void;
}

export type UseErrorDetectionReturn = ErrorDetectionState & ErrorDetectionActions;

/**
 * Parse content into clickable segments, identifying error phrases
 */
function parseContent(content: string, errors: ErrorDetectionContent['errors']): Segment[] {
  if (!content || errors.length === 0) {
    // If no errors, split by word/punctuation and return as non-error segments
    const words = content.match(/\S+/g) || [];
    return words.map((text) => ({ text, isError: false }));
  }

  // Check for overlapping errors (when positions are provided)
  const errorsWithPositions = errors.filter((e) => e.position !== undefined);
  if (errorsWithPositions.length > 1) {
    const sorted = [...errorsWithPositions].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!;
      const curr = sorted[i]!;
      const prevEnd = (prev.position ?? 0) + prev.errorText.length;
      if ((curr.position ?? 0) < prevEnd) {
        console.warn(
          '[ErrorDetection] Overlapping errors detected - behavior may be undefined:',
          prev.errorText,
          'and',
          curr.errorText
        );
      }
    }
  }

  // Sort errors by position (if provided) or by length (longer first to match multi-word first)
  const sortedErrors = [...errors].sort((a, b) => {
    if (a.position !== undefined && b.position !== undefined) {
      return a.position - b.position;
    }
    return b.errorText.length - a.errorText.length;
  });

  // Build segments by finding error phrases in content
  const segments: Segment[] = [];
  let remaining = content;
  let currentPosition = 0;

  while (remaining.length > 0) {
    // Find the earliest error in the remaining content
    let earliestError: { error: (typeof errors)[0]; startIdx: number; errorArrayIdx: number } | null = null;

    for (let i = 0; i < sortedErrors.length; i++) {
      const error = sortedErrors[i]!;
      const searchStart = error.position !== undefined
        ? Math.max(0, error.position - currentPosition)
        : 0;

      const idx = remaining.indexOf(error.errorText, searchStart);

      if (idx !== -1) {
        // Check if this error applies at this position
        if (error.position !== undefined) {
          // Position-specific error - must match exactly
          if (currentPosition + idx !== error.position) {
            continue;
          }
        }

        if (!earliestError || idx < earliestError.startIdx) {
          earliestError = {
            error,
            startIdx: idx,
            errorArrayIdx: errors.indexOf(error),
          };
        }
      }
    }

    if (earliestError) {
      // Add non-error text before the error as individual word segments
      if (earliestError.startIdx > 0) {
        const beforeText = remaining.substring(0, earliestError.startIdx);
        const words = beforeText.match(/\S+/g) || [];
        words.forEach((word) => {
          segments.push({ text: word, isError: false });
        });
      }

      // Add the error segment
      segments.push({
        text: earliestError.error.errorText,
        isError: true,
        errorIndex: earliestError.errorArrayIdx,
      });

      // Move past the error
      const endIdx = earliestError.startIdx + earliestError.error.errorText.length;
      currentPosition += endIdx;
      remaining = remaining.substring(endIdx);
    } else {
      // No more errors, add remaining as word segments
      const words = remaining.match(/\S+/g) || [];
      words.forEach((word) => {
        segments.push({ text: word, isError: false });
      });
      break;
    }
  }

  return segments;
}

/**
 * Custom hook for Error Detection task logic
 */
export function useErrorDetection(
  task: Task | null,
  showFeedback: boolean
): UseErrorDetectionReturn {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [cursor, setCursor] = useState(-1);

  // Parse content into segments when task changes
  const segments = useMemo<Segment[]>(() => {
    if (!task || task.type !== 'error-detection') {
      return [];
    }

    const content = task.content as ErrorDetectionContent;
    return parseContent(content.content, content.errors);
  }, [task]);

  // Reset state when task changes
  useEffect(() => {
    setSelectedIndices(new Set());
    setCursor(-1);
  }, [task]);

  /**
   * Toggle selection of a segment
   */
  const toggleSelection = useCallback(
    (index: number) => {
      if (showFeedback) return;

      setSelectedIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    },
    [showFeedback]
  );

  /**
   * Move keyboard cursor
   */
  const moveCursor = useCallback(
    (delta: number) => {
      setCursor((prev) => {
        const next = prev + delta;
        if (next < -1) return -1;
        if (next >= segments.length) return segments.length - 1;
        return next;
      });
    },
    [segments.length]
  );

  /**
   * Check if user can submit (always true - can submit with 0 selections)
   */
  const canSubmit = useCallback((): boolean => {
    return true;
  }, []);

  /**
   * Check if answer is completely correct (all errors found, no false positives)
   */
  const checkAnswer = useCallback((): boolean => {
    if (!task || task.type !== 'error-detection') {
      return false;
    }

    const content = task.content as ErrorDetectionContent;

    // If no errors in content, answer is correct only if no selections
    if (content.errors.length === 0) {
      return selectedIndices.size === 0;
    }

    // Find indices of actual errors in segments
    const errorIndices = new Set(
      segments
        .map((s, i) => (s.isError ? i : -1))
        .filter((i) => i !== -1)
    );

    // Check for exact match: all errors selected, no false positives
    if (selectedIndices.size !== errorIndices.size) {
      return false;
    }

    for (const idx of selectedIndices) {
      if (!errorIndices.has(idx)) {
        return false;
      }
    }

    return true;
  }, [task, selectedIndices, segments]);

  /**
   * Get score breakdown with partial credit
   */
  const getScore = useCallback((): ScoreResult => {
    if (!task || task.type !== 'error-detection') {
      return {
        hits: 0,
        falsePositives: 0,
        missedErrors: 0,
        totalErrors: 0,
        score: 0,
      };
    }

    const content = task.content as ErrorDetectionContent;
    const totalErrors = content.errors.length;

    // If no errors, perfect score if no selections
    if (totalErrors === 0) {
      return {
        hits: 0,
        falsePositives: selectedIndices.size,
        missedErrors: 0,
        totalErrors: 0,
        score: selectedIndices.size === 0 ? 1 : 0,
      };
    }

    // Find error indices
    const errorIndices = new Set(
      segments
        .map((s, i) => (s.isError ? i : -1))
        .filter((i) => i !== -1)
    );

    let hits = 0;
    let falsePositives = 0;

    for (const idx of selectedIndices) {
      if (errorIndices.has(idx)) {
        hits++;
      } else {
        falsePositives++;
      }
    }

    const missedErrors = totalErrors - hits;
    const rawScore = (hits - falsePositives) / totalErrors;
    const score = Math.max(0, Math.min(1, rawScore));

    return {
      hits,
      falsePositives,
      missedErrors,
      totalErrors,
      score,
    };
  }, [task, selectedIndices, segments]);

  /**
   * Get user's answer as array of selected texts
   */
  const getUserAnswer = useCallback((): string[] => {
    return Array.from(selectedIndices)
      .sort((a, b) => a - b)
      .map((idx) => segments[idx]?.text ?? '')
      .filter((text) => text !== '');
  }, [selectedIndices, segments]);

  /**
   * Reset to initial state
   */
  const resetState = useCallback(() => {
    setSelectedIndices(new Set());
    setCursor(-1);
  }, []);

  return {
    // State
    selectedIndices,
    segments,
    cursor,

    // Actions
    toggleSelection,
    moveCursor,
    canSubmit,
    checkAnswer,
    getScore,
    getUserAnswer,
    resetState,
  };
}
