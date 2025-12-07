/**
 * Tests for ClozeDeletionTask Component
 *
 * Tests the cloze deletion task functionality including:
 * - Component rendering with text containing gaps
 * - Gap selection/interaction
 * - Answer input for gaps
 * - Feedback state rendering
 * - Disabled state during feedback
 * - Multiple gaps handling
 * - Correct/incorrect answer highlighting
 * - Alternative answers support
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClozeDeletionTask } from '../../../src/modules/ui/components/practice/tasks/ClozeDeletion/ClozeDeletionTask';
import { createClozeDeletionTask } from '../../factories/task-factory';
import type { Task, ClozeDeletionContent } from '../../../src/modules/core/types/services';
import type { UseClozeDeletionReturn } from '../../../src/modules/ui/components/practice/tasks/ClozeDeletion/use-cloze-deletion';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session__cloze-container': 'cloze-container',
    'practice-session__cloze-text': 'cloze-text',
    'practice-session__cloze-input': 'cloze-input',
    'practice-session__cloze-feedback': 'cloze-feedback',
    'practice-session__cloze-feedback-title': 'cloze-feedback-title',
    'practice-session__cloze-answer': 'cloze-answer',
    'practice-session__cloze-answer--correct': 'cloze-answer--correct',
    'practice-session__cloze-answer--neutral': 'cloze-answer--neutral',
    'practice-session__cloze-answer-correct': 'cloze-answer-correct',
    'practice-session__cloze-alternatives': 'cloze-alternatives',
  },
}));

// Mock the Input component
vi.mock('../../../src/modules/ui/components/forms', () => ({
  Input: ({
    value,
    onChange,
    disabled,
    error,
    success,
    className,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
    error: boolean;
    success: boolean;
    className?: string;
  }) => (
    <input
      data-testid="cloze-input"
      value={value}
      onChange={onChange}
      disabled={disabled}
      data-error={error}
      data-success={success}
      className={className}
    />
  ),
}));

// Mock the useClozeDeletion hook
const mockUseClozeDeletion = vi.fn<
  [Task | null, boolean],
  UseClozeDeletionReturn
>();

vi.mock(
  '../../../src/modules/ui/components/practice/tasks/ClozeDeletion/use-cloze-deletion',
  () => ({
    useClozeDeletion: (task: Task | null, showFeedback: boolean) =>
      mockUseClozeDeletion(task, showFeedback),
  })
);

/**
 * Helper to create a mock useClozeDeletion return value
 */
function createMockHookReturn(
  overrides: Partial<UseClozeDeletionReturn> = {}
): UseClozeDeletionReturn {
  return {
    blankAnswers: [],
    setBlankAnswer: vi.fn(),
    canSubmit: vi.fn(() => false),
    checkAnswer: vi.fn(() => false),
    resetState: vi.fn(),
    ...overrides,
  };
}

