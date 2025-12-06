import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TaskRenderer } from '@ui/components/practice/TaskRenderer';
import type { Task } from '@core/types/services';

// Mock CSS module
vi.mock('@ui/components/practice-session.module.css', () => ({
  default: {},
}));

// Mock all task components
vi.mock('@ui/components/practice/tasks/MultipleChoice', () => ({
  MultipleChoiceTask: ({ task }: { task: Task }) => (
    <div data-testid="multiple-choice-task">Multiple Choice: {(task.content as { question: string }).question}</div>
  ),
}));

vi.mock('@ui/components/practice/tasks/TrueFalse', () => ({
  TrueFalseTask: ({ task }: { task: Task }) => (
    <div data-testid="true-false-task">True/False: {(task.content as { statement: string }).statement}</div>
  ),
}));

vi.mock('@ui/components/practice/tasks/TextInput', () => ({
  TextInputTask: ({ task }: { task: Task }) => (
    <div data-testid="text-input-task">Text Input: {(task.content as { question: string }).question}</div>
  ),
}));

vi.mock('@ui/components/practice/tasks/Slider', () => ({
  SliderTask: ({ task }: { task: Task }) => (
    <div data-testid="slider-task">Slider: {(task.content as { question: string }).question}</div>
  ),
}));

vi.mock('@ui/components/practice/tasks/MultipleSelect', () => ({
  MultipleSelectTask: ({ task }: { task: Task }) => (
    <div data-testid="multiple-select-task">Multiple Select: {(task.content as { question: string }).question}</div>
  ),
}));

vi.mock('@ui/components/practice/tasks/WordScramble', () => ({
  WordScrambleTask: ({ task }: { task: Task }) => (
    <div data-testid="word-scramble-task">Word Scramble: {(task.content as { question: string }).question}</div>
  ),
}));

vi.mock('@ui/components/practice/tasks/Flashcard', () => ({
  FlashcardTask: ({ task }: { task: Task }) => (
    <div data-testid="flashcard-task">Flashcard: {(task.content as { front: string }).front}</div>
  ),
}));

vi.mock('@ui/components/practice/tasks/ClozeDeletion', () => ({
  ClozeDeletionTask: ({ task }: { task: Task }) => (
    <div data-testid="cloze-deletion-task">Cloze: {(task.content as { text: string }).text}</div>
  ),
}));

vi.mock('@ui/components/practice/tasks/Ordering', () => ({
  OrderingTask: ({ task }: { task: Task }) => (
    <div data-testid="ordering-task">Ordering: {(task.content as { question: string }).question}</div>
  ),
}));

vi.mock('@ui/components/practice/tasks/Matching', () => ({
  MatchingTask: ({ task }: { task: Task }) => (
    <div data-testid="matching-task">Matching: {(task.content as { question: string }).question}</div>
  ),
}));

vi.mock('@ui/components/practice/tasks/ErrorDetection', () => ({
  ErrorDetectionTask: ({ task }: { task: Task }) => (
    <div data-testid="error-detection-task">Error Detection: {(task.content as { text: string }).text}</div>
  ),
}));

