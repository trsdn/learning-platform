import type { Meta, StoryObj } from '@storybook/react';
import { SessionProgressBar } from './SessionProgressBar';
import type { TaskResult } from './SessionProgressBar';

const meta = {
  title: 'Practice/SessionProgressBar',
  component: SessionProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentIndex: { control: { type: 'number', min: 0 } },
    totalTasks: { control: { type: 'number', min: 1 } },
    showTaskMarkers: { control: 'boolean' },
    animate: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Basic Examples
export const Default: Story = {
  args: {
    currentIndex: 3,
    totalTasks: 10,
  },
};

export const WithTaskMarkers: Story = {
  args: {
    currentIndex: 3,
    totalTasks: 10,
    showTaskMarkers: true,
  },
};

export const WithResults: Story = {
  args: {
    currentIndex: 4,
    totalTasks: 10,
    showTaskMarkers: true,
    taskResults: ['correct', 'correct', 'incorrect', 'correct', 'pending'],
  },
};

// Progress States
export const JustStarted: Story = {
  args: {
    currentIndex: 0,
    totalTasks: 10,
    showTaskMarkers: true,
    taskResults: ['pending'],
  },
};

export const MidSession: Story = {
  args: {
    currentIndex: 5,
    totalTasks: 10,
    showTaskMarkers: true,
    taskResults: ['correct', 'correct', 'incorrect', 'correct', 'skipped', 'pending'],
  },
};

export const AlmostDone: Story = {
  args: {
    currentIndex: 8,
    totalTasks: 10,
    showTaskMarkers: true,
    taskResults: [
      'correct',
      'correct',
      'incorrect',
      'correct',
      'correct',
      'incorrect',
      'correct',
      'correct',
      'pending',
    ],
  },
};

export const LastTask: Story = {
  args: {
    currentIndex: 9,
    totalTasks: 10,
    showTaskMarkers: true,
    taskResults: [
      'correct',
      'correct',
      'incorrect',
      'correct',
      'correct',
      'incorrect',
      'correct',
      'correct',
      'correct',
      'pending',
    ],
  },
};

// Different Task Counts
export const FiveTasks: Story = {
  args: {
    currentIndex: 2,
    totalTasks: 5,
    showTaskMarkers: true,
    taskResults: ['correct', 'correct', 'pending'],
  },
};

export const FifteenTasks: Story = {
  args: {
    currentIndex: 7,
    totalTasks: 15,
    showTaskMarkers: true,
    taskResults: [
      'correct',
      'correct',
      'incorrect',
      'correct',
      'skipped',
      'correct',
      'correct',
      'pending',
    ],
  },
};

export const TwentyTasks: Story = {
  args: {
    currentIndex: 10,
    totalTasks: 20,
    showTaskMarkers: true,
    taskResults: [
      'correct',
      'correct',
      'incorrect',
      'correct',
      'correct',
      'skipped',
      'correct',
      'incorrect',
      'correct',
      'correct',
      'pending',
    ],
  },
};

export const TooManyTasksForMarkers: Story = {
  args: {
    currentIndex: 15,
    totalTasks: 25,
    showTaskMarkers: true,
  },
};

// Result Variations
export const AllCorrect: Story = {
  args: {
    currentIndex: 4,
    totalTasks: 8,
    showTaskMarkers: true,
    taskResults: ['correct', 'correct', 'correct', 'correct', 'pending'],
  },
};

export const MixedResults: Story = {
  args: {
    currentIndex: 5,
    totalTasks: 8,
    showTaskMarkers: true,
    taskResults: ['correct', 'incorrect', 'correct', 'skipped', 'correct', 'pending'],
  },
};

export const WithManyIncorrect: Story = {
  args: {
    currentIndex: 5,
    totalTasks: 8,
    showTaskMarkers: true,
    taskResults: ['incorrect', 'incorrect', 'correct', 'incorrect', 'correct', 'pending'],
  },
};

export const WithSkipped: Story = {
  args: {
    currentIndex: 4,
    totalTasks: 8,
    showTaskMarkers: true,
    taskResults: ['skipped', 'correct', 'skipped', 'correct', 'pending'],
  },
};

// Without Markers
export const WithoutMarkers: Story = {
  args: {
    currentIndex: 5,
    totalTasks: 10,
    showTaskMarkers: false,
  },
};

export const WithoutMarkersLongSession: Story = {
  args: {
    currentIndex: 45,
    totalTasks: 100,
    showTaskMarkers: false,
  },
};

// Animation
export const NoAnimation: Story = {
  args: {
    currentIndex: 3,
    totalTasks: 10,
    showTaskMarkers: true,
    animate: false,
    taskResults: ['correct', 'correct', 'incorrect', 'pending'],
  },
};

// Showcase - Progress Through Session
export const ProgressThroughSession: RenderStory = {
  render: () => {
    const results: TaskResult[] = ['correct', 'correct', 'incorrect', 'correct', 'skipped'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '600px' }}>
        <div>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Task 1 of 10</h4>
          <SessionProgressBar
            currentIndex={0}
            totalTasks={10}
            showTaskMarkers
            taskResults={['pending']}
          />
        </div>

        <div>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Task 3 of 10</h4>
          <SessionProgressBar
            currentIndex={2}
            totalTasks={10}
            showTaskMarkers
            taskResults={['correct', 'correct', 'pending']}
          />
        </div>

        <div>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Task 6 of 10</h4>
          <SessionProgressBar
            currentIndex={5}
            totalTasks={10}
            showTaskMarkers
            taskResults={[...results, 'pending']}
          />
        </div>

        <div>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Task 10 of 10</h4>
          <SessionProgressBar
            currentIndex={9}
            totalTasks={10}
            showTaskMarkers
            taskResults={[
              'correct',
              'correct',
              'incorrect',
              'correct',
              'skipped',
              'correct',
              'correct',
              'incorrect',
              'correct',
              'pending',
            ]}
          />
        </div>
      </div>
    );
  },
};

