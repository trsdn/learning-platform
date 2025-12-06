/**
 * Tests for TrueFalseTask Component
 *
 * Tests the true/false task functionality including:
 * - Component rendering with true/false buttons
 * - Button click handling and answer selection
 * - Selected answer state display
 * - Feedback state rendering (correct/incorrect highlighting)
 * - Disabled state during feedback
 * - Accessibility attributes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrueFalseTask } from '../../../src/modules/ui/components/practice/tasks/TrueFalse/TrueFalseTask';
import { createTrueFalseTask } from '../../factories/task-factory';
import type { TrueFalseContent } from '../../../src/modules/core/types/services';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session__tf-container': 'tf-container',
    'practice-session__tf-statement': 'tf-statement',
    'practice-session__tf-buttons': 'tf-buttons',
    'practice-session__tf-button': 'tf-button',
    'practice-session__tf-button--correct': 'tf-button--correct',
    'practice-session__tf-button--incorrect': 'tf-button--incorrect',
    'practice-session__tf-button--selected': 'tf-button--selected',
    'practice-session__tf-button--disabled': 'tf-button--disabled',
  },
}));

// Mock the useTrueFalse hook
vi.mock('../../../src/modules/ui/components/practice/tasks/TrueFalse/use-true-false', () => ({
  useTrueFalse: vi.fn(),
}));

import { useTrueFalse } from '../../../src/modules/ui/components/practice/tasks/TrueFalse/use-true-false';

describe('TrueFalseTask', () => {
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAnswerChange = vi.fn();
  });

  describe('Rendering', () => {
    it('should render the statement', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Berlin ist die Hauptstadt von Deutschland.',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Berlin ist die Hauptstadt von Deutschland.')).toBeInTheDocument();
    });

    it('should render Richtig (true) button', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Richtig')).toBeInTheDocument();
      expect(screen.getByLabelText('Richtig')).toBeInTheDocument();
    });

    it('should render Falsch (false) button', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Falsch')).toBeInTheDocument();
      expect(screen.getByLabelText('Falsch')).toBeInTheDocument();
    });

    it('should not render for non-true-false task types', () => {
      const task = {
        ...createTrueFalseTask(),
        type: 'multiple-choice' as const,
      };

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      const { container } = render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render both buttons in enabled state initially', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      const falseButton = screen.getByLabelText('Falsch');

      expect(trueButton).not.toBeDisabled();
      expect(falseButton).not.toBeDisabled();
    });
  });

  describe('Button Click Handling', () => {
    it('should call setAnswer with true when Richtig button is clicked', () => {
      const task = createTrueFalseTask();
      const mockSetAnswer = vi.fn();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: mockSetAnswer,
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      fireEvent.click(screen.getByText('Richtig'));

      expect(mockSetAnswer).toHaveBeenCalledWith(true);
      expect(mockSetAnswer).toHaveBeenCalledTimes(1);
    });

    it('should call setAnswer with false when Falsch button is clicked', () => {
      const task = createTrueFalseTask();
      const mockSetAnswer = vi.fn();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: mockSetAnswer,
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      fireEvent.click(screen.getByText('Falsch'));

      expect(mockSetAnswer).toHaveBeenCalledWith(false);
      expect(mockSetAnswer).toHaveBeenCalledTimes(1);
    });

    it('should not call setAnswer when showFeedback is true', () => {
      const task = createTrueFalseTask();
      const mockSetAnswer = vi.fn();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: mockSetAnswer,
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      fireEvent.click(screen.getByText('Richtig'));
      fireEvent.click(screen.getByText('Falsch'));

      expect(mockSetAnswer).not.toHaveBeenCalled();
    });

    it('should allow changing answer before feedback', () => {
      const task = createTrueFalseTask();
      const mockSetAnswer = vi.fn();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: mockSetAnswer,
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Click true
      fireEvent.click(screen.getByText('Richtig'));
      expect(mockSetAnswer).toHaveBeenCalledWith(true);

      // Click false
      fireEvent.click(screen.getByText('Falsch'));
      expect(mockSetAnswer).toHaveBeenCalledWith(false);

      expect(mockSetAnswer).toHaveBeenCalledTimes(2);
    });
  });

  describe('Selected Answer State Display', () => {
    it('should highlight Richtig button when answer is true', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      expect(trueButton).toHaveClass('tf-button--selected');
      expect(trueButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should highlight Falsch button when answer is false', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: false,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const falseButton = screen.getByLabelText('Falsch');
      expect(falseButton).toHaveClass('tf-button--selected');
      expect(falseButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should not highlight any button when no answer is selected', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      const falseButton = screen.getByLabelText('Falsch');

      expect(trueButton).not.toHaveClass('tf-button--selected');
      expect(falseButton).not.toHaveClass('tf-button--selected');
      expect(trueButton).toHaveAttribute('aria-pressed', 'false');
      expect(falseButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should not show selected style during feedback', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test statement',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      // Selected class should not be applied during feedback
      expect(trueButton.className).not.toContain('tf-button--selected');
    });
  });

  describe('Feedback State Rendering - Correct Answer Highlighting', () => {
    it('should highlight correct answer (true) in green during feedback', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test statement',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      expect(trueButton).toHaveClass('tf-button--correct');
    });

    it('should highlight correct answer (false) in green during feedback', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test statement',
          correctAnswer: false,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: false,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const falseButton = screen.getByLabelText('Falsch');
      expect(falseButton).toHaveClass('tf-button--correct');
    });

    it('should always show correct answer during feedback even if not selected', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test statement',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: false, // User selected wrong answer
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      expect(trueButton).toHaveClass('tf-button--correct');
    });
  });

  describe('Feedback State Rendering - Incorrect Answer Highlighting', () => {
    it('should highlight incorrect selection in red during feedback', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test statement',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: false, // Wrong answer selected
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const falseButton = screen.getByLabelText('Falsch');
      expect(falseButton).toHaveClass('tf-button--incorrect');
    });

    it('should show both correct (green) and incorrect (red) during wrong answer feedback', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test statement',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: false, // Wrong answer
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      const falseButton = screen.getByLabelText('Falsch');

      // True is correct answer - should be green
      expect(trueButton).toHaveClass('tf-button--correct');
      // False is incorrect selection - should be red
      expect(falseButton).toHaveClass('tf-button--incorrect');
    });

    it('should not highlight incorrect when answer is correct', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test statement',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true, // Correct answer
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      const falseButton = screen.getByLabelText('Falsch');

      expect(trueButton).toHaveClass('tf-button--correct');
      expect(falseButton).not.toHaveClass('tf-button--incorrect');
    });

    it('should not show feedback styles when showFeedback is false', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test statement',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: false,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      const falseButton = screen.getByLabelText('Falsch');

      expect(trueButton).not.toHaveClass('tf-button--correct');
      expect(falseButton).not.toHaveClass('tf-button--incorrect');
    });
  });

  describe('Disabled State During Feedback', () => {
    it('should disable both buttons when showFeedback is true', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      const falseButton = screen.getByLabelText('Falsch');

      expect(trueButton).toBeDisabled();
      expect(falseButton).toBeDisabled();
    });

    it('should apply disabled class during feedback', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      const falseButton = screen.getByLabelText('Falsch');

      expect(trueButton).toHaveClass('tf-button--disabled');
      expect(falseButton).toHaveClass('tf-button--disabled');
    });

    it('should not disable buttons when showFeedback is false', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      const falseButton = screen.getByLabelText('Falsch');

      expect(trueButton).not.toBeDisabled();
      expect(falseButton).not.toBeDisabled();
      expect(trueButton).not.toHaveClass('tf-button--disabled');
      expect(falseButton).not.toHaveClass('tf-button--disabled');
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange with false initially when no answer selected', () => {
      const task = createTrueFalseTask();
      const mockCanSubmit = vi.fn(() => false);

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: mockCanSubmit,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
    });

    it('should call onAnswerChange with true when answer is selected', () => {
      const task = createTrueFalseTask();
      const mockCanSubmit = vi.fn(() => true);

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: mockCanSubmit,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should not call onAnswerChange if not provided', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      // Should not throw
      expect(() => {
        render(
          <TrueFalseTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });

    it('should update onAnswerChange calls based on canSubmit return value', () => {
      const task = createTrueFalseTask();

      // First render - no answer
      const mockCanSubmit1 = vi.fn(() => false);
      vi.mocked(useTrueFalse).mockReturnValueOnce({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: mockCanSubmit1,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      const { unmount } = render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
      unmount();

      // Second render - answer selected
      mockOnAnswerChange.mockClear();
      const mockCanSubmit2 = vi.fn(() => true);
      vi.mocked(useTrueFalse).mockReturnValueOnce({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: mockCanSubmit2,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for true button', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      expect(trueButton).toHaveAttribute('aria-label', 'Richtig');
    });

    it('should have proper aria-label for false button', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const falseButton = screen.getByLabelText('Falsch');
      expect(falseButton).toHaveAttribute('aria-label', 'Falsch');
    });

    it('should set aria-pressed to true when button is selected', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      const falseButton = screen.getByLabelText('Falsch');

      expect(trueButton).toHaveAttribute('aria-pressed', 'true');
      expect(falseButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should set aria-pressed to false when button is not selected', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      const falseButton = screen.getByLabelText('Falsch');

      expect(trueButton).toHaveAttribute('aria-pressed', 'false');
      expect(falseButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', () => {
      const task = createTrueFalseTask();
      const mockSetAnswer = vi.fn();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: mockSetAnswer,
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');

      // Click multiple times rapidly
      fireEvent.click(trueButton);
      fireEvent.click(trueButton);
      fireEvent.click(trueButton);

      expect(mockSetAnswer).toHaveBeenCalledTimes(3);
      expect(mockSetAnswer).toHaveBeenCalledWith(true);
    });

    it('should handle task with very long statement', () => {
      const longStatement = 'A'.repeat(1000);
      const task = createTrueFalseTask({
        content: {
          statement: longStatement,
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(longStatement)).toBeInTheDocument();
    });

    it('should handle statement with special characters', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test <>&"\'!@#$%^&*()',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Test <>&"\'!@#$%^&*()')).toBeInTheDocument();
    });

    it('should handle transition from no feedback to feedback', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test statement',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      const { rerender } = render(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      expect(trueButton).not.toBeDisabled();
      expect(trueButton).toHaveClass('tf-button--selected');

      // Show feedback
      rerender(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(trueButton).toBeDisabled();
      expect(trueButton).toHaveClass('tf-button--correct');
      expect(trueButton).toHaveClass('tf-button--disabled');
    });

    it('should handle transition from feedback back to no feedback', () => {
      const task = createTrueFalseTask({
        content: {
          statement: 'Test statement',
          correctAnswer: true,
        } as TrueFalseContent,
      });

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: true,
        setAnswer: vi.fn(),
        canSubmit: () => true,
        checkAnswer: () => true,
        resetState: vi.fn(),
      });

      const { rerender } = render(
        <TrueFalseTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const trueButton = screen.getByLabelText('Richtig');
      expect(trueButton).toBeDisabled();

      // Hide feedback
      rerender(
        <TrueFalseTask
          task={task}
          showFeedback={false}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(trueButton).not.toBeDisabled();
      expect(trueButton).not.toHaveClass('tf-button--disabled');
    });
  });

  describe('Audio Config', () => {
    it('should accept audioConfig prop without errors', () => {
      const task = createTrueFalseTask();
      const audioConfig = {
        buttons: {
          front: { show: true, field: 'audioUrl' },
          back: { show: false, field: 'backAudio' },
        },
      };

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      expect(() => {
        render(
          <TrueFalseTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={audioConfig}
          />
        );
      }).not.toThrow();
    });

    it('should accept null audioConfig', () => {
      const task = createTrueFalseTask();

      vi.mocked(useTrueFalse).mockReturnValue({
        answer: null,
        setAnswer: vi.fn(),
        canSubmit: () => false,
        checkAnswer: () => false,
        resetState: vi.fn(),
      });

      expect(() => {
        render(
          <TrueFalseTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });
  });
});
