import type { Meta, StoryObj } from '@storybook/react';
import { MultipleSelectTask } from './MultipleSelectTask';
import type { Task, MultipleSelectContent } from '@core/types/services';

const meta = {
  title: 'Tasks/MultipleSelect',
  component: MultipleSelectTask,
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
} satisfies Meta<typeof MultipleSelectTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: MultipleSelectContent): Task => ({
  id: 'task-ms-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'multiple-select',
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

const animalsQuestion: MultipleSelectContent = {
  question: 'Select ALL German words for animals:',
  options: ['der Hund', 'das Auto', 'die Katze', 'das Buch', 'der Vogel'],
  correctAnswers: [0, 2, 4], // Hund, Katze, Vogel
  minRequired: 2,
  explanation: 'Hund (dog), Katze (cat), and Vogel (bird) are animals.',
};

const masculineNouns: MultipleSelectContent = {
  question: 'Select ALL masculine nouns (use "der"):',
  options: ['Hund', 'Katze', 'Buch', 'Mann', 'Frau', 'Tisch'],
  optionsLanguage: 'de',
  correctAnswers: [0, 3, 5], // Hund, Mann, Tisch
  hint: 'Remember: masculine nouns use the article "der".',
};

const verbsQuestion: MultipleSelectContent = {
  question: 'Select ALL German verbs:',
  options: ['laufen', 'Haus', 'essen', 'trinken', 'schnell'],
  correctAnswers: [0, 2, 3], // laufen, essen, trinken
};

// Default state
export const Default: Story = {
  args: {
    task: createMockTask(animalsQuestion),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// Correct selections
export const CorrectSelections: Story = {
  args: {
    task: createMockTask(animalsQuestion),
    showFeedback: true,
    isCorrect: true,
    audioConfig: null,
  },
};

// Incorrect selections
export const IncorrectSelections: Story = {
  args: {
    task: createMockTask(animalsQuestion),
    showFeedback: true,
    isCorrect: false,
    audioConfig: null,
  },
};

// Grammar question
export const GrammarQuestion: Story = {
  args: {
    task: createMockTask(masculineNouns),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Verbs question
export const VerbsQuestion: Story = {
  args: {
    task: createMockTask(verbsQuestion),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};
