import type { Meta, StoryObj } from '@storybook/react';
import { SessionStats } from './SessionStats';
import type { PracticeSession } from '@core/types/services';

const meta = {
  title: 'Session/SessionStats',
  component: SessionStats,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SessionStats>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Mock session factory
const createMockSession = (
  completedCount: number,
  correctCount: number
): PracticeSession => ({
  id: 'session-1',
  configuration: {
    topicId: 'topic-1',
    learningPathIds: ['lp-1'],
    targetCount: 10,
    includeReview: true,
  },
  execution: {
    taskIds: Array(10).fill('task-1'),
    completedCount,
    correctCount,
    status: 'active',
    startedAt: new Date(),
    totalTimeSpent: 0,
  },
  results: {
    accuracy: completedCount > 0 ? (correctCount / completedCount) * 100 : 0,
    averageTime: 0,
    difficultyDistribution: {},
    improvementAreas: [],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Default (beginning)
export const Default: Story = {
  args: {
    session: createMockSession(0, 0),
  },
};

// Some progress
export const SomeProgress: Story = {
  args: {
    session: createMockSession(5, 4),
  },
};

// Perfect score
export const PerfectScore: Story = {
  args: {
    session: createMockSession(10, 10),
  },
};

// Half correct
export const HalfCorrect: Story = {
  args: {
    session: createMockSession(8, 4),
  },
};

// Low accuracy
export const LowAccuracy: Story = {
  args: {
    session: createMockSession(10, 2),
  },
};

// Single answer
export const SingleAnswer: Story = {
  args: {
    session: createMockSession(1, 1),
  },
};

// All variants
export const AllVariants: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Session Start
        </p>
        <SessionStats session={createMockSession(0, 0)} />
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          50% Accuracy
        </p>
        <SessionStats session={createMockSession(10, 5)} />
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          High Accuracy
        </p>
        <SessionStats session={createMockSession(10, 9)} />
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Perfect Score
        </p>
        <SessionStats session={createMockSession(10, 10)} />
      </div>
    </div>
  ),
};
