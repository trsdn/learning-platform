/**
 * Tests for MatchingTask Component
 *
 * Tests the matching task functionality including:
 * - Component rendering with left and right items
 * - Item selection handling via Select dropdowns
 * - Match creation between left and right items
 * - Feedback state rendering (correct/incorrect matches)
 * - Disabled state during feedback
 * - Visual indicators for matches (success/error states)
 * - Audio button rendering for items with audio
 * - Answer change callbacks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchingTask } from '../../../src/modules/ui/components/practice/tasks/Matching/MatchingTask';
import { createMatchingTask } from '../../factories/task-factory';
import type { Task, MatchingContent } from '../../../src/modules/core/types/services';
import type { UseMatchingReturn } from '../../../src/modules/ui/components/practice/tasks/Matching/use-matching';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session__matching-container': 'matching-container',
    'practice-session__matching-instruction': 'matching-instruction',
    'practice-session__matching-grid': 'matching-grid',
    'practice-session__matching-left-item': 'matching-left-item',
    'practice-session__matching-feedback': 'matching-feedback',
    'practice-session__matching-feedback-title': 'matching-feedback-title',
    'practice-session__matching-feedback-item': 'matching-feedback-item',
  },
}));

// Mock the Select component
vi.mock('../../../src/modules/ui/components/forms', () => ({
  Select: ({
    value,
    onChange,
    options,
    disabled,
    placeholder,
    error,
    success,
    fullWidth,
  }: {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    disabled: boolean;
    placeholder?: string;
    error?: boolean;
    success?: boolean;
    fullWidth?: boolean;
  }) => (
    <div
      data-testid="select"
      data-value={value}
      data-disabled={disabled}
      data-error={error}
      data-success={success}
      data-full-width={fullWidth}
      data-placeholder={placeholder}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-error={error}
        data-success={success}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

// Mock the AudioButton component
vi.mock('../../../src/modules/ui/components/audio-button', () => ({
  AudioButton: ({
    text,
    audioUrl,
    size,
  }: {
    text: string;
    audioUrl: string;
    size: string;
  }) => (
    <button
      data-testid="audio-button"
      data-text={text}
      data-audio-url={audioUrl}
      data-size={size}
    >
      Audio
    </button>
  ),
}));

// Mock the useMatching hook
const mockUseMatching = vi.fn<[Task, boolean], UseMatchingReturn>();

vi.mock(
  '../../../src/modules/ui/components/practice/tasks/Matching/use-matching',
  () => ({
    useMatching: (task: Task, showFeedback: boolean) =>
      mockUseMatching(task, showFeedback),
  })
);

/**
 * Helper to create a mock useMatching return value
 */
function createMockHookReturn(
  overrides: Partial<UseMatchingReturn> = {}
): UseMatchingReturn {
  return {
    matchingAnswers: {},
    shuffledRightColumn: [0, 1, 2],
    setMatch: vi.fn(),
    canSubmit: vi.fn(() => false),
    checkAnswer: vi.fn(() => false),
    resetState: vi.fn(),
    ...overrides,
  };
}

