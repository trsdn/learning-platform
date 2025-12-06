/**
 * Tests for SliderTask Component
 *
 * Tests the slider task functionality including:
 * - Component rendering
 * - Slider interaction and value changes
 * - Value change callbacks
 * - Question display
 * - Unit display (suffix)
 * - Accessibility attributes
 * - Feedback display
 * - Tolerance handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SliderTask } from '../../../src/modules/ui/components/practice/tasks/Slider/SliderTask';
import type { Task, SliderContent } from '../../../src/modules/core/types/services';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session__slider-container': 'slider-container',
    'practice-session__slider-value-display': 'slider-value-display',
    'practice-session__slider-value': 'slider-value',
    'practice-session__slider-value--correct': 'slider-value--correct',
    'practice-session__slider-value--incorrect': 'slider-value--incorrect',
    'practice-session__slider-wrapper': 'slider-wrapper',
    'practice-session__slider-feedback': 'slider-feedback',
    'practice-session__slider-feedback-text': 'slider-feedback-text',
    'practice-session__slider-correct-value': 'slider-correct-value',
    'practice-session__slider-tolerance': 'slider-tolerance',
  },
}));

// Mock the Slider component
vi.mock('../../../src/modules/ui/components/forms', () => ({
  Slider: ({ value, onChange, min, max, step, disabled, unit, showValue, 'aria-label': ariaLabel }: {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    disabled: boolean;
    unit: string;
    showValue: boolean;
    'aria-label': string;
  }) => (
    <div data-testid="slider">
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        data-unit={unit}
        data-show-value={showValue}
        aria-label={ariaLabel}
      />
    </div>
  ),
}));

// Mock the useSlider hook
const mockUseSlider = vi.fn();
vi.mock('../../../src/modules/ui/components/practice/tasks/Slider/use-slider', () => ({
  useSlider: (task: Task, showFeedback: boolean) => mockUseSlider(task, showFeedback),
}));

// Helper to create a mock slider task
function createSliderTask(
  overrides: Partial<Task> = {},
  contentOverrides: Partial<SliderContent> = {}
): Task {
  return {
    id: 'slider-1',
    learningPathId: 'math-path',
    templateId: 'slider-template',
    type: 'slider',
    content: {
      question: 'What is the freezing point of water?',
      min: -50,
      max: 50,
      step: 1,
      correctValue: 0,
      tolerance: 0,
      unit: '°C',
      ...contentOverrides,
    } as SliderContent,
    metadata: {
      difficulty: 'easy',
      tags: ['temperature', 'science'],
      estimatedTime: 15,
      points: 10,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('SliderTask', () => {
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAnswerChange = vi.fn();

    // Default mock implementation
    mockUseSlider.mockReturnValue({
      value: 0,
      setValue: vi.fn(),
      canSubmit: vi.fn(() => true),
      checkAnswer: vi.fn(() => false),
      resetState: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render slider with initial value', () => {
      const task = createSliderTask();
      mockUseSlider.mockReturnValue({
        value: 0,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByTestId('slider')).toBeInTheDocument();
      expect(screen.getByText('0°C')).toBeInTheDocument();
    });

    it('should display current value with unit', () => {
      const task = createSliderTask({}, {
        unit: '%',
      });
      mockUseSlider.mockReturnValue({
        value: 50,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should display value without unit when unit is not provided', () => {
      const task = createSliderTask({}, {
        unit: undefined,
      });
      mockUseSlider.mockReturnValue({
        value: 25,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should not render for non-slider task types', () => {
      const task = {
        ...createSliderTask(),
        type: 'multiple-choice' as const,
      };

      const { container } = render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render slider with correct min/max range', () => {
      const task = createSliderTask({}, {
        min: 0,
        max: 100,
      });
      mockUseSlider.mockReturnValue({
        value: 50,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
    });

    it('should render slider with correct step value', () => {
      const task = createSliderTask({}, {
        step: 5,
      });
      mockUseSlider.mockReturnValue({
        value: 25,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('step', '5');
    });

    it('should render slider with default step of 1 when not provided', () => {
      const task = createSliderTask({}, {
        step: undefined,
      });
      mockUseSlider.mockReturnValue({
        value: 10,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('step', '1');
    });
  });

  describe('Slider Interaction', () => {
    it('should call setValue when slider value changes', () => {
      const task = createSliderTask();
      const mockSetValue = vi.fn();
      mockUseSlider.mockReturnValue({
        value: 0,
        setValue: mockSetValue,
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '25' } });

      expect(mockSetValue).toHaveBeenCalledWith(25);
    });

    it('should update displayed value when slider changes', () => {
      const task = createSliderTask({}, {
        unit: '°C',
      });

      // Start with value 0
      mockUseSlider.mockReturnValue({
        value: 0,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      const { rerender } = render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('0°C')).toBeInTheDocument();

      // Update to value 15
      mockUseSlider.mockReturnValue({
        value: 15,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      rerender(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('15°C')).toBeInTheDocument();
    });

    it('should disable slider when showFeedback is true', () => {
      const task = createSliderTask();
      mockUseSlider.mockReturnValue({
        value: 0,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
    });

    it('should enable slider when showFeedback is false', () => {
      const task = createSliderTask();
      mockUseSlider.mockReturnValue({
        value: 0,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).not.toBeDisabled();
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange when canSubmit changes', () => {
      const task = createSliderTask();
      const mockCanSubmit = vi.fn(() => true);
      mockUseSlider.mockReturnValue({
        value: 0,
        setValue: vi.fn(),
        canSubmit: mockCanSubmit,
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should call onAnswerChange with false when canSubmit is false', () => {
      const task = createSliderTask();
      const mockCanSubmit = vi.fn(() => false);
      mockUseSlider.mockReturnValue({
        value: 0,
        setValue: vi.fn(),
        canSubmit: mockCanSubmit,
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
    });

    it('should not throw if onAnswerChange is not provided', () => {
      const task = createSliderTask();
      mockUseSlider.mockReturnValue({
        value: 0,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      expect(() => {
        render(
          <SliderTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Feedback Display', () => {
    it('should show feedback when showFeedback is true', () => {
      const task = createSliderTask({}, {
        correctValue: 0,
        unit: '°C',
      });
      mockUseSlider.mockReturnValue({
        value: 5,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Richtige Antwort:')).toBeInTheDocument();
      expect(screen.getByText('0°C')).toBeInTheDocument();
    });

    it('should not show feedback when showFeedback is false', () => {
      const task = createSliderTask({}, {
        correctValue: 0,
      });
      mockUseSlider.mockReturnValue({
        value: 5,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Richtige Antwort:')).not.toBeInTheDocument();
    });

    it('should display correct value with unit in feedback', () => {
      const task = createSliderTask({}, {
        correctValue: 100,
        unit: '%',
      });
      mockUseSlider.mockReturnValue({
        value: 75,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should display tolerance when provided', () => {
      const task = createSliderTask({}, {
        correctValue: 50,
        tolerance: 5,
        unit: '°C',
      });
      mockUseSlider.mockReturnValue({
        value: 40,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('(±5)')).toBeInTheDocument();
    });

    it('should not display tolerance when tolerance is 0', () => {
      const task = createSliderTask({}, {
        correctValue: 50,
        tolerance: 0,
      });
      mockUseSlider.mockReturnValue({
        value: 40,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText(/±/)).not.toBeInTheDocument();
    });

    it('should not display tolerance when not provided', () => {
      const task = createSliderTask({}, {
        correctValue: 50,
        tolerance: undefined,
      });
      mockUseSlider.mockReturnValue({
        value: 40,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText(/±/)).not.toBeInTheDocument();
    });
  });

  describe('Value Correctness Styling', () => {
    it('should apply correct class when value is within tolerance', () => {
      const task = createSliderTask({}, {
        correctValue: 50,
        tolerance: 5,
        unit: '°C',
      });
      mockUseSlider.mockReturnValue({
        value: 52, // Within tolerance (50 ± 5)
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      const { container } = render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const valueElement = container.querySelector('.slider-value--correct');
      expect(valueElement).toBeInTheDocument();
      expect(valueElement).toHaveTextContent('52°C');
    });

    it('should apply incorrect class when value is outside tolerance', () => {
      const task = createSliderTask({}, {
        correctValue: 50,
        tolerance: 5,
        unit: '°C',
      });
      mockUseSlider.mockReturnValue({
        value: 60, // Outside tolerance (50 ± 5)
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      const { container } = render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const valueElement = container.querySelector('.slider-value--incorrect');
      expect(valueElement).toBeInTheDocument();
      expect(valueElement).toHaveTextContent('60°C');
    });

    it('should apply correct class when value exactly matches correct value', () => {
      const task = createSliderTask({}, {
        correctValue: 0,
        tolerance: 0,
        unit: '°C',
      });
      mockUseSlider.mockReturnValue({
        value: 0,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      const { container } = render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const valueElement = container.querySelector('.slider-value--correct');
      expect(valueElement).toBeInTheDocument();
    });

    it('should not apply correctness classes when showFeedback is false', () => {
      const task = createSliderTask({}, {
        correctValue: 50,
        tolerance: 0,
      });
      mockUseSlider.mockReturnValue({
        value: 50,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      const { container } = render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.slider-value--correct')).not.toBeInTheDocument();
      expect(container.querySelector('.slider-value--incorrect')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on slider', () => {
      const task = createSliderTask({}, {
        min: 0,
        max: 100,
      });
      mockUseSlider.mockReturnValue({
        value: 50,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Slider from 0 to 100');
    });

    it('should pass unit to slider component', () => {
      const task = createSliderTask({}, {
        unit: 'cm',
      });
      mockUseSlider.mockReturnValue({
        value: 25,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('data-unit', 'cm');
    });

    it('should pass showValue=false to slider component', () => {
      const task = createSliderTask();
      mockUseSlider.mockReturnValue({
        value: 10,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('data-show-value', 'false');
    });
  });

  describe('Tolerance Calculation', () => {
    it('should consider value correct when exactly at lower tolerance boundary', () => {
      const task = createSliderTask({}, {
        correctValue: 50,
        tolerance: 10,
        unit: '°C',
      });
      mockUseSlider.mockReturnValue({
        value: 40, // 50 - 10
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      const { container } = render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.slider-value--correct')).toBeInTheDocument();
    });

    it('should consider value correct when exactly at upper tolerance boundary', () => {
      const task = createSliderTask({}, {
        correctValue: 50,
        tolerance: 10,
        unit: '°C',
      });
      mockUseSlider.mockReturnValue({
        value: 60, // 50 + 10
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      const { container } = render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.slider-value--correct')).toBeInTheDocument();
    });

    it('should consider value incorrect when just outside lower tolerance boundary', () => {
      const task = createSliderTask({}, {
        correctValue: 50,
        tolerance: 10,
        unit: '°C',
      });
      mockUseSlider.mockReturnValue({
        value: 39, // 50 - 11
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      const { container } = render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.slider-value--incorrect')).toBeInTheDocument();
    });

    it('should consider value incorrect when just outside upper tolerance boundary', () => {
      const task = createSliderTask({}, {
        correctValue: 50,
        tolerance: 10,
        unit: '°C',
      });
      mockUseSlider.mockReturnValue({
        value: 61, // 50 + 11
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      const { container } = render(
        <SliderTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.slider-value--incorrect')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative values correctly', () => {
      const task = createSliderTask({}, {
        min: -100,
        max: 0,
        correctValue: -50,
        unit: '°C',
      });
      mockUseSlider.mockReturnValue({
        value: -50,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('-50°C')).toBeInTheDocument();
    });

    it('should handle decimal step values', () => {
      const task = createSliderTask({}, {
        min: 0,
        max: 1,
        step: 0.1,
        correctValue: 0.5,
      });
      mockUseSlider.mockReturnValue({
        value: 0.5,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('step', '0.1');
    });

    it('should handle very large numbers', () => {
      const task = createSliderTask({}, {
        min: 0,
        max: 1000000,
        correctValue: 500000,
        unit: undefined,
      });
      mockUseSlider.mockReturnValue({
        value: 500000,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('500000')).toBeInTheDocument();
    });

    it('should handle empty unit string', () => {
      const task = createSliderTask({}, {
        unit: '',
      });
      mockUseSlider.mockReturnValue({
        value: 42,
        setValue: vi.fn(),
        canSubmit: vi.fn(() => true),
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <SliderTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });
});
