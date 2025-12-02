import type { Meta, StoryObj } from '@storybook/react';
import { WordScrambleTask } from './WordScrambleTask';
import type { Task, WordScrambleContent } from '@core/types/services';

const meta = {
  title: 'Tasks/WordScramble',
  component: WordScrambleTask,
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
} satisfies Meta<typeof WordScrambleTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: WordScrambleContent): Task => ({
  id: 'task-ws-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'word-scramble',
  content,
  metadata: {
    difficulty: 'easy',
    tags: ['vocabulary', 'german'],
    estimatedTime: 20,
    points: 5,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

const basicScramble: WordScrambleContent = {
  question: 'Unscramble this German word for "dog":',
  scrambledWord: 'DNUH',
  correctWord: 'HUND',
};

const butterflyScramble: WordScrambleContent = {
  question: 'Unscramble: This means "butterfly"',
  scrambledWord: 'GIMRETTESCHNL',
  correctWord: 'SCHMETTERLING',
  showLength: true,
  hint: 'A beautiful insect with colorful wings.',
};

const shortWord: WordScrambleContent = {
  question: 'Unscramble: A German greeting',
  scrambledWord: 'LOLAH',
  correctWord: 'HALLO',
};

// Default state
export const Default: Story = {
  args: {
    task: createMockTask(basicScramble),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// Correct answer
export const CorrectAnswer: Story = {
  args: {
    task: createMockTask(basicScramble),
    showFeedback: true,
    isCorrect: true,
    audioConfig: null,
  },
};

// Incorrect answer
export const IncorrectAnswer: Story = {
  args: {
    task: createMockTask(basicScramble),
    showFeedback: true,
    isCorrect: false,
    audioConfig: null,
  },
};

// Long word with hint
export const LongWordWithHint: Story = {
  args: {
    task: createMockTask(butterflyScramble),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Short word
export const ShortWord: Story = {
  args: {
    task: createMockTask(shortWord),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};
