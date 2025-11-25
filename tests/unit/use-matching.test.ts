/**
 * Tests for useMatching hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMatching } from '../../src/modules/ui/components/practice/tasks/Matching/use-matching';
import { createMatchingTask } from '../factories/task-factory';
import type { Task } from '../../src/modules/core/types/services';

describe('useMatching', () => {
  let task: Task;

  beforeEach(() => {
    // Default task: 3 pairs (eins-one, zwei-two, drei-three)
    task = createMatchingTask();
    // Mock Math.random for predictable shuffle
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  describe('Initialization', () => {
    it('should initialize with empty matches and shuffled right column', () => {
      const { result } = renderHook(() => useMatching(task, false));

      expect(result.current.matchingAnswers).toEqual({});
      expect(result.current.shuffledRightColumn).toHaveLength(3);
    });

    it('should reset when task changes', () => {
      const { result, rerender } = renderHook(
        ({ t }) => useMatching(t, false),
        { initialProps: { t: task } }
      );

      act(() => {
        result.current.setMatch(0, 0);
      });

      expect(result.current.matchingAnswers).toEqual({ 0: 0 });

      const newTask = createMatchingTask({
        id: 'different-task',
        content: {
          instruction: 'Match colors',
          pairs: [
            { left: 'red', right: 'rot' },
            { left: 'blue', right: 'blau' },
          ],
        },
      });

      rerender({ t: newTask });

      expect(result.current.matchingAnswers).toEqual({});
      expect(result.current.shuffledRightColumn).toHaveLength(2);
    });

    it('should handle null task', () => {
      const { result } = renderHook(() => useMatching(null, false));

      expect(result.current.matchingAnswers).toEqual({});
      expect(result.current.shuffledRightColumn).toEqual([]);
    });
  });

  describe('Set Match', () => {
    it('should create a match', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 0);
      });

      expect(result.current.matchingAnswers[0]).toBe(0);
    });

    it('should allow multiple matches', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 0);
        result.current.setMatch(1, 1);
        result.current.setMatch(2, 2);
      });

      expect(result.current.matchingAnswers).toEqual({
        0: 0,
        1: 1,
        2: 2,
      });
    });

    it('should allow changing a match', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 1);
      });

      expect(result.current.matchingAnswers[0]).toBe(1);

      act(() => {
        result.current.setMatch(0, 0);
      });

      expect(result.current.matchingAnswers[0]).toBe(0);
    });

    it('should preserve other matches when changing one', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 0);
        result.current.setMatch(1, 1);
      });

      expect(result.current.matchingAnswers).toEqual({ 0: 0, 1: 1 });

      act(() => {
        result.current.setMatch(0, 2);
      });

      expect(result.current.matchingAnswers).toEqual({ 0: 2, 1: 1 });
    });
  });

  describe('Can Submit', () => {
    it('should return false when no matches made', () => {
      const { result } = renderHook(() => useMatching(task, false));

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return false when only some pairs matched', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 0);
        result.current.setMatch(1, 1);
      });

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return true when all pairs matched', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 0);
        result.current.setMatch(1, 1);
        result.current.setMatch(2, 2);
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true even if matches are incorrect', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 1);
        result.current.setMatch(1, 2);
        result.current.setMatch(2, 0);
      });

      expect(result.current.canSubmit()).toBe(true);
    });
  });

  describe('Check Answer', () => {
    it('should return true when all matches correct', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 0); // eins -> one (correct)
        result.current.setMatch(1, 1); // zwei -> two (correct)
        result.current.setMatch(2, 2); // drei -> three (correct)
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false when not all pairs matched', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 0);
        result.current.setMatch(1, 1);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when one match is incorrect', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 0); // Correct
        result.current.setMatch(1, 2); // Incorrect
        result.current.setMatch(2, 2); // Correct
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when all matches incorrect', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 1);
        result.current.setMatch(1, 2);
        result.current.setMatch(2, 0);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when task is null', () => {
      const { result } = renderHook(() => useMatching(null, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should handle single pair task', () => {
      const singlePairTask = createMatchingTask({
        content: {
          instruction: 'Match',
          pairs: [{ left: 'A', right: 'B' }],
        },
      });

      const { result } = renderHook(() =>
        useMatching(singlePairTask, false)
      );

      act(() => {
        result.current.setMatch(0, 0);
      });

      expect(result.current.checkAnswer()).toBe(true);
    });
  });

  describe('Reset State', () => {
    it('should clear all matches and shuffled column', () => {
      const { result } = renderHook(() => useMatching(task, false));

      act(() => {
        result.current.setMatch(0, 0);
        result.current.setMatch(1, 1);
      });

      expect(result.current.matchingAnswers).toEqual({ 0: 0, 1: 1 });
      expect(result.current.shuffledRightColumn).toHaveLength(3);

      act(() => {
        result.current.resetState();
      });

      expect(result.current.matchingAnswers).toEqual({});
      expect(result.current.shuffledRightColumn).toEqual([]);
    });
  });
});
