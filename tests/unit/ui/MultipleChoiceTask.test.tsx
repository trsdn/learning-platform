/**
 * Tests for MultipleChoiceTask Component
 *
 * Tests the multiple choice task functionality including:
 * - Component rendering with options
 * - Option click handling
 * - Cursor movement on mouse enter
 * - Feedback state rendering (correct/incorrect highlighting)
 * - Audio button rendering when audio URL exists
 * - Disabled state during feedback
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultipleChoiceTask } from '../../../src/modules/ui/components/practice/tasks/MultipleChoice/MultipleChoiceTask';
import type { Task, MultipleChoiceContent } from '../../../src/modules/core/types/services';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session__mc-options': 'mc-options',
    'practice-session__mc-option': 'mc-option',
    'practice-session__mc-option--correct': 'mc-option--correct',
    'practice-session__mc-option--incorrect': 'mc-option--incorrect',
    'practice-session__mc-option--selected': 'mc-option--selected',
    'practice-session__mc-option--focused': 'mc-option--focused',
    'practice-session__mc-option--disabled': 'mc-option--disabled',
  },
}));

// Mock AudioButton component
vi.mock('../../../src/modules/ui/components/audio-button', () => ({
  AudioButton: ({ text, audioUrl, size }: { text: string; audioUrl: string; size: string }) => (
    <button data-testid="audio-button" data-text={text} data-audio-url={audioUrl} data-size={size}>
      Audio
    </button>
  ),
}));

// Mock the useMultipleChoice hook
vi.mock('../../../src/modules/ui/components/practice/tasks/MultipleChoice/use-multiple-choice', () => ({
  useMultipleChoice: vi.fn(),
}));

import { useMultipleChoice } from '../../../src/modules/ui/components/practice/tasks/MultipleChoice/use-multiple-choice';

// Helper to create a mock multiple choice task
function createMultipleChoiceTask(
  overrides: Partial<Task> = {},
  contentOverrides: Partial<MultipleChoiceContent> = {}
): Task {
  return {
    id: 'mc-1',
    learningPathId: 'spanish-path',
    templateId: 'mc-template',
    type: 'multiple-choice',
    content: {
      question: '¿Cómo se dice "hello" en español?',
      questionLanguage: 'de',
      options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
      correctAnswer: 0,
      ...contentOverrides,
    } as MultipleChoiceContent,
    metadata: {
      difficulty: 'medium',
      tags: ['vocabulary'],
      estimatedTime: 10,
      points: 5,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Helper to setup mock hook return values
function setupMockHook(overrides = {}) {
  const mockHookReturn = {
    selectedAnswer: null,
    shuffledOptions: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
    shuffledIndices: [0, 1, 2, 3],
    correctAnswerIndex: 0,
    optionCursor: 0,
    setSelectedAnswer: vi.fn(),
    setOptionCursor: vi.fn(),
    moveCursor: vi.fn(),
    canSubmit: vi.fn(),
    checkAnswer: vi.fn(),
    resetState: vi.fn(),
    ...overrides,
  };

  (useMultipleChoice as ReturnType<typeof vi.fn>).mockReturnValue(mockHookReturn);

  return mockHookReturn;
}

describe('MultipleChoiceTask', () => {
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAnswerChange = vi.fn();
  });

  describe('Rendering', () => {
    it('should render all options from the task', () => {
      setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Hola')).toBeInTheDocument();
      expect(screen.getByText('Adiós')).toBeInTheDocument();
      expect(screen.getByText('Gracias')).toBeInTheDocument();
      expect(screen.getByText('Por favor')).toBeInTheDocument();
    });

    it('should not render for non-multiple-choice task types', () => {
      setupMockHook();
      const task = {
        ...createMultipleChoiceTask(),
        type: 'flashcard' as const,
      };

      const { container } = render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render options as buttons with correct aria attributes', () => {
      setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      expect(buttons).toHaveLength(4);
      expect(buttons[0]).toHaveAttribute('aria-label', 'Option 1: Hola');
      expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
    });

    it('should render with shuffled options from the hook', () => {
      setupMockHook({
        shuffledOptions: ['Gracias', 'Hola', 'Por favor', 'Adiós'],
        shuffledIndices: [2, 0, 3, 1],
        correctAnswerIndex: 1, // 'Hola' is at index 1 after shuffling
      });
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));
      expect(buttons[0]).toHaveTextContent('Gracias');
      expect(buttons[1]).toHaveTextContent('Hola');
      expect(buttons[2]).toHaveTextContent('Por favor');
      expect(buttons[3]).toHaveTextContent('Adiós');
    });
  });

  describe('Option Selection', () => {
    it('should call setOptionCursor and setSelectedAnswer when option is clicked', () => {
      const mockHook = setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));
      fireEvent.click(buttons[1]); // Click 'Adiós'

      expect(mockHook.setOptionCursor).toHaveBeenCalledWith(1);
      expect(mockHook.setSelectedAnswer).toHaveBeenCalledWith(1);
    });

    it('should not call handlers when option is clicked during feedback', () => {
      const mockHook = setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));
      fireEvent.click(buttons[1]);

      expect(mockHook.setOptionCursor).not.toHaveBeenCalled();
      expect(mockHook.setSelectedAnswer).not.toHaveBeenCalled();
    });

    it('should update aria-pressed attribute when option is selected', () => {
      setupMockHook({ selectedAnswer: 2 });
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
      expect(buttons[1]).toHaveAttribute('aria-pressed', 'false');
      expect(buttons[2]).toHaveAttribute('aria-pressed', 'true');
      expect(buttons[3]).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Cursor Movement on Mouse Enter', () => {
    it('should call setOptionCursor when mouse enters an option', () => {
      const mockHook = setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));
      fireEvent.mouseEnter(buttons[2]);

      expect(mockHook.setOptionCursor).toHaveBeenCalledWith(2);
    });

    it('should update cursor on each option hover', () => {
      const mockHook = setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      fireEvent.mouseEnter(buttons[0]);
      expect(mockHook.setOptionCursor).toHaveBeenCalledWith(0);

      fireEvent.mouseEnter(buttons[3]);
      expect(mockHook.setOptionCursor).toHaveBeenCalledWith(3);

      expect(mockHook.setOptionCursor).toHaveBeenCalledTimes(2);
    });
  });

  describe('CSS Classes and Visual States', () => {
    it('should apply selected class when option is selected and not showing feedback', () => {
      setupMockHook({ selectedAnswer: 1 });
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      expect(buttons[1].className).toContain('mc-option--selected');
      expect(buttons[0].className).not.toContain('mc-option--selected');
    });

    it('should apply focused class to option under cursor when not showing feedback', () => {
      setupMockHook({ optionCursor: 2 });
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      expect(buttons[2].className).toContain('mc-option--focused');
      expect(buttons[0].className).not.toContain('mc-option--focused');
      expect(buttons[1].className).not.toContain('mc-option--focused');
    });

    it('should not apply focused class when showing feedback', () => {
      setupMockHook({ optionCursor: 2 });
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      expect(buttons[2].className).not.toContain('mc-option--focused');
    });

    it('should apply correct class to correct answer when showing feedback', () => {
      setupMockHook({
        selectedAnswer: 1,
        correctAnswerIndex: 0
      });
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      expect(buttons[0].className).toContain('mc-option--correct');
      expect(buttons[1].className).not.toContain('mc-option--correct');
    });

    it('should apply incorrect class to wrong selected answer when showing feedback and answer is incorrect', () => {
      setupMockHook({
        selectedAnswer: 2,
        correctAnswerIndex: 0
      });
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      expect(buttons[2].className).toContain('mc-option--incorrect');
      expect(buttons[0].className).not.toContain('mc-option--incorrect');
    });

    it('should not apply incorrect class when answer is correct', () => {
      setupMockHook({
        selectedAnswer: 0,
        correctAnswerIndex: 0
      });
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      expect(buttons[0].className).not.toContain('mc-option--incorrect');
      expect(buttons[0].className).toContain('mc-option--correct');
    });

    it('should apply disabled class to all options when showing feedback', () => {
      setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      buttons.forEach(button => {
        expect(button.className).toContain('mc-option--disabled');
      });
    });
  });

  describe('Disabled State During Feedback', () => {
    it('should disable all option buttons when showing feedback', () => {
      setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should not disable option buttons when not showing feedback', () => {
      setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));

      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Audio Button Rendering', () => {
    it('should render audio button for options when optionsAudio is provided', () => {
      setupMockHook({
        shuffledOptions: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
        shuffledIndices: [0, 1, 2, 3],
      });

      const task = createMultipleChoiceTask({}, {
        optionsAudio: ['spanish/hola.mp3', 'spanish/adios.mp3', 'spanish/gracias.mp3', 'spanish/por-favor.mp3'],
      });

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButtons = screen.getAllByTestId('audio-button');
      expect(audioButtons).toHaveLength(4);

      expect(audioButtons[0]).toHaveAttribute('data-audio-url', expect.stringContaining('spanish/hola.mp3'));
      expect(audioButtons[0]).toHaveAttribute('data-text', 'Hola');
      expect(audioButtons[0]).toHaveAttribute('data-size', 'small');
    });

    it('should map audio URLs correctly after shuffling', () => {
      setupMockHook({
        shuffledOptions: ['Adiós', 'Hola', 'Por favor', 'Gracias'],
        shuffledIndices: [1, 0, 3, 2], // Options are shuffled
      });

      const task = createMultipleChoiceTask({}, {
        optionsAudio: ['spanish/hola.mp3', 'spanish/adios.mp3', 'spanish/gracias.mp3', 'spanish/por-favor.mp3'],
      });

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButtons = screen.getAllByTestId('audio-button');

      // Audio should match original indices, not shuffled positions
      expect(audioButtons[0]).toHaveAttribute('data-audio-url', expect.stringContaining('spanish/adios.mp3'));
      expect(audioButtons[0]).toHaveAttribute('data-text', 'Adiós');

      expect(audioButtons[1]).toHaveAttribute('data-audio-url', expect.stringContaining('spanish/hola.mp3'));
      expect(audioButtons[1]).toHaveAttribute('data-text', 'Hola');
    });

    it('should not render audio button when optionsAudio is not provided', () => {
      setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByTestId('audio-button')).not.toBeInTheDocument();
    });

    it('should not render audio button for option when specific audio URL is null', () => {
      setupMockHook({
        shuffledOptions: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
        shuffledIndices: [0, 1, 2, 3],
      });

      const task = createMultipleChoiceTask({}, {
        optionsAudio: ['spanish/hola.mp3', undefined, 'spanish/gracias.mp3', 'spanish/por-favor.mp3'],
      });

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButtons = screen.getAllByTestId('audio-button');

      // Only 3 audio buttons (option at index 1 has no audio)
      expect(audioButtons).toHaveLength(3);
    });

    it('should include BASE_URL in audio URL path', () => {
      setupMockHook({
        shuffledOptions: ['Hola'],
        shuffledIndices: [0],
      });

      const task = createMultipleChoiceTask({}, {
        options: ['Hola'],
        optionsAudio: ['spanish/hola.mp3'],
        correctAnswer: 0,
      });

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButton = screen.getByTestId('audio-button');
      expect(audioButton).toHaveAttribute('data-audio-url', expect.stringMatching(/audio\/spanish\/hola\.mp3$/));
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange with false when no answer is selected', () => {
      setupMockHook({ selectedAnswer: null });
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
    });

    it('should call onAnswerChange with true when an answer is selected', () => {
      setupMockHook({ selectedAnswer: 2 });
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should update onAnswerChange when selection changes', () => {
      const mockHook = setupMockHook({ selectedAnswer: null });
      const task = createMultipleChoiceTask();

      const { rerender } = render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
      mockOnAnswerChange.mockClear();

      // Simulate selection change
      mockHook.selectedAnswer = 1;
      rerender(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should not throw if onAnswerChange is not provided', () => {
      setupMockHook({ selectedAnswer: 1 });
      const task = createMultipleChoiceTask();

      expect(() => {
        render(
          <MultipleChoiceTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Integration with useMultipleChoice Hook', () => {
    it('should call useMultipleChoice with task and showFeedback', () => {
      setupMockHook();
      const task = createMultipleChoiceTask();

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(useMultipleChoice).toHaveBeenCalledWith(task, false);
    });

    it('should re-call hook when showFeedback changes', () => {
      setupMockHook();
      const task = createMultipleChoiceTask();

      const { rerender } = render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(useMultipleChoice).toHaveBeenCalledWith(task, false);

      rerender(
        <MultipleChoiceTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(useMultipleChoice).toHaveBeenCalledWith(task, true);
    });

    it('should use shuffled options from hook for rendering', () => {
      setupMockHook({
        shuffledOptions: ['Custom', 'Shuffled', 'Order'],
        shuffledIndices: [2, 0, 1],
      });

      const task = createMultipleChoiceTask({}, {
        options: ['Original', 'Order', 'Custom'],
      });

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));
      expect(buttons[0]).toHaveTextContent('Custom');
      expect(buttons[1]).toHaveTextContent('Shuffled');
      expect(buttons[2]).toHaveTextContent('Order');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array gracefully', () => {
      setupMockHook({ shuffledOptions: [] });
      const task = createMultipleChoiceTask({}, { options: [] });

      const { container } = render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = container.querySelectorAll('button:not([data-testid])');
      expect(buttons).toHaveLength(0);
    });

    it('should handle single option', () => {
      setupMockHook({
        shuffledOptions: ['Only Option'],
        shuffledIndices: [0],
        correctAnswerIndex: 0,
      });

      const task = createMultipleChoiceTask({}, {
        options: ['Only Option'],
        correctAnswer: 0,
      });

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const buttons = screen.getAllByRole('button').filter(btn => !btn.hasAttribute('data-testid'));
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent('Only Option');
    });

    it('should handle very long option text', () => {
      const longText = 'This is a very long option text that might overflow or cause layout issues in the component';

      setupMockHook({
        shuffledOptions: [longText],
        shuffledIndices: [0],
      });

      const task = createMultipleChoiceTask({}, {
        options: [longText],
      });

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters in options', () => {
      setupMockHook({
        shuffledOptions: ['¿Cómo?', 'Äpfel', '日本語', '🎉'],
        shuffledIndices: [0, 1, 2, 3],
      });

      const task = createMultipleChoiceTask({}, {
        options: ['¿Cómo?', 'Äpfel', '日本語', '🎉'],
      });

      render(
        <MultipleChoiceTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('¿Cómo?')).toBeInTheDocument();
      expect(screen.getByText('Äpfel')).toBeInTheDocument();
      expect(screen.getByText('日本語')).toBeInTheDocument();
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });
  });
});
