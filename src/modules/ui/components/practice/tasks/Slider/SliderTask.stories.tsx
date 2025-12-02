import type { Meta, StoryObj } from '@storybook/react';
import { SliderTask } from './SliderTask';
import type { Task, SliderContent } from '@core/types/services';

const meta = {
  title: 'Tasks/Slider',
  component: SliderTask,
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
} satisfies Meta<typeof SliderTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: SliderContent): Task => ({
  id: 'task-sl-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'slider',
  content,
  metadata: {
    difficulty: 'medium',
    tags: ['history', 'german'],
    estimatedTime: 20,
    points: 10,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

const yearQuestion: SliderContent = {
  question: 'In which year was the German Empire founded?',
  min: 1800,
  max: 1920,
  step: 1,
  correctValue: 1871,
  tolerance: 2,
  explanation: 'The German Empire was founded on January 18, 1871.',
};

const percentageQuestion: SliderContent = {
  question: 'What percentage of Germans speak at least one foreign language?',
  min: 0,
  max: 100,
  step: 5,
  correctValue: 65,
  tolerance: 10,
  unit: '%',
  hint: 'Most Germans learn English in school.',
};

const temperatureQuestion: SliderContent = {
  question: 'What is the average temperature in Berlin in July?',
  min: 10,
  max: 35,
  step: 1,
  correctValue: 24,
  tolerance: 3,
  unit: '°C',
};

// Default state
export const Default: Story = {
  args: {
    task: createMockTask(yearQuestion),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// Correct answer
export const CorrectAnswer: Story = {
  args: {
    task: createMockTask(yearQuestion),
    showFeedback: true,
    isCorrect: true,
    audioConfig: null,
  },
};

// Incorrect answer
export const IncorrectAnswer: Story = {
  args: {
    task: createMockTask(yearQuestion),
    showFeedback: true,
    isCorrect: false,
    audioConfig: null,
  },
};

// Percentage question
export const PercentageQuestion: Story = {
  args: {
    task: createMockTask(percentageQuestion),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Temperature question
export const TemperatureQuestion: Story = {
  args: {
    task: createMockTask(temperatureQuestion),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};
