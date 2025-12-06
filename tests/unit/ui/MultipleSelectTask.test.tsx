/**
 * Tests for MultipleSelectTask Component
 *
 * Tests the multiple select task functionality including:
 * - Component rendering with options
 * - Checkbox toggle handling
 * - Multiple selection state management
 * - Cursor movement on mouse enter
 * - Feedback state rendering (correct/incorrect/missed highlighting)
 * - Disabled state during feedback
 * - Answer change callbacks
 * - Status icons and visual feedback
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultipleSelectTask } from '../../../src/modules/ui/components/practice/tasks/MultipleSelect/MultipleSelectTask';
import { createMultipleSelectTask } from '../../factories/task-factory';
import type { Task, MultipleSelectContent } from '../../../src/modules/core/types/services';
import type { UseMultipleSelectReturn } from '../../../src/modules/ui/components/practice/tasks/MultipleSelect/use-multiple-select';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session__ms-container': 'ms-container',
    'practice-session__ms-instruction': 'ms-instruction',
    'practice-session__ms-options': 'ms-options',
    'practice-session__ms-option': 'ms-option',
    'practice-session__ms-option--focused': 'ms-option--focused',
    'practice-session__ms-option--correct': 'ms-option--correct',
    'practice-session__ms-option--incorrect': 'ms-option--incorrect',
    'practice-session__ms-option--selected': 'ms-option--selected',
    'practice-session__ms-option-label': 'ms-option-label',
    'practice-session__ms-status-icon': 'ms-status-icon',
    'practice-session__ms-status-icon--correct': 'ms-status-icon--correct',
    'practice-session__ms-status-icon--incorrect': 'ms-status-icon--incorrect',
  },
}));

// Mock the Checkbox component
vi.mock('../../../src/modules/ui/components/forms', () => ({
  Checkbox: ({
    checked,
    onChange,
    disabled,
    label,
    error,
    success,
    style,
  }: {
    checked: boolean;
    onChange: () => void;
    disabled: boolean;
    label: React.ReactNode;
    error: boolean;
    success: boolean;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="checkbox" data-checked={checked} data-disabled={disabled} style={style}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        data-error={error}
        data-success={success}
      />
      <span>{label}</span>
    </div>
  ),
}));

// Mock the useMultipleSelect hook
const mockUseMultipleSelect = vi.fn<
  [Task | null, boolean],
  UseMultipleSelectReturn
>();

vi.mock(
  '../../../src/modules/ui/components/practice/tasks/MultipleSelect/use-multiple-select',
  () => ({
    useMultipleSelect: (task: Task | null, showFeedback: boolean) =>
      mockUseMultipleSelect(task, showFeedback),
  })
);

/**
 * Helper to create a mock useMultipleSelect return value
 */
function createMockHookReturn(
  overrides: Partial<UseMultipleSelectReturn> = {}
): UseMultipleSelectReturn {
  return {
    selectedOptions: new Set<number>(),
    cursor: 0,
    toggleOption: vi.fn(),
    setCursor: vi.fn(),
    moveCursor: vi.fn(),
    canSubmit: vi.fn(() => false),
    checkAnswer: vi.fn(() => false),
    resetState: vi.fn(),
    ...overrides,
  };
}

