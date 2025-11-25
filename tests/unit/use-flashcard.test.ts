/**
 * Tests for useFlashcard hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlashcard } from '../../src/modules/ui/components/practice/tasks/Flashcard/use-flashcard';
import { createFlashcardTask } from '../factories/task-factory';
import type { Task } from '../../src/modules/core/types/services';

describe('useFlashcard', () => {
  let task: Task;

  beforeEach(() => {
    // Default task: front "Was ist die Hauptstadt von Deutschland?" -> back "Berlin"
    task = createFlashcardTask();
  });

  describe('Initialization', () => {
    it('should initialize with not revealed and no assessment', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      expect(result.current.revealed).toBe(false);
      expect(result.current.known).toBe(null);
    });

    it('should reset state when task changes', () => {
      const { result, rerender } = renderHook(
        ({ t }) => useFlashcard(t, false),
        { initialProps: { t: task } }
      );

      // Reveal and assess
      act(() => {
        result.current.setRevealed(true);
        result.current.setKnown(true);
      });

      expect(result.current.revealed).toBe(true);
      expect(result.current.known).toBe(true);

      // Change task
      const newTask = createFlashcardTask({
        id: 'different-task',
        content: {
          front: 'Hola',
          back: 'Hello',
        },
      });

      rerender({ t: newTask });

      expect(result.current.revealed).toBe(false);
      expect(result.current.known).toBe(null);
    });

    it('should handle null task', () => {
      const { result } = renderHook(() => useFlashcard(null, false));

      expect(result.current.revealed).toBe(false);
      expect(result.current.known).toBe(null);
    });
  });

  describe('Set Revealed', () => {
    it('should reveal flashcard', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      expect(result.current.revealed).toBe(false);

      act(() => {
        result.current.setRevealed(true);
      });

      expect(result.current.revealed).toBe(true);
    });

    it('should allow hiding flashcard again', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      act(() => {
        result.current.setRevealed(true);
      });

      expect(result.current.revealed).toBe(true);

      act(() => {
        result.current.setRevealed(false);
      });

      expect(result.current.revealed).toBe(false);
    });
  });

  describe('Set Known', () => {
    it('should set known to true', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      expect(result.current.known).toBe(null);

      act(() => {
        result.current.setKnown(true);
      });

      expect(result.current.known).toBe(true);
    });

    it('should set known to false', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      expect(result.current.known).toBe(null);

      act(() => {
        result.current.setKnown(false);
      });

      expect(result.current.known).toBe(false);
    });

    it('should allow changing known value', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      act(() => {
        result.current.setKnown(true);
      });

      expect(result.current.known).toBe(true);

      act(() => {
        result.current.setKnown(false);
      });

      expect(result.current.known).toBe(false);
    });
  });

  describe('Can Submit', () => {
    it('should return false when assessment not made', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      expect(result.current.canSubmit()).toBe(false);
    });

    it('should return true when known is true', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      act(() => {
        result.current.setKnown(true);
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true when known is false', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      act(() => {
        result.current.setKnown(false);
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should work even if flashcard not revealed', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      // Technically user could assess without revealing (shouldn't happen in UI)
      act(() => {
        result.current.setKnown(true);
      });

      expect(result.current.canSubmit()).toBe(true);
    });
  });

  describe('Check Answer', () => {
    it('should return true when user knew the flashcard', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      act(() => {
        result.current.setKnown(true);
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false when user did not know the flashcard', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      act(() => {
        result.current.setKnown(false);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when no assessment made', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should work regardless of revealed state', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      // Without revealing
      act(() => {
        result.current.setKnown(true);
      });

      expect(result.current.checkAnswer()).toBe(true);

      // Reset and test with revealing
      act(() => {
        result.current.resetState();
      });

      act(() => {
        result.current.setRevealed(true);
        result.current.setKnown(true);
      });

      expect(result.current.checkAnswer()).toBe(true);
    });
  });

  describe('Reset State', () => {
    it('should reset revealed and known', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      // Reveal and assess
      act(() => {
        result.current.setRevealed(true);
        result.current.setKnown(true);
      });

      expect(result.current.revealed).toBe(true);
      expect(result.current.known).toBe(true);

      // Reset
      act(() => {
        result.current.resetState();
      });

      expect(result.current.revealed).toBe(false);
      expect(result.current.known).toBe(null);
    });
  });

  describe('Typical Workflow', () => {
    it('should handle normal flashcard workflow', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      // 1. Initial state
      expect(result.current.revealed).toBe(false);
      expect(result.current.known).toBe(null);
      expect(result.current.canSubmit()).toBe(false);

      // 2. User reveals flashcard
      act(() => {
        result.current.setRevealed(true);
      });

      expect(result.current.revealed).toBe(true);
      expect(result.current.canSubmit()).toBe(false); // Still no assessment

      // 3. User assesses they knew it
      act(() => {
        result.current.setKnown(true);
      });

      expect(result.current.canSubmit()).toBe(true);
      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should handle workflow when user did not know', () => {
      const { result } = renderHook(() => useFlashcard(task, false));

      // 1. Reveal
      act(() => {
        result.current.setRevealed(true);
      });

      // 2. User assesses they did not know it
      act(() => {
        result.current.setKnown(false);
      });

      expect(result.current.canSubmit()).toBe(true);
      expect(result.current.checkAnswer()).toBe(false);
    });
  });
});
