/**
 * Tests for useMultipleChoice hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMultipleChoice } from '../../src/modules/ui/components/practice/tasks/MultipleChoice/use-multiple-choice';
import { createMultipleChoiceTask } from '../factories/task-factory';
import type { Task } from '@core/types/services';

describe('useMultipleChoice', () => {
  let task: Task;

  beforeEach(() => {
    task = createMultipleChoiceTask({
      content: {
        question: 'Test question?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option B',
        explanation: 'Test explanation',
      },
    });
  });

  describe('initialization', () => {
    it('should initialize with null selected answer', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      expect(result.current.selectedAnswer).toBeNull();
    });

    it('should shuffle options on mount', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      expect(result.current.shuffledOptions).toHaveLength(4);
      expect(result.current.shuffledOptions).toContain('Option A');
      expect(result.current.shuffledOptions).toContain('Option B');
      expect(result.current.shuffledOptions).toContain('Option C');
      expect(result.current.shuffledOptions).toContain('Option D');
    });

    it('should track the correct answer index after shuffling', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      const correctOptionIndex = result.current.correctAnswerIndex;
      const correctOption = result.current.shuffledOptions[correctOptionIndex];

      expect(correctOption).toBe('Option B');
    });

    it('should initialize cursor at 0', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      expect(result.current.optionCursor).toBe(0);
    });
  });

  describe('canSubmit', () => {
    it('should return false when no answer is selected', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return true when an answer is selected', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      act(() => {
        result.current.setSelectedAnswer(0);
      });

      expect(result.current.canSubmit()).toBe(true);
    });
  });

  describe('checkAnswer', () => {
    it('should return true when correct answer is selected', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      act(() => {
        result.current.setSelectedAnswer(result.current.correctAnswerIndex);
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false when wrong answer is selected', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      const wrongIndex =
        result.current.correctAnswerIndex === 0 ? 1 : 0;

      act(() => {
        result.current.setSelectedAnswer(wrongIndex);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when no answer is selected', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      expect(result.current.checkAnswer()).toBe(false);
    });
  });

  describe('moveCursor', () => {
    it('should move cursor down by delta', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      act(() => {
        result.current.moveCursor(1);
      });

      expect(result.current.optionCursor).toBe(1);
    });

    it('should move cursor up by negative delta', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      act(() => {
        result.current.setOptionCursor(2);
      });

      act(() => {
        result.current.moveCursor(-1);
      });

      expect(result.current.optionCursor).toBe(1);
    });

    it('should wrap around when moving past last option', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      act(() => {
        result.current.setOptionCursor(3); // Last option
      });

      act(() => {
        result.current.moveCursor(1);
      });

      expect(result.current.optionCursor).toBe(0);
    });

    it('should wrap around when moving before first option', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      act(() => {
        result.current.setOptionCursor(0); // First option
      });

      act(() => {
        result.current.moveCursor(-1);
      });

      expect(result.current.optionCursor).toBe(3);
    });

    it('should not auto-select when feedback is shown', () => {
      const { result } = renderHook(() => useMultipleChoice(task, true));

      act(() => {
        result.current.moveCursor(1);
      });

      expect(result.current.selectedAnswer).toBeNull();
    });

    it('should auto-select when feedback is not shown', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      act(() => {
        result.current.moveCursor(2);
      });

      expect(result.current.selectedAnswer).toBe(2);
    });
  });

  describe('resetState', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useMultipleChoice(task, false));

      act(() => {
        result.current.setSelectedAnswer(2);
        result.current.setOptionCursor(3);
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.selectedAnswer).toBeNull();
      expect(result.current.shuffledOptions).toHaveLength(0);
      expect(result.current.optionCursor).toBe(0);
    });
  });

  describe('task type validation', () => {
    it('should reset state when task is null', () => {
      const { result } = renderHook(() => useMultipleChoice(null, false));

      expect(result.current.selectedAnswer).toBeNull();
      expect(result.current.shuffledOptions).toHaveLength(0);
    });

    it('should reset state when task type is not multiple-choice', () => {
      const wrongTypeTask = createMultipleChoiceTask();
      wrongTypeTask.type = 'text-input' as any;

      const { result } = renderHook(() => useMultipleChoice(wrongTypeTask, false));

      expect(result.current.selectedAnswer).toBeNull();
      expect(result.current.shuffledOptions).toHaveLength(0);
    });
  });
});
