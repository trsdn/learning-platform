import type { Meta, StoryObj } from '@storybook/react';
import { TopicCard, type TopicCardTopic } from './TopicCard';

const meta = {
  title: 'Features/TopicCard',
  component: TopicCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TopicCard>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Mock topics
const germanTopic: TopicCardTopic = {
  id: 'german-basics',
  name: 'German Basics',
  description: 'Learn fundamental German vocabulary and grammar',
  icon: '🇩🇪',
};

const mathTopic: TopicCardTopic = {
  id: 'math-algebra',
  name: 'Algebra',
  description: 'Master algebraic equations and expressions',
  icon: '📐',
};

const historyTopic: TopicCardTopic = {
  id: 'world-history',
  name: 'World History',
  description: 'Explore major events that shaped our world',
  icon: '🌍',
};

const scienceTopic: TopicCardTopic = {
  id: 'biology',
  name: 'Biology',
  description: 'Discover the science of living organisms',
  icon: '🧬',
};

const noIconTopic: TopicCardTopic = {
  id: 'no-icon',
  name: 'Plain Topic',
  description: 'A topic without an icon',
};

// Default
export const Default: Story = {
  args: {
    topic: germanTopic,
    onSelect: (topicId) => console.log('Selected topic:', topicId),
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    topic: germanTopic,
    onSelect: (topicId) => console.log('Selected topic:', topicId),
    disabled: true,
  },
};

// Without icon
export const WithoutIcon: Story = {
  args: {
    topic: noIconTopic,
    onSelect: (topicId) => console.log('Selected topic:', topicId),
  },
};

// Grid of topics
export const TopicGrid: RenderStory = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      width: '620px'
    }}>
      <TopicCard topic={germanTopic} onSelect={(id) => console.log('Selected:', id)} />
      <TopicCard topic={mathTopic} onSelect={(id) => console.log('Selected:', id)} />
      <TopicCard topic={historyTopic} onSelect={(id) => console.log('Selected:', id)} />
      <TopicCard topic={scienceTopic} onSelect={(id) => console.log('Selected:', id)} />
    </div>
  ),
};

// Mixed states
export const MixedStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <TopicCard
        topic={germanTopic}
        onSelect={(id) => console.log('Selected:', id)}
      />
      <TopicCard
        topic={mathTopic}
        onSelect={(id) => console.log('Selected:', id)}
        disabled={true}
      />
    </div>
  ),
};
