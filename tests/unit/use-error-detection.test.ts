/**
 * Tests for useErrorDetection hook
 *
 * Tests the error detection task hook which handles:
 * - Parsing content into clickable segments
 * - Toggle selection of segments (errors)
 * - Checking answers with partial credit scoring
 * - Keyboard navigation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorDetection } from '../../src/modules/ui/components/practice/tasks/ErrorDetection/use-error-detection';
import {
  createErrorDetectionTask,
  createErrorDetectionTaskNoErrors,
  createErrorDetectionTaskMultiWord,
} from '../factories/task-factory';
import type { Task } from '../../src/modules/core/types/services';

describe('useErrorDetection', () => {
  let task: Task;

  beforeEach(() => {
    // Default task: 2 errors (Sydney -> Canberra, 1888 -> 1913)
    task = createErrorDetectionTask();
  });

  describe('Initialization', () => {
    it('should initialize with empty selections', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      expect(result.current.selectedIndices.size).toBe(0);
    });

    it('should parse content into segments', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      expect(result.current.segments.length).toBeGreaterThan(0);
      // Should have segments for each word plus the error segments
      expect(result.current.segments.some((s) => s.isError)).toBe(true);
    });

    it('should identify error segments correctly', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      const errorSegments = result.current.segments.filter((s) => s.isError);
      expect(errorSegments.length).toBe(2); // Sydney and 1888
    });

    it('should reset when task changes', () => {
      const { result, rerender } = renderHook(
        ({ t }) => useErrorDetection(t, false),
        { initialProps: { t: task } }
      );

      act(() => {
        result.current.toggleSelection(0);
      });

      expect(result.current.selectedIndices.size).toBe(1);

      const newTask = createErrorDetectionTaskMultiWord();

      rerender({ t: newTask });

      expect(result.current.selectedIndices.size).toBe(0);
    });

    it('should handle null task', () => {
      const { result } = renderHook(() => useErrorDetection(null, false));

      expect(result.current.selectedIndices.size).toBe(0);
      expect(result.current.segments).toEqual([]);
    });

    it('should handle task with no errors', () => {
      const noErrorTask = createErrorDetectionTaskNoErrors();
      const { result } = renderHook(() => useErrorDetection(noErrorTask, false));

      expect(result.current.segments.length).toBeGreaterThan(0);
      expect(result.current.segments.every((s) => !s.isError)).toBe(true);
    });
  });

  describe('Toggle Selection', () => {
    it('should add index to selection', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      act(() => {
        result.current.toggleSelection(0);
      });

      expect(result.current.selectedIndices.has(0)).toBe(true);
    });

    it('should remove index from selection when toggled again', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      act(() => {
        result.current.toggleSelection(0);
      });

      expect(result.current.selectedIndices.has(0)).toBe(true);

      act(() => {
        result.current.toggleSelection(0);
      });

      expect(result.current.selectedIndices.has(0)).toBe(false);
    });

    it('should allow multiple selections', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      act(() => {
        result.current.toggleSelection(0);
        result.current.toggleSelection(2);
        result.current.toggleSelection(4);
      });

      expect(result.current.selectedIndices.size).toBe(3);
      expect(result.current.selectedIndices.has(0)).toBe(true);
      expect(result.current.selectedIndices.has(2)).toBe(true);
      expect(result.current.selectedIndices.has(4)).toBe(true);
    });

    it('should not allow selection when showFeedback is true', () => {
      const { result } = renderHook(() => useErrorDetection(task, true));

      act(() => {
        result.current.toggleSelection(0);
      });

      expect(result.current.selectedIndices.size).toBe(0);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should initialize cursor to -1', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      expect(result.current.cursor).toBe(-1);
    });

    it('should move cursor forward', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      act(() => {
        result.current.moveCursor(1);
      });

      expect(result.current.cursor).toBe(0);

      act(() => {
        result.current.moveCursor(1);
      });

      expect(result.current.cursor).toBe(1);
    });

    it('should move cursor backward', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      act(() => {
        result.current.moveCursor(1);
        result.current.moveCursor(1);
        result.current.moveCursor(1);
      });

      expect(result.current.cursor).toBe(2);

      act(() => {
        result.current.moveCursor(-1);
      });

      expect(result.current.cursor).toBe(1);
    });

    it('should not move cursor below -1', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      act(() => {
        result.current.moveCursor(-1);
      });

      expect(result.current.cursor).toBe(-1);
    });

    it('should not move cursor beyond segments length', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      const segmentsLength = result.current.segments.length;

      // Move to last segment
      for (let i = 0; i <= segmentsLength; i++) {
        act(() => {
          result.current.moveCursor(1);
        });
      }

      expect(result.current.cursor).toBe(segmentsLength - 1);
    });

    it('should allow toggling at cursor position', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      act(() => {
        result.current.moveCursor(1); // Move to index 0
      });

      act(() => {
        result.current.toggleSelection(result.current.cursor);
      });

      expect(result.current.selectedIndices.has(0)).toBe(true);
    });
  });

  describe('Can Submit', () => {
    it('should return true with no selections (can submit empty)', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true with selections', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      act(() => {
        result.current.toggleSelection(0);
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true for task with no errors and no selections', () => {
      const noErrorTask = createErrorDetectionTaskNoErrors();
      const { result } = renderHook(() => useErrorDetection(noErrorTask, false));

      expect(result.current.canSubmit()).toBe(true);
    });
  });

  describe('Check Answer', () => {
    it('should return true when all errors found and no false positives', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      // Find indices of actual errors
      const errorIndices = result.current.segments
        .map((s, i) => (s.isError ? i : -1))
        .filter((i) => i !== -1);

      // Select all errors
      act(() => {
        errorIndices.forEach((i) => result.current.toggleSelection(i));
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false when some errors missed', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      // Find only the first error index
      const firstErrorIndex = result.current.segments.findIndex((s) => s.isError);

      act(() => {
        result.current.toggleSelection(firstErrorIndex);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when there are false positives', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      // Find all error indices and select them
      const errorIndices = result.current.segments
        .map((s, i) => (s.isError ? i : -1))
        .filter((i) => i !== -1);

      act(() => {
        errorIndices.forEach((i) => result.current.toggleSelection(i));
      });

      // Also select a non-error segment (false positive)
      const nonErrorIndex = result.current.segments.findIndex((s) => !s.isError);

      act(() => {
        result.current.toggleSelection(nonErrorIndex);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when no selections but errors exist', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return true for task with no errors and no selections', () => {
      const noErrorTask = createErrorDetectionTaskNoErrors();
      const { result } = renderHook(() => useErrorDetection(noErrorTask, false));

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false for task with no errors but with selections', () => {
      const noErrorTask = createErrorDetectionTaskNoErrors();
      const { result } = renderHook(() => useErrorDetection(noErrorTask, false));

      act(() => {
        result.current.toggleSelection(0);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when task is null', () => {
      const { result } = renderHook(() => useErrorDetection(null, false));

      expect(result.current.checkAnswer()).toBe(false);
    });
  });

  describe('Get Score', () => {
    it('should return perfect score when all errors found with no false positives', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      // Find and select all error indices
      const errorIndices = result.current.segments
        .map((s, i) => (s.isError ? i : -1))
        .filter((i) => i !== -1);

      act(() => {
        errorIndices.forEach((i) => result.current.toggleSelection(i));
      });

      const score = result.current.getScore();
      expect(score.hits).toBe(2);
      expect(score.falsePositives).toBe(0);
      expect(score.totalErrors).toBe(2);
      expect(score.missedErrors).toBe(0);
      expect(score.score).toBe(1); // (2 - 0) / 2 = 1
    });

    it('should return partial score when some errors found', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      // Find first error index
      const firstErrorIndex = result.current.segments.findIndex((s) => s.isError);

      act(() => {
        result.current.toggleSelection(firstErrorIndex);
      });

      const score = result.current.getScore();
      expect(score.hits).toBe(1);
      expect(score.falsePositives).toBe(0);
      expect(score.totalErrors).toBe(2);
      expect(score.missedErrors).toBe(1);
      expect(score.score).toBe(0.5); // (1 - 0) / 2 = 0.5
    });

    it('should reduce score with false positives', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      // Find all error indices and select them
      const errorIndices = result.current.segments
        .map((s, i) => (s.isError ? i : -1))
        .filter((i) => i !== -1);

      act(() => {
        errorIndices.forEach((i) => result.current.toggleSelection(i));
      });

      // Add one false positive
      const nonErrorIndex = result.current.segments.findIndex((s) => !s.isError);

      act(() => {
        result.current.toggleSelection(nonErrorIndex);
      });

      const score = result.current.getScore();
      expect(score.hits).toBe(2);
      expect(score.falsePositives).toBe(1);
      expect(score.totalErrors).toBe(2);
      expect(score.score).toBe(0.5); // (2 - 1) / 2 = 0.5
    });

    it('should return zero score when only false positives', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      // Select only non-error segments
      const nonErrorIndices = result.current.segments
        .map((s, i) => (!s.isError ? i : -1))
        .filter((i) => i !== -1)
        .slice(0, 2);

      act(() => {
        nonErrorIndices.forEach((i) => result.current.toggleSelection(i));
      });

      const score = result.current.getScore();
      expect(score.hits).toBe(0);
      expect(score.falsePositives).toBe(2);
      expect(score.totalErrors).toBe(2);
      expect(score.score).toBe(0); // Max(0, (0 - 2) / 2) = 0
    });

    it('should handle task with no errors', () => {
      const noErrorTask = createErrorDetectionTaskNoErrors();
      const { result } = renderHook(() => useErrorDetection(noErrorTask, false));

      const score = result.current.getScore();
      expect(score.hits).toBe(0);
      expect(score.falsePositives).toBe(0);
      expect(score.totalErrors).toBe(0);
      expect(score.missedErrors).toBe(0);
      expect(score.score).toBe(1); // No errors = perfect score when no selections
    });

    it('should return zero score for null task', () => {
      const { result } = renderHook(() => useErrorDetection(null, false));

      const score = result.current.getScore();
      expect(score.score).toBe(0);
    });
  });

  describe('Reset State', () => {
    it('should clear all selections', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      act(() => {
        result.current.toggleSelection(0);
        result.current.toggleSelection(2);
      });

      expect(result.current.selectedIndices.size).toBe(2);

      act(() => {
        result.current.resetState();
      });

      expect(result.current.selectedIndices.size).toBe(0);
    });

    it('should reset cursor', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      act(() => {
        result.current.moveCursor(1);
        result.current.moveCursor(1);
      });

      expect(result.current.cursor).toBe(1);

      act(() => {
        result.current.resetState();
      });

      expect(result.current.cursor).toBe(-1);
    });

    it('should preserve segments after reset', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      const segmentsBeforeReset = result.current.segments.length;

      act(() => {
        result.current.toggleSelection(0);
        result.current.resetState();
      });

      expect(result.current.segments.length).toBe(segmentsBeforeReset);
    });
  });

  describe('Multi-word Error Handling', () => {
    it('should treat multi-word phrases as single selectable segments', () => {
      const multiWordTask = createErrorDetectionTaskMultiWord();
      const { result } = renderHook(() => useErrorDetection(multiWordTask, false));

      // "Los Angeles" should be a single segment
      const losAngelesSegment = result.current.segments.find(
        (s) => s.text === 'Los Angeles'
      );

      expect(losAngelesSegment).toBeDefined();
      expect(losAngelesSegment?.isError).toBe(true);
    });

    it('should correctly identify multi-word error segments', () => {
      const multiWordTask = createErrorDetectionTaskMultiWord();
      const { result } = renderHook(() => useErrorDetection(multiWordTask, false));

      const errorSegments = result.current.segments.filter((s) => s.isError);
      expect(errorSegments.length).toBe(2); // "Los Angeles" and "England"
    });
  });

  describe('Get User Answer', () => {
    it('should return selected segment texts', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      // Find error indices
      const errorIndices = result.current.segments
        .map((s, i) => (s.isError ? i : -1))
        .filter((i) => i !== -1);

      act(() => {
        result.current.toggleSelection(errorIndices[0]!);
      });

      const answer = result.current.getUserAnswer();
      expect(answer.length).toBe(1);
      expect(typeof answer[0]).toBe('string');
    });

    it('should return empty array when no selections', () => {
      const { result } = renderHook(() => useErrorDetection(task, false));

      const answer = result.current.getUserAnswer();
      expect(answer).toEqual([]);
    });
  });
});
