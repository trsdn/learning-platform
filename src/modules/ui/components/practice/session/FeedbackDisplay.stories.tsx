import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackDisplay } from './FeedbackDisplay';
import type { Task } from '@core/types/services';

const meta = {
  title: 'Session/FeedbackDisplay',
  component: FeedbackDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isCorrect: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeedbackDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Mock tasks
const taskWithExplanation: Task = {
  id: 'task-mc-001',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'multiple-choice',
  content: {
    question: 'What is the article for "Hund"?',
    options: ['der', 'die', 'das'],
    correctAnswer: 0,
    explanation: '"Hund" is a masculine noun in German, so it uses the article "der".',
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

const taskWithoutExplanation: Task = {
  ...taskWithExplanation,
  content: {
    question: 'What is the article for "Hund"?',
    options: ['der', 'die', 'das'],
    correctAnswer: 0,
  },
};

const taskWithAudio: Task = {
  ...taskWithExplanation,
  audioUrl: '/audio/german/hund.mp3',
};

// Correct answer
export const Correct: Story = {
  args: {
    isCorrect: true,
    currentTask: taskWithExplanation,
  },
};

// Incorrect answer
export const Incorrect: Story = {
  args: {
    isCorrect: false,
    currentTask: taskWithExplanation,
  },
};

// Correct without explanation
export const CorrectNoExplanation: Story = {
  args: {
    isCorrect: true,
    currentTask: taskWithoutExplanation,
  },
};

// Incorrect without explanation
export const IncorrectNoExplanation: Story = {
  args: {
    isCorrect: false,
    currentTask: taskWithoutExplanation,
  },
};

// With audio button
export const WithAudio: Story = {
  args: {
    isCorrect: true,
    currentTask: taskWithAudio,
  },
};

// Side by side comparison
export const SideBySide: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <FeedbackDisplay isCorrect={true} currentTask={taskWithExplanation} />
      <FeedbackDisplay isCorrect={false} currentTask={taskWithExplanation} />
    </div>
  ),
};
