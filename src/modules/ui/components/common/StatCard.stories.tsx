import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';

const meta = {
  title: 'Common/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Basic Examples
export const Default: Story = {
  args: {
    title: 'Total Sessions',
    value: 42,
    subtitle: 'this week',
  },
};

export const WithCustomColor: Story = {
  args: {
    title: 'Accuracy',
    value: '95%',
    subtitle: '12/13 correct',
    color: '#10b981',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Streak',
    value: 7,
    subtitle: 'days in a row',
    color: '#f59e0b',
    icon: <span style={{ fontSize: '1.5rem' }}>🔥</span>,
  },
};

// Different Stats
export const CardsReviewed: Story = {
  args: {
    title: 'Cards Reviewed',
    value: 156,
    subtitle: 'today',
    color: '#3b82f6',
    icon: <span style={{ fontSize: '1.5rem' }}>📚</span>,
  },
};

export const TimeSpent: Story = {
  args: {
    title: 'Time Spent',
    value: '2h 15m',
    subtitle: 'this session',
    color: '#8b5cf6',
    icon: <span style={{ fontSize: '1.5rem' }}>⏱</span>,
  },
};

export const Mastered: Story = {
  args: {
    title: 'Mastered',
    value: 24,
    subtitle: 'vocabulary items',
    color: '#10b981',
    icon: <span style={{ fontSize: '1.5rem' }}>✓</span>,
  },
};

export const NeedsReview: Story = {
  args: {
    title: 'Needs Review',
    value: 8,
    subtitle: 'due today',
    color: '#ef4444',
    icon: <span style={{ fontSize: '1.5rem' }}>⚠</span>,
  },
};

// Large Numbers
export const LargeValue: Story = {
  args: {
    title: 'Total Points',
    value: '12,450',
    subtitle: 'all time',
    color: '#f59e0b',
    icon: <span style={{ fontSize: '1.5rem' }}>⭐</span>,
  },
};

// Dashboard Grid Example
export const DashboardGrid: RenderStory = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: '500px' }}>
      <StatCard
        title="Sessions"
        value={42}
        subtitle="this week"
        color="#3b82f6"
        icon={<span>📊</span>}
      />
      <StatCard
        title="Accuracy"
        value="95%"
        subtitle="average"
        color="#10b981"
        icon={<span>🎯</span>}
      />
      <StatCard
        title="Streak"
        value={7}
        subtitle="days"
        color="#f59e0b"
        icon={<span>🔥</span>}
      />
      <StatCard
        title="Mastered"
        value={156}
        subtitle="cards"
        color="#8b5cf6"
        icon={<span>✓</span>}
      />
    </div>
  ),
};
