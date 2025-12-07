/**
 * Tests for TextInputTask Component
 *
 * Tests the text input task functionality including:
 * - Component rendering
 * - Text input interaction
 * - Value change callbacks
 * - Question display
 * - Placeholder text
 * - Keyboard interaction (Enter to submit)
 * - Feedback display
 * - Audio button rendering
 * - Accessibility attributes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextInputTask } from '../../../src/modules/ui/components/practice/tasks/TextInput/TextInputTask';
import type { Task, TextInputContent } from '../../../src/modules/core/types/services';
import type { AudioConfig } from '../../../src/modules/storage/template-loader';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session__text-input-container': 'text-input-container',
    'practice-session__text-input-wrapper': 'text-input-wrapper',
    'practice-session__text-input': 'text-input',
    'practice-session__text-input-feedback': 'text-input-feedback',
  },
}));

// Mock AudioButton component
vi.mock('../../../src/modules/ui/components/audio-button', () => ({
  AudioButton: ({ text, audioUrl, size }: { text: string; audioUrl: string; size: string }) => (
    <button data-testid="audio-button" data-text={text} data-audio-url={audioUrl} data-size={size}>
      Audio: {text}
    </button>
  ),
}));

// Mock Input component
vi.mock('../../../src/modules/ui/components/forms', () => ({
  Input: ({
    value,
    onChange,
    onKeyDown,
    disabled,
    placeholder,
    error,
    success,
    fullWidth,
    className,
    ...props
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    disabled: boolean;
    placeholder: string;
    error: boolean;
    success: boolean;
    fullWidth: boolean;
    className: string;
    [key: string]: unknown;
  }) => (
    <input
      data-testid="text-input"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      data-error={error}
      data-success={success}
      data-full-width={fullWidth}
      className={className}
      {...props}
    />
  ),
}));

// Mock the useTextInput hook
const mockUseTextInput = vi.fn();
vi.mock('../../../src/modules/ui/components/practice/tasks/TextInput/use-text-input', () => ({
  useTextInput: (task: Task | null, showFeedback: boolean) => mockUseTextInput(task, showFeedback),
}));

// Helper to create a mock text input task
function createTextInputTask(
  overrides: Partial<Task> = {},
  contentOverrides: Partial<TextInputContent> = {}
): Task {
  return {
    id: 'text-input-1',
    learningPathId: 'german-path',
    templateId: 'text-input-template',
    type: 'text-input',
    content: {
      question: 'Was ist die Hauptstadt von Deutschland?',
      correctAnswer: 'Berlin',
      alternatives: ['berlin'],
      caseSensitive: false,
      ...contentOverrides,
    } as TextInputContent,
    metadata: {
      difficulty: 'medium',
      tags: ['geography'],
      estimatedTime: 20,
      points: 10,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('TextInputTask', () => {
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockSetAnswer: ReturnType<typeof vi.fn>;
  let mockCanSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOnAnswerChange = vi.fn();
    mockOnSubmit = vi.fn();
    mockSetAnswer = vi.fn();
    mockCanSubmit = vi.fn(() => false);

    // Default hook implementation
    mockUseTextInput.mockReturnValue({
      answer: '',
      setAnswer: mockSetAnswer,
      canSubmit: mockCanSubmit,
      checkAnswer: vi.fn(() => false),
      resetState: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render text input field', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByTestId('text-input')).toBeInTheDocument();
    });

    it('should render with placeholder text', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input).toHaveAttribute('placeholder', 'Deine Antwort...');
    });

    it('should not render for non-text-input task types', () => {
      const task = {
        ...createTextInputTask(),
        type: 'multiple-choice' as const,
      };

      const { container } = render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render input with full width', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input.getAttribute('data-full-width')).toBe('true');
    });

    it('should render input with correct CSS class', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input).toHaveClass('text-input');
    });
  });

  describe('Text Input Interaction', () => {
    it('should display current answer from hook', () => {
      const task = createTextInputTask();
      mockUseTextInput.mockReturnValue({
        answer: 'Berlin',
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input).toHaveValue('Berlin');
    });

    it('should call setAnswer when user types', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      fireEvent.change(input, { target: { value: 'B' } });

      expect(mockSetAnswer).toHaveBeenCalledWith('B');
    });

    it('should call setAnswer with complete answer', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      fireEvent.change(input, { target: { value: 'Berlin' } });

      expect(mockSetAnswer).toHaveBeenCalledWith('Berlin');
    });

    it('should handle empty input', () => {
      const task = createTextInputTask();
      mockUseTextInput.mockReturnValue({
        answer: 'Berlin',
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      fireEvent.change(input, { target: { value: '' } });

      expect(mockSetAnswer).toHaveBeenCalledWith('');
    });

    it('should disable input when showFeedback is true', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input).toBeDisabled();
    });

    it('should enable input when showFeedback is false', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input).not.toBeDisabled();
    });
  });

  describe('Keyboard Interaction', () => {
    it('should call onSubmit when Enter is pressed and can submit', () => {
      const task = createTextInputTask();
      mockCanSubmit.mockReturnValue(true);

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByTestId('text-input');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not call onSubmit when Enter is pressed and cannot submit', () => {
      const task = createTextInputTask();
      mockCanSubmit.mockReturnValue(false);

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByTestId('text-input');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not call onSubmit when Enter is pressed and showFeedback is true', () => {
      const task = createTextInputTask();
      mockCanSubmit.mockReturnValue(true);

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByTestId('text-input');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not call onSubmit when other keys are pressed', () => {
      const task = createTextInputTask();
      mockCanSubmit.mockReturnValue(true);

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByTestId('text-input');
      fireEvent.keyDown(input, { key: 'a' });
      fireEvent.keyDown(input, { key: 'Space' });
      fireEvent.keyDown(input, { key: 'Tab' });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not throw when onSubmit is not provided', () => {
      const task = createTextInputTask();
      mockCanSubmit.mockReturnValue(true);

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          // No onSubmit
        />
      );

      const input = screen.getByTestId('text-input');
      expect(() => {
        fireEvent.keyDown(input, { key: 'Enter' });
      }).not.toThrow();
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange with initial canSubmit state', () => {
      const task = createTextInputTask();
      mockCanSubmit.mockReturnValue(false);

      render(
        <TextInputTask
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
      const task = createTextInputTask();

      // Create a new canSubmit function that returns true
      const newCanSubmit = vi.fn(() => true);

      // Start with false
      mockCanSubmit.mockReturnValue(false);
      const { rerender } = render(
        <TextInputTask
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
      mockUseTextInput.mockReturnValue({
        answer: 'Berlin',
        setAnswer: mockSetAnswer,
        canSubmit: newCanSubmit,
        checkAnswer: vi.fn(() => true),
        resetState: vi.fn(),
      });

      rerender(
        <TextInputTask
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
      const task = createTextInputTask();

      expect(() => {
        render(
          <TextInputTask
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
    it('should show error state when showFeedback is true and isCorrect is false', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input.getAttribute('data-error')).toBe('true');
      expect(input.getAttribute('data-success')).toBe('false');
    });

    it('should show success state when showFeedback is true and isCorrect is true', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input.getAttribute('data-error')).toBe('false');
      expect(input.getAttribute('data-success')).toBe('true');
    });

    it('should not show error or success state when showFeedback is false', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input.getAttribute('data-error')).toBe('false');
      expect(input.getAttribute('data-success')).toBe('false');
    });

    it('should display correct answer when showFeedback is true and answer is incorrect', () => {
      const task = createTextInputTask({}, {
        correctAnswer: 'Berlin',
      });

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Richtige Antwort:')).toBeInTheDocument();
      expect(screen.getByText('Berlin')).toBeInTheDocument();
    });

    it('should not display correct answer when showFeedback is false', () => {
      const task = createTextInputTask({}, {
        correctAnswer: 'Berlin',
      });

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Richtige Antwort:')).not.toBeInTheDocument();
    });

    it('should not display correct answer when answer is correct', () => {
      const task = createTextInputTask({}, {
        correctAnswer: 'Berlin',
      });

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Richtige Antwort:')).not.toBeInTheDocument();
    });
  });

  describe('Audio Button', () => {
    it('should show audio button when incorrect and correctAnswerAudio is provided', () => {
      const task = createTextInputTask({}, {
        correctAnswer: 'Berlin',
        correctAnswerAudio: 'german/berlin.mp3',
      } as TextInputContent & { correctAnswerAudio?: string });

      // Mock import.meta.env
      vi.stubGlobal('import.meta', {
        env: {
          BASE_URL: '/',
        },
      });

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButton = screen.getByTestId('audio-button');
      expect(audioButton).toBeInTheDocument();
      expect(audioButton).toHaveAttribute('data-text', 'Berlin');
      expect(audioButton).toHaveAttribute('data-audio-url', '/audio/german/berlin.mp3');
      expect(audioButton).toHaveAttribute('data-size', 'small');
    });

    it('should use task audioUrl as fallback when correctAnswerAudio is not provided', () => {
      const task = createTextInputTask({
        audioUrl: '/audio/fallback.mp3',
      }, {
        correctAnswer: 'Berlin',
      });

      vi.stubGlobal('import.meta', {
        env: {
          BASE_URL: '/',
        },
      });

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButton = screen.getByTestId('audio-button');
      expect(audioButton).toBeInTheDocument();
      expect(audioButton).toHaveAttribute('data-audio-url', '/audio/fallback.mp3');
    });

    it('should not show audio button when showFeedback is false', () => {
      const task = createTextInputTask({}, {
        correctAnswer: 'Berlin',
        correctAnswerAudio: 'german/berlin.mp3',
      } as TextInputContent & { correctAnswerAudio?: string });

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByTestId('audio-button')).not.toBeInTheDocument();
    });

    it('should not show audio button when answer is correct', () => {
      const task = createTextInputTask({}, {
        correctAnswer: 'Berlin',
        correctAnswerAudio: 'german/berlin.mp3',
      } as TextInputContent & { correctAnswerAudio?: string });

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(screen.queryByTestId('audio-button')).not.toBeInTheDocument();
    });

    it('should not show audio button when no audio URL is available', () => {
      const task = createTextInputTask({}, {
        correctAnswer: 'Berlin',
      });

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByTestId('audio-button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on input field', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input).toHaveAttribute('aria-label', 'Text answer input');
    });

    it('should update aria-invalid when showing error feedback', () => {
      const task = createTextInputTask();

      const { rerender } = render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      let input = screen.getByTestId('text-input');
      expect(input.getAttribute('data-error')).toBe('false');

      rerender(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      input = screen.getByTestId('text-input');
      expect(input.getAttribute('data-error')).toBe('true');
    });

    it('should be keyboard navigable', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Hook Integration', () => {
    it('should call useTextInput with correct task and showFeedback', () => {
      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseTextInput).toHaveBeenCalledWith(task, false);
    });

    it('should update hook when showFeedback changes', () => {
      const task = createTextInputTask();

      const { rerender } = render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseTextInput).toHaveBeenCalledWith(task, false);

      mockUseTextInput.mockClear();

      rerender(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseTextInput).toHaveBeenCalledWith(task, true);
    });

    it('should update hook when task changes', () => {
      const task1 = createTextInputTask({ id: 'task-1' });
      const task2 = createTextInputTask({ id: 'task-2' });

      const { rerender } = render(
        <TextInputTask
          task={task1}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseTextInput).toHaveBeenCalledWith(task1, false);

      mockUseTextInput.mockClear();

      rerender(
        <TextInputTask
          task={task2}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseTextInput).toHaveBeenCalledWith(task2, false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle task with undefined correctAnswerAudio', () => {
      const task = createTextInputTask({}, {
        correctAnswer: 'Berlin',
      });

      expect(() => {
        render(
          <TextInputTask
            task={task}
            showFeedback={true}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });

    it('should handle very long answers', () => {
      const longAnswer = 'A'.repeat(1000);
      mockUseTextInput.mockReturnValue({
        answer: longAnswer,
        setAnswer: mockSetAnswer,
        canSubmit: mockCanSubmit,
        checkAnswer: vi.fn(() => false),
        resetState: vi.fn(),
      });

      const task = createTextInputTask();

      render(
        <TextInputTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const input = screen.getByTestId('text-input');
      expect(input).toHaveValue(longAnswer);
    });

    it('should handle special characters in correct answer', () => {
      const task = createTextInputTask({}, {
        correctAnswer: 'Björk & Søren',
      });

      render(
        <TextInputTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Björk & Søren')).toBeInTheDocument();
    });

    it('should handle null audioConfig', () => {
      const task = createTextInputTask();

      expect(() => {
        render(
          <TextInputTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });

    it('should handle defined but unused audioConfig', () => {
      const task = createTextInputTask();
      const audioConfig: AudioConfig = {
        autoPlay: { enabled: false },
        buttons: {},
      };

      expect(() => {
        render(
          <TextInputTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={audioConfig}
          />
        );
      }).not.toThrow();
    });
  });
});