describe('MatchingTask', () => {
  let task: Task;
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default task: Match German numbers with English
    task = createMatchingTask();
    mockOnAnswerChange = vi.fn();

    // Default mock hook return
    mockUseMatching.mockReturnValue(createMockHookReturn());
  });

  describe('Rendering', () => {
    it('should render instruction text', () => {
      mockUseMatching.mockReturnValue(createMockHookReturn());

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Ordne die passenden Paare zu')).toBeInTheDocument();
    });

    it('should render all left items from pairs', () => {
      mockUseMatching.mockReturnValue(createMockHookReturn());

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as MatchingContent;

      content.pairs.forEach((pair) => {
        expect(screen.getByText(pair.left)).toBeInTheDocument();
      });
    });

    it('should render a select dropdown for each left item', () => {
      mockUseMatching.mockReturnValue(createMockHookReturn());

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');
      const content = task.content as MatchingContent;

      expect(selects).toHaveLength(content.pairs.length);
    });

    it('should render right items as select options', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as MatchingContent;

      // Check that right items appear as options (getAllByText since they appear in each dropdown)
      content.pairs.forEach((pair) => {
        const elements = screen.getAllByText(pair.right);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should render select dropdowns with placeholder', () => {
      mockUseMatching.mockReturnValue(createMockHookReturn());

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      selects.forEach((select) => {
        expect(select).toHaveAttribute('data-placeholder', 'Wähle...');
      });
    });

    it('should not render for non-matching task types', () => {
      const wrongTypeTask = {
        ...task,
        type: 'multiple-choice' as const,
      };

      mockUseMatching.mockReturnValue(createMockHookReturn());

      const { container } = render(
        <MatchingTask
          task={wrongTypeTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render with correct container classes', () => {
      mockUseMatching.mockReturnValue(createMockHookReturn());

      const { container } = render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.matching-container')).toBeInTheDocument();
      expect(container.querySelector('.matching-instruction')).toBeInTheDocument();
      expect(container.querySelector('.matching-grid')).toBeInTheDocument();
    });
  });

  describe('Item Selection Handling', () => {
    it('should call setMatch when a selection is made', () => {
      const mockSetMatch = vi.fn();

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          setMatch: mockSetMatch,
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByRole('combobox');

      // Select "two" for "eins" (leftIndex 0, rightIndex 1)
      fireEvent.change(selects[0], { target: { value: '1' } });

      expect(mockSetMatch).toHaveBeenCalledWith(0, 1);
    });

    it('should call setMatch with correct indices for multiple selections', () => {
      const mockSetMatch = vi.fn();

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          setMatch: mockSetMatch,
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByRole('combobox');

      // Make multiple selections
      fireEvent.change(selects[0], { target: { value: '0' } });
      expect(mockSetMatch).toHaveBeenCalledWith(0, 0);

      fireEvent.change(selects[1], { target: { value: '1' } });
      expect(mockSetMatch).toHaveBeenCalledWith(1, 1);

      fireEvent.change(selects[2], { target: { value: '2' } });
      expect(mockSetMatch).toHaveBeenCalledWith(2, 2);
    });

    it('should display selected values in select dropdowns', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0, 1: 1, 2: 2 },
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      expect(selects[0]).toHaveAttribute('data-value', '0');
      expect(selects[1]).toHaveAttribute('data-value', '1');
      expect(selects[2]).toHaveAttribute('data-value', '2');
    });

    it('should display empty value for unmatched items', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0 }, // Only first item matched
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      expect(selects[0]).toHaveAttribute('data-value', '0');
      expect(selects[1]).toHaveAttribute('data-value', '');
      expect(selects[2]).toHaveAttribute('data-value', '');
    });
  });

  describe('Match Creation', () => {
    it('should allow creating matches between left and right items', () => {
      const mockSetMatch = vi.fn();

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: {},
          shuffledRightColumn: [2, 0, 1], // Shuffled order
          setMatch: mockSetMatch,
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByRole('combobox');

      // Match "eins" with "one" (which is at index 1 in shuffled order)
      fireEvent.change(selects[0], { target: { value: '0' } });

      expect(mockSetMatch).toHaveBeenCalledWith(0, 0);
    });

    it('should handle shuffled right column correctly', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          shuffledRightColumn: [2, 0, 1], // three, one, two
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByRole('combobox');
      const options = selects[0].querySelectorAll('option');

      // Filter out placeholder
      const dataOptions = Array.from(options).filter(opt => (opt as HTMLOptionElement).value !== '');

      // Should show right items in shuffled order
      expect(dataOptions[0]).toHaveTextContent('three');
      expect(dataOptions[1]).toHaveTextContent('one');
      expect(dataOptions[2]).toHaveTextContent('two');
    });

    it('should allow changing a match', () => {
      const mockSetMatch = vi.fn();

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0 }, // Initial match
          shuffledRightColumn: [0, 1, 2],
          setMatch: mockSetMatch,
        })
      );

      const { rerender } = render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByRole('combobox');

      // Change the match
      fireEvent.change(selects[0], { target: { value: '1' } });

      expect(mockSetMatch).toHaveBeenCalledWith(0, 1);

      // Update the mock to reflect the change
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 1 }, // Updated match
          shuffledRightColumn: [0, 1, 2],
          setMatch: mockSetMatch,
        })
      );

      rerender(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const updatedSelects = screen.getAllByTestId('select');
      expect(updatedSelects[0]).toHaveAttribute('data-value', '1');
    });
  });

  describe('Feedback State - Correct Matches', () => {
    it('should apply success state to correct matches when showing feedback', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0, 1: 1, 2: 2 }, // All correct
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      selects.forEach((select) => {
        expect(select).toHaveAttribute('data-success', 'true');
      });
    });

    it('should apply success state only to correct matches in partial success', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0, 1: 2, 2: 2 }, // 0 and 2 correct, 1 wrong
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      expect(selects[0]).toHaveAttribute('data-success', 'true'); // Correct
      expect(selects[1]).toHaveAttribute('data-error', 'true'); // Incorrect
      expect(selects[2]).toHaveAttribute('data-success', 'true'); // Correct
    });

    it('should not apply success state when not showing feedback', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0, 1: 1, 2: 2 },
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      selects.forEach((select) => {
        expect(select).toHaveAttribute('data-success', 'false');
        expect(select).toHaveAttribute('data-error', 'false');
      });
    });
  });

  describe('Feedback State - Incorrect Matches', () => {
    it('should apply error state to incorrect matches when showing feedback', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 1, 1: 0, 2: 2 }, // 0 and 1 wrong, 2 correct
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      expect(selects[0]).toHaveAttribute('data-error', 'true');
      expect(selects[1]).toHaveAttribute('data-error', 'true');
      expect(selects[2]).toHaveAttribute('data-success', 'true');
    });

    it('should not apply error state to unanswered items', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 1 }, // Only first item answered (wrong)
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      expect(selects[0]).toHaveAttribute('data-error', 'true'); // Wrong answer
      expect(selects[1]).toHaveAttribute('data-error', 'false'); // No answer
      expect(selects[2]).toHaveAttribute('data-error', 'false'); // No answer
    });

    it('should show correct answers feedback section when answer is incorrect', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 1, 1: 0, 2: 2 },
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Richtige Zuordnungen:')).toBeInTheDocument();

      const content = task.content as MatchingContent;

      // All correct pairs should be shown (using getAllByText since they appear in multiple places)
      content.pairs.forEach((pair) => {
        expect(screen.getAllByText(pair.left).length).toBeGreaterThan(0);
        expect(screen.getAllByText(pair.right).length).toBeGreaterThan(0);
      });
    });

    it('should not show correct answers feedback when answer is correct', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0, 1: 1, 2: 2 },
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Richtige Zuordnungen:')).not.toBeInTheDocument();
    });

    it('should not show feedback section when not showing feedback', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 1, 1: 0, 2: 2 },
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Richtige Zuordnungen:')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State During Feedback', () => {
    it('should disable all select dropdowns when showing feedback', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0, 1: 1, 2: 2 },
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      selects.forEach((select) => {
        expect(select).toHaveAttribute('data-disabled', 'true');
      });
    });

    it('should enable select dropdowns when not showing feedback', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: {},
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      selects.forEach((select) => {
        expect(select).toHaveAttribute('data-disabled', 'false');
      });
    });

    it('should not allow changing selections during feedback', () => {
      const mockSetMatch = vi.fn();

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0, 1: 1, 2: 2 },
          shuffledRightColumn: [0, 1, 2],
          setMatch: mockSetMatch,
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByRole('combobox');

      // All selects should be disabled
      selects.forEach((select) => {
        expect(select).toBeDisabled();
      });
    });
  });

  describe('Audio Button Rendering', () => {
    it('should render audio button for left item when leftAudio is provided', () => {
      const taskWithAudio = createMatchingTask({
        content: {
          instruction: 'Match numbers',
          pairs: [
            { left: 'eins', right: 'one', leftAudio: 'german/eins.mp3' },
            { left: 'zwei', right: 'two', leftAudio: 'german/zwei.mp3' },
            { left: 'drei', right: 'three', leftAudio: 'german/drei.mp3' },
          ],
        } as MatchingContent,
      });

      mockUseMatching.mockReturnValue(createMockHookReturn());

      render(
        <MatchingTask
          task={taskWithAudio}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButtons = screen.getAllByTestId('audio-button');
      expect(audioButtons).toHaveLength(3);

      expect(audioButtons[0]).toHaveAttribute('data-text', 'eins');
      expect(audioButtons[0]).toHaveAttribute('data-audio-url', expect.stringContaining('german/eins.mp3'));
      expect(audioButtons[0]).toHaveAttribute('data-size', 'small');
    });

    it('should not render audio button when leftAudio is not provided', () => {
      mockUseMatching.mockReturnValue(createMockHookReturn());

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByTestId('audio-button')).not.toBeInTheDocument();
    });

    it('should render audio buttons only for items with audio', () => {
      const taskWithPartialAudio = createMatchingTask({
        content: {
          instruction: 'Match numbers',
          pairs: [
            { left: 'eins', right: 'one', leftAudio: 'german/eins.mp3' },
            { left: 'zwei', right: 'two' }, // No audio
            { left: 'drei', right: 'three', leftAudio: 'german/drei.mp3' },
          ],
        } as MatchingContent,
      });

      mockUseMatching.mockReturnValue(createMockHookReturn());

      render(
        <MatchingTask
          task={taskWithPartialAudio}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButtons = screen.getAllByTestId('audio-button');
      expect(audioButtons).toHaveLength(2); // Only for eins and drei
    });

    it('should include BASE_URL in audio URL path', () => {
      const taskWithAudio = createMatchingTask({
        content: {
          instruction: 'Match numbers',
          pairs: [
            { left: 'eins', right: 'one', leftAudio: 'german/eins.mp3' },
          ],
        } as MatchingContent,
      });

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          shuffledRightColumn: [0],
        })
      );

      render(
        <MatchingTask
          task={taskWithAudio}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButton = screen.getByTestId('audio-button');
      const audioUrl = audioButton.getAttribute('data-audio-url');

      // Should include 'audio/' prefix and the audio file path
      expect(audioUrl).toContain('audio/');
      expect(audioUrl).toContain('german/eins.mp3');
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange with false when no matches are made', () => {
      const mockCanSubmit = vi.fn(() => false);

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: {},
          canSubmit: mockCanSubmit,
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
    });

    it('should call onAnswerChange with true when all matches are made', () => {
      const mockCanSubmit = vi.fn(() => true);

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0, 1: 1, 2: 2 },
          canSubmit: mockCanSubmit,
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should update onAnswerChange when matches change', () => {
      const mockCanSubmit1 = vi.fn(() => false);

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0 }, // Partial
          canSubmit: mockCanSubmit1,
        })
      );

      const { rerender } = render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);

      // Complete all matches
      const mockCanSubmit2 = vi.fn(() => true);
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0, 1: 1, 2: 2 },
          canSubmit: mockCanSubmit2,
        })
      );

      rerender(
        <MatchingTask
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
      mockUseMatching.mockReturnValue(createMockHookReturn());

      expect(() => {
        render(
          <MatchingTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Full Width Select', () => {
    it('should render all select dropdowns with fullWidth prop', () => {
      mockUseMatching.mockReturnValue(createMockHookReturn());

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');

      selects.forEach((select) => {
        expect(select).toHaveAttribute('data-full-width', 'true');
      });
    });
  });

  describe('Hook Integration', () => {
    it('should pass task and showFeedback to useMatching', () => {
      mockUseMatching.mockReturnValue(createMockHookReturn());

      render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseMatching).toHaveBeenCalledWith(task, true);
    });

    it('should call useMatching with updated showFeedback', () => {
      mockUseMatching.mockReturnValue(createMockHookReturn());

      const { rerender } = render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseMatching).toHaveBeenCalledWith(task, false);

      rerender(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseMatching).toHaveBeenCalledWith(task, true);
    });

    it('should use all hook return values correctly', () => {
      const mockReturn = createMockHookReturn({
        matchingAnswers: { 0: 0, 1: 1 },
        shuffledRightColumn: [2, 0, 1],
        setMatch: vi.fn(),
        canSubmit: vi.fn(() => false),
      });

      mockUseMatching.mockReturnValue(mockReturn);

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      // Verify matchingAnswers are used
      const selects = screen.getAllByTestId('select');
      expect(selects[0]).toHaveAttribute('data-value', '0');
      expect(selects[1]).toHaveAttribute('data-value', '1');

      // Verify canSubmit is called
      expect(mockReturn.canSubmit).toHaveBeenCalled();

      // Verify setMatch is available
      const selectInputs = screen.getAllByRole('combobox');
      fireEvent.change(selectInputs[0], { target: { value: '2' } });
      expect(mockReturn.setMatch).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle task with single pair', () => {
      const singlePairTask = createMatchingTask({
        content: {
          instruction: 'Match',
          pairs: [{ left: 'eins', right: 'one' }],
        } as MatchingContent,
      });

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          shuffledRightColumn: [0],
        })
      );

      render(
        <MatchingTask
          task={singlePairTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('eins')).toBeInTheDocument();
      expect(screen.getAllByTestId('select')).toHaveLength(1);
    });

    it('should handle task with many pairs', () => {
      const manyPairsTask = createMatchingTask({
        content: {
          instruction: 'Match all',
          pairs: Array.from({ length: 10 }, (_, i) => ({
            left: `left${i}`,
            right: `right${i}`,
          })),
        } as MatchingContent,
      });

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          shuffledRightColumn: Array.from({ length: 10 }, (_, i) => i),
        })
      );

      render(
        <MatchingTask
          task={manyPairsTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getAllByTestId('select')).toHaveLength(10);
    });

    it('should handle pairs with special characters', () => {
      const specialCharsTask = createMatchingTask({
        content: {
          instruction: 'Match',
          pairs: [
            { left: '¿Cómo?', right: 'How?' },
            { left: 'Äpfel', right: 'Apples' },
            { left: '日本語', right: 'Japanese' },
          ],
        } as MatchingContent,
      });

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={specialCharsTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('¿Cómo?')).toBeInTheDocument();
      expect(screen.getByText('Äpfel')).toBeInTheDocument();
      expect(screen.getByText('日本語')).toBeInTheDocument();
    });

    it('should handle long text in pairs', () => {
      const longTextTask = createMatchingTask({
        content: {
          instruction: 'Match',
          pairs: [
            {
              left: 'This is a very long text that might cause layout issues',
              right: 'This is also a very long matching text',
            },
          ],
        } as MatchingContent,
      });

      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          shuffledRightColumn: [0],
        })
      );

      render(
        <MatchingTask
          task={longTextTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('This is a very long text that might cause layout issues')).toBeInTheDocument();
    });

    it('should handle null/undefined matchingAnswers values', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 0, 1: null as unknown as number, 2: undefined as unknown as number },
          shuffledRightColumn: [0, 1, 2],
        })
      );

      render(
        <MatchingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const selects = screen.getAllByTestId('select');
      expect(selects[0]).toHaveAttribute('data-value', '0');
      expect(selects[1]).toHaveAttribute('data-value', '');
      expect(selects[2]).toHaveAttribute('data-value', '');
    });
  });

  describe('Feedback Display', () => {
    it('should display all correct pairs in feedback section', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 1, 1: 0, 2: 2 },
          shuffledRightColumn: [0, 1, 2],
        })
      );

      const { container } = render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const feedbackItems = container.querySelectorAll('.matching-feedback-item');
      const content = task.content as MatchingContent;

      expect(feedbackItems).toHaveLength(content.pairs.length);
    });

    it('should render feedback with correct CSS classes', () => {
      mockUseMatching.mockReturnValue(
        createMockHookReturn({
          matchingAnswers: { 0: 1 },
          shuffledRightColumn: [0, 1, 2],
        })
      );

      const { container } = render(
        <MatchingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.matching-feedback')).toBeInTheDocument();
      expect(container.querySelector('.matching-feedback-title')).toBeInTheDocument();
    });
  });
});