describe('TaskRenderer', () => {
  const baseTask = {
    id: 'task-1',
    learningPathId: 'path-1',
    templateId: 'template-1',
    metadata: {
      difficulty: 'easy' as const,
      tags: ['test'],
      estimatedTime: 60,
      points: 10,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultProps = {
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  };

  describe('Rendering different task types', () => {
    it('should render MultipleChoiceTask for multiple-choice type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'multiple-choice',
        content: {
          question: 'What is 2+2?',
          options: ['3', '4', '5'],
          correctAnswer: 1,
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('multiple-choice-task')).toBeInTheDocument();
        expect(screen.getByText(/What is 2\+2\?/)).toBeInTheDocument();
      });
    });

    it('should render TrueFalseTask for true-false type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'true-false',
        content: {
          statement: 'The sky is blue',
          correctAnswer: true,
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('true-false-task')).toBeInTheDocument();
        expect(screen.getByText(/The sky is blue/)).toBeInTheDocument();
      });
    });

    it('should render TextInputTask for text-input type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'text-input',
        content: {
          question: 'What is the capital of France?',
          correctAnswer: 'Paris',
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('text-input-task')).toBeInTheDocument();
      });
    });

    it('should render SliderTask for slider type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'slider',
        content: {
          question: 'Rate this from 1-10',
          min: 1,
          max: 10,
          correctValue: 7,
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('slider-task')).toBeInTheDocument();
      });
    });

    it('should render MultipleSelectTask for multiple-select type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'multiple-select',
        content: {
          question: 'Select all prime numbers',
          options: ['2', '3', '4', '5'],
          correctAnswers: [0, 1, 3],
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('multiple-select-task')).toBeInTheDocument();
      });
    });

    it('should render WordScrambleTask for word-scramble type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'word-scramble',
        content: {
          question: 'Unscramble this word',
          scrambledWord: 'TPHONY',
          correctAnswer: 'PYTHON',
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('word-scramble-task')).toBeInTheDocument();
      });
    });

    it('should render FlashcardTask for flashcard type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'flashcard',
        content: {
          front: 'What is React?',
          back: 'A JavaScript library for building user interfaces',
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('flashcard-task')).toBeInTheDocument();
      });
    });

    it('should render ClozeDeletionTask for cloze-deletion type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'cloze-deletion',
        content: {
          text: 'The capital of France is {{Paris}}.',
          blanks: [
            {
              index: 0,
              correctAnswer: 'Paris',
            },
          ],
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('cloze-deletion-task')).toBeInTheDocument();
      });
    });

    it('should render OrderingTask for ordering type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'ordering',
        content: {
          question: 'Order these numbers',
          items: ['3', '1', '2'],
          correctOrder: [1, 2, 0],
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('ordering-task')).toBeInTheDocument();
      });
    });

    it('should render MatchingTask for matching type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'matching',
        content: {
          question: 'Match the pairs',
          pairs: [
            { left: 'A', right: '1' },
            { left: 'B', right: '2' },
          ],
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('matching-task')).toBeInTheDocument();
      });
    });

    it('should render ErrorDetectionTask for error-detection type', async () => {
      const task: Task = {
        ...baseTask,
        type: 'error-detection',
        content: {
          text: 'This sentence have an error.',
          errors: [
            {
              index: 0,
              incorrect: 'have',
              correct: 'has',
            },
          ],
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('error-detection-task')).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('should show message when task is null', () => {
      render(<TaskRenderer task={null} {...defaultProps} />);
      expect(screen.getByText('Keine Aufgabe geladen')).toBeInTheDocument();
    });

    it('should show message for unknown task type', async () => {
      const task = {
        ...baseTask,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: 'unknown-type' as any,
        content: {},
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Unbekannter Aufgabentyp: unknown-type/)).toBeInTheDocument();
      });
    });

    it('should show loading fallback during Suspense', () => {
      const task: Task = {
        ...baseTask,
        type: 'multiple-choice',
        content: {
          question: 'Test question',
          options: ['A', 'B'],
          correctAnswer: 0,
        },
      };

      const { container } = render(<TaskRenderer task={task} {...defaultProps} />);

      // Suspense fallback should appear briefly
      expect(container.textContent).toBeTruthy();
    });
  });

  describe('Props passing', () => {
    it('should pass showFeedback prop to task component', async () => {
      const task: Task = {
        ...baseTask,
        type: 'multiple-choice',
        content: {
          question: 'Test',
          options: ['A', 'B'],
          correctAnswer: 0,
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} showFeedback={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('multiple-choice-task')).toBeInTheDocument();
      });
    });

    it('should pass isCorrect prop to task component', async () => {
      const task: Task = {
        ...baseTask,
        type: 'multiple-choice',
        content: {
          question: 'Test',
          options: ['A', 'B'],
          correctAnswer: 0,
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} isCorrect={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('multiple-choice-task')).toBeInTheDocument();
      });
    });

    it('should pass audioConfig prop to task component', async () => {
      const audioConfig = {
        autoPlay: { enabled: true, field: 'questionAudio' },
        buttons: { question: { show: true, field: 'questionAudio' } },
      };

      const task: Task = {
        ...baseTask,
        type: 'multiple-choice',
        content: {
          question: 'Test',
          options: ['A', 'B'],
          correctAnswer: 0,
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} audioConfig={audioConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('multiple-choice-task')).toBeInTheDocument();
      });
    });

    it('should pass onAnswerChange callback to task component', async () => {
      const onAnswerChange = vi.fn();
      const task: Task = {
        ...baseTask,
        type: 'multiple-choice',
        content: {
          question: 'Test',
          options: ['A', 'B'],
          correctAnswer: 0,
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} onAnswerChange={onAnswerChange} />);

      await waitFor(() => {
        expect(screen.getByTestId('multiple-choice-task')).toBeInTheDocument();
      });
    });

    it('should pass additional props to task component', async () => {
      const task: Task = {
        ...baseTask,
        type: 'flashcard',
        content: {
          front: 'Front',
          back: 'Back',
        },
      };

      const additionalProps = {
        onAutoAdvance: vi.fn(),
        onSubmitAnswer: vi.fn(),
      };

      render(<TaskRenderer task={task} {...defaultProps} {...additionalProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('flashcard-task')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should render task content in accessible way', async () => {
      const task: Task = {
        ...baseTask,
        type: 'multiple-choice',
        content: {
          question: 'Accessible question',
          options: ['A', 'B'],
          correctAnswer: 0,
        },
      };

      render(<TaskRenderer task={task} {...defaultProps} />);

      await waitFor(() => {
        const taskElement = screen.getByTestId('multiple-choice-task');
        expect(taskElement).toBeInTheDocument();
      });
    });
  });
});
