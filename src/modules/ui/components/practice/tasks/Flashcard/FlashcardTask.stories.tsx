import type { Meta, StoryObj } from '@storybook/react';
import { FlashcardTask } from './FlashcardTask';
import type { Task, FlashcardContent } from '@core/types/services';

const meta = {
  title: 'Tasks/Flashcard',
  component: FlashcardTask,
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
} satisfies Meta<typeof FlashcardTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: FlashcardContent): Task => ({
  id: 'task-fc-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'flashcard',
  content,
  metadata: {
    difficulty: 'easy',
    tags: ['vocabulary', 'german'],
    estimatedTime: 15,
    points: 5,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

const basicFlashcard: FlashcardContent = {
  front: 'Hund',
  back: 'dog',
  frontLanguage: 'de',
  backLanguage: 'en',
};

const greetingFlashcard: FlashcardContent = {
  front: 'Guten Morgen',
  back: 'Good morning',
  frontLanguage: 'de',
  backLanguage: 'en',
  explanation: 'A common greeting used in the morning.',
};

const phraseFlashcard: FlashcardContent = {
  front: 'Ich verstehe nicht',
  back: 'I don\'t understand',
  frontLanguage: 'de',
  backLanguage: 'en',
  hint: 'A useful phrase when learning a new language.',
};

// Default (front side only)
export const Default: Story = {
  args: {
    task: createMockTask(basicFlashcard),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// With greeting
export const Greeting: Story = {
  args: {
    task: createMockTask(greetingFlashcard),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// With phrase
export const Phrase: Story = {
  args: {
    task: createMockTask(phraseFlashcard),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// With audio configuration
export const WithAudioConfig: Story = {
  args: {
    task: createMockTask({
      ...basicFlashcard,
      frontAudio: 'german/hund.mp3',
      backAudio: 'english/dog.mp3',
    }),
    showFeedback: false,
    isCorrect: false,
    audioConfig: {
      buttons: {
        front: { show: true, field: 'frontAudio' },
        back: { show: true, field: 'backAudio' },
      },
    },
  },
};
