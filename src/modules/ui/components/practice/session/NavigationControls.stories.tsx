import type { Meta, StoryObj } from '@storybook/react';
import { NavigationControls } from './NavigationControls';
import type { PracticeSession, Task } from '@core/types/services';

const meta = {
  title: 'Session/NavigationControls',
  component: NavigationControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showFeedback: { control: 'boolean' },
    canSubmit: { control: 'boolean' },
  },
} satisfies Meta<typeof NavigationControls>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockTask: Task = {
  id: 'task-mc-001',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'multiple-choice',
  content: {
    question: 'What is the article for "Hund"?',
    options: ['der', 'die', 'das'],
    correctAnswer: 0,
  },
  metadata: {
    difficulty: 'medium',
    tags: ['vocabulary'],
    estimatedTime: 30,
    points: 10,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const flashcardTask: Task = {
  ...mockTask,
  id: 'task-fc-001',
  type: 'flashcard',
  content: {
    front: 'Hund',
    back: 'dog',
    frontLanguage: 'de',
    backLanguage: 'en',
  },
};

const createMockSession = (taskCount: number): PracticeSession => ({
  id: 'session-1',
  configuration: {
    topicId: 'topic-1',
    learningPathIds: ['lp-1'],
    targetCount: taskCount,
    includeReview: true,
  },
  execution: {
    taskIds: Array(taskCount).fill('task-1'),
    completedCount: 0,
    correctCount: 0,
    status: 'active',
    startedAt: new Date(),
    totalTimeSpent: 0,
  },
  results: {
    accuracy: 0,
    averageTime: 0,
    difficultyDistribution: {},
    improvementAreas: [],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Default (cannot submit)
export const Default: Story = {
  args: {
    session: createMockSession(10),
    currentTask: mockTask,
    currentTaskIndex: 0,
    showFeedback: false,
    canSubmit: false,
    onSubmit: () => console.log('Submit'),
    onSkip: () => console.log('Skip'),
    onNext: () => console.log('Next'),
    onComplete: () => console.log('Complete'),
  },
};

// Can submit
export const CanSubmit: Story = {
  args: {
    session: createMockSession(10),
    currentTask: mockTask,
    currentTaskIndex: 0,
    showFeedback: false,
    canSubmit: true,
    onSubmit: () => console.log('Submit'),
    onSkip: () => console.log('Skip'),
    onNext: () => console.log('Next'),
    onComplete: () => console.log('Complete'),
  },
};

// After submit (showing feedback)
export const AfterSubmit: Story = {
  args: {
    session: createMockSession(10),
    currentTask: mockTask,
    currentTaskIndex: 0,
    showFeedback: true,
    canSubmit: false,
    onSubmit: () => console.log('Submit'),
    onSkip: () => console.log('Skip'),
    onNext: () => console.log('Next'),
    onComplete: () => console.log('Complete'),
  },
};

// Last task (before submit)
export const LastTaskBeforeSubmit: Story = {
  args: {
    session: createMockSession(10),
    currentTask: mockTask,
    currentTaskIndex: 9,
    showFeedback: false,
    canSubmit: true,
    onSubmit: () => console.log('Submit'),
    onSkip: () => console.log('Skip'),
    onNext: () => console.log('Next'),
    onComplete: () => console.log('Complete'),
  },
};

// Last task (after submit)
export const LastTaskAfterSubmit: Story = {
  args: {
    session: createMockSession(10),
    currentTask: mockTask,
    currentTaskIndex: 9,
    showFeedback: true,
    canSubmit: false,
    onSubmit: () => console.log('Submit'),
    onSkip: () => console.log('Skip'),
    onNext: () => console.log('Next'),
    onComplete: () => console.log('Complete'),
  },
};

// Flashcard (no submit button)
export const FlashcardTask: Story = {
  args: {
    session: createMockSession(10),
    currentTask: flashcardTask,
    currentTaskIndex: 0,
    showFeedback: false,
    canSubmit: false,
    onSubmit: () => console.log('Submit'),
    onSkip: () => console.log('Skip'),
    onNext: () => console.log('Next'),
    onComplete: () => console.log('Complete'),
  },
};