// Showcase - Different Result Patterns
export const ResultPatterns: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '600px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Perfect Score</h4>
        <SessionProgressBar
          currentIndex={4}
          totalTasks={8}
          showTaskMarkers
          taskResults={['correct', 'correct', 'correct', 'correct', 'pending']}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Mixed Performance</h4>
        <SessionProgressBar
          currentIndex={4}
          totalTasks={8}
          showTaskMarkers
          taskResults={['correct', 'incorrect', 'correct', 'incorrect', 'pending']}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>With Skipped Tasks</h4>
        <SessionProgressBar
          currentIndex={4}
          totalTasks={8}
          showTaskMarkers
          taskResults={['correct', 'skipped', 'skipped', 'correct', 'pending']}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Challenging Session</h4>
        <SessionProgressBar
          currentIndex={4}
          totalTasks={8}
          showTaskMarkers
          taskResults={['incorrect', 'incorrect', 'correct', 'incorrect', 'pending']}
        />
      </div>
    </div>
  ),
};

// Showcase - Different Session Lengths
export const SessionLengths: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '600px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Short Session (5 tasks)</h4>
        <SessionProgressBar
          currentIndex={2}
          totalTasks={5}
          showTaskMarkers
          taskResults={['correct', 'correct', 'pending']}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Standard Session (10 tasks)</h4>
        <SessionProgressBar
          currentIndex={5}
          totalTasks={10}
          showTaskMarkers
          taskResults={['correct', 'incorrect', 'correct', 'correct', 'skipped', 'pending']}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Long Session (15 tasks)</h4>
        <SessionProgressBar
          currentIndex={7}
          totalTasks={15}
          showTaskMarkers
          taskResults={[
            'correct',
            'correct',
            'incorrect',
            'correct',
            'correct',
            'skipped',
            'correct',
            'pending',
          ]}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>
          Very Long Session (25 tasks - no markers)
        </h4>
        <SessionProgressBar currentIndex={12} totalTasks={25} showTaskMarkers />
      </div>
    </div>
  ),
};

// Showcase - Real-World Examples
export const RealWorldExamples: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '600px' }}>
      <div style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '0.25rem' }}>German Vocabulary Practice</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Task 4 of 10
          </p>
        </div>
        <SessionProgressBar
          currentIndex={3}
          totalTasks={10}
          showTaskMarkers
          taskResults={['correct', 'correct', 'incorrect', 'pending']}
        />
      </div>

      <div style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '0.25rem' }}>Math Problem Set</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Task 8 of 15
          </p>
        </div>
        <SessionProgressBar
          currentIndex={7}
          totalTasks={15}
          showTaskMarkers
          taskResults={[
            'correct',
            'correct',
            'incorrect',
            'correct',
            'skipped',
            'correct',
            'correct',
            'pending',
          ]}
        />
      </div>

      <div style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '0.25rem' }}>Quick Review</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Task 3 of 5
          </p>
        </div>
        <SessionProgressBar
          currentIndex={2}
          totalTasks={5}
          showTaskMarkers
          taskResults={['correct', 'correct', 'pending']}
        />
      </div>
    </div>
  ),
};
