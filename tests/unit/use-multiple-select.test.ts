/**
 * Tests for useMultipleSelect hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMultipleSelect } from '../../src/modules/ui/components/practice/tasks/MultipleSelect/use-multiple-select';
import { createMultipleSelectTask } from '../factories/task-factory';
import type { Task } from '../../src/modules/core/types/services';

describe('useMultipleSelect', () => {
  let task: Task;

  beforeEach(() => {
    // Default task: Berlin (0), München (2), Hamburg (4) are correct
    task = createMultipleSelectTask();
  });

  describe('Initialization', () => {
    it('should initialize with empty selection set', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      expect(result.current.selectedOptions.size).toBe(0);
      expect(result.current.cursor).toBe(0);
    });

    it('should reset state when task changes', () => {
      const { result, rerender } = renderHook(
        ({ t }) => useMultipleSelect(t, false),
        { initialProps: { t: task } }
      );

      // Select some options
      act(() => {
        result.current.toggleOption(0);
        result.current.toggleOption(2);
      });

      expect(result.current.selectedOptions.size).toBe(2);

      // Change task
      const newTask = createMultipleSelectTask({
        id: 'different-task',
        content: {
          question: 'Different question?',
          options: ['A', 'B', 'C'],
          correctAnswers: [0, 1],
          explanation: 'Test',
        },
      });

      rerender({ t: newTask });

      expect(result.current.selectedOptions.size).toBe(0);
      expect(result.current.cursor).toBe(0);
    });

    it('should handle null task', () => {
      const { result } = renderHook(() => useMultipleSelect(null, false));

      expect(result.current.selectedOptions.size).toBe(0);
      expect(result.current.cursor).toBe(0);
    });
  });

  describe('Toggle Option', () => {
    it('should add option when not selected', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.toggleOption(0);
      });

      expect(result.current.selectedOptions.has(0)).toBe(true);
      expect(result.current.selectedOptions.size).toBe(1);
    });

    it('should remove option when already selected', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.toggleOption(0);
      });

      expect(result.current.selectedOptions.has(0)).toBe(true);

      act(() => {
        result.current.toggleOption(0);
      });

      expect(result.current.selectedOptions.has(0)).toBe(false);
      expect(result.current.selectedOptions.size).toBe(0);
    });

    it('should allow multiple selections', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.toggleOption(0);
        result.current.toggleOption(2);
        result.current.toggleOption(4);
      });

      expect(result.current.selectedOptions.has(0)).toBe(true);
      expect(result.current.selectedOptions.has(2)).toBe(true);
      expect(result.current.selectedOptions.has(4)).toBe(true);
      expect(result.current.selectedOptions.size).toBe(3);
    });

    it('should not toggle when showFeedback is true', () => {
      const { result } = renderHook(() => useMultipleSelect(task, true));

      act(() => {
        result.current.toggleOption(0);
      });

      expect(result.current.selectedOptions.size).toBe(0);
    });

    it('should not toggle when task is null', () => {
      const { result } = renderHook(() => useMultipleSelect(null, false));

      act(() => {
        result.current.toggleOption(0);
      });

      expect(result.current.selectedOptions.size).toBe(0);
    });
  });

  describe('Cursor Movement', () => {
    it('should update cursor directly', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.setCursor(3);
      });

      expect(result.current.cursor).toBe(3);
    });

    it('should move cursor down', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      expect(result.current.cursor).toBe(0);

      act(() => {
        result.current.moveCursor('down');
      });

      expect(result.current.cursor).toBe(1);
    });

    it('should move cursor up', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.setCursor(2);
      });

      act(() => {
        result.current.moveCursor('up');
      });

      expect(result.current.cursor).toBe(1);
    });

    it('should wrap cursor to end when moving up from first option', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      expect(result.current.cursor).toBe(0);

      act(() => {
        result.current.moveCursor('up');
      });

      // Should wrap to last option (4 options, index 4)
      expect(result.current.cursor).toBe(4);
    });

    it('should wrap cursor to start when moving down from last option', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.setCursor(4);
      });

      act(() => {
        result.current.moveCursor('down');
      });

      expect(result.current.cursor).toBe(0);
    });
  });

  describe('Can Submit', () => {
    it('should return false when no options selected', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return true when at least one option selected', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.toggleOption(0);
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true when multiple options selected', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.toggleOption(0);
        result.current.toggleOption(2);
      });

      expect(result.current.canSubmit()).toBe(true);
    });
  });

  describe('Check Answer', () => {
    it('should return true when all correct answers selected', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.toggleOption(0); // Berlin - correct
        result.current.toggleOption(2); // München - correct
        result.current.toggleOption(4); // Hamburg - correct
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false when no options selected', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when only some correct answers selected', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.toggleOption(0); // Berlin - correct
        result.current.toggleOption(2); // München - correct
        // Missing Hamburg (4)
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when incorrect answer included', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.toggleOption(0); // Berlin - correct
        result.current.toggleOption(1); // London - INCORRECT
        result.current.toggleOption(2); // München - correct
        result.current.toggleOption(4); // Hamburg - correct
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when only incorrect answers selected', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      act(() => {
        result.current.toggleOption(1); // London - incorrect
        result.current.toggleOption(3); // Paris - incorrect
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when task is null', () => {
      const { result } = renderHook(() => useMultipleSelect(null, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should handle single correct answer', () => {
      const singleAnswerTask = createMultipleSelectTask({
        content: {
          question: 'Which is correct?',
          options: ['A', 'B', 'C'],
          correctAnswers: [1], // Only B
          explanation: 'B is correct',
        },
      });

      const { result } = renderHook(() =>
        useMultipleSelect(singleAnswerTask, false)
      );

      act(() => {
        result.current.toggleOption(1);
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle all options being correct', () => {
      const allCorrectTask = createMultipleSelectTask({
        content: {
          question: 'All are correct?',
          options: ['A', 'B', 'C'],
          correctAnswers: [0, 1, 2], // All correct
          explanation: 'All are correct',
        },
      });

      const { result } = renderHook(() =>
        useMultipleSelect(allCorrectTask, false)
      );

      act(() => {
        result.current.toggleOption(0);
        result.current.toggleOption(1);
        result.current.toggleOption(2);
      });

      expect(result.current.checkAnswer()).toBe(true);
    });
  });

  describe('Reset State', () => {
    it('should clear all selections and reset cursor', () => {
      const { result } = renderHook(() => useMultipleSelect(task, false));

      // Make some selections and move cursor
      act(() => {
        result.current.toggleOption(0);
        result.current.toggleOption(2);
        result.current.setCursor(3);
      });

      expect(result.current.selectedOptions.size).toBe(2);
      expect(result.current.cursor).toBe(3);

      // Reset
      act(() => {
        result.current.resetState();
      });

      expect(result.current.selectedOptions.size).toBe(0);
      expect(result.current.cursor).toBe(0);
    });
  });
});
