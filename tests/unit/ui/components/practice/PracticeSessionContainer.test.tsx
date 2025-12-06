import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PracticeSessionContainer } from '@ui/components/practice/PracticeSessionContainer';
import type { Task } from '@core/types/services';

// Mock CSS module
vi.mock('@ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session': 'practice-session',
    'practice-session__question-area': 'practice-session__question-area',
    'practice-session__question-header': 'practice-session__question-header',
    'practice-session__question-text': 'practice-session__question-text',
    'practice-session__hint-controls': 'practice-session__hint-controls',
    'practice-session__hint-button': 'practice-session__hint-button',
    'practice-session__hint': 'practice-session__hint',
    'practice-session__footer': 'practice-session__footer',
    'practice-session__shortcuts-overlay': 'practice-session__shortcuts-overlay',
    'practice-session__shortcuts-content': 'practice-session__shortcuts-content',
    'practice-session__shortcuts-groups': 'practice-session__shortcuts-groups',
    'practice-session__shortcuts-group-title': 'practice-session__shortcuts-group-title',
    'practice-session__shortcuts-list': 'practice-session__shortcuts-list',
    'practice-session__shortcut-item': 'practice-session__shortcut-item',
    'practice-session__shortcut-keys': 'practice-session__shortcut-keys',
    'practice-session__shortcuts-close': 'practice-session__shortcuts-close',
  },
}));

// Mock storage template-loader
vi.mock('@storage/template-loader', () => ({
  getAudioConfig: vi.fn().mockResolvedValue(null),
}));