describe('MultipleSelectTask', () => {
  let task: Task;
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default task: "Which are German cities?" with Berlin, Munich, Hamburg as correct
    task = createMultipleSelectTask();
    mockOnAnswerChange = vi.fn();

    // Default mock hook return
    mockUseMultipleSelect.mockReturnValue(createMockHookReturn());
  });

  describe('Rendering', () => {
    it('should render instruction text', () => {
      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Wähle alle zutreffenden Antworten')).toBeInTheDocument();
    });

    it('should render all options with checkboxes', () => {
      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as MultipleSelectContent;

      // Check all options are rendered
      expect(screen.getByText('Berlin')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('München')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('Hamburg')).toBeInTheDocument();

      // Check all checkboxes are rendered
      const checkboxes = screen.getAllByTestId('checkbox');
      expect(checkboxes).toHaveLength(content.options.length);
    });

    it('should not render for non-multiple-select task types', () => {
      const wrongTypeTask = {
        ...task,
        type: 'multiple-choice' as const,
      };

      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      const { container } = render(
        <MultipleSelectTask
          task={wrongTypeTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render options with correct container classes', () => {
      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.ms-container')).toBeInTheDocument();
      expect(container.querySelector('.ms-instruction')).toBeInTheDocument();
      expect(container.querySelector('.ms-options')).toBeInTheDocument();
    });
  });

  describe('Selection State', () => {
    it('should render selected options as checked', () => {
      const selectedOptions = new Set([0, 2]); // Berlin, München

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const checkboxes = screen.getAllByTestId('checkbox');
      expect(checkboxes[0]).toHaveAttribute('data-checked', 'true'); // Berlin
      expect(checkboxes[1]).toHaveAttribute('data-checked', 'false'); // London
      expect(checkboxes[2]).toHaveAttribute('data-checked', 'true'); // München
      expect(checkboxes[3]).toHaveAttribute('data-checked', 'false'); // Paris
      expect(checkboxes[4]).toHaveAttribute('data-checked', 'false'); // Hamburg
    });

    it('should render unselected options as unchecked', () => {
      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions: new Set() })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const checkboxes = screen.getAllByTestId('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute('data-checked', 'false');
      });
    });

    it('should apply selected class to selected options when not showing feedback', () => {
      const selectedOptions = new Set([0]);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const options = container.querySelectorAll('.ms-option');
      expect(options[0]).toHaveClass('ms-option--selected');
      expect(options[1]).not.toHaveClass('ms-option--selected');
    });
  });

  describe('Checkbox Toggle Handling', () => {
    it('should call toggleOption when checkbox is clicked', () => {
      const mockToggleOption = vi.fn();
      const mockSetCursor = vi.fn();

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({
          toggleOption: mockToggleOption,
          setCursor: mockSetCursor,
        })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // Click Berlin

      expect(mockToggleOption).toHaveBeenCalledWith(0);
      expect(mockSetCursor).toHaveBeenCalledWith(0);
    });

    it('should call toggleOption with correct index for each option', () => {
      const mockToggleOption = vi.fn();

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ toggleOption: mockToggleOption })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');

      fireEvent.click(checkboxes[0]);
      expect(mockToggleOption).toHaveBeenLastCalledWith(0);

      fireEvent.click(checkboxes[2]);
      expect(mockToggleOption).toHaveBeenLastCalledWith(2);

      fireEvent.click(checkboxes[4]);
      expect(mockToggleOption).toHaveBeenLastCalledWith(4);
    });

    it('should update cursor when option is toggled', () => {
      const mockSetCursor = vi.fn();

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ setCursor: mockSetCursor })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[2]); // Click München

      expect(mockSetCursor).toHaveBeenCalledWith(2);
    });
  });

  describe('Cursor Movement', () => {
    it('should call setCursor when mouse enters an option', () => {
      const mockSetCursor = vi.fn();

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ setCursor: mockSetCursor })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const options = container.querySelectorAll('.ms-option');

      fireEvent.mouseEnter(options[0]);
      expect(mockSetCursor).toHaveBeenCalledWith(0);

      fireEvent.mouseEnter(options[3]);
      expect(mockSetCursor).toHaveBeenCalledWith(3);
    });

    it('should apply focused class to option at cursor position', () => {
      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ cursor: 2 })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const options = container.querySelectorAll('.ms-option');
      expect(options[0]).not.toHaveClass('ms-option--focused');
      expect(options[1]).not.toHaveClass('ms-option--focused');
      expect(options[2]).toHaveClass('ms-option--focused'); // München
      expect(options[3]).not.toHaveClass('ms-option--focused');
    });

    it('should not apply focused class when showing feedback', () => {
      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ cursor: 1 })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const options = container.querySelectorAll('.ms-option');
      options.forEach((option) => {
        expect(option).not.toHaveClass('ms-option--focused');
      });
    });
  });

  describe('Feedback State - Correct Answers', () => {
    it('should apply correct class to correct answers when showing feedback', () => {
      const selectedOptions = new Set([0, 2, 4]); // All correct answers selected

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const options = container.querySelectorAll('.ms-option');
      const content = task.content as MultipleSelectContent;

      // Correct answers should have correct class
      content.correctAnswers.forEach((index) => {
        expect(options[index]).toHaveClass('ms-option--correct');
      });
    });

    it('should show checkmark (✓) for selected correct answers', () => {
      const selectedOptions = new Set([0, 2, 4]); // All correct

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks).toHaveLength(3); // Berlin, München, Hamburg
    });

    it('should show circle (○) for unselected correct answers (missed)', () => {
      const selectedOptions = new Set([0]); // Only Berlin selected

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('✓')).toBeInTheDocument(); // Berlin (selected correct)
      expect(screen.getAllByText('○')).toHaveLength(2); // München, Hamburg (missed)
    });

    it('should apply correct icon class to status icons for correct answers', () => {
      const selectedOptions = new Set([0]);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const correctIcons = container.querySelectorAll('.ms-status-icon--correct');
      expect(correctIcons.length).toBeGreaterThan(0);
    });

    it('should set success prop on checkboxes for selected correct answers', () => {
      const selectedOptions = new Set([0, 2]);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toHaveAttribute('data-success', 'true'); // Berlin
      expect(checkboxes[2]).toHaveAttribute('data-success', 'true'); // München
    });
  });

  describe('Feedback State - Incorrect Answers', () => {
    it('should apply incorrect class to selected wrong answers', () => {
      const selectedOptions = new Set([1, 3]); // London, Paris (wrong)

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const options = container.querySelectorAll('.ms-option');
      expect(options[1]).toHaveClass('ms-option--incorrect'); // London
      expect(options[3]).toHaveClass('ms-option--incorrect'); // Paris
    });

    it('should show X mark (✗) for selected incorrect answers', () => {
      const selectedOptions = new Set([1, 3]); // London, Paris (wrong)

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const xMarks = screen.getAllByText('✗');
      expect(xMarks).toHaveLength(2);
    });

    it('should apply incorrect icon class to status icons for wrong answers', () => {
      const selectedOptions = new Set([1]);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const incorrectIcons = container.querySelectorAll('.ms-status-icon--incorrect');
      expect(incorrectIcons.length).toBeGreaterThan(0);
    });

    it('should set error prop on checkboxes for selected incorrect answers', () => {
      const selectedOptions = new Set([1, 3]);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).toHaveAttribute('data-error', 'true'); // London
      expect(checkboxes[3]).toHaveAttribute('data-error', 'true'); // Paris
    });

    it('should not show status icon for unselected incorrect answers', () => {
      const selectedOptions = new Set([0]); // Only Berlin selected

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // London and Paris are wrong but not selected, so no X marks for them
      const statusIcons = container.querySelectorAll('.ms-status-icon');
      // Should have icons for: Berlin (✓), München (○), Hamburg (○)
      expect(statusIcons.length).toBe(3);
    });
  });

  describe('Feedback State - Mixed Selection', () => {
    it('should show mixed feedback for partially correct answer', () => {
      const selectedOptions = new Set([0, 1, 2]); // Berlin ✓, London ✗, München ✓

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getAllByText('✓')).toHaveLength(2); // Berlin, München
      expect(screen.getByText('✗')).toBeInTheDocument(); // London
      expect(screen.getByText('○')).toBeInTheDocument(); // Hamburg (missed)
    });

    it('should apply correct classes for mixed selection', () => {
      const selectedOptions = new Set([0, 1]); // Berlin correct, London incorrect

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const options = container.querySelectorAll('.ms-option');
      expect(options[0]).toHaveClass('ms-option--correct');
      expect(options[1]).toHaveClass('ms-option--incorrect');
    });
  });

  describe('Disabled State During Feedback', () => {
    it('should disable all checkboxes when showing feedback', () => {
      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const checkboxes = screen.getAllByTestId('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute('data-disabled', 'true');
      });
    });

    it('should enable checkboxes when not showing feedback', () => {
      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const checkboxes = screen.getAllByTestId('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute('data-disabled', 'false');
      });
    });

    it('should not show status icons when not showing feedback', () => {
      const selectedOptions = new Set([0, 1]);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const statusIcons = container.querySelectorAll('.ms-status-icon');
      expect(statusIcons).toHaveLength(0);
    });

    it('should not apply feedback classes when not showing feedback', () => {
      const selectedOptions = new Set([0, 1]);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const options = container.querySelectorAll('.ms-option');
      options.forEach((option) => {
        expect(option).not.toHaveClass('ms-option--correct');
        expect(option).not.toHaveClass('ms-option--incorrect');
      });
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange with canSubmit result on mount', () => {
      const mockCanSubmit = vi.fn(() => false);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ canSubmit: mockCanSubmit })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
    });

    it('should call onAnswerChange with true when answer can be submitted', () => {
      const mockCanSubmit = vi.fn(() => true);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ canSubmit: mockCanSubmit })
      );

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should update onAnswerChange when canSubmit changes', () => {
      const mockCanSubmit1 = vi.fn(() => false);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ canSubmit: mockCanSubmit1 })
      );

      const { rerender } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);

      // Create a new canSubmit function that returns true
      const mockCanSubmit2 = vi.fn(() => true);
      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ canSubmit: mockCanSubmit2 })
      );

      rerender(
        <MultipleSelectTask
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
      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      expect(() => {
        render(
          <MultipleSelectTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Checkbox Styling', () => {
    it('should apply flex: 1 style to all checkboxes', () => {
      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const checkboxes = screen.getAllByTestId('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveStyle({ flex: '1' });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle task with single option', () => {
      const singleOptionTask = createMultipleSelectTask({
        content: {
          question: 'Is this correct?',
          options: ['Yes'],
          correctAnswers: [0],
        } as MultipleSelectContent,
      });

      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      render(
        <MultipleSelectTask
          task={singleOptionTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getAllByTestId('checkbox')).toHaveLength(1);
    });

    it('should handle task with many options', () => {
      const manyOptionsTask = createMultipleSelectTask({
        content: {
          question: 'Select all correct',
          options: Array.from({ length: 10 }, (_, i) => `Option ${i + 1}`),
          correctAnswers: [0, 5, 9],
        } as MultipleSelectContent,
      });

      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      render(
        <MultipleSelectTask
          task={manyOptionsTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getAllByTestId('checkbox')).toHaveLength(10);
    });

    it('should handle task with no correct answers (edge case)', () => {
      const noCorrectTask = createMultipleSelectTask({
        content: {
          question: 'None are correct',
          options: ['A', 'B', 'C'],
          correctAnswers: [],
        } as MultipleSelectContent,
      });

      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      render(
        <MultipleSelectTask
          task={noCorrectTask}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Should render without crashing
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should handle task with all options correct', () => {
      const allCorrectTask = createMultipleSelectTask({
        content: {
          question: 'All are correct',
          options: ['A', 'B', 'C'],
          correctAnswers: [0, 1, 2],
        } as MultipleSelectContent,
      });

      const selectedOptions = new Set([0, 1, 2]);

      mockUseMultipleSelect.mockReturnValue(
        createMockHookReturn({ selectedOptions })
      );

      render(
        <MultipleSelectTask
          task={allCorrectTask}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(screen.getAllByText('✓')).toHaveLength(3);
    });

    it('should handle long option text', () => {
      const longTextTask = createMultipleSelectTask({
        content: {
          question: 'Select correct',
          options: [
            'This is a very long option text that should be displayed properly in the UI without breaking the layout',
            'Short',
          ],
          correctAnswers: [0],
        } as MultipleSelectContent,
      });

      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      render(
        <MultipleSelectTask
          task={longTextTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(
        screen.getByText(
          'This is a very long option text that should be displayed properly in the UI without breaking the layout'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should pass task and showFeedback to useMultipleSelect', () => {
      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      render(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseMultipleSelect).toHaveBeenCalledWith(task, true);
    });

    it('should call useMultipleSelect with updated showFeedback', () => {
      mockUseMultipleSelect.mockReturnValue(createMockHookReturn());

      const { rerender } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseMultipleSelect).toHaveBeenCalledWith(task, false);

      rerender(
        <MultipleSelectTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseMultipleSelect).toHaveBeenCalledWith(task, true);
    });

    it('should use all hook return values correctly', () => {
      const mockReturn = createMockHookReturn({
        selectedOptions: new Set([0, 2]),
        cursor: 1,
        toggleOption: vi.fn(),
        setCursor: vi.fn(),
        canSubmit: vi.fn(() => true),
      });

      mockUseMultipleSelect.mockReturnValue(mockReturn);

      const { container } = render(
        <MultipleSelectTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      // Verify selectedOptions are used
      const checkboxes = screen.getAllByTestId('checkbox');
      expect(checkboxes[0]).toHaveAttribute('data-checked', 'true');
      expect(checkboxes[2]).toHaveAttribute('data-checked', 'true');

      // Verify cursor is used
      const options = container.querySelectorAll('.ms-option');
      expect(options[1]).toHaveClass('ms-option--focused');

      // Verify canSubmit is called
      expect(mockReturn.canSubmit).toHaveBeenCalled();
      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);

      // Verify toggleOption is available
      const inputs = screen.getAllByRole('checkbox');
      fireEvent.click(inputs[0]);
      expect(mockReturn.toggleOption).toHaveBeenCalled();

      // Verify setCursor is available
      fireEvent.mouseEnter(options[0]);
      expect(mockReturn.setCursor).toHaveBeenCalled();
    });
  });
});
