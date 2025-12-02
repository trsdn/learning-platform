import type { Meta, StoryObj } from '@storybook/react';
import { SessionResults } from './session-results';
import type { PracticeSession } from '@core/types/services';

const meta = {
  title: 'Features/SessionResults',
  component: SessionResults,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '500px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionResults>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock session factory
const createMockSession = (
  completedCount: number,
  correctCount: number,
  totalTimeSpent: number = 300
): PracticeSession => ({
  id: 'session-1',
  configuration: {
    topicId: 'german-basics',
    learningPathIds: ['lp-1'],
    targetCount: completedCount,
    includeReview: true,
  },
  execution: {
    taskIds: Array(completedCount).fill('task-1'),
    completedCount,
    correctCount,
    status: 'completed',
    startedAt: new Date(Date.now() - totalTimeSpent * 1000),
    completedAt: new Date(),
    totalTimeSpent,
  },
  results: {
    accuracy: completedCount > 0 ? (correctCount / completedCount) * 100 : 0,
    averageTime: completedCount > 0 ? totalTimeSpent / completedCount : 0,
    difficultyDistribution: {},
    improvementAreas: [],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Perfect score (90%+)
export const PerfectScore: Story = {
  args: {
    session: createMockSession(10, 10, 180),
    onClose: () => console.log('Close'),
    onStartNew: () => console.log('Start new session'),
  },
};

// Very good (75-89%)
export const VeryGood: Story = {
  args: {
    session: createMockSession(10, 8, 240),
    onClose: () => console.log('Close'),
    onStartNew: () => console.log('Start new session'),
  },
};

// Good (60-74%)
export const Good: Story = {
  args: {
    session: createMockSession(10, 7, 300),
    onClose: () => console.log('Close'),
    onStartNew: () => console.log('Start new session'),
  },
};

// Needs improvement (below 60%)
export const NeedsImprovement: Story = {
  args: {
    session: createMockSession(10, 4, 360),
    onClose: () => console.log('Close'),
    onStartNew: () => console.log('Start new session'),
  },
};

// Short session
export const ShortSession: Story = {
  args: {
    session: createMockSession(5, 4, 90),
    onClose: () => console.log('Close'),
    onStartNew: () => console.log('Start new session'),
  },
};

// Long session
export const LongSession: Story = {
  args: {
    session: createMockSession(20, 18, 1200),
    onClose: () => console.log('Close'),
    onStartNew: () => console.log('Start new session'),
  },
};

// All none correct
export const AllIncorrect: Story = {
  args: {
    session: createMockSession(10, 0, 300),
    onClose: () => console.log('Close'),
    onStartNew: () => console.log('Start new session'),
  },
};
