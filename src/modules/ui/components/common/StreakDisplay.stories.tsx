import type { Meta, StoryObj } from '@storybook/react';
import { StreakDisplay } from './StreakDisplay';

const meta = {
  title: 'Common/StreakDisplay',
  component: StreakDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentStreak: { control: { type: 'number', min: 0 } },
    bestStreak: { control: { type: 'number', min: 0 } },
    nextMilestone: { control: { type: 'number', min: 0 } },
    progressToMilestone: { control: { type: 'number', min: 0, max: 100 } },
    isStreakActive: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['compact', 'standard', 'large'],
    },
    showMilestoneProgress: { control: 'boolean' },
  },
} satisfies Meta<typeof StreakDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Basic Examples
export const Default: Story = {
  args: {
    currentStreak: 7,
    bestStreak: 15,
    nextMilestone: 10,
    progressToMilestone: 70,
    isStreakActive: true,
  },
};

export const ActiveStreak: Story = {
  args: {
    currentStreak: 12,
    bestStreak: 15,
    nextMilestone: 20,
    progressToMilestone: 60,
    isStreakActive: true,
  },
};

export const InactiveStreak: Story = {
  args: {
    currentStreak: 5,
    bestStreak: 10,
    nextMilestone: 10,
    progressToMilestone: 50,
    isStreakActive: false,
  },
};

// Sizes
export const Compact: Story = {
  args: {
    currentStreak: 7,
    bestStreak: 15,
    nextMilestone: 10,
    progressToMilestone: 70,
    size: 'compact',
  },
};

export const Standard: Story = {
  args: {
    currentStreak: 7,
    bestStreak: 15,
    nextMilestone: 10,
    progressToMilestone: 70,
    size: 'standard',
  },
};

export const Large: Story = {
  args: {
    currentStreak: 7,
    bestStreak: 15,
    nextMilestone: 10,
    progressToMilestone: 70,
    size: 'large',
  },
};

// Milestone Progress
export const WithMilestoneProgress: Story = {
  args: {
    currentStreak: 8,
    bestStreak: 20,
    nextMilestone: 10,
    progressToMilestone: 80,
    showMilestoneProgress: true,
  },
};

export const WithoutMilestoneProgress: Story = {
  args: {
    currentStreak: 8,
    bestStreak: 20,
    nextMilestone: 10,
    progressToMilestone: 80,
    showMilestoneProgress: false,
  },
};

// Different Streak Scenarios
export const NewStreak: Story = {
  args: {
    currentStreak: 1,
    bestStreak: 5,
    nextMilestone: 7,
    progressToMilestone: 14,
    isStreakActive: true,
  },
};

export const NoStreak: Story = {
  args: {
    currentStreak: 0,
    bestStreak: 10,
    nextMilestone: 7,
    progressToMilestone: 0,
    isStreakActive: false,
  },
};

export const BrokenStreak: Story = {
  args: {
    currentStreak: 3,
    bestStreak: 15,
    nextMilestone: 7,
    progressToMilestone: 43,
    isStreakActive: false,
  },
};

export const ShortStreak: Story = {
  args: {
    currentStreak: 3,
    bestStreak: 20,
    nextMilestone: 7,
    progressToMilestone: 43,
    isStreakActive: true,
  },
};

export const MediumStreak: Story = {
  args: {
    currentStreak: 15,
    bestStreak: 30,
    nextMilestone: 20,
    progressToMilestone: 75,
    isStreakActive: true,
  },
};

export const LongStreak: Story = {
  args: {
    currentStreak: 45,
    bestStreak: 45,
    nextMilestone: 50,
    progressToMilestone: 90,
    isStreakActive: true,
  },
};

export const RecordBreaking: Story = {
  args: {
    currentStreak: 25,
    bestStreak: 20,
    nextMilestone: 30,
    progressToMilestone: 83,
    isStreakActive: true,
  },
};

// Near Milestones
export const AlmostAtMilestone: Story = {
  args: {
    currentStreak: 9,
    bestStreak: 15,
    nextMilestone: 10,
    progressToMilestone: 90,
    isStreakActive: true,
  },
};

export const OneDayToMilestone: Story = {
  args: {
    currentStreak: 6,
    bestStreak: 10,
    nextMilestone: 7,
    progressToMilestone: 86,
    isStreakActive: true,
  },
};

export const JustPassedMilestone: Story = {
  args: {
    currentStreak: 11,
    bestStreak: 15,
    nextMilestone: 20,
    progressToMilestone: 55,
    isStreakActive: true,
  },
};

// Milestone Scenarios
export const FirstMilestone: Story = {
  args: {
    currentStreak: 4,
    bestStreak: 7,
    nextMilestone: 7,
    progressToMilestone: 57,
    isStreakActive: true,
  },
};