// Mock hooks
const mockUseSessionManagement = vi.fn();
vi.mock('@ui/components/practice/session', () => ({
  useSessionManagement: () => mockUseSessionManagement(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SessionHeader: ({ currentTaskIndex, totalTasks, onCancel }: any) => (
    <div data-testid="session-header">
      Task {currentTaskIndex + 1} of {totalTasks}
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NavigationControls: ({ onSubmit, onNext, onSkip, onComplete, canSubmit, showFeedback }: any) => (
    <div data-testid="navigation-controls">
      {!showFeedback && <button onClick={onSubmit} disabled={!canSubmit}>Submit</button>}
      {showFeedback && <button onClick={onNext}>Next</button>}
      <button onClick={onSkip}>Skip</button>
      <button onClick={onComplete}>Complete</button>
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FeedbackDisplay: ({ isCorrect }: any) => (
    <div data-testid="feedback-display">{isCorrect ? 'Correct!' : 'Incorrect'}</div>
  ),
  SessionStats: () => <div data-testid="session-stats">Stats</div>,
}));

vi.mock('@ui/hooks/use-audio-playback', () => ({
  useAudioPlayback: () => ({
    playbackState: { autoPlayUnlocked: false },
    loadAudio: vi.fn().mockResolvedValue(undefined),
    replay: vi.fn(),
    unlockAutoPlay: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@ui/hooks/use-audio-settings', () => ({
  useAudioSettings: () => ({
    settings: { autoPlay: true, volume: 1.0 },
  }),
}));

vi.mock('@ui/hooks/use-vibration', () => ({
  useVibration: () => ({
    vibrateCorrect: vi.fn(),
    vibrateIncorrect: vi.fn(),
    vibrateSessionComplete: vi.fn(),
  }),
}));

vi.mock('@ui/hooks/use-wake-lock', () => ({
  useWakeLock: () => ({
    acquire: vi.fn(),
    release: vi.fn(),
  }),
}));

vi.mock('@core/utils/audio-helpers', () => ({
  isEligibleForAutoPlay: vi.fn().mockReturnValue(false),
}));

vi.mock('@ui/components/audio-button', () => ({
  AudioButton: ({ text }: { text: string }) => (
    <button data-testid="audio-button">{text}</button>
  ),
}));

// Mock TaskRenderer
vi.mock('@ui/components/practice/TaskRenderer', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TaskRenderer: ({ task, onAnswerChange }: any) => (
    <div data-testid="task-renderer">
      Task: {task?.type}
      <button onClick={() => onAnswerChange?.(true)}>Set Answer</button>
    </div>
  ),
}));

// Mock all task hooks
const mockTaskHook = {
  checkAnswer: vi.fn().mockReturnValue(true),
  canSubmit: vi.fn().mockReturnValue(true),
  selectedAnswer: null,
};

vi.mock('@ui/components/practice/tasks', () => ({
  useMultipleChoice: () => mockTaskHook,
  useTrueFalse: () => mockTaskHook,
  useTextInput: () => mockTaskHook,
  useSlider: () => mockTaskHook,
  useMultipleSelect: () => mockTaskHook,
  useWordScramble: () => mockTaskHook,
  useFlashcard: () => mockTaskHook,
  useClozeDeletion: () => mockTaskHook,
  useOrdering: () => mockTaskHook,
  useMatching: () => mockTaskHook,
}));

describe('PracticeSessionContainer', () => {
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();
  const mockSubmitAnswer = vi.fn();
  const mockNextTask = vi.fn();
  const mockCompleteSession = vi.fn();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createMockTask = (type: string, content: any): Task => ({
    id: `task-${type}`,
    learningPathId: 'path-1',
    templateId: 'template-1',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: type as any,
    content,
    metadata: {
      difficulty: 'easy' as const,
      tags: ['test'],
      estimatedTime: 60,
      points: 10,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockSession = {
    id: 'session-1',
    userId: 'user-1',
    learningPathId: 'path-1',
    execution: {
      taskIds: ['task-1', 'task-2', 'task-3'],
      currentTaskIndex: 0,
      responses: [],
      startedAt: new Date(),
    },
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSessionManagement.mockReturnValue({
      session: mockSession,
      currentTask: createMockTask('multiple-choice', {
        question: 'Test question?',
        options: ['A', 'B', 'C'],
        correctAnswer: 1,
      }),
      currentTaskIndex: 0,
      isLoading: false,
      showFeedback: false,
      isCorrect: false,
      progress: { completed: 0, total: 3, percentage: 0 },
      submitAnswer: mockSubmitAnswer,
      nextTask: mockNextTask,
      completeSession: mockCompleteSession,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading state when isLoading is true', () => {
      mockUseSessionManagement.mockReturnValue({
        session: null,
        currentTask: null,
        currentTaskIndex: 0,
        isLoading: true,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 0, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Laden...')).toBeInTheDocument();
    });

    it('should render session components when loaded', () => {
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Check for actual rendered components instead of test IDs
      expect(screen.getByText('Übungssitzung')).toBeInTheDocument();
      expect(screen.getByTestId('task-renderer')).toBeInTheDocument();
      expect(screen.getByText(/Antwort überprüfen/)).toBeInTheDocument();
      expect(screen.getByText(/beantwortet/)).toBeInTheDocument();
    });

    it('should render question header for multiple-choice tasks', () => {
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Test question?')).toBeInTheDocument();
    });

    it('should render question header for text-input tasks', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('text-input', {
          question: 'What is the answer?',
          correctAnswer: 'answer',
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('What is the answer?')).toBeInTheDocument();
    });

    it('should not render question header for flashcard tasks', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('flashcard', {
          front: 'Front text',
          back: 'Back text',
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByText('Front text')).not.toBeInTheDocument();
    });
  });

  describe('Hint functionality', () => {
    it('should show hint button when task has hint', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question with hint',
          options: ['A', 'B'],
          correctAnswer: 0,
          hint: 'This is a helpful hint',
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Hinweis anzeigen/)).toBeInTheDocument();
    });

    it('should toggle hint visibility when button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question',
          options: ['A', 'B'],
          correctAnswer: 0,
          hint: 'Helpful hint',
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      const hintButton = screen.getByText(/Hinweis anzeigen/);
      await user.click(hintButton);

      await waitFor(() => {
        expect(screen.getByText(/Helpful hint/)).toBeInTheDocument();
      });

      const hideButton = screen.getByText(/Hinweis verbergen/);
      await user.click(hideButton);

      await waitFor(() => {
        expect(screen.queryByText(/Helpful hint/)).not.toBeInTheDocument();
      });
    });

    it('should not show hint during feedback', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question',
          options: ['A', 'B'],
          correctAnswer: 0,
          hint: 'Helpful hint',
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: true,
        isCorrect: true,
        progress: { completed: 1, total: 3, percentage: 33 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByText(/Hinweis anzeigen/)).not.toBeInTheDocument();
    });
  });

  describe('Answer submission', () => {
    it('should enable submit button when answer is set', async () => {
      const user = userEvent.setup();
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      const setAnswerButton = screen.getByText('Set Answer');
      await user.click(setAnswerButton);

      await waitFor(() => {
        const submitButton = screen.getByText(/Antwort überprüfen/);
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should call submitAnswer when submit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Set answer first
      const setAnswerButton = screen.getByText('Set Answer');
      await user.click(setAnswerButton);

      // Click submit
      const submitButton = screen.getByText(/Antwort überprüfen/);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmitAnswer).toHaveBeenCalledWith(true);
      });
    });

    it('should not submit when showFeedback is true', async () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question',
          options: ['A', 'B'],
          correctAnswer: 0,
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: true,
        isCorrect: true,
        progress: { completed: 1, total: 3, percentage: 33 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByText(/Antwort überprüfen/)).not.toBeInTheDocument();
      expect(screen.getByText(/Nächste Aufgabe/)).toBeInTheDocument();
    });
  });

  describe('Feedback display', () => {
    it('should show feedback when showFeedback is true', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question',
          options: ['A', 'B'],
          correctAnswer: 0,
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: true,
        isCorrect: true,
        progress: { completed: 1, total: 3, percentage: 33 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Feedback is shown through the actual FeedbackDisplay component
      expect(screen.getByText(/Richtig/)).toBeInTheDocument();
    });

    it('should not show feedback for flashcard tasks', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('flashcard', {
          front: 'Front',
          back: 'Back',
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: true,
        isCorrect: true,
        progress: { completed: 1, total: 3, percentage: 33 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByTestId('feedback-display')).not.toBeInTheDocument();
    });

    it('should show incorrect feedback', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question',
          options: ['A', 'B'],
          correctAnswer: 0,
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: true,
        isCorrect: false,
        progress: { completed: 1, total: 3, percentage: 33 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Nicht ganz/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call nextTask when Next button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question',
          options: ['A', 'B'],
          correctAnswer: 0,
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: true,
        isCorrect: true,
        progress: { completed: 1, total: 3, percentage: 33 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      const nextButton = screen.getByText(/Nächste Aufgabe/);
      await user.click(nextButton);

      expect(mockNextTask).toHaveBeenCalled();
    });

    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText(/Abbrechen/);
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should call completeSession when Complete button is clicked at last task', async () => {
      const user = userEvent.setup();
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question',
          options: ['A', 'B'],
          correctAnswer: 0,
        }),
        currentTaskIndex: 2, // Last task (index 2 of 3 tasks)
        isLoading: false,
        showFeedback: true,
        isCorrect: true,
        progress: { completed: 3, total: 3, percentage: 100 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      const completeButton = screen.getByText(/Sitzung beenden/);
      await user.click(completeButton);

      expect(mockCompleteSession).toHaveBeenCalled();
    });
  });

  describe('Keyboard shortcuts', () => {
    it('should show keyboard shortcuts overlay when ? is pressed', async () => {
      const user = userEvent.setup();
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      await user.keyboard('?');

      await waitFor(() => {
        expect(screen.getByText('Tastaturkürzel')).toBeInTheDocument();
      });
    });

    it('should close shortcuts overlay when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Open shortcuts
      await user.keyboard('?');

      await waitFor(() => {
        expect(screen.getByText('Tastaturkürzel')).toBeInTheDocument();
      });

      // Close with Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Tastaturkürzel')).not.toBeInTheDocument();
      });
    });

    it('should toggle hint when H is pressed', async () => {
      const user = userEvent.setup();
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question',
          options: ['A', 'B'],
          correctAnswer: 0,
          hint: 'Test hint',
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      await user.keyboard('h');

      await waitFor(() => {
        expect(screen.getByText(/Test hint/)).toBeInTheDocument();
      });

      // Toggle off
      await user.keyboard('h');

      await waitFor(() => {
        expect(screen.queryByText(/Test hint/)).not.toBeInTheDocument();
      });
    });

    it('should call onCancel when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      await user.keyboard('{Escape}');

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should submit answer when Enter is pressed and can submit', async () => {
      const user = userEvent.setup();
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Set answer first
      const setAnswerButton = screen.getByText('Set Answer');
      await user.click(setAnswerButton);

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSubmitAnswer).toHaveBeenCalled();
      });
    });

    it('should go to next task when Enter is pressed during feedback', async () => {
      const user = userEvent.setup();
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question',
          options: ['A', 'B'],
          correctAnswer: 0,
        }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: true,
        isCorrect: true,
        progress: { completed: 1, total: 3, percentage: 33 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      await user.keyboard('{Enter}');

      expect(mockNextTask).toHaveBeenCalled();
    });
  });

  describe('Session progress', () => {
    it('should display current task index', () => {
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/1\/3/)).toBeInTheDocument();
    });

    it('should update task index as session progresses', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', {
          question: 'Question 2',
          options: ['A', 'B'],
          correctAnswer: 0,
        }),
        currentTaskIndex: 1,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 1, total: 3, percentage: 33 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/2\/3/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible keyboard shortcuts dialog', async () => {
      const user = userEvent.setup();
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      await user.keyboard('?');

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'practice-shortcuts-title');
      });
    });

    it('should have accessible navigation controls', () => {
      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Check for navigation buttons
      expect(screen.getByText(/Antwort überprüfen/)).toBeInTheDocument();
      expect(screen.getByText(/Überspringen/)).toBeInTheDocument();
    });
  });

  describe('Task type handling', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taskTypes: Array<[string, any]> = [
      ['multiple-choice', { question: 'Q?', options: ['A', 'B'], correctAnswer: 0 }],
      ['true-false', { statement: 'Statement', correctAnswer: true }],
      ['text-input', { question: 'Q?', correctAnswer: 'answer' }],
      ['slider', { question: 'Q?', min: 1, max: 10, correctValue: 5 }],
      ['multiple-select', { question: 'Q?', options: ['A', 'B'], correctAnswers: [0] }],
      ['word-scramble', { question: 'Q?', scrambledWord: 'ABC', correctAnswer: 'CAB' }],
      ['flashcard', { front: 'Front', back: 'Back' }],
      ['cloze-deletion', { text: 'Text {{blank}}', blanks: [{ index: 0, correctAnswer: 'word' }] }],
      ['ordering', { question: 'Q?', items: ['A', 'B'], correctOrder: [1, 0] }],
      ['matching', { question: 'Q?', pairs: [{ left: 'A', right: '1' }] }],
    ];

    taskTypes.forEach(([type, content]) => {
      it(`should render ${type} task correctly`, () => {
        mockUseSessionManagement.mockReturnValue({
          session: mockSession,
          currentTask: createMockTask(type, content),
          currentTaskIndex: 0,
          isLoading: false,
          showFeedback: false,
          isCorrect: false,
          progress: { completed: 0, total: 3, percentage: 0 },
          submitAnswer: mockSubmitAnswer,
          nextTask: mockNextTask,
          completeSession: mockCompleteSession,
        });

        render(
          <PracticeSessionContainer
            sessionId="session-1"
            onComplete={mockOnComplete}
            onCancel={mockOnCancel}
          />
        );

        expect(screen.getByTestId('task-renderer')).toBeInTheDocument();
        expect(screen.getByText(`Task: ${type}`)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should display loading indicator when isLoading is true', () => {
      mockUseSessionManagement.mockReturnValue({
        session: null,
        currentTask: null,
        currentTaskIndex: 0,
        isLoading: true,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 0, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Lade/i)).toBeInTheDocument();
    });

    it('should not display task content when loading', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', { question: 'Q?', options: ['A', 'B'], correctAnswer: 0 }),
        currentTaskIndex: 0,
        isLoading: true,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByTestId('task-renderer')).not.toBeInTheDocument();
    });

    it('should not allow submit while loading', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', { question: 'Q?', options: ['A', 'B'], correctAnswer: 0 }),
        currentTaskIndex: 0,
        isLoading: true,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.queryByText(/Antwort überprüfen/i);
      expect(submitButton).not.toBeInTheDocument();
    });

    it('should transition from loading to showing task', async () => {
      const { rerender } = render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Initially loading
      mockUseSessionManagement.mockReturnValue({
        session: null,
        currentTask: null,
        currentTaskIndex: 0,
        isLoading: true,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 0, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      rerender(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Lade/i)).toBeInTheDocument();

      // After loading completes
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', { question: 'Q?', options: ['A', 'B'], correctAnswer: 0 }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      rerender(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByText(/Lade/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('task-renderer')).toBeInTheDocument();
    });
  });

  describe('Session State Management', () => {
    it('should show loading state when no session and no task', () => {
      mockUseSessionManagement.mockReturnValue({
        session: null,
        currentTask: null,
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 0, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // When session is not loaded yet, should show loading
      expect(screen.getByText(/Laden/i)).toBeInTheDocument();
    });

    it('should render content when session and task are available', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', { question: 'Q?', options: ['A', 'B'], correctAnswer: 0 }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('task-renderer')).toBeInTheDocument();
    });

    it('should allow user to cancel the session', async () => {
      const user = userEvent.setup();
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: createMockTask('multiple-choice', { question: 'Q?', options: ['A', 'B'], correctAnswer: 0 }),
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText(/Abbrechen|Cancel/i);
      await user.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty session gracefully', () => {
      mockUseSessionManagement.mockReturnValue({
        session: { ...mockSession, tasks: [] },
        currentTask: null,
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 0, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Should not crash, may show empty state or complete
      expect(screen.queryByTestId('task-renderer')).not.toBeInTheDocument();
    });

    it('should handle null currentTask after session start', () => {
      mockUseSessionManagement.mockReturnValue({
        session: mockSession,
        currentTask: null,
        currentTaskIndex: 0,
        isLoading: false,
        showFeedback: false,
        isCorrect: false,
        progress: { completed: 0, total: 3, percentage: 0 },
        submitAnswer: mockSubmitAnswer,
        nextTask: mockNextTask,
        completeSession: mockCompleteSession,
      });

      render(
        <PracticeSessionContainer
          sessionId="session-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByTestId('task-renderer')).not.toBeInTheDocument();
    });
  });
});
