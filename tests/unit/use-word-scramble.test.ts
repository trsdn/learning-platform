/**
 * Tests for useWordScramble hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWordScramble } from '../../src/modules/ui/components/practice/tasks/WordScramble/use-word-scramble';
import { createWordScrambleTask } from '../factories/task-factory';
import type { Task } from '../../src/modules/core/types/services';

describe('useWordScramble', () => {
  let task: Task;

  beforeEach(() => {
    // Default task: scrambled "LREBNI" should be "BERLIN"
    task = createWordScrambleTask();
  });

  describe('Initialization', () => {
    it('should initialize with empty answer', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      expect(result.current.answer).toBe('');
    });

    it('should reset answer when task changes', () => {
      const { result, rerender } = renderHook(
        ({ t }) => useWordScramble(t, false),
        { initialProps: { t: task } }
      );

      // Set an answer
      act(() => {
        result.current.setAnswer('BERLIN');
      });

      expect(result.current.answer).toBe('BERLIN');

      // Change task
      const newTask = createWordScrambleTask({
        id: 'different-task',
        content: {
          scrambledWord: 'HSUCE',
          correctWord: 'SUCHE',
          hint: 'Looking for something',
        },
      });

      rerender({ t: newTask });

      expect(result.current.answer).toBe('');
    });

    it('should handle null task', () => {
      const { result } = renderHook(() => useWordScramble(null, false));

      expect(result.current.answer).toBe('');
    });
  });

  describe('Set Answer', () => {
    it('should update answer when set', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('BERLIN');
      });

      expect(result.current.answer).toBe('BERLIN');
    });

    it('should allow partial answers', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('BER');
      });

      expect(result.current.answer).toBe('BER');
    });

    it('should allow lowercase answers', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('berlin');
      });

      expect(result.current.answer).toBe('berlin');
    });

    it('should allow answers with spaces', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer(' BERLIN ');
      });

      expect(result.current.answer).toBe(' BERLIN ');
    });
  });

  describe('Can Submit', () => {
    it('should return false when answer is empty', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return false when answer is only whitespace', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('   ');
      });

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return true when answer has content', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('BERLIN');
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true when answer has content with surrounding spaces', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('  BERLIN  ');
      });

      expect(result.current.canSubmit()).toBe(true);
    });
  });

  describe('Check Answer', () => {
    it('should return true for correct answer (exact case)', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('BERLIN');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return true for correct answer (case insensitive)', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('berlin');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return true for correct answer (mixed case)', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('BeRLiN');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return true for correct answer with surrounding spaces', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('  BERLIN  ');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('MUNICH');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false for partial answer', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('BER');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false for empty answer', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false for whitespace-only answer', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      act(() => {
        result.current.setAnswer('   ');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when task is null', () => {
      const { result } = renderHook(() => useWordScramble(null, false));

      act(() => {
        result.current.setAnswer('BERLIN');
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should handle single character words', () => {
      const singleCharTask = createWordScrambleTask({
        content: {
          scrambledWord: 'A',
          correctWord: 'A',
          hint: 'Single letter',
        },
      });

      const { result } = renderHook(() =>
        useWordScramble(singleCharTask, false)
      );

      act(() => {
        result.current.setAnswer('A');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle multi-word answers (if supported)', () => {
      const multiWordTask = createWordScrambleTask({
        content: {
          scrambledWord: 'NEU KROY',
          correctWord: 'NEW YORK',
          hint: 'A city',
        },
      });

      const { result } = renderHook(() =>
        useWordScramble(multiWordTask, false)
      );

      act(() => {
        result.current.setAnswer('NEW YORK');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle German umlauts', () => {
      const umlautTask = createWordScrambleTask({
        content: {
          scrambledWord: 'ÜNHMENC',
          correctWord: 'MÜNCHEN',
          hint: 'City in Bavaria',
        },
      });

      const { result } = renderHook(() => useWordScramble(umlautTask, false));

      act(() => {
        result.current.setAnswer('münchen');
      });

      expect(result.current.checkAnswer()).toBe(true);
    });
  });

  describe('Reset State', () => {
    it('should clear answer', () => {
      const { result } = renderHook(() => useWordScramble(task, false));

      // Set an answer
      act(() => {
        result.current.setAnswer('BERLIN');
      });

      expect(result.current.answer).toBe('BERLIN');

      // Reset
      act(() => {
        result.current.resetState();
      });

      expect(result.current.answer).toBe('');
    });
  });
});
