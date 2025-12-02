import type { Meta, StoryObj } from '@storybook/react';
import { MultipleChoiceTask } from './MultipleChoiceTask';
import type { Task, MultipleChoiceContent } from '@core/types/services';

const meta = {
  title: 'Tasks/MultipleChoice',
  component: MultipleChoiceTask,
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
} satisfies Meta<typeof MultipleChoiceTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: MultipleChoiceContent): Task => ({
  id: 'task-mc-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'multiple-choice',
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

const germanArticleTask: MultipleChoiceContent = {
  question: 'What is the correct article for "Hund" (dog)?',
  options: ['der', 'die', 'das', 'den'],
  correctAnswer: 0,
  explanation: '"Hund" is masculine, so it uses "der".',
};

const vocabularyTask: MultipleChoiceContent = {
  question: 'What does "Schmetterling" mean?',
  questionLanguage: 'de',
  options: ['Butterfly', 'Caterpillar', 'Bee', 'Dragonfly'],
  optionsLanguage: 'en',
  correctAnswer: 0,
  hint: 'It\'s a beautiful insect with colorful wings.',
};

// Default state (no answer selected)
export const Default: Story = {
  args: {
    task: createMockTask(germanArticleTask),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// Correct answer feedback
export const CorrectAnswer: Story = {
  args: {
    task: createMockTask(germanArticleTask),
    showFeedback: true,
    isCorrect: true,
    audioConfig: null,
  },
};

// Incorrect answer feedback
export const IncorrectAnswer: Story = {
  args: {
    task: createMockTask(germanArticleTask),
    showFeedback: true,
    isCorrect: false,
    audioConfig: null,
  },
};

// Vocabulary question
export const VocabularyQuestion: Story = {
  args: {
    task: createMockTask(vocabularyTask),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Four options example
export const FourOptions: Story = {
  args: {
    task: createMockTask({
      question: 'Which of these is a German greeting?',
      options: ['Guten Tag', 'Bonjour', 'Ciao', 'Hello'],
      correctAnswer: 0,
    }),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};