describe('ClozeDeletionTask', () => {
  let task: Task;
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default task with correct {{blank}} marker format
    task = createClozeDeletionTask({
      content: {
        text: 'Die Hauptstadt von Deutschland ist {{blank}}. Es ist eine {{blank}} Stadt.',
        blanks: [
          { correctAnswer: 'Berlin', alternatives: ['berlin'] },
          { correctAnswer: 'große', alternatives: ['grosse', 'große'] },
        ],
      } as ClozeDeletionContent,
    });
    mockOnAnswerChange = vi.fn();

    // Default mock hook return
    mockUseClozeDeletion.mockReturnValue(createMockHookReturn());
  });

  describe('Rendering', () => {
    it('should render text with blanks replaced by input fields', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Should have the text content
      expect(screen.getByText(/Die Hauptstadt von Deutschland ist/i)).toBeInTheDocument();
      expect(screen.getByText(/\. Es ist eine/i)).toBeInTheDocument();
      expect(screen.getByText(/Stadt\./i)).toBeInTheDocument();

      // Should have input fields for the blanks
      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs).toHaveLength(2); // Two blanks
    });

    it('should render all text parts correctly', () => {
      const customTask = createClozeDeletionTask({
        content: {
          text: 'Hello {{blank}}! This is a {{blank}}.',
          blanks: [
            { correctAnswer: 'world', alternatives: [] },
            { correctAnswer: 'test', alternatives: [] },
          ],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      render(
        <ClozeDeletionTask
          task={customTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(/Hello/i)).toBeInTheDocument();
      expect(screen.getByText(/! This is a/i)).toBeInTheDocument();
      expect(screen.getByText(/\./)).toBeInTheDocument();
    });

    it('should not render for non-cloze-deletion task types', () => {
      const wrongTypeTask = {
        ...task,
        type: 'multiple-choice' as const,
      };

      mockUseClozeDeletion.mockReturnValue(createMockHookReturn());

      const { container } = render(
        <ClozeDeletionTask
          task={wrongTypeTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render with correct container classes', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      const { container } = render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.cloze-container')).toBeInTheDocument();
      expect(container.querySelector('.cloze-text')).toBeInTheDocument();
    });
  });

  describe('Input Field Behavior', () => {
    it('should display current answer values in input fields', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['Berlin', 'große'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveValue('Berlin');
      expect(inputs[1]).toHaveValue('große');
    });

    it('should call setBlankAnswer when input value changes', () => {
      const mockSetBlankAnswer = vi.fn();

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({
          blankAnswers: ['', ''],
          setBlankAnswer: mockSetBlankAnswer,
        })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');

      // Type in first blank
      fireEvent.change(inputs[0], { target: { value: 'Berlin' } });
      expect(mockSetBlankAnswer).toHaveBeenCalledWith(0, 'Berlin');

      // Type in second blank
      fireEvent.change(inputs[1], { target: { value: 'große' } });
      expect(mockSetBlankAnswer).toHaveBeenCalledWith(1, 'große');
    });

    it('should call setBlankAnswer with correct index for each blank', () => {
      const mockSetBlankAnswer = vi.fn();

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({
          blankAnswers: ['', ''],
          setBlankAnswer: mockSetBlankAnswer,
        })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');

      fireEvent.change(inputs[0], { target: { value: 'test1' } });
      expect(mockSetBlankAnswer).toHaveBeenLastCalledWith(0, 'test1');

      fireEvent.change(inputs[1], { target: { value: 'test2' } });
      expect(mockSetBlankAnswer).toHaveBeenLastCalledWith(1, 'test2');
    });

    it('should handle empty string values', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveValue('');
      expect(inputs[1]).toHaveValue('');
    });
  });

  describe('Disabled State During Feedback', () => {
    it('should disable all input fields when showing feedback', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['Berlin', 'große'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it('should enable input fields when not showing feedback', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      inputs.forEach((input) => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('Feedback State - Correct Answers', () => {
    it('should mark correct answers with success state when showing feedback', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['Berlin', 'große'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveAttribute('data-success', 'true');
      expect(inputs[1]).toHaveAttribute('data-success', 'true');
    });

    it('should accept alternative answers as correct', () => {
      // Factory creates alternatives: ['berlin'] for first blank, ['grosse', 'große'] for second
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['berlin', 'grosse'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveAttribute('data-success', 'true');
      expect(inputs[1]).toHaveAttribute('data-success', 'true');
    });

    it('should be case-insensitive when checking answers', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['BERLIN', 'GROSSE'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveAttribute('data-success', 'true');
      expect(inputs[1]).toHaveAttribute('data-success', 'true');
    });

    it('should not show success state when not showing feedback', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['Berlin', 'große'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveAttribute('data-success', 'false');
      expect(inputs[1]).toHaveAttribute('data-success', 'false');
    });
  });

  describe('Feedback State - Incorrect Answers', () => {
    it('should mark incorrect answers with error state when showing feedback', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['Paris', 'small'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveAttribute('data-error', 'true');
      expect(inputs[1]).toHaveAttribute('data-error', 'true');
    });

    it('should not mark empty answers with error state', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveAttribute('data-error', 'false');
      expect(inputs[1]).toHaveAttribute('data-error', 'false');
    });

    it('should not show error state when not showing feedback', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['wrong', 'answer'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveAttribute('data-error', 'false');
      expect(inputs[1]).toHaveAttribute('data-error', 'false');
    });

    it('should handle mixed correct and incorrect answers', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['Berlin', 'wrong'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveAttribute('data-success', 'true');
      expect(inputs[0]).toHaveAttribute('data-error', 'false');
      expect(inputs[1]).toHaveAttribute('data-success', 'false');
      expect(inputs[1]).toHaveAttribute('data-error', 'true');
    });
  });

  describe('Feedback Display', () => {
    it('should show feedback section when showFeedback is true', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['Berlin', 'große'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Richtige Antworten:')).toBeInTheDocument();
    });

    it('should not show feedback section when showFeedback is false', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['Berlin', 'große'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Richtige Antworten:')).not.toBeInTheDocument();
    });

    it('should display correct answers in feedback section', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['wrong1', 'wrong2'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as ClozeDeletionContent;
      expect(screen.getByText('Lücke 1:')).toBeInTheDocument();
      expect(screen.getByText(content.blanks[0].correctAnswer)).toBeInTheDocument();
      expect(screen.getByText('Lücke 2:')).toBeInTheDocument();
      expect(screen.getByText(content.blanks[1].correctAnswer)).toBeInTheDocument();
    });

    it('should display alternative answers when available', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['wrong', 'wrong'] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Check for alternatives text (there should be 2 instances, one for each blank)
      const alternativesText = screen.getAllByText(/auch richtig:/i);
      expect(alternativesText.length).toBe(2); // Two blanks with alternatives

      // Verify the alternatives are shown in the feedback
      // First blank alternatives: "berlin"
      expect(screen.getByText(/\(auch richtig: berlin\)/i)).toBeInTheDocument();

      // Second blank alternatives: "grosse, große"
      expect(screen.getByText(/\(auch richtig: grosse, große\)/i)).toBeInTheDocument();
    });

    it('should apply correct CSS class to correct user answers in feedback', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['Berlin', 'große'] })
      );

      const { container } = render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const feedbackItems = container.querySelectorAll('.cloze-answer--correct');
      expect(feedbackItems.length).toBe(2); // Both answers correct
    });

    it('should apply neutral CSS class to incorrect user answers in feedback', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['wrong', 'wrong'] })
      );

      const { container } = render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const feedbackItems = container.querySelectorAll('.cloze-answer--neutral');
      expect(feedbackItems.length).toBe(2); // Both answers incorrect
    });
  });

  describe('Multiple Gaps Handling', () => {
    it('should handle task with single gap', () => {
      const singleGapTask = createClozeDeletionTask({
        content: {
          text: 'The capital is {{blank}}.',
          blanks: [{ correctAnswer: 'Berlin', alternatives: [] }],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: [''] })
      );

      render(
        <ClozeDeletionTask
          task={singleGapTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs).toHaveLength(1);
    });

    it('should handle task with many gaps', () => {
      const manyGapsTask = createClozeDeletionTask({
        content: {
          text: 'The {{blank}} {{blank}} {{blank}} {{blank}} over the {{blank}} {{blank}}.',
          blanks: [
            { correctAnswer: 'quick', alternatives: [] },
            { correctAnswer: 'brown', alternatives: [] },
            { correctAnswer: 'fox', alternatives: [] },
            { correctAnswer: 'jumps', alternatives: [] },
            { correctAnswer: 'lazy', alternatives: [] },
            { correctAnswer: 'dog', alternatives: [] },
          ],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', '', '', '', '', ''] })
      );

      render(
        <ClozeDeletionTask
          task={manyGapsTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs).toHaveLength(6);
    });

    it('should handle consecutive gaps', () => {
      const consecutiveGapsTask = createClozeDeletionTask({
        content: {
          text: '{{blank}} {{blank}} word.',
          blanks: [
            { correctAnswer: 'First', alternatives: [] },
            { correctAnswer: 'Second', alternatives: [] },
          ],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      render(
        <ClozeDeletionTask
          task={consecutiveGapsTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs).toHaveLength(2);
    });

    it('should handle text starting with a gap', () => {
      const startGapTask = createClozeDeletionTask({
        content: {
          text: '{{blank}} is the capital.',
          blanks: [{ correctAnswer: 'Berlin', alternatives: [] }],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: [''] })
      );

      render(
        <ClozeDeletionTask
          task={startGapTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs).toHaveLength(1);
      expect(screen.getByText(/is the capital\./i)).toBeInTheDocument();
    });

    it('should handle text ending with a gap', () => {
      const endGapTask = createClozeDeletionTask({
        content: {
          text: 'The capital is {{blank}}',
          blanks: [{ correctAnswer: 'Berlin', alternatives: [] }],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: [''] })
      );

      render(
        <ClozeDeletionTask
          task={endGapTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs).toHaveLength(1);
      expect(screen.getByText(/The capital is/i)).toBeInTheDocument();
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange with canSubmit result on mount', () => {
      const mockCanSubmit = vi.fn(() => false);

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({
          blankAnswers: ['', ''],
          canSubmit: mockCanSubmit,
        })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockCanSubmit).toHaveBeenCalled();
      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
    });

    it('should call onAnswerChange with true when all blanks are filled', () => {
      const mockCanSubmit = vi.fn(() => true);

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({
          blankAnswers: ['Berlin', 'große'],
          canSubmit: mockCanSubmit,
        })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockCanSubmit).toHaveBeenCalled();
      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should update onAnswerChange when canSubmit changes', () => {
      const mockCanSubmit1 = vi.fn(() => false);

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({
          blankAnswers: ['', ''],
          canSubmit: mockCanSubmit1,
        })
      );

      const { rerender } = render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);

      // Update with filled blanks
      const mockCanSubmit2 = vi.fn(() => true);
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({
          blankAnswers: ['Berlin', 'große'],
          canSubmit: mockCanSubmit2,
        })
      );

      rerender(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should not crash if onAnswerChange is not provided', () => {
      const mockCanSubmit = vi.fn(() => true);

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({
          blankAnswers: ['Berlin', 'große'],
          canSubmit: mockCanSubmit,
        })
      );

      expect(() => {
        render(
          <ClozeDeletionTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Hook Integration', () => {
    it('should pass task and showFeedback to useClozeDeletion', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseClozeDeletion).toHaveBeenCalledWith(task, true);
    });

    it('should call useClozeDeletion with updated showFeedback', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      const { rerender } = render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseClozeDeletion).toHaveBeenCalledWith(task, false);

      rerender(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseClozeDeletion).toHaveBeenCalledWith(task, true);
    });

    it('should use all hook return values correctly', () => {
      const mockSetBlankAnswer = vi.fn();
      const mockCanSubmit = vi.fn(() => true);

      const mockReturn = createMockHookReturn({
        blankAnswers: ['Berlin', 'große'],
        setBlankAnswer: mockSetBlankAnswer,
        canSubmit: mockCanSubmit,
      });

      mockUseClozeDeletion.mockReturnValue(mockReturn);

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      // Verify blankAnswers are used
      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveValue('Berlin');
      expect(inputs[1]).toHaveValue('große');

      // Verify canSubmit is called
      expect(mockCanSubmit).toHaveBeenCalled();
      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);

      // Verify setBlankAnswer is available
      fireEvent.change(inputs[0], { target: { value: 'test' } });
      expect(mockSetBlankAnswer).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle blanks with no alternatives', () => {
      const noAlternativesTask = createClozeDeletionTask({
        content: {
          text: 'Answer is {{blank}}.',
          blanks: [{ correctAnswer: 'test', alternatives: undefined }],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['test'] })
      );

      render(
        <ClozeDeletionTask
          task={noAlternativesTask}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      // Should not crash and should not show alternatives
      expect(screen.getByText('Lücke 1:')).toBeInTheDocument();
      expect(screen.queryByText(/auch richtig:/i)).not.toBeInTheDocument();
    });

    it('should handle blanks with empty alternatives array', () => {
      const emptyAlternativesTask = createClozeDeletionTask({
        content: {
          text: 'Answer is {{blank}}.',
          blanks: [{ correctAnswer: 'test', alternatives: [] }],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['test'] })
      );

      render(
        <ClozeDeletionTask
          task={emptyAlternativesTask}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(screen.queryByText(/auch richtig:/i)).not.toBeInTheDocument();
    });

    it('should trim whitespace when checking answers', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['  Berlin  ', '  große  '] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      expect(inputs[0]).toHaveAttribute('data-success', 'true');
      expect(inputs[1]).toHaveAttribute('data-success', 'true');
    });

    it('should handle long text content', () => {
      const longTextTask = createClozeDeletionTask({
        content: {
          text: 'This is a very long text with multiple sentences. It contains several blanks {{blank}} this and {{blank}} like this. The text should render properly without breaking the layout even though it is quite long and contains multiple paragraphs worth of content.',
          blanks: [
            { correctAnswer: 'like', alternatives: [] },
            { correctAnswer: 'also', alternatives: [] },
          ],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      render(
        <ClozeDeletionTask
          task={longTextTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(/This is a very long text/i)).toBeInTheDocument();
      expect(screen.getAllByTestId('cloze-input')).toHaveLength(2);
    });

    it('should handle special characters in text', () => {
      const specialCharsTask = createClozeDeletionTask({
        content: {
          text: 'Special: @#$%^&* {{blank}} (parentheses) [brackets] {braces}!',
          blanks: [{ correctAnswer: 'test', alternatives: [] }],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: [''] })
      );

      render(
        <ClozeDeletionTask
          task={specialCharsTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(/Special: @#\$%\^&\*/i)).toBeInTheDocument();
      expect(screen.getAllByTestId('cloze-input')).toHaveLength(1);
    });

    it('should handle Unicode characters', () => {
      const unicodeTask = createClozeDeletionTask({
        content: {
          text: 'Das Wort ist {{blank}} mit Umlauten ä, ö, ü, ß.',
          blanks: [{ correctAnswer: 'Übung', alternatives: [] }],
        } as ClozeDeletionContent,
      });

      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: [''] })
      );

      render(
        <ClozeDeletionTask
          task={unicodeTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(/Das Wort ist/i)).toBeInTheDocument();
      expect(screen.getByText(/mit Umlauten ä, ö, ü, ß\./i)).toBeInTheDocument();
    });
  });

  describe('Input Styling', () => {
    it('should apply cloze-input class to all input fields', () => {
      mockUseClozeDeletion.mockReturnValue(
        createMockHookReturn({ blankAnswers: ['', ''] })
      );

      render(
        <ClozeDeletionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const inputs = screen.getAllByTestId('cloze-input');
      inputs.forEach((input) => {
        expect(input).toHaveClass('cloze-input');
      });
    });
  });
});
