import type { Meta, StoryObj } from '@storybook/react';
import { LearningPathCard } from './LearningPathCard';
import type { LearningPath } from '@core/types/services';

const meta = {
  title: 'Components/LearningPathCard',
  component: LearningPathCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    animate: { control: 'boolean' },
    animationIndex: { control: { type: 'number', min: 0 } },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LearningPathCard>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Sample Learning Paths
const easyPath: LearningPath = {
  id: 'german-basics',
  topicId: 'german',
  title: 'German Basics',
  description: 'Start your German learning journey with fundamental vocabulary and phrases.',
  difficulty: 'easy',
  taskIds: [],
  estimatedTime: 30,
  isActive: true,
  requirements: {
    minimumAccuracy: 70,
    requiredTasks: 10,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mediumPath: LearningPath = {
  id: 'german-intermediate',
  topicId: 'german',
  title: 'Intermediate German',
  description: 'Build on your foundation with more complex grammar and conversation skills.',
  difficulty: 'medium',
  taskIds: [],
  estimatedTime: 45,
  isActive: true,
  requirements: {
    minimumAccuracy: 75,
    requiredTasks: 15,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const hardPath: LearningPath = {
  id: 'german-advanced',
  topicId: 'german',
  title: 'Advanced German',
  description: 'Master advanced grammar, idioms, and professional communication.',
  difficulty: 'hard',
  taskIds: [],
  estimatedTime: 60,
  isActive: true,
  requirements: {
    minimumAccuracy: 80,
    requiredTasks: 20,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Basic Examples
export const Default: Story = {
  args: {
    learningPath: easyPath,
    taskCount: 15,
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const WithoutProgress: Story = {
  args: {
    learningPath: mediumPath,
    taskCount: 20,
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const WithProgress: Story = {
  args: {
    learningPath: easyPath,
    taskCount: 15,
    progress: {
      completedTasks: 8,
      masteredTasks: 5,
      accuracy: 85,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const NearlyComplete: Story = {
  args: {
    learningPath: mediumPath,
    taskCount: 20,
    progress: {
      completedTasks: 18,
      masteredTasks: 15,
      accuracy: 92,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const Completed: Story = {
  args: {
    learningPath: easyPath,
    taskCount: 15,
    progress: {
      completedTasks: 15,
      masteredTasks: 13,
      accuracy: 95,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

// Difficulty Levels
export const EasyDifficulty: Story = {
  args: {
    learningPath: easyPath,
    taskCount: 15,
    progress: {
      completedTasks: 5,
      masteredTasks: 3,
      accuracy: 80,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const MediumDifficulty: Story = {
  args: {
    learningPath: mediumPath,
    taskCount: 20,
    progress: {
      completedTasks: 10,
      masteredTasks: 6,
      accuracy: 75,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const HardDifficulty: Story = {
  args: {
    learningPath: hardPath,
    taskCount: 25,
    progress: {
      completedTasks: 8,
      masteredTasks: 4,
      accuracy: 70,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

// Progress Variations
export const JustStarted: Story = {
  args: {
    learningPath: easyPath,
    taskCount: 15,
    progress: {
      completedTasks: 1,
      masteredTasks: 0,
      accuracy: 100,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const MidProgress: Story = {
  args: {
    learningPath: mediumPath,
    taskCount: 20,
    progress: {
      completedTasks: 10,
      masteredTasks: 7,
      accuracy: 85,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const HighProgress: Story = {
  args: {
    learningPath: hardPath,
    taskCount: 25,
    progress: {
      completedTasks: 20,
      masteredTasks: 16,
      accuracy: 88,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

// Accuracy Variations
export const LowAccuracy: Story = {
  args: {
    learningPath: hardPath,
    taskCount: 20,
    progress: {
      completedTasks: 10,
      masteredTasks: 3,
      accuracy: 55,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const AverageAccuracy: Story = {
  args: {
    learningPath: mediumPath,
    taskCount: 20,
    progress: {
      completedTasks: 12,
      masteredTasks: 8,
      accuracy: 75,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const HighAccuracy: Story = {
  args: {
    learningPath: easyPath,
    taskCount: 15,
    progress: {
      completedTasks: 10,
      masteredTasks: 9,
      accuracy: 95,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

// Different Task Counts
export const ShortPath: Story = {
  args: {
    learningPath: {
      ...easyPath,
      id: 'quick-review',
      title: 'Quick Review',
      description: 'A quick 10-minute review of essential concepts.',
      estimatedTime: 10,
    },
    taskCount: 5,
    onSelect: (id) => console.log('Selected:', id),
  },
};

export const LongPath: Story = {
  args: {
    learningPath: {
      ...hardPath,
      id: 'comprehensive-course',
      title: 'Comprehensive Course',
      description: 'An in-depth exploration covering all aspects of the topic.',
      estimatedTime: 120,
    },
    taskCount: 50,
    progress: {
      completedTasks: 25,
      masteredTasks: 18,
      accuracy: 82,
    },
    onSelect: (id) => console.log('Selected:', id),
  },
};

// Animation
export const NoAnimation: Story = {
  args: {
    learningPath: mediumPath,
    taskCount: 20,
    progress: {
      completedTasks: 10,
      masteredTasks: 7,
      accuracy: 85,
    },
    animate: false,
    onSelect: (id) => console.log('Selected:', id),
  },
};

// Showcase - All Difficulties
export const AllDifficulties: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '400px' }}>
      <LearningPathCard
        learningPath={easyPath}
        taskCount={15}
        onSelect={(id) => console.log('Selected:', id)}
      />
      <LearningPathCard
        learningPath={mediumPath}
        taskCount={20}
        onSelect={(id) => console.log('Selected:', id)}
      />
      <LearningPathCard
        learningPath={hardPath}
        taskCount={25}
        onSelect={(id) => console.log('Selected:', id)}
      />
    </div>
  ),
};

// Showcase - Progress States
export const ProgressStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '400px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Not Started</h4>
        <LearningPathCard
          learningPath={easyPath}
          taskCount={15}
          onSelect={(id) => console.log('Selected:', id)}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>In Progress</h4>
        <LearningPathCard
          learningPath={mediumPath}
          taskCount={20}
          progress={{
            completedTasks: 10,
            masteredTasks: 7,
            accuracy: 85,
          }}
          onSelect={(id) => console.log('Selected:', id)}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Completed</h4>
        <LearningPathCard
          learningPath={hardPath}
          taskCount={25}
          progress={{
            completedTasks: 25,
            masteredTasks: 22,
            accuracy: 92,
          }}
          onSelect={(id) => console.log('Selected:', id)}
        />
      </div>
    </div>
  ),
};

// Showcase - Multiple Cards Grid
export const CardGrid: RenderStory = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '1200px',
      }}
    >
      <LearningPathCard
        learningPath={easyPath}
        taskCount={15}
        progress={{
          completedTasks: 8,
          masteredTasks: 5,
          accuracy: 85,
        }}
        onSelect={(id) => console.log('Selected:', id)}
      />
      <LearningPathCard
        learningPath={mediumPath}
        taskCount={20}
        progress={{
          completedTasks: 5,
          masteredTasks: 2,
          accuracy: 70,
        }}
        onSelect={(id) => console.log('Selected:', id)}
      />
      <LearningPathCard
        learningPath={hardPath}
        taskCount={25}
        onSelect={(id) => console.log('Selected:', id)}
      />
      <LearningPathCard
        learningPath={{
          ...easyPath,
          id: 'vocab-builder',
          title: 'Vocabulary Builder',
          description: 'Expand your vocabulary with common words and phrases.',
          estimatedTime: 20,
        }}
        taskCount={30}
        progress={{
          completedTasks: 30,
          masteredTasks: 28,
          accuracy: 95,
        }}
        onSelect={(id) => console.log('Selected:', id)}
      />
    </div>
  ),
};

// Showcase - Staggered Animation
export const StaggeredAnimation: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '400px' }}>
      <LearningPathCard
        learningPath={easyPath}
        taskCount={15}
        animate
        animationIndex={0}
        onSelect={(id) => console.log('Selected:', id)}
      />
      <LearningPathCard
        learningPath={mediumPath}
        taskCount={20}
        animate
        animationIndex={1}
        onSelect={(id) => console.log('Selected:', id)}
      />
      <LearningPathCard
        learningPath={hardPath}
        taskCount={25}
        animate
        animationIndex={2}
        onSelect={(id) => console.log('Selected:', id)}
      />
    </div>
  ),
};

// Showcase - Dashboard View
export const DashboardView: RenderStory = {
  render: () => (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '0.5rem' }}>Continue Learning</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Pick up where you left off
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        <LearningPathCard
          learningPath={easyPath}
          taskCount={15}
          progress={{
            completedTasks: 8,
            masteredTasks: 5,
            accuracy: 85,
          }}
          onSelect={(id) => console.log('Selected:', id)}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '0.5rem' }}>Recommended Paths</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Based on your learning goals
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <LearningPathCard
          learningPath={mediumPath}
          taskCount={20}
          onSelect={(id) => console.log('Selected:', id)}
        />
        <LearningPathCard
          learningPath={hardPath}
          taskCount={25}
          onSelect={(id) => console.log('Selected:', id)}
        />
      </div>
    </div>
  ),
};

// Showcase - Different Topics
export const DifferentTopics: RenderStory = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '1200px',
      }}
    >
      <LearningPathCard
        learningPath={{
          ...easyPath,
          id: 'math-algebra',
          topicId: 'math',
          title: 'Algebra Fundamentals',
          description: 'Master the basics of algebra including equations, variables, and functions.',
          difficulty: 'easy',
          estimatedTime: 40,
        }}
        taskCount={18}
        progress={{
          completedTasks: 6,
          masteredTasks: 4,
          accuracy: 78,
        }}
        onSelect={(id) => console.log('Selected:', id)}
      />

      <LearningPathCard
        learningPath={{
          ...mediumPath,
          id: 'science-biology',
          topicId: 'science',
          title: 'Cell Biology',
          description: 'Explore the structure and function of cells, the building blocks of life.',
          difficulty: 'medium',
          estimatedTime: 50,
        }}
        taskCount={22}
        onSelect={(id) => console.log('Selected:', id)}
      />

      <LearningPathCard
        learningPath={{
          ...hardPath,
          id: 'history-wwii',
          topicId: 'history',
          title: 'World War II',
          description: 'Study the causes, major events, and consequences of World War II.',
          difficulty: 'hard',
          estimatedTime: 75,
        }}
        taskCount={30}
        progress={{
          completedTasks: 30,
          masteredTasks: 26,
          accuracy: 90,
        }}
        onSelect={(id) => console.log('Selected:', id)}
      />
    </div>
  ),
};
