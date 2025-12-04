import type { Meta, StoryObj } from '@storybook/react';
import { ErrorDetectionTask } from './ErrorDetectionTask';
import type { Task, ErrorDetectionContent } from '@core/types/services';

const meta = {
  title: 'Tasks/ErrorDetection',
  component: ErrorDetectionTask,
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
      <div style={{ width: '600px', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorDetectionTask>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock task data
const createMockTask = (content: ErrorDetectionContent): Task => ({
  id: 'task-ed-1',
  learningPathId: 'lp-1',
  templateId: 'template-1',
  type: 'error-detection',
  content,
  metadata: {
    difficulty: 'medium',
    tags: ['fact-checking', 'critical-thinking'],
    estimatedTime: 60,
    points: 20,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

const geographyErrors: ErrorDetectionContent = {
  content: 'The capital of Australia is Sydney. It was founded in 1888.',
  errors: [
    { errorText: 'Sydney', correction: 'Canberra', errorType: 'factual' },
    { errorText: '1888', correction: '1913', errorType: 'factual' },
  ],
  showErrorCount: true,
  explanation: 'Canberra is the capital of Australia, and it was founded in 1913.',
  hint: 'Look for geographical and historical errors.',
};

const landmarkErrors: ErrorDetectionContent = {
  content: 'The Statue of Liberty is located in Los Angeles. It was a gift from England.',
  errors: [
    { errorText: 'Los Angeles', correction: 'New York', errorType: 'factual' },
    { errorText: 'England', correction: 'France', errorType: 'factual' },
  ],
  showErrorCount: true,
  hint: 'Check the location and origin of the statue.',
};

const noErrorsContent: ErrorDetectionContent = {
  content: 'Berlin is the capital of Germany. It is located in northeastern Germany.',
  errors: [],
  showErrorCount: false,
  explanation: 'This text contains no errors.',
};

const singleError: ErrorDetectionContent = {
  content: 'The Earth revolves around the Moon once every 365 days.',
  errors: [
    { errorText: 'Moon', correction: 'Sun', errorType: 'factual' },
  ],
  showErrorCount: true,
  explanation: 'The Earth revolves around the Sun, not the Moon.',
};

const multiWordErrors: ErrorDetectionContent = {
  content: 'The Great Wall of China is visible from outer space. It was built by the Roman Empire.',
  errors: [
    { errorText: 'visible from outer space', correction: 'not visible from outer space with the naked eye', errorType: 'factual' },
    { errorText: 'Roman Empire', correction: 'Chinese dynasties', errorType: 'factual' },
  ],
  showErrorCount: true,
  hint: 'Question common misconceptions about this famous landmark.',
};

// Default state
export const Default: Story = {
  args: {
    task: createMockTask(geographyErrors),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
    onAnswerChange: (canSubmit) => console.log('Can submit:', canSubmit),
  },
};

// Correct answer - all errors found
export const AllErrorsFound: Story = {
  args: {
    task: createMockTask(geographyErrors),
    showFeedback: true,
    isCorrect: true,
    audioConfig: null,
  },
};

// Incorrect - some errors missed
export const MissedErrors: Story = {
  args: {
    task: createMockTask(geographyErrors),
    showFeedback: true,
    isCorrect: false,
    audioConfig: null,
  },
};

// Single error
export const SingleError: Story = {
  args: {
    task: createMockTask(singleError),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// No errors in content
export const NoErrors: Story = {
  args: {
    task: createMockTask(noErrorsContent),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Multi-word error phrases
export const MultiWordErrors: Story = {
  args: {
    task: createMockTask(multiWordErrors),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};

// Famous landmarks
export const Landmarks: Story = {
  args: {
    task: createMockTask(landmarkErrors),
    showFeedback: false,
    isCorrect: false,
    audioConfig: null,
  },
};
