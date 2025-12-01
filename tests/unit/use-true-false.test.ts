/**
 * Tests for useTrueFalse hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTrueFalse } from '../../src/modules/ui/components/practice/tasks/TrueFalse/use-true-false';
import { createTrueFalseTask } from '../factories/task-factory';
import type { Task } from '@core/types/services';

describe('useTrueFalse', () => {
  let task: Task;

  beforeEach(() => {
    task = createTrueFalseTask({
      content: {
        statement: 'Berlin ist die Hauptstadt von Deutschland.',
        correctAnswer: true,
        explanation: 'Richtig! Berlin ist die Hauptstadt von Deutschland.',
      },
    });
  });

  describe('initialization', () => {
    it('should initialize with null answer', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      expect(result.current.answer).toBeNull();
    });
  });

  describe('canSubmit', () => {
    it('should return false when no answer is selected', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return true when true is selected', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      act(() => {
        result.current.setAnswer(true);
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true when false is selected', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      act(() => {
        result.current.setAnswer(false);
      });

      expect(result.current.canSubmit()).toBe(true);
    });
  });

  describe('checkAnswer', () => {
    it('should return true when correct answer (true) is selected', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      act(() => {
        result.current.setAnswer(true);
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false when wrong answer is selected', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      act(() => {
        result.current.setAnswer(false);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when no answer is selected', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should handle false as correct answer', () => {
      const falseTask = createTrueFalseTask({
        content: {
          statement: 'Paris ist die Hauptstadt von Deutschland.',
          correctAnswer: false,
          explanation: 'Richtig! Paris ist die Hauptstadt von Frankreich.',
        },
      });

      const { result } = renderHook(() => useTrueFalse(falseTask, false));

      act(() => {
        result.current.setAnswer(false);
      });

      expect(result.current.checkAnswer()).toBe(true);
    });
  });

  describe('setAnswer', () => {
    it('should update answer to true', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      act(() => {
        result.current.setAnswer(true);
      });

      expect(result.current.answer).toBe(true);
    });

    it('should update answer to false', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      act(() => {
        result.current.setAnswer(false);
      });

      expect(result.current.answer).toBe(false);
    });

    it('should allow changing answer', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      act(() => {
        result.current.setAnswer(true);
      });

      expect(result.current.answer).toBe(true);

      act(() => {
        result.current.setAnswer(false);
      });

      expect(result.current.answer).toBe(false);
    });
  });

  describe('resetState', () => {
    it('should reset answer to null', () => {
      const { result } = renderHook(() => useTrueFalse(task, false));

      act(() => {
        result.current.setAnswer(true);
      });

      expect(result.current.answer).toBe(true);

      act(() => {
        result.current.resetState();
      });

      expect(result.current.answer).toBeNull();
    });
  });

  describe('task type validation', () => {
    it('should reset state when task is null', () => {
      const { result } = renderHook(() => useTrueFalse(null, false));

      expect(result.current.answer).toBeNull();
    });

    it('should reset state when task type is not true-false', () => {
      const wrongTypeTask = createTrueFalseTask();
      wrongTypeTask.type = 'multiple-choice' as 'true-false';

      const { result } = renderHook(() => useTrueFalse(wrongTypeTask, false));

      expect(result.current.answer).toBeNull();
    });

    it('should reset answer when task changes', () => {
      const { result, rerender } = renderHook(
        ({ task }) => useTrueFalse(task, false),
        { initialProps: { task } }
      );

      act(() => {
        result.current.setAnswer(true);
      });

      expect(result.current.answer).toBe(true);

      const newTask = createTrueFalseTask({ id: 'task-2' });
      rerender({ task: newTask });

      expect(result.current.answer).toBeNull();
    });
  });
});
