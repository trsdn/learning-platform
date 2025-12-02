import type { Meta, StoryObj } from '@storybook/react';
import { MasteryBar } from './MasteryBar';

const meta = {
  title: 'Common/MasteryBar',
  component: MasteryBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    count: { control: { type: 'number', min: 0 } },
    max: { control: { type: 'number', min: 0 } },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MasteryBar>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Basic Examples
export const Default: Story = {
  args: {
    label: 'Progress',
    count: 25,
    max: 100,
    color: '#3b82f6',
  },
};

export const HalfFilled: Story = {
  args: {
    label: 'Completed',
    count: 50,
    max: 100,
    color: '#10b981',
  },
};

export const FullBar: Story = {
  args: {
    label: 'Mastered',
    count: 100,
    max: 100,
    color: '#10b981',
  },
};

export const EmptyBar: Story = {
  args: {
    label: 'New',
    count: 0,
    max: 100,
    color: '#6b7280',
  },
};

// Without Max (Shows Full When Count > 0)
export const WithoutMax: Story = {
  args: {
    label: 'Items',
    count: 15,
    color: '#8b5cf6',
  },
};

// Learning Platform Examples
export const Mastered: Story = {
  args: {
    label: 'Gemeistert',
    count: 24,
    max: 50,
    color: '#10b981',
  },
};

export const Learning: Story = {
  args: {
    label: 'Lernend',
    count: 18,
    max: 50,
    color: '#3b82f6',
  },
};

export const NeedsReview: Story = {
  args: {
    label: 'Wiederholen',
    count: 8,
    max: 50,
    color: '#f59e0b',
  },
};

// Dashboard Mastery Levels
export const DashboardMasteryLevels: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <MasteryBar
        label="Gemeistert"
        count={24}
        max={100}
        color="#10b981"
      />
      <MasteryBar
        label="Gut"
        count={35}
        max={100}
        color="#3b82f6"
      />
      <MasteryBar
        label="Lernend"
        count={28}
        max={100}
        color="#f59e0b"
      />
      <MasteryBar
        label="Neu"
        count={13}
        max={100}
        color="#6b7280"
      />
    </div>
  ),
};

// Color Variations
export const ColorVariations: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <MasteryBar label="Green" count={80} max={100} color="#10b981" />
      <MasteryBar label="Blue" count={60} max={100} color="#3b82f6" />
      <MasteryBar label="Yellow" count={40} max={100} color="#f59e0b" />
      <MasteryBar label="Red" count={20} max={100} color="#ef4444" />
      <MasteryBar label="Purple" count={70} max={100} color="#8b5cf6" />
    </div>
  ),
};

// Progress Animation Demo
export const ProgressStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <MasteryBar label="0%" count={0} max={100} color="#3b82f6" />
      <MasteryBar label="25%" count={25} max={100} color="#3b82f6" />
      <MasteryBar label="50%" count={50} max={100} color="#3b82f6" />
      <MasteryBar label="75%" count={75} max={100} color="#3b82f6" />
      <MasteryBar label="100%" count={100} max={100} color="#3b82f6" />
    </div>
  ),
};