export const SecondMilestone: Story = {
  args: {
    currentStreak: 12,
    bestStreak: 15,
    nextMilestone: 20,
    progressToMilestone: 60,
    isStreakActive: true,
  },
};

export const ThirdMilestone: Story = {
  args: {
    currentStreak: 25,
    bestStreak: 35,
    nextMilestone: 30,
    progressToMilestone: 83,
    isStreakActive: true,
  },
};

export const MajorMilestone: Story = {
  args: {
    currentStreak: 85,
    bestStreak: 90,
    nextMilestone: 100,
    progressToMilestone: 85,
    isStreakActive: true,
  },
};

// Showcase - All Sizes
export const AllSizes: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <div style={{ textAlign: 'center' }}>
        <StreakDisplay
          currentStreak={7}
          bestStreak={15}
          nextMilestone={10}
          progressToMilestone={70}
          size="compact"
        />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Compact</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <StreakDisplay
          currentStreak={7}
          bestStreak={15}
          nextMilestone={10}
          progressToMilestone={70}
          size="standard"
        />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Standard</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <StreakDisplay
          currentStreak={7}
          bestStreak={15}
          nextMilestone={10}
          progressToMilestone={70}
          size="large"
        />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Large</p>
      </div>
    </div>
  ),
};

// Showcase - Streak Journey
export const StreakJourney: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>Just Starting</h4>
        <StreakDisplay
          currentStreak={1}
          bestStreak={5}
          nextMilestone={7}
          progressToMilestone={14}
          isStreakActive
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>Building Momentum</h4>
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          isStreakActive
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>Hitting Milestones</h4>
        <StreakDisplay
          currentStreak={15}
          bestStreak={15}
          nextMilestone={20}
          progressToMilestone={75}
          isStreakActive
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>Master Level</h4>
        <StreakDisplay
          currentStreak={45}
          bestStreak={50}
          nextMilestone={50}
          progressToMilestone={90}
          isStreakActive
        />
      </div>
    </div>
  ),
};

// Showcase - Active vs Inactive
export const ActiveVsInactive: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '3rem' }}>
      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>Active Streak</h4>
        <StreakDisplay
          currentStreak={12}
          bestStreak={20}
          nextMilestone={20}
          progressToMilestone={60}
          isStreakActive
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>Inactive Streak</h4>
        <StreakDisplay
          currentStreak={12}
          bestStreak={20}
          nextMilestone={20}
          progressToMilestone={60}
          isStreakActive={false}
        />
      </div>
    </div>
  ),
};

// Showcase - Dashboard Examples
export const DashboardExamples: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '800px' }}>
      <div style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '18px' }}>Your Learning Streak</h3>
        <StreakDisplay
          currentStreak={7}
          bestStreak={15}
          nextMilestone={10}
          progressToMilestone={70}
          size="large"
        />
      </div>

      <div style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '18px' }}>Keep it up!</h3>
        <StreakDisplay
          currentStreak={6}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={86}
          size="standard"
        />
        <p style={{ marginTop: '1rem', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Just 1 more day to reach your next milestone!
        </p>
      </div>

      <div style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px', opacity: 0.7 }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '18px' }}>{"Don't break the chain!"}</h3>
        <StreakDisplay
          currentStreak={5}
          bestStreak={12}
          nextMilestone={7}
          progressToMilestone={71}
          size="standard"
          isStreakActive={false}
        />
        <p style={{ marginTop: '1rem', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Complete a lesson today to continue your streak.
        </p>
      </div>
    </div>
  ),
};

// Showcase - Milestone Celebrations
export const MilestoneCelebrations: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>1 Day Away!</h4>
        <StreakDisplay
          currentStreak={6}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={86}
          isStreakActive
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>2 Days Away!</h4>
        <StreakDisplay
          currentStreak={8}
          bestStreak={15}
          nextMilestone={10}
          progressToMilestone={80}
          isStreakActive
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>Halfway There!</h4>
        <StreakDisplay
          currentStreak={15}
          bestStreak={25}
          nextMilestone={30}
          progressToMilestone={50}
          isStreakActive
        />
      </div>
    </div>
  ),
};

// Showcase - Without Milestone Progress Circle
export const WithoutProgressCircle: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <StreakDisplay
        currentStreak={7}
        bestStreak={15}
        nextMilestone={10}
        progressToMilestone={70}
        showMilestoneProgress={false}
        size="compact"
      />
      <StreakDisplay
        currentStreak={7}
        bestStreak={15}
        nextMilestone={10}
        progressToMilestone={70}
        showMilestoneProgress={false}
        size="standard"
      />
      <StreakDisplay
        currentStreak={7}
        bestStreak={15}
        nextMilestone={10}
        progressToMilestone={70}
        showMilestoneProgress={false}
        size="large"
      />
    </div>
  ),
};
