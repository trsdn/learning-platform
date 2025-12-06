/**
 * Tests for useTextInput hook
 *
 * Tests the text input task hook which handles:
 * - Managing user input state
 * - Answer submission validation
 * - Answer correctness evaluation with case sensitivity
 * - Alternative answer matching
 * - State reset functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTextInput } from '../../../../src/modules/ui/components/practice/tasks/TextInput/use-text-input';
import { createTextInputTask } from '../../../factories/task-factory';
import type { Task, TextInputContent } from '../../../../src/modules/core/types/services';

describe('useTextInput', () => {
  let task: Task;

  beforeEach(() => {
    // Default task: case-insensitive, "Berlin" with alternative "berlin"
    task = createTextInputTask();
  });

  describe('Initialization', () => {
    it('should initialize with empty answer', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      expect(result.current.answer).toBe('');
    });

    it('should initialize with canSubmit returning false', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should handle null task', () => {
      const { result } = renderHook(() => useTextInput(null, false));

      expect(result.current.answer).toBe('');
      expect(result.current.canSubmit()).toBe(false);
      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should handle non-text-input task type', () => {
      const multipleChoiceTask = {
        ...task,
        type: 'multiple-choice' as const,
      };

      const { result } = renderHook(() => useTextInput(multipleChoiceTask, false));

      expect(result.current.answer).toBe('');
      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should reset when task changes', () => {
      const { result, rerender } = renderHook(
        ({ t }) => useTextInput(t, false),
        { initialProps: { t: task } }
      );

      // Set an answer
      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.answer).toBe('Berlin');

      // Change task
      const newTask = createTextInputTask({
        id: 'task-2',
        content: {
          question: 'What is the capital of France?',
          correctAnswer: 'Paris',
          alternatives: ['paris'],
          caseSensitive: false,
        } as TextInputContent,
      });

      rerender({ t: newTask });

      // Answer should be reset
      expect(result.current.answer).toBe('');
    });

    it('should reset to empty when task becomes null', () => {
      const { result, rerender } = renderHook(
        ({ t }) => useTextInput(t, false),
        { initialProps: { t: task } }
      );

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.answer).toBe('Berlin');

      rerender({ t: null });

      expect(result.current.answer).toBe('');
    });
  });

  describe('User Input', () => {
    it('should update answer when setAnswer is called', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.answer).toBe('Berlin');
    });

    it('should handle multiple answer updates', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('B');
      });
      expect(result.current.answer).toBe('B');

      act(() => {
        result.current.setAnswer('Be');
      });
      expect(result.current.answer).toBe('Be');

      act(() => {
        result.current.setAnswer('Berlin');
      });
      expect(result.current.answer).toBe('Berlin');
    });

    it('should handle empty string input', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      act(() => {
        result.current.setAnswer('');
      });

      expect(result.current.answer).toBe('');
    });

    it('should preserve whitespace in answer', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('  Berlin  ');
      });

      expect(result.current.answer).toBe('  Berlin  ');
    });

    it('should handle special characters', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin!@#$%');
      });

      expect(result.current.answer).toBe('Berlin!@#$%');
    });
  });

  describe('Can Submit', () => {
    it('should return false when answer is empty', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return false when answer contains only whitespace', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('   ');
      });

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return true when answer has non-whitespace content', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('B');
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true even with leading/trailing whitespace', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('  Berlin  ');
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should update when answer changes', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      expect(result.current.canSubmit()).toBe(false);

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.canSubmit()).toBe(true);

      act(() => {
        result.current.setAnswer('');
      });

      expect(result.current.canSubmit()).toBe(false);
    });
  });

  describe('Check Answer - Case Insensitive', () => {
    beforeEach(() => {
      task = createTextInputTask({
        content: {
          question: 'What is the capital of Germany?',
          correctAnswer: 'Berlin',
          alternatives: ['berlin', 'BERLIN'],
          caseSensitive: false,
        } as TextInputContent,
      });
    });

    it('should return true for exact match', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return true for lowercase match', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('berlin');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return true for uppercase match', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('BERLIN');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return true for mixed case match', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('bErLiN');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should trim whitespace before checking', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('  Berlin  ');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Munich');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false for partial match', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Ber');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false for answer with extra characters', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin city');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });
  });

  describe('Check Answer - Case Sensitive', () => {
    beforeEach(() => {
      task = createTextInputTask({
        content: {
          question: 'What is the capital of Germany?',
          correctAnswer: 'Berlin',
          alternatives: ['Berlín'],
          caseSensitive: true,
        } as TextInputContent,
      });
    });

    it('should return true for exact match', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false for lowercase when case-sensitive', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('berlin');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false for uppercase when case-sensitive', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('BERLIN');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should still trim whitespace when case-sensitive', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('  Berlin  ');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should match case-sensitive alternative', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlín');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should not match alternative with wrong case', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('berlín');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });
  });

  describe('Alternative Answers', () => {
    beforeEach(() => {
      task = createTextInputTask({
        content: {
          question: 'What is the largest German city?',
          correctAnswer: 'Berlin',
          alternatives: ['berlin', 'The capital', 'Capital of Germany'],
          caseSensitive: false,
        } as TextInputContent,
      });
    });

    it('should accept first alternative', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('berlin');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should accept any alternative', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('The capital');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle alternatives case-insensitively', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('CAPITAL OF GERMANY');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should trim alternatives before matching', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('  The capital  ');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle empty alternatives array', () => {
      const taskNoAlternatives = createTextInputTask({
        content: {
          question: 'What is the capital of Germany?',
          correctAnswer: 'Berlin',
          alternatives: [],
          caseSensitive: false,
        } as TextInputContent,
      });

      const { result } = renderHook(() => useTextInput(taskNoAlternatives, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle undefined alternatives', () => {
      const taskNoAlternatives = createTextInputTask({
        content: {
          question: 'What is the capital of Germany?',
          correctAnswer: 'Berlin',
          caseSensitive: false,
        } as TextInputContent,
      });

      const { result } = renderHook(() => useTextInput(taskNoAlternatives, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should return false when checking with empty answer', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when checking with whitespace-only answer', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('   ');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when task is null', () => {
      const { result } = renderHook(() => useTextInput(null, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when task type is incorrect', () => {
      const wrongTypeTask = {
        ...task,
        type: 'multiple-choice' as const,
      };

      const { result } = renderHook(() => useTextInput(wrongTypeTask, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should handle numeric answers', () => {
      const numericTask = createTextInputTask({
        content: {
          question: 'How many states does Germany have?',
          correctAnswer: '16',
          alternatives: ['sixteen'],
          caseSensitive: false,
        } as TextInputContent,
      });

      const { result } = renderHook(() => useTextInput(numericTask, false));

      act(() => {
        result.current.setAnswer('16');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle answers with diacritics', () => {
      const diacriticTask = createTextInputTask({
        content: {
          question: 'What is the Spanish name for Germany?',
          correctAnswer: 'Alemania',
          alternatives: ['alemania'],
          caseSensitive: false,
        } as TextInputContent,
      });

      const { result } = renderHook(() => useTextInput(diacriticTask, false));

      act(() => {
        result.current.setAnswer('Alemania');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle multi-word answers', () => {
      const multiWordTask = createTextInputTask({
        content: {
          question: 'What is the capital of the United States?',
          correctAnswer: 'Washington DC',
          alternatives: ['Washington D.C.', 'Washington, D.C.'],
          caseSensitive: false,
        } as TextInputContent,
      });

      const { result } = renderHook(() => useTextInput(multiWordTask, false));

      act(() => {
        result.current.setAnswer('Washington DC');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should not match substring of correct answer', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berl');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should not match superstring of correct answer', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin Germany');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });
  });

  describe('Reset State', () => {
    it('should clear answer', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.answer).toBe('Berlin');

      act(() => {
        result.current.resetState();
      });

      expect(result.current.answer).toBe('');
    });

    it('should make canSubmit return false after reset', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.canSubmit()).toBe(true);

      act(() => {
        result.current.resetState();
      });

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should allow setting new answer after reset', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin');
        result.current.resetState();
        result.current.setAnswer('Munich');
      });

      expect(result.current.answer).toBe('Munich');
    });

    it('should be idempotent', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      act(() => {
        result.current.setAnswer('Berlin');
      });

      act(() => {
        result.current.resetState();
        result.current.resetState();
        result.current.resetState();
      });

      expect(result.current.answer).toBe('');
    });
  });

  describe('ShowFeedback Parameter', () => {
    it('should not affect answer state', () => {
      const { result, rerender } = renderHook(
        ({ showFeedback }) => useTextInput(task, showFeedback),
        { initialProps: { showFeedback: false } }
      );

      act(() => {
        result.current.setAnswer('Berlin');
      });

      rerender({ showFeedback: true });

      expect(result.current.answer).toBe('Berlin');
    });

    it('should not affect canSubmit', () => {
      const { result, rerender } = renderHook(
        ({ showFeedback }) => useTextInput(task, showFeedback),
        { initialProps: { showFeedback: false } }
      );

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.canSubmit()).toBe(true);

      rerender({ showFeedback: true });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should not affect checkAnswer', () => {
      const { result, rerender } = renderHook(
        ({ showFeedback }) => useTextInput(task, showFeedback),
        { initialProps: { showFeedback: false } }
      );

      act(() => {
        result.current.setAnswer('Berlin');
      });

      expect(result.current.checkAnswer()).toBe(true);

      rerender({ showFeedback: true });

      expect(result.current.checkAnswer()).toBe(true);
    });
  });

  describe('Default caseSensitive Behavior', () => {
    it('should default to case-insensitive when caseSensitive is undefined', () => {
      const taskNoCaseSetting = createTextInputTask({
        content: {
          question: 'What is the capital of Germany?',
          correctAnswer: 'Berlin',
        } as TextInputContent,
      });

      const { result } = renderHook(() => useTextInput(taskNoCaseSetting, false));

      act(() => {
        result.current.setAnswer('berlin');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should default to case-insensitive when caseSensitive is null', () => {
      const taskNoCaseSetting = createTextInputTask({
        content: {
          question: 'What is the capital of Germany?',
          correctAnswer: 'Berlin',
          caseSensitive: null as unknown as boolean,
        } as TextInputContent,
      });

      const { result } = renderHook(() => useTextInput(taskNoCaseSetting, false));

      act(() => {
        result.current.setAnswer('BERLIN');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });
  });

  describe('Return Value Structure', () => {
    it('should return all expected state properties', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      expect(result.current).toHaveProperty('answer');
      expect(typeof result.current.answer).toBe('string');
    });

    it('should return all expected action methods', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      expect(result.current).toHaveProperty('setAnswer');
      expect(result.current).toHaveProperty('canSubmit');
      expect(result.current).toHaveProperty('checkAnswer');
      expect(result.current).toHaveProperty('resetState');

      expect(typeof result.current.setAnswer).toBe('function');
      expect(typeof result.current.canSubmit).toBe('function');
      expect(typeof result.current.checkAnswer).toBe('function');
      expect(typeof result.current.resetState).toBe('function');
    });

    it('should have stable function references for functions without dependencies', () => {
      const { result, rerender } = renderHook(() => useTextInput(task, false));

      const initialSetAnswer = result.current.setAnswer;
      const initialResetState = result.current.resetState;

      act(() => {
        result.current.setAnswer('Berlin');
      });

      rerender();

      // setAnswer and resetState should maintain stable references (no dependencies)
      expect(result.current.resetState).toBe(initialResetState);
      expect(result.current.setAnswer).toBe(initialSetAnswer);
    });

    it('should recreate canSubmit and checkAnswer when answer changes', () => {
      const { result } = renderHook(() => useTextInput(task, false));

      const initialCanSubmit = result.current.canSubmit;
      const initialCheckAnswer = result.current.checkAnswer;

      act(() => {
        result.current.setAnswer('Berlin');
      });

      // canSubmit and checkAnswer depend on answer, so they should be recreated
      expect(result.current.canSubmit).not.toBe(initialCanSubmit);
      expect(result.current.checkAnswer).not.toBe(initialCheckAnswer);
    });
  });
});
