import type { Meta, StoryObj } from '@storybook/react';
import { ClozeDeletionTask } from './ClozeDeletionTask';
import type { Task, ClozeDeletionContent } from '@core/types/services';

const meta = {
  title: 'Tasks/ClozeDeletion',
  component: ClozeDeletionTask,
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
      <div style={{ width: '450px', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClozeDeletionTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: ClozeDeletionContent): Task => ({
  id: 'task-cd-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'cloze-deletion',
  content,
  metadata: {
    difficulty: 'medium',
    tags: ['grammar', 'german'],
    estimatedTime: 30,
    points: 10,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

const singleBlank: ClozeDeletionContent = {
  text: 'Ich {{lese}} ein Buch.',
  textLanguage: 'de',
  blanks: [
    {
      index: 0,
      correctAnswer: 'lese',
      alternatives: ['Lese'],
    },
  ],
  explanation: '"lese" is the first person singular of "lesen" (to read).',
};

const multipleBlank: ClozeDeletionContent = {
  text: 'Der {{Hund}} ist {{groß}} und {{braun}}.',
  textLanguage: 'de',
  blanks: [
    { index: 0, correctAnswer: 'Hund' },
    { index: 1, correctAnswer: 'groß' },
    { index: 2, correctAnswer: 'braun' },
  ],
  hint: 'Fill in: dog, big, brown',
};

const articleBlank: ClozeDeletionContent = {
  text: '{{Der}} Mann kauft {{ein}} Buch.',
  textLanguage: 'de',
  blanks: [
    { index: 0, correctAnswer: 'Der', alternatives: ['der'] },
    { index: 1, correctAnswer: 'ein', alternatives: ['Ein'] },
  ],
  explanation: '"Mann" is masculine (der), "Buch" is neuter (ein Buch in accusative).',
};

// Default state
export const Default: Story = {
  args: {
    task: createMockTask(singleBlank),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// Correct answer
export const CorrectAnswer: Story = {
  args: {
    task: createMockTask(singleBlank),
    showFeedback: true,
    isCorrect: true,
    audioConfig: null,
  },
};

// Incorrect answer
export const IncorrectAnswer: Story = {
  args: {
    task: createMockTask(singleBlank),
    showFeedback: true,
    isCorrect: false,
    audioConfig: null,
  },
};

// Multiple blanks
export const MultipleBlanks: Story = {
  args: {
    task: createMockTask(multipleBlank),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Article practice
export const ArticlePractice: Story = {
  args: {
    task: createMockTask(articleBlank),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};
