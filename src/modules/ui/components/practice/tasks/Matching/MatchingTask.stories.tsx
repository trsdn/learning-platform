import type { Meta, StoryObj } from '@storybook/react';
import { MatchingTask } from './MatchingTask';
import type { Task, MatchingContent } from '@core/types/services';

const meta = {
  title: 'Tasks/Matching',
  component: MatchingTask,
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
      <div style={{ width: '500px', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MatchingTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: MatchingContent): Task => ({
  id: 'task-m-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'matching',
  content,
  metadata: {
    difficulty: 'medium',
    tags: ['vocabulary', 'german'],
    estimatedTime: 45,
    points: 15,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

const animalsMatching: MatchingContent = {
  question: 'Match the German animals with their English translations:',
  pairs: [
    { left: 'der Hund', leftLanguage: 'de', right: 'the dog', rightLanguage: 'en' },
    { left: 'die Katze', leftLanguage: 'de', right: 'the cat', rightLanguage: 'en' },
    { left: 'der Vogel', leftLanguage: 'de', right: 'the bird', rightLanguage: 'en' },
    { left: 'der Fisch', leftLanguage: 'de', right: 'the fish', rightLanguage: 'en' },
  ],
};

const greetingsMatching: MatchingContent = {
  question: 'Match the German greetings with their meanings:',
  pairs: [
    { left: 'Guten Morgen', leftLanguage: 'de', right: 'Good morning', rightLanguage: 'en' },
    { left: 'Guten Tag', leftLanguage: 'de', right: 'Good day', rightLanguage: 'en' },
    { left: 'Guten Abend', leftLanguage: 'de', right: 'Good evening', rightLanguage: 'en' },
  ],
};

const colorsMatching: MatchingContent = {
  question: 'Match the colors:',
  pairs: [
    { left: 'rot', leftLanguage: 'de', right: 'red', rightLanguage: 'en' },
    { left: 'blau', leftLanguage: 'de', right: 'blue', rightLanguage: 'en' },
    { left: 'grün', leftLanguage: 'de', right: 'green', rightLanguage: 'en' },
    { left: 'gelb', leftLanguage: 'de', right: 'yellow', rightLanguage: 'en' },
    { left: 'schwarz', leftLanguage: 'de', right: 'black', rightLanguage: 'en' },
  ],
};

// Default state
export const Default: Story = {
  args: {
    task: createMockTask(animalsMatching),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// Correct matches
export const CorrectMatches: Story = {
  args: {
    task: createMockTask(animalsMatching),
    showFeedback: true,
    isCorrect: true,
    audioConfig: null,
  },
};

// Incorrect matches
export const IncorrectMatches: Story = {
  args: {
    task: createMockTask(animalsMatching),
    showFeedback: true,
    isCorrect: false,
    audioConfig: null,
  },
};

// Three pairs
export const ThreePairs: Story = {
  args: {
    task: createMockTask(greetingsMatching),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Five pairs
export const FivePairs: Story = {
  args: {
    task: createMockTask(colorsMatching),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};
