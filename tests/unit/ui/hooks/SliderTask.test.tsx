/**
 * Tests for useSlider hook
 *
 * Tests the slider task functionality including:
 * - Initial state and value initialization
 * - User interactions (sliding/setting values)
 * - Answer submission validation
 * - Correctness evaluation with tolerance
 * - Edge cases and boundary conditions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlider } from '../../../../src/modules/ui/components/practice/tasks/Slider/use-slider';
import { createSliderTask } from '../../../factories/task-factory';
import type { Task, SliderContent } from '@core/types/services';

describe('useSlider', () => {
  let task: Task;

  beforeEach(() => {
    task = createSliderTask({
      content: {
        question: 'Wie viele Bundesländer hat Deutschland?',
        min: 0,
        max: 20,
        correctValue: 16,
        tolerance: 0,
        unit: 'Bundesländer',
      },
    });
  });

  describe('Initialization', () => {
    it('should initialize with middle value of range', () => {
      const { result } = renderHook(() => useSlider(task, false));

      // Middle of 0-20 range = 10
      expect(result.current.value).toBe(10);
    });

    it('should calculate initial value correctly for different ranges', () => {
      const customTask = createSliderTask({
        content: {
          question: 'Test question',
          min: 10,
          max: 30,
          correctValue: 20,
          tolerance: 0,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(customTask, false));

      // Middle of 10-30 range = 20
      expect(result.current.value).toBe(20);
    });

    it('should handle odd range midpoint by flooring', () => {
      const customTask = createSliderTask({
        content: {
          question: 'Test question',
          min: 0,
          max: 15,
          correctValue: 7,
          tolerance: 0,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(customTask, false));

      // Middle of 0-15 range = floor(7.5) = 7
      expect(result.current.value).toBe(7);
    });

    it('should reset to 0 when task is null', () => {
      const { result } = renderHook(() => useSlider(null, false));

      expect(result.current.value).toBe(0);
    });

    it('should reset to 0 when task type is not slider', () => {
      const wrongTypeTask = createSliderTask();
      wrongTypeTask.type = 'multiple-choice' as 'slider';

      const { result } = renderHook(() => useSlider(wrongTypeTask, false));

      expect(result.current.value).toBe(0);
    });
  });

  describe('Task Changes', () => {
    it('should reinitialize value when task changes', () => {
      const { result, rerender } = renderHook(
        ({ task }) => useSlider(task, false),
        { initialProps: { task } }
      );

      // Initial value is middle of 0-20 = 10
      expect(result.current.value).toBe(10);

      // Change value
      act(() => {
        result.current.setValue(16);
      });

      expect(result.current.value).toBe(16);

      // Change task
      const newTask = createSliderTask({
        id: 'task-2',
        content: {
          question: 'Different question',
          min: 0,
          max: 100,
          correctValue: 50,
          tolerance: 5,
        } as SliderContent,
      });

      rerender({ task: newTask });

      // Should reset to middle of new range (0-100 = 50)
      expect(result.current.value).toBe(50);
    });

    it('should reset to 0 when task becomes null', () => {
      const { result, rerender } = renderHook(
        ({ task }) => useSlider(task, false),
        { initialProps: { task } }
      );

      expect(result.current.value).toBe(10);

      rerender({ task: null });

      expect(result.current.value).toBe(0);
    });
  });

  describe('setValue', () => {
    it('should update value when setValue is called', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(16);
      });

      expect(result.current.value).toBe(16);
    });

    it('should allow setting value to minimum', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(0);
      });

      expect(result.current.value).toBe(0);
    });

    it('should allow setting value to maximum', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(20);
      });

      expect(result.current.value).toBe(20);
    });

    it('should allow changing value multiple times', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(5);
      });

      expect(result.current.value).toBe(5);

      act(() => {
        result.current.setValue(15);
      });

      expect(result.current.value).toBe(15);

      act(() => {
        result.current.setValue(8);
      });

      expect(result.current.value).toBe(8);
    });
  });

  describe('canSubmit', () => {
    it('should always return true (slider always has a value)', () => {
      const { result } = renderHook(() => useSlider(task, false));

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true even at initial state', () => {
      const { result } = renderHook(() => useSlider(task, false));

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true after value changes', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(16);
      });

      expect(result.current.canSubmit()).toBe(true);
    });

    it('should return true at boundary values', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(0);
      });

      expect(result.current.canSubmit()).toBe(true);

      act(() => {
        result.current.setValue(20);
      });

      expect(result.current.canSubmit()).toBe(true);
    });
  });

  describe('checkAnswer - Exact Match (no tolerance)', () => {
    it('should return true when value equals correct answer', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(16);
      });

      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false when value is less than correct answer', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(15);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when value is greater than correct answer', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(17);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false when value is far from correct answer', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(5);
      });

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false at initial value if not correct', () => {
      const { result } = renderHook(() => useSlider(task, false));

      // Initial value is 10, correct is 16
      expect(result.current.checkAnswer()).toBe(false);
    });
  });

  describe('checkAnswer - With Tolerance', () => {
    it('should return true when value is within positive tolerance', () => {
      const toleranceTask = createSliderTask({
        content: {
          question: 'Test question',
          min: 0,
          max: 100,
          correctValue: 50,
          tolerance: 5,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(toleranceTask, false));

      // Test values within tolerance (50 ± 5)
      act(() => {
        result.current.setValue(55); // +5
      });
      expect(result.current.checkAnswer()).toBe(true);

      act(() => {
        result.current.setValue(45); // -5
      });
      expect(result.current.checkAnswer()).toBe(true);

      act(() => {
        result.current.setValue(50); // exact
      });
      expect(result.current.checkAnswer()).toBe(true);
    });

    it('should return false when value is outside tolerance range', () => {
      const toleranceTask = createSliderTask({
        content: {
          question: 'Test question',
          min: 0,
          max: 100,
          correctValue: 50,
          tolerance: 5,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(toleranceTask, false));

      // Test values outside tolerance (50 ± 5)
      act(() => {
        result.current.setValue(56); // +6
      });
      expect(result.current.checkAnswer()).toBe(false);

      act(() => {
        result.current.setValue(44); // -6
      });
      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should handle tolerance at boundary values', () => {
      const toleranceTask = createSliderTask({
        content: {
          question: 'Test question',
          min: 0,
          max: 100,
          correctValue: 50,
          tolerance: 3,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(toleranceTask, false));

      // Exactly at boundary
      act(() => {
        result.current.setValue(53); // +3 (boundary)
      });
      expect(result.current.checkAnswer()).toBe(true);

      act(() => {
        result.current.setValue(47); // -3 (boundary)
      });
      expect(result.current.checkAnswer()).toBe(true);

      // Just outside boundary
      act(() => {
        result.current.setValue(54); // +4 (outside)
      });
      expect(result.current.checkAnswer()).toBe(false);

      act(() => {
        result.current.setValue(46); // -4 (outside)
      });
      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should use 0 tolerance when tolerance is undefined', () => {
      const noToleranceTask = createSliderTask({
        content: {
          question: 'Test question',
          min: 0,
          max: 100,
          correctValue: 50,
          // tolerance is undefined
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(noToleranceTask, false));

      // Exact value should be correct
      act(() => {
        result.current.setValue(50);
      });
      expect(result.current.checkAnswer()).toBe(true);

      // Off by 1 should be wrong
      act(() => {
        result.current.setValue(51);
      });
      expect(result.current.checkAnswer()).toBe(false);

      act(() => {
        result.current.setValue(49);
      });
      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should handle large tolerance values', () => {
      const largeToleranceTask = createSliderTask({
        content: {
          question: 'Test question',
          min: 0,
          max: 100,
          correctValue: 50,
          tolerance: 20,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(largeToleranceTask, false));

      // Wide range should be accepted (30-70)
      act(() => {
        result.current.setValue(30);
      });
      expect(result.current.checkAnswer()).toBe(true);

      act(() => {
        result.current.setValue(70);
      });
      expect(result.current.checkAnswer()).toBe(true);

      // Outside range should fail
      act(() => {
        result.current.setValue(29);
      });
      expect(result.current.checkAnswer()).toBe(false);

      act(() => {
        result.current.setValue(71);
      });
      expect(result.current.checkAnswer()).toBe(false);
    });
  });

  describe('resetState', () => {
    it('should reset value to 0', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(16);
      });

      expect(result.current.value).toBe(16);

      act(() => {
        result.current.resetState();
      });

      expect(result.current.value).toBe(0);
    });

    it('should reset from any value', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(5);
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.value).toBe(0);

      act(() => {
        result.current.setValue(20);
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.value).toBe(0);
    });

    it('should allow setting value after reset', () => {
      const { result } = renderHook(() => useSlider(task, false));

      act(() => {
        result.current.setValue(16);
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.value).toBe(0);

      act(() => {
        result.current.setValue(12);
      });

      expect(result.current.value).toBe(12);
    });
  });

  describe('Edge Cases', () => {
    it('should handle task with minimum = maximum', () => {
      const singleValueTask = createSliderTask({
        content: {
          question: 'Single value slider',
          min: 10,
          max: 10,
          correctValue: 10,
          tolerance: 0,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(singleValueTask, false));

      // Should initialize to the only possible value
      expect(result.current.value).toBe(10);
    });

    it('should handle negative value ranges', () => {
      const negativeTask = createSliderTask({
        content: {
          question: 'Negative range',
          min: -10,
          max: 10,
          correctValue: 0,
          tolerance: 2,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(negativeTask, false));

      // Middle of -10 to 10 is 0
      expect(result.current.value).toBe(0);

      act(() => {
        result.current.setValue(-5);
      });
      expect(result.current.value).toBe(-5);

      act(() => {
        result.current.setValue(2);
      });
      expect(result.current.checkAnswer()).toBe(true); // Within tolerance
    });

    it('should handle decimal correct values with tolerance', () => {
      const decimalTask = createSliderTask({
        content: {
          question: 'Decimal values',
          min: 0,
          max: 10,
          correctValue: 5.5,
          tolerance: 0.5,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(decimalTask, false));

      act(() => {
        result.current.setValue(5);
      });
      expect(result.current.checkAnswer()).toBe(true); // 5 is within 5.5 ± 0.5

      act(() => {
        result.current.setValue(6);
      });
      expect(result.current.checkAnswer()).toBe(true); // 6 is within 5.5 ± 0.5

      act(() => {
        result.current.setValue(4);
      });
      expect(result.current.checkAnswer()).toBe(false); // 4 is outside 5.5 ± 0.5
    });

    it('should return false for checkAnswer when task is null', () => {
      const { result } = renderHook(() => useSlider(null, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should return false for checkAnswer when task type is wrong', () => {
      const wrongTypeTask = createSliderTask();
      wrongTypeTask.type = 'multiple-choice' as 'slider';

      const { result } = renderHook(() => useSlider(wrongTypeTask, false));

      expect(result.current.checkAnswer()).toBe(false);
    });

    it('should handle very large ranges', () => {
      const largeRangeTask = createSliderTask({
        content: {
          question: 'Large range',
          min: 0,
          max: 10000,
          correctValue: 5000,
          tolerance: 100,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(largeRangeTask, false));

      // Middle of 0-10000 = 5000
      expect(result.current.value).toBe(5000);

      act(() => {
        result.current.setValue(5100);
      });
      expect(result.current.checkAnswer()).toBe(true); // Within tolerance

      act(() => {
        result.current.setValue(5101);
      });
      expect(result.current.checkAnswer()).toBe(false); // Outside tolerance
    });

    it('should handle zero tolerance explicitly set', () => {
      const zeroToleranceTask = createSliderTask({
        content: {
          question: 'Zero tolerance',
          min: 0,
          max: 100,
          correctValue: 50,
          tolerance: 0,
        } as SliderContent,
      });

      const { result } = renderHook(() => useSlider(zeroToleranceTask, false));

      act(() => {
        result.current.setValue(50);
      });
      expect(result.current.checkAnswer()).toBe(true);

      act(() => {
        result.current.setValue(51);
      });
      expect(result.current.checkAnswer()).toBe(false);
    });
  });

  describe('showFeedback parameter', () => {
    it('should not affect slider behavior (parameter is unused)', () => {
      const { result: resultWithFeedback } = renderHook(() =>
        useSlider(task, true)
      );
      const { result: resultWithoutFeedback } = renderHook(() =>
        useSlider(task, false)
      );

      // Both should behave the same
      expect(resultWithFeedback.current.value).toBe(
        resultWithoutFeedback.current.value
      );
      expect(resultWithFeedback.current.canSubmit()).toBe(
        resultWithoutFeedback.current.canSubmit()
      );
    });
  });

  describe('Return Value Structure', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => useSlider(task, false));

      // State
      expect(result.current).toHaveProperty('value');
      expect(typeof result.current.value).toBe('number');

      // Actions
      expect(result.current).toHaveProperty('setValue');
      expect(typeof result.current.setValue).toBe('function');

      expect(result.current).toHaveProperty('canSubmit');
      expect(typeof result.current.canSubmit).toBe('function');

      expect(result.current).toHaveProperty('checkAnswer');
      expect(typeof result.current.checkAnswer).toBe('function');

      expect(result.current).toHaveProperty('resetState');
      expect(typeof result.current.resetState).toBe('function');
    });

    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useSlider(task, false));

      const initialSetValue = result.current.setValue;
      const initialCanSubmit = result.current.canSubmit;
      const initialResetState = result.current.resetState;

      // Change value
      act(() => {
        result.current.setValue(15);
      });

      rerender();

      // Function references should be stable (useCallback)
      expect(result.current.setValue).toBe(initialSetValue);
      expect(result.current.canSubmit).toBe(initialCanSubmit);
      expect(result.current.resetState).toBe(initialResetState);
    });
  });
});
