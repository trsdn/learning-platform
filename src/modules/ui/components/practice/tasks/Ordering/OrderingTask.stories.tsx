import type { Meta, StoryObj } from '@storybook/react';
import { OrderingTask } from './OrderingTask';
import type { Task, OrderingContent } from '@core/types/services';

const meta = {
  title: 'Tasks/Ordering',
  component: OrderingTask,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showFeedback: { control: 'boolean' },
    isCorrect: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OrderingTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: OrderingContent): Task => ({
  id: 'task-o-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'ordering',
  content,
  metadata: {
    difficulty: 'medium',
    tags: ['grammar', 'german'],
    estimatedTime: 45,
    points: 15,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

const sentenceOrdering: OrderingContent = {
  question: 'Put the words in correct order to form a German sentence:',
  items: ['gehe', 'Ich', 'Schule', 'zur'],
  itemsLanguage: 'de',
  correctOrder: [1, 0, 3, 2], // "Ich gehe zur Schule"
  explanation: 'In German main clauses, the verb comes in second position.',
};

const numberOrdering: OrderingContent = {
  question: 'Arrange the German numbers from smallest to largest:',
  items: ['drei', 'eins', 'fünf', 'zwei', 'vier'],
  correctOrder: [1, 3, 0, 4, 2], // eins, zwei, drei, vier, fünf
};

const daysOrdering: OrderingContent = {
  question: 'Put the days of the week in order (starting Monday):',
  items: ['Mittwoch', 'Montag', 'Freitag', 'Donnerstag', 'Dienstag'],
  itemsLanguage: 'de',
  correctOrder: [1, 4, 0, 3, 2], // Montag, Dienstag, Mittwoch, Donnerstag, Freitag
};

// Default state
export const Default: Story = {
  args: {
    task: createMockTask(sentenceOrdering),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// Correct order
export const CorrectOrder: Story = {
  args: {
    task: createMockTask(sentenceOrdering),
    showFeedback: true,
    isCorrect: true,
    audioConfig: null,
  },
};

// Incorrect order
export const IncorrectOrder: Story = {
  args: {
    task: createMockTask(sentenceOrdering),
    showFeedback: true,
    isCorrect: false,
    audioConfig: null,
  },
};

// Number ordering
export const NumberOrdering: Story = {
  args: {
    task: createMockTask(numberOrdering),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Days of week
export const DaysOfWeek: Story = {
  args: {
    task: createMockTask(daysOrdering),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};
