import type { Meta, StoryObj } from '@storybook/react';
import { TextInputTask } from './TextInputTask';
import type { Task, TextInputContent } from '@core/types/services';

const meta = {
  title: 'Tasks/TextInput',
  component: TextInputTask,
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
} satisfies Meta<typeof TextInputTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: TextInputContent): Task => ({
  id: 'task-ti-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'text-input',
  content,
  metadata: {
    difficulty: 'medium',
    tags: ['vocabulary', 'german'],
    estimatedTime: 30,
    points: 10,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

const translationTask: TextInputContent = {
  question: 'Translate to German: "the dog"',
  correctAnswer: 'der Hund',
  alternatives: ['Der Hund'],
  caseSensitive: false,
};

const verbTask: TextInputContent = {
  question: 'Complete: Ich ___ ein Buch. (lesen - I)',
  correctAnswer: 'lese',
  hint: 'First person singular of "lesen"',
  caseSensitive: false,
};

const greetingTask: TextInputContent = {
  question: 'How do you say "Good evening" in German?',
  correctAnswer: 'Guten Abend',
  alternatives: ['guten abend', 'Guten abend'],
  caseSensitive: false,
  explanation: 'Used as a greeting in the evening.',
};

// Default state
export const Default: Story = {
  args: {
    task: createMockTask(translationTask),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// Correct answer
export const CorrectAnswer: Story = {
  args: {
    task: createMockTask(translationTask),
    showFeedback: true,
    isCorrect: true,
    audioConfig: null,
  },
};

// Incorrect answer
export const IncorrectAnswer: Story = {
  args: {
    task: createMockTask(translationTask),
    showFeedback: true,
    isCorrect: false,
    audioConfig: null,
  },
};

// Verb conjugation
export const VerbConjugation: Story = {
  args: {
    task: createMockTask(verbTask),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Greeting translation
export const GreetingTranslation: Story = {
  args: {
    task: createMockTask(greetingTask),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};
