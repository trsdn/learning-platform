import type { Meta, StoryObj } from '@storybook/react';
import { TrueFalseTask } from './TrueFalseTask';
import type { Task, TrueFalseContent } from '@core/types/services';

const meta = {
  title: 'Tasks/TrueFalse',
  component: TrueFalseTask,
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
} satisfies Meta<typeof TrueFalseTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: TrueFalseContent): Task => ({
  id: 'task-tf-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'true-false',
  content,
  metadata: {
    difficulty: 'easy',
    tags: ['grammar', 'german'],
    estimatedTime: 15,
    points: 5,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

const trueStatement: TrueFalseContent = {
  statement: '"Hund" is a masculine noun in German.',
  correctAnswer: true,
  explanation: '"der Hund" - masculine nouns use the article "der".',
};

const falseStatement: TrueFalseContent = {
  statement: 'German nouns are never capitalized.',
  correctAnswer: false,
  explanation: 'In German, ALL nouns are capitalized, not just proper nouns.',
};

const grammarStatement: TrueFalseContent = {
  statement: 'The German verb always comes second in main clauses.',
  correctAnswer: true,
  explanation: 'This is the V2 (verb-second) rule in German.',
};

// Default state
export const Default: Story = {
  args: {
    task: createMockTask(trueStatement),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// Correct answer - True
export const CorrectTrue: Story = {
  args: {
    task: createMockTask(trueStatement),
    showFeedback: true,
    isCorrect: true,
    audioConfig: null,
  },
};

// Incorrect answer - should have been False
export const IncorrectTrue: Story = {
  args: {
    task: createMockTask(falseStatement),
    showFeedback: true,
    isCorrect: false,
    audioConfig: null,
  },
};

// Grammar question
export const GrammarQuestion: Story = {
  args: {
    task: createMockTask(grammarStatement),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Longer statement
export const LongStatement: Story = {
  args: {
    task: createMockTask({
      statement: 'In German, the past tense is formed the same way for all verbs, regardless of whether they are regular or irregular.',
      correctAnswer: false,
      explanation: 'German has both regular (weak) and irregular (strong) verbs with different conjugation patterns.',
    }),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};
