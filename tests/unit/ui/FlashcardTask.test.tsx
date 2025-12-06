/**
 * Tests for FlashcardTask Component
 *
 * Tests the flashcard task functionality including:
 * - #152: Self-assessment buttons calling onSubmitAnswer and onAutoAdvance
 * - Reveal functionality
 * - Language display
 * - Audio button rendering
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FlashcardTask } from '../../../src/modules/ui/components/practice/tasks/Flashcard/FlashcardTask';
import type { Task, FlashcardContent } from '../../../src/modules/core/types/services';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session__flashcard-container': 'flashcard-container',
    'practice-session__flashcard': 'flashcard',
    'practice-session__flashcard-lang': 'flashcard-lang',
    'practice-session__flashcard-front': 'flashcard-front',
    'practice-session__flashcard-back': 'flashcard-back',
    'practice-session__flashcard-reveal-btn': 'flashcard-reveal-btn',
    'practice-session__flashcard-divider': 'flashcard-divider',
    'practice-session__flashcard-assessment': 'flashcard-assessment',
    'practice-session__flashcard-btn': 'flashcard-btn',
    'practice-session__flashcard-btn--unknown': 'flashcard-btn--unknown',
    'practice-session__flashcard-btn--known': 'flashcard-btn--known',
    'practice-session__flashcard-icon': 'flashcard-icon',
  },
}));

// Mock AudioButton component
vi.mock('../../../src/modules/ui/components/audio-button', () => ({
  AudioButton: ({ text, size }: { text: string; size: string }) => (
    <button data-testid="audio-button" data-text={text} data-size={size}>
      Audio
    </button>
  ),
}));

// Helper to create a mock flashcard task
function createFlashcardTask(
  overrides: Partial<Task> = {},
  contentOverrides: Partial<FlashcardContent> = {}
): Task {
  return {
    id: 'flashcard-1',
    learningPathId: 'spanish-path',
    templateId: 'flashcard-template',
    type: 'flashcard',
    content: {
      front: 'Hola',
      frontLanguage: 'es',
      back: 'Hello',
      backLanguage: 'de',
      ...contentOverrides,
    } as FlashcardContent,
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

describe('FlashcardTask', () => {
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;
  let mockOnAutoAdvance: ReturnType<typeof vi.fn>;
  let mockOnSubmitAnswer: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockOnAnswerChange = vi.fn();
    mockOnAutoAdvance = vi.fn();
    mockOnSubmitAnswer = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render front text and language', () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Hola')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
    });

    it('should show reveal button initially', () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Ergebnis anzeigen')).toBeInTheDocument();
    });

    it('should not render for non-flashcard task types', () => {
      const task = {
        ...createFlashcardTask(),
        type: 'multiple-choice' as const,
      };

      const { container } = render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should display language labels correctly', () => {
      const task = createFlashcardTask({}, {
        front: 'Guten Tag',
        frontLanguage: 'de',
        back: 'Buenos días',
        backLanguage: 'es',
      });

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Deutsch')).toBeInTheDocument();
    });
  });

  describe('Reveal Functionality', () => {
    it('should reveal back content when reveal button is clicked', () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Click reveal button
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));

      // Back content should be visible
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.queryByText('Ergebnis anzeigen')).not.toBeInTheDocument();
    });

    it('should show assessment buttons after reveal', () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Reveal
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));

      // Assessment buttons should be visible
      expect(screen.getByText('Nicht gewusst')).toBeInTheDocument();
      expect(screen.getByText('Gewusst')).toBeInTheDocument();
    });

    it('should disable reveal button when showFeedback is true', () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const revealButton = screen.getByText('Ergebnis anzeigen');
      expect(revealButton).toBeDisabled();
    });
  });

  describe('Self-Assessment (#152 - Stats Recording)', () => {
    it('should call onSubmitAnswer with true when "Gewusst" is clicked', async () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAutoAdvance={mockOnAutoAdvance}
        />
      );

      // Reveal and click "Gewusst"
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));
      fireEvent.click(screen.getByText('Gewusst'));

      // Should call onSubmitAnswer with true (known = correct)
      expect(mockOnSubmitAnswer).toHaveBeenCalledWith(true);
    });

    it('should call onSubmitAnswer with false when "Nicht gewusst" is clicked', async () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAutoAdvance={mockOnAutoAdvance}
        />
      );

      // Reveal and click "Nicht gewusst"
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));
      fireEvent.click(screen.getByText('Nicht gewusst'));

      // Should call onSubmitAnswer with false (not known = incorrect)
      expect(mockOnSubmitAnswer).toHaveBeenCalledWith(false);
    });

    it('should call onAutoAdvance after brief delay when assessment is made', async () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAutoAdvance={mockOnAutoAdvance}
        />
      );

      // Reveal
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));

      // Click assessment - this triggers async handleKnownResponse
      fireEvent.click(screen.getByText('Gewusst'));

      // Flush the promise from onSubmitAnswer (which is awaited before setTimeout)
      await act(async () => {
        await Promise.resolve();
      });

      // onAutoAdvance should not be called immediately (setTimeout hasn't fired yet)
      expect(mockOnAutoAdvance).not.toHaveBeenCalled();

      // Now advance timers to trigger the setTimeout callback
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Now it should be called
      expect(mockOnAutoAdvance).toHaveBeenCalledTimes(1);
    });

    it('should not call onAutoAdvance if not provided', () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onSubmitAnswer={mockOnSubmitAnswer}
          // No onAutoAdvance
        />
      );

      // Reveal and click assessment
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));
      fireEvent.click(screen.getByText('Gewusst'));

      vi.advanceTimersByTime(500);

      // Should not throw, onAutoAdvance is optional
      expect(mockOnSubmitAnswer).toHaveBeenCalledWith(true);
    });

    it('should not call onSubmitAnswer if not provided', () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAutoAdvance={mockOnAutoAdvance}
          // No onSubmitAnswer
        />
      );

      // Reveal and click assessment
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));
      fireEvent.click(screen.getByText('Gewusst'));

      vi.advanceTimersByTime(500);

      // Should auto-advance without throwing
      expect(mockOnAutoAdvance).toHaveBeenCalled();
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange with false initially', () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      // Initially, can't submit (no assessment made)
      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
    });

    it('should call onAnswerChange with true after assessment', () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      mockOnAnswerChange.mockClear();

      // Reveal and make assessment
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));
      fireEvent.click(screen.getByText('Gewusst'));

      // Should report that answer can be submitted
      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Assessment Button Visibility', () => {
    it('should hide assessment buttons when showFeedback is true', () => {
      const task = createFlashcardTask();

      const { rerender } = render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Reveal
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));

      // Buttons should be visible
      expect(screen.getByText('Gewusst')).toBeInTheDocument();

      // Rerender with showFeedback = true
      rerender(
        <FlashcardTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Buttons should be hidden
      expect(screen.queryByText('Gewusst')).not.toBeInTheDocument();
      expect(screen.queryByText('Nicht gewusst')).not.toBeInTheDocument();
    });

    it('should hide assessment buttons after user has answered (#167 - prevent duplicate answer)', () => {
      const task = createFlashcardTask();

      const { rerender } = render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAutoAdvance={mockOnAutoAdvance}
        />
      );

      // Reveal the card
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));

      // Assessment buttons should be visible
      expect(screen.getByText('Gewusst')).toBeInTheDocument();
      expect(screen.getByText('Nicht gewusst')).toBeInTheDocument();

      // Click "Gewusst" - this sets known = true
      fireEvent.click(screen.getByText('Gewusst'));

      // Even with showFeedback still false, buttons should be hidden because known is set
      // This prevents the bug where buttons reappear when showFeedback toggles back to false
      expect(screen.queryByText('Gewusst')).not.toBeInTheDocument();
      expect(screen.queryByText('Nicht gewusst')).not.toBeInTheDocument();

      // Simulate what happens during session completion:
      // showFeedback goes true, then false again - buttons should NOT reappear
      rerender(
        <FlashcardTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAutoAdvance={mockOnAutoAdvance}
        />
      );

      rerender(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={true}
          audioConfig={null}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAutoAdvance={mockOnAutoAdvance}
        />
      );

      // Buttons should still be hidden - user already answered
      expect(screen.queryByText('Gewusst')).not.toBeInTheDocument();
      expect(screen.queryByText('Nicht gewusst')).not.toBeInTheDocument();
    });

    it('should prevent double-answering the last flashcard (#167)', async () => {
      const task = createFlashcardTask();

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onSubmitAnswer={mockOnSubmitAnswer}
          onAutoAdvance={mockOnAutoAdvance}
        />
      );

      // Reveal and answer
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));
      fireEvent.click(screen.getByText('Gewusst'));

      // onSubmitAnswer should be called exactly once
      expect(mockOnSubmitAnswer).toHaveBeenCalledTimes(1);
      expect(mockOnSubmitAnswer).toHaveBeenCalledWith(true);

      // Buttons are now hidden, can't click again
      expect(screen.queryByText('Gewusst')).not.toBeInTheDocument();

      // Even if we try to find and click, nothing happens
      mockOnSubmitAnswer.mockClear();

      // Wait for any potential re-renders
      await act(async () => {
        await Promise.resolve();
      });

      // Still no additional calls
      expect(mockOnSubmitAnswer).not.toHaveBeenCalled();
    });
  });

  describe('Audio Configuration', () => {
    it('should show front audio button when configured', () => {
      const task = createFlashcardTask({}, {
        frontAudio: 'spanish/hola.mp3',
      });

      const audioConfig = {
        buttons: {
          front: { show: true, field: 'frontAudio' },
          back: { show: false, field: 'backAudio' },
        },
      };

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={audioConfig}
        />
      );

      expect(screen.getByTestId('audio-button')).toBeInTheDocument();
    });

    it('should show back audio button after reveal when configured', () => {
      const task = createFlashcardTask({}, {
        backAudio: 'german/hello.mp3',
      });

      const audioConfig = {
        buttons: {
          front: { show: false, field: 'frontAudio' },
          back: { show: true, field: 'backAudio' },
        },
      };

      render(
        <FlashcardTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={audioConfig}
        />
      );

      // No audio button initially
      expect(screen.queryByTestId('audio-button')).not.toBeInTheDocument();

      // Reveal
      fireEvent.click(screen.getByText('Ergebnis anzeigen'));

      // Audio button should appear
      expect(screen.getByTestId('audio-button')).toBeInTheDocument();
    });
  });
});
