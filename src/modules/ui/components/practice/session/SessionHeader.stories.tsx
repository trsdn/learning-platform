import type { Meta, StoryObj } from '@storybook/react';
import { SessionHeader } from './SessionHeader';
import type { Task } from '@core/types/services';

const meta = {
  title: 'Session/SessionHeader',
  component: SessionHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    currentTaskIndex: { control: { type: 'number', min: 0 } },
    totalTasks: { control: { type: 'number', min: 1 } },
    progress: { control: { type: 'range', min: 0, max: 100 } },
  },
} satisfies Meta<typeof SessionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Mock task data
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

// Default (beginning of session)
export const Default: Story = {
  args: {
    currentTaskIndex: 0,
    totalTasks: 10,
    currentTask: mockTask,
    progress: 0,
    onCancel: () => console.log('Session cancelled'),
  },
};

// Middle of session
export const MidSession: Story = {
  args: {
    currentTaskIndex: 4,
    totalTasks: 10,
    currentTask: mockTask,
    progress: 50,
    onCancel: () => console.log('Session cancelled'),
  },
};

// Near completion
export const NearCompletion: Story = {
  args: {
    currentTaskIndex: 8,
    totalTasks: 10,
    currentTask: mockTask,
    progress: 90,
    onCancel: () => console.log('Session cancelled'),
  },
};

// Last task
export const LastTask: Story = {
  args: {
    currentTaskIndex: 9,
    totalTasks: 10,
    currentTask: mockTask,
    progress: 100,
    onCancel: () => console.log('Session cancelled'),
  },
};

// Without current task
export const WithoutCurrentTask: Story = {
  args: {
    currentTaskIndex: 0,
    totalTasks: 10,
    currentTask: null,
    progress: 0,
    onCancel: () => console.log('Session cancelled'),
  },
};

// Short session
export const ShortSession: Story = {
  args: {
    currentTaskIndex: 1,
    totalTasks: 3,
    currentTask: mockTask,
    progress: 33,
    onCancel: () => console.log('Session cancelled'),
  },
};

// Progress variants
export const ProgressVariants: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SessionHeader
        currentTaskIndex={0}
        totalTasks={10}
        currentTask={mockTask}
        progress={10}
        onCancel={() => {}}
      />
      <SessionHeader
        currentTaskIndex={4}
        totalTasks={10}
        currentTask={mockTask}
        progress={50}
        onCancel={() => {}}
      />
      <SessionHeader
        currentTaskIndex={9}
        totalTasks={10}
        currentTask={mockTask}
        progress={100}
        onCancel={() => {}}
      />
    </div>
  ),
};
