/**
 * Tests for WordScrambleTask Component
 *
 * Tests the word scramble task functionality including:
 * - Component rendering with scrambled word
 * - Text input interaction
 * - Answer validation
 * - Feedback state rendering (correct/incorrect)
 * - Disabled state during feedback
 * - Word length hint display
 * - Integration with useWordScramble hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WordScrambleTask } from '../../../src/modules/ui/components/practice/tasks/WordScramble/WordScrambleTask';
import type { Task, WordScrambleContent } from '../../../src/modules/core/types/services';
import type { AudioConfig } from '../../../src/modules/storage/template-loader';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session__scramble-container': 'scramble-container',
    'practice-session__scramble-display': 'scramble-display',
    'practice-session__scramble-label': 'scramble-label',
    'practice-session__scramble-word': 'scramble-word',
    'practice-session__scramble-length': 'scramble-length',
    'practice-session__scramble-input-label': 'scramble-input-label',
    'practice-session__scramble-input': 'scramble-input',
    'practice-session__scramble-input--correct': 'scramble-input--correct',
    'practice-session__scramble-input--incorrect': 'scramble-input--incorrect',
    'practice-session__scramble-feedback': 'scramble-feedback',
    'practice-session__scramble-feedback-label': 'scramble-feedback-label',
    'practice-session__scramble-feedback-word': 'scramble-feedback-word',
  },
}));

// Mock the useWordScramble hook
const mockUseWordScramble = vi.fn();
vi.mock('../../../src/modules/ui/components/practice/tasks/WordScramble/use-word-scramble', () => ({
  useWordScramble: (task: Task | null, showFeedback: boolean) => mockUseWordScramble(task, showFeedback),
}));

// Helper to create a mock word scramble task
function createWordScrambleTask(
  overrides: Partial<Task> = {},
  contentOverrides: Partial<WordScrambleContent> = {}
): Task {
  return {
    id: 'word-scramble-1',
    learningPathId: 'german-path',
    templateId: 'word-scramble-template',
    type: 'word-scramble',
    content: {
      question: 'Entschlüssle das Wort',
      scrambledWord: 'AELBT',
      correctWord: 'TABELLE',
      showLength: false,
      ...contentOverrides,
    } as WordScrambleContent,
    metadata: {
      difficulty: 'medium',
      tags: ['vocabulary'],
      estimatedTime: 15,
      points: 10,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('WordScrambleTask', () => {
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;
  let mockSetAnswer: ReturnType<typeof vi.fn>;
  let mockCanSubmit: ReturnType<typeof vi.fn>;
  let mockCheckAnswer: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOnAnswerChange = vi.fn();
    mockSetAnswer = vi.fn();
    mockCanSubmit = vi.fn(() => false);
    mockCheckAnswer = vi.fn(() => false);

    // Default hook implementation
    mockUseWordScramble.mockReturnValue({
      answer: '',
      setAnswer: mockSetAnswer,
      canSubmit: mockCanSubmit,
      checkAnswer: mockCheckAnswer,
      resetState: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render scrambled word display', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Buchstabensalat:')).toBeInTheDocument();
      expect(screen.getByText('AELBT')).toBeInTheDocument();
    });

    it('should render text input field', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByPlaceholderText('Entschlüssle das Wort...')).toBeInTheDocument();
      expect(screen.getByText('Deine Lösung:')).toBeInTheDocument();
    });

    it('should not render for non-word-scramble task types', () => {
      const task = {
        ...createWordScrambleTask(),
        type: 'multiple-choice' as const,
      };

      const { container } = render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render with correct CSS classes', () => {
      const task = createWordScrambleTask();

      const { container } = render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.scramble-container')).toBeInTheDocument();
      expect(container.querySelector('.scramble-display')).toBeInTheDocument();
      expect(container.querySelector('.scramble-input')).toBeInTheDocument();
    });
  });

  describe('Word Length Hint', () => {
    it('should display word length when showLength is true', () => {
      const task = createWordScrambleTask({}, {
        correctWord: 'TABELLE',
        showLength: true,
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('(7 Buchstaben)')).toBeInTheDocument();
    });

    it('should not display word length when showLength is false', () => {
      const task = createWordScrambleTask({}, {
        correctWord: 'TABELLE',
        showLength: false,
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('(7 Buchstaben)')).not.toBeInTheDocument();
    });

    it('should not display word length when showLength is undefined', () => {
      const task = createWordScrambleTask({}, {
        correctWord: 'TABELLE',
        showLength: undefined,
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('(7 Buchstaben)')).not.toBeInTheDocument();
    });

    it('should display correct length for different word lengths', () => {
      const task = createWordScrambleTask({}, {
        correctWord: 'HAUS',
        showLength: true,
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('(4 Buchstaben)')).toBeInTheDocument();
    });
  });

  describe('Text Input Interaction', () => {
    it('should display current answer from hook', () => {
      const task = createWordScrambleTask();
      mockUseWordScramble.mockReturnValue({
        answer: 'TABELLE',
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: mockCheckAnswer,
        resetState: vi.fn(),
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      expect(input).toHaveValue('TABELLE');
    });

    it('should call setAnswer when user types', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      fireEvent.change(input, { target: { value: 'T' } });

      expect(mockSetAnswer).toHaveBeenCalledWith('T');
    });

    it('should call setAnswer with complete answer', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      fireEvent.change(input, { target: { value: 'TABELLE' } });

      expect(mockSetAnswer).toHaveBeenCalledWith('TABELLE');
    });

    it('should handle empty input', () => {
      const task = createWordScrambleTask();
      mockUseWordScramble.mockReturnValue({
        answer: 'TABELLE',
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: mockCheckAnswer,
        resetState: vi.fn(),
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      fireEvent.change(input, { target: { value: '' } });

      expect(mockSetAnswer).toHaveBeenCalledWith('');
    });

    it('should handle typing with spaces', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      fireEvent.change(input, { target: { value: '  TABELLE  ' } });

      expect(mockSetAnswer).toHaveBeenCalledWith('  TABELLE  ');
    });

    it('should disable input when showFeedback is true', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      expect(input).toBeDisabled();
    });

    it('should enable input when showFeedback is false', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      expect(input).not.toBeDisabled();
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange with initial canSubmit state', () => {
      const task = createWordScrambleTask();
      mockCanSubmit.mockReturnValue(false);

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
    });

    it('should call onAnswerChange when canSubmit changes', () => {
      const task = createWordScrambleTask();

      // Create a new canSubmit function that returns true
      const newCanSubmit = vi.fn(() => true);

      // Start with false
      mockCanSubmit.mockReturnValue(false);
      const { rerender } = render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
      mockOnAnswerChange.mockClear();

      // Update hook to return new canSubmit function (new reference triggers useEffect)
      mockUseWordScramble.mockReturnValue({
        answer: 'TABELLE',
        setAnswer: mockSetAnswer,
        canSubmit: newCanSubmit,
        checkAnswer: mockCheckAnswer,
        resetState: vi.fn(),
      });

      rerender(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should not call onAnswerChange when not provided', () => {
      const task = createWordScrambleTask();

      expect(() => {
        render(
          <WordScrambleTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
            // No onAnswerChange
          />
        );
      }).not.toThrow();
    });
  });

  describe('Feedback Display', () => {
    it('should show correct styling when showFeedback is true and answer is correct', () => {
      const task = createWordScrambleTask();
      mockUseWordScramble.mockReturnValue({
        answer: 'TABELLE',
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      const { container } = render(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const input = container.querySelector('.scramble-input');
      expect(input?.className).toContain('scramble-input--correct');
      expect(input?.className).not.toContain('scramble-input--incorrect');
    });

    it('should show incorrect styling when showFeedback is true and answer is incorrect', () => {
      const task = createWordScrambleTask();
      mockUseWordScramble.mockReturnValue({
        answer: 'WRONG',
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      const { container } = render(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = container.querySelector('.scramble-input');
      expect(input?.className).toContain('scramble-input--incorrect');
      expect(input?.className).not.toContain('scramble-input--correct');
    });

    it('should not show styling when showFeedback is false', () => {
      const task = createWordScrambleTask();
      mockUseWordScramble.mockReturnValue({
        answer: 'TABELLE',
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      const { container } = render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = container.querySelector('.scramble-input');
      expect(input?.className).not.toContain('scramble-input--correct');
      expect(input?.className).not.toContain('scramble-input--incorrect');
    });

    it('should not show incorrect styling when answer is empty', () => {
      const task = createWordScrambleTask();
      mockUseWordScramble.mockReturnValue({
        answer: '',
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      const { container } = render(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = container.querySelector('.scramble-input');
      expect(input?.className).not.toContain('scramble-input--incorrect');
      expect(input?.className).not.toContain('scramble-input--correct');
    });

    it('should not show incorrect styling when answer is only whitespace', () => {
      const task = createWordScrambleTask();
      mockUseWordScramble.mockReturnValue({
        answer: '   ',
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      const { container } = render(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = container.querySelector('.scramble-input');
      expect(input?.className).not.toContain('scramble-input--incorrect');
    });

    it('should display correct answer when showFeedback is true and answer is incorrect', () => {
      const task = createWordScrambleTask({}, {
        correctWord: 'TABELLE',
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Richtige Lösung:')).toBeInTheDocument();
      expect(screen.getByText('TABELLE')).toBeInTheDocument();
    });

    it('should not display correct answer when showFeedback is false', () => {
      const task = createWordScrambleTask({}, {
        correctWord: 'TABELLE',
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Richtige Lösung:')).not.toBeInTheDocument();
    });

    it('should not display correct answer when answer is correct', () => {
      const task = createWordScrambleTask({}, {
        correctWord: 'TABELLE',
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Richtige Lösung:')).not.toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should call useWordScramble with correct task and showFeedback', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseWordScramble).toHaveBeenCalledWith(task, false);
    });

    it('should update hook when showFeedback changes', () => {
      const task = createWordScrambleTask();

      const { rerender } = render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseWordScramble).toHaveBeenCalledWith(task, false);

      mockUseWordScramble.mockClear();

      rerender(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseWordScramble).toHaveBeenCalledWith(task, true);
    });

    it('should update hook when task changes', () => {
      const task1 = createWordScrambleTask({ id: 'task-1' });
      const task2 = createWordScrambleTask({ id: 'task-2' });

      const { rerender } = render(
        <WordScrambleTask
          task={task1}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseWordScramble).toHaveBeenCalledWith(task1, false);

      mockUseWordScramble.mockClear();

      rerender(
        <WordScrambleTask
          task={task2}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseWordScramble).toHaveBeenCalledWith(task2, false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long scrambled words', () => {
      const task = createWordScrambleTask({}, {
        scrambledWord: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        correctWord: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBeInTheDocument();
    });

    it('should handle very long answers', () => {
      const longAnswer = 'A'.repeat(1000);
      mockUseWordScramble.mockReturnValue({
        answer: longAnswer,
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: mockCheckAnswer,
        resetState: vi.fn(),
      });

      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      expect(input).toHaveValue(longAnswer);
    });

    it('should handle special characters in scrambled word', () => {
      const task = createWordScrambleTask({}, {
        scrambledWord: 'ÄÖÜSS',
        correctWord: 'ÄÖÜẞ',
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('ÄÖÜSS')).toBeInTheDocument();
    });

    it('should handle special characters in correct word', () => {
      const task = createWordScrambleTask({}, {
        correctWord: 'Björk & Søren',
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Björk & Søren')).toBeInTheDocument();
    });

    it('should handle single character words', () => {
      const task = createWordScrambleTask({}, {
        scrambledWord: 'A',
        correctWord: 'A',
        showLength: true,
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('(1 Buchstaben)')).toBeInTheDocument();
    });

    it('should handle null audioConfig', () => {
      const task = createWordScrambleTask();

      expect(() => {
        render(
          <WordScrambleTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });

    it('should handle defined but unused audioConfig', () => {
      const task = createWordScrambleTask();
      const audioConfig: AudioConfig = {
        autoPlay: { enabled: false },
        buttons: {},
      };

      expect(() => {
        render(
          <WordScrambleTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={audioConfig}
          />
        );
      }).not.toThrow();
    });

    it('should handle empty scrambled word', () => {
      const task = createWordScrambleTask({}, {
        scrambledWord: '',
        correctWord: 'WORD',
      });

      const { container } = render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const scrambleDisplay = container.querySelector('.scramble-word');
      expect(scrambleDisplay).toBeInTheDocument();
      expect(scrambleDisplay?.textContent).toBe('');
    });

    it('should handle numeric characters in word', () => {
      const task = createWordScrambleTask({}, {
        scrambledWord: 'ABC123',
        correctWord: '123ABC',
      });

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('ABC123')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label for input field', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Deine Lösung:')).toBeInTheDocument();
      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      expect(input).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      input.focus();
      expect(document.activeElement).toBe(input);
    });

    it('should update disabled state for accessibility', () => {
      const task = createWordScrambleTask();

      const { rerender } = render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      let input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      expect(input).not.toBeDisabled();

      rerender(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      expect(input).toBeDisabled();
    });
  });

  describe('Component Structure', () => {
    it('should render all required sections', () => {
      const task = createWordScrambleTask({}, {
        showLength: true,
      });

      const { container } = render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.scramble-container')).toBeInTheDocument();
      expect(container.querySelector('.scramble-display')).toBeInTheDocument();
      expect(container.querySelector('.scramble-label')).toBeInTheDocument();
      expect(container.querySelector('.scramble-word')).toBeInTheDocument();
      expect(container.querySelector('.scramble-length')).toBeInTheDocument();
      expect(container.querySelector('.scramble-input-label')).toBeInTheDocument();
      expect(container.querySelector('.scramble-input')).toBeInTheDocument();
    });

    it('should render feedback section only when showing feedback and incorrect', () => {
      const task = createWordScrambleTask();

      const { container, rerender } = render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.scramble-feedback')).not.toBeInTheDocument();

      rerender(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.scramble-feedback')).toBeInTheDocument();
      expect(container.querySelector('.scramble-feedback-label')).toBeInTheDocument();
      expect(container.querySelector('.scramble-feedback-word')).toBeInTheDocument();
    });

    it('should not render feedback section when correct', () => {
      const task = createWordScrambleTask();

      const { container } = render(
        <WordScrambleTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.scramble-feedback')).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should maintain answer state across re-renders', () => {
      const task = createWordScrambleTask();
      mockUseWordScramble.mockReturnValue({
        answer: 'TABELLE',
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: mockCheckAnswer,
        resetState: vi.fn(),
      });

      const { rerender } = render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      let input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      expect(input).toHaveValue('TABELLE');

      rerender(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      input = screen.getByPlaceholderText('Entschlüssle das Wort...');
      expect(input).toHaveValue('TABELLE');
    });

    it('should handle rapid state changes', () => {
      const task = createWordScrambleTask();

      render(
        <WordScrambleTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByPlaceholderText('Entschlüssle das Wort...');

      fireEvent.change(input, { target: { value: 'T' } });
      fireEvent.change(input, { target: { value: 'TA' } });
      fireEvent.change(input, { target: { value: 'TAB' } });
      fireEvent.change(input, { target: { value: 'TABE' } });
      fireEvent.change(input, { target: { value: 'TABELL' } });
      fireEvent.change(input, { target: { value: 'TABELLE' } });

      expect(mockSetAnswer).toHaveBeenCalledTimes(6);
      expect(mockSetAnswer).toHaveBeenLastCalledWith('TABELLE');
    });
  });
});
