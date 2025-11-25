/**
 * Tests for useClozeDeletion hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClozeDeletion } from '../../src/modules/ui/components/practice/tasks/ClozeDeletion/use-cloze-deletion';
import { createClozeDeletionTask } from '../factories/task-factory';
import type { Task } from '../../src/modules/core/types/services';

describe('useClozeDeletion', () => {
  let task: Task;

  beforeEach(() => {
    // Default task with 2 blanks: "Berlin" and "große"
    task = createClozeDeletionTask();
  });

  describe('Initialization', () => {
    it('should initialize with empty blank answers array', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      expect(result.current.blankAnswers).toEqual(['', '']);
      expect(result.current.blankAnswers.length).toBe(2);
    });

    it('should initialize with correct array length based on blanks', () => {
      const taskWith3Blanks = createClozeDeletionTask({
        content: {
          text: '{{blank}} is {{blank}} in {{blank}}',
          blanks: [
            { correctAnswer: 'Berlin' },
            { correctAnswer: 'the capital' },
            { correctAnswer: 'Germany' },
          ],
        },
      });

      const { result } = renderHook(() =>
        useClozeDeletion(taskWith3Blanks, false)
      );

      expect(result.current.blankAnswers).toEqual(['', '', '']);
      expect(result.current.blankAnswers.length).toBe(3);
    });

    it('should reset blank answers when task changes', () => {
      const { result, rerender } = renderHook(
        ({ t }) => useClozeDeletion(t, false),
        { initialProps: { t: task } }
      );

      // Fill in some answers
      act(() => {
        result.current.setBlankAnswer(0, 'Berlin');
        result.current.setBlankAnswer(1, 'große');
      });

      expect(result.current.blankAnswers).toEqual(['Berlin', 'große']);

      // Change task
      const newTask = createClozeDeletionTask({
        id: 'different-task',
        content: {
          text: 'The answer is {{blank}}',
          blanks: [{ correctAnswer: 'yes' }],
        },
      });

      rerender({ t: newTask });

      expect(result.current.blankAnswers).toEqual(['']);
    });

    it('should handle null task', () => {
      const { result } = renderHook(() => useClozeDeletion(null, false));

      expect(result.current.blankAnswers).toEqual([]);
    });
  });

  describe('Set Blank Answer', () => {
    it('should update specific blank answer', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'Berlin');
      });

      expect(result.current.blankAnswers[0]).toBe('Berlin');
      expect(result.current.blankAnswers[1]).toBe('');
    });

    it('should update multiple blank answers', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'Berlin');
        result.current.setBlankAnswer(1, 'große');
      });

      expect(result.current.blankAnswers).toEqual(['Berlin', 'große']);
    });

    it('should allow changing blank answer', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'wrong');
      });

      expect(result.current.blankAnswers[0]).toBe('wrong');

      act(() => {
        result.current.setBlankAnswer(0, 'Berlin');
      });

      expect(result.current.blankAnswers[0]).toBe('Berlin');
    });

    it('should preserve other blanks when updating one', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'First');
        result.current.setBlankAnswer(1, 'Second');
      });

      expect(result.current.blankAnswers).toEqual(['First', 'Second']);

      act(() => {
        result.current.setBlankAnswer(0, 'Changed');
      });

      expect(result.current.blankAnswers).toEqual(['Changed', 'Second']);
    });
  });

  describe('Can Submit', () => {
    it('should return false when blanks are empty', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return false when only some blanks filled', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'Berlin');
      });

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return false when blanks contain only whitespace', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, '   ');
        result.current.setBlankAnswer(1, '  ');
      });

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return true when all blanks filled', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'Berlin');
        result.current.setBlankAnswer(1, 'große');
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true even if answers are incorrect', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'wrong');
        result.current.setBlankAnswer(1, 'answers');
      });

      expect(result.current.canSubmit()).toBe(true);
    });
  });

  describe('Check Answer', () => {
    it('should return true when all blanks correct (exact match)', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'Berlin');
        result.current.setBlankAnswer(1, 'große');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return true when all blanks correct (case insensitive)', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'berlin');
        result.current.setBlankAnswer(1, 'GROßE');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return true when using alternatives', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'berlin'); // Alternative
        result.current.setBlankAnswer(1, 'grosse'); // Alternative
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false when not all blanks filled', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'Berlin');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when one blank is incorrect', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'Munich'); // Incorrect
        result.current.setBlankAnswer(1, 'große'); // Correct
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when all blanks are incorrect', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, 'wrong');
        result.current.setBlankAnswer(1, 'answers');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when task is null', () => {
      const { result } = renderHook(() => useClozeDeletion(null, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should trim whitespace from answers', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      act(() => {
        result.current.setBlankAnswer(0, '  Berlin  ');
        result.current.setBlankAnswer(1, ' große ');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle single blank task', () => {
      const singleBlankTask = createClozeDeletionTask({
        content: {
          text: 'The capital is {{blank}}',
          blanks: [{ correctAnswer: 'Berlin', alternatives: ['berlin'] }],
        },
      });

      const { result } = renderHook(() =>
        useClozeDeletion(singleBlankTask, false)
      );

      act(() => {
        result.current.setBlankAnswer(0, 'Berlin');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle blanks without alternatives', () => {
      const noAlternativesTask = createClozeDeletionTask({
        content: {
          text: '{{blank}} and {{blank}}',
          blanks: [
            { correctAnswer: 'First' },
            { correctAnswer: 'Second' },
          ],
        },
      });

      const { result } = renderHook(() =>
        useClozeDeletion(noAlternativesTask, false)
      );

      act(() => {
        result.current.setBlankAnswer(0, 'First');
        result.current.setBlankAnswer(1, 'Second');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });
  });

  describe('Reset State', () => {
    it('should clear all blank answers', () => {
      const { result } = renderHook(() => useClozeDeletion(task, false));

      // Fill in answers
      act(() => {
        result.current.setBlankAnswer(0, 'Berlin');
        result.current.setBlankAnswer(1, 'große');
      });

      expect(result.current.blankAnswers).toEqual(['Berlin', 'große']);

      // Reset
      act(() => {
        result.current.resetState();
      });

      expect(result.current.blankAnswers).toEqual([]);
    });
  });
});
