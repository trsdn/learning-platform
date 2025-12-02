import type { Meta, StoryObj } from '@storybook/react';
import { CircularProgress } from './CircularProgress';

const meta = {
  title: 'Common/CircularProgress',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 100 } },
    max: { control: { type: 'number', min: 1 } },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    strokeWidth: { control: { type: 'number', min: 1, max: 20 } },
    pathColor: { control: 'color' },
    trailColor: { control: 'color' },
    showValue: { control: 'boolean' },
    disableAnimation: { control: 'boolean' },
  },
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Basic Examples
export const Default: Story = {
  args: {
    value: 75,
  },
};

export const WithValue: Story = {
  args: {
    value: 85,
    showValue: true,
  },
};

export const WithoutValue: Story = {
  args: {
    value: 60,
    showValue: false,
  },
};

// Sizes
export const Small: Story = {
  args: {
    value: 75,
    size: 'small',
    showValue: true,
  },
};

export const Medium: Story = {
  args: {
    value: 75,
    size: 'medium',
    showValue: true,
  },
};

export const Large: Story = {
  args: {
    value: 75,
    size: 'large',
    showValue: true,
  },
};

export const CustomSize: Story = {
  args: {
    value: 65,
    size: 150,
    showValue: true,
  },
};

// Custom Colors
export const CustomGreen: Story = {
  args: {
    value: 90,
    pathColor: 'var(--color-success)',
    showValue: true,
  },
};

export const CustomBlue: Story = {
  args: {
    value: 70,
    pathColor: 'var(--color-primary)',
    showValue: true,
  },
};

export const CustomOrange: Story = {
  args: {
    value: 50,
    pathColor: 'var(--color-warning)',
    showValue: true,
  },
};

export const CustomRed: Story = {
  args: {
    value: 30,
    pathColor: 'var(--color-error)',
    showValue: true,
  },
};

// Stroke Width
export const ThinStroke: Story = {
  args: {
    value: 75,
    strokeWidth: 4,
    showValue: true,
  },
};

export const ThickStroke: Story = {
  args: {
    value: 75,
    strokeWidth: 15,
    showValue: true,
  },
};

// Custom Content
export const WithCustomContent: Story = {
  args: {
    value: 7,
    max: 10,
    size: 'large',
  },
  render: (args) => (
    <CircularProgress {...args}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>7/10</div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Tasks</div>
      </div>
    </CircularProgress>
  ),
};

export const WithIcon: Story = {
  args: {
    value: 100,
    pathColor: 'var(--color-success)',
  },
  render: (args) => (
    <CircularProgress {...args}>
      <span style={{ fontSize: '32px' }}>✓</span>
    </CircularProgress>
  ),
};

export const WithEmoji: Story = {
  args: {
    value: 80,
    size: 'large',
    pathColor: 'var(--color-warning)',
  },
  render: (args) => (
    <CircularProgress {...args}>
      <span style={{ fontSize: '48px' }}>🔥</span>
    </CircularProgress>
  ),
};

// Edge Cases
export const Empty: Story = {
  args: {
    value: 0,
    showValue: true,
  },
};

export const Full: Story = {
  args: {
    value: 100,
    showValue: true,
    pathColor: 'var(--color-success)',
  },
};

export const VeryLow: Story = {
  args: {
    value: 5,
    showValue: true,
  },
};

export const VeryHigh: Story = {
  args: {
    value: 99,
    showValue: true,
  },
};

// Custom Max
export const CustomMaxValue: Story = {
  args: {
    value: 3,
    max: 5,
    showValue: true,
  },
};

export const TaskCompletion: Story = {
  args: {
    value: 12,
    max: 15,
    size: 'large',
  },
  render: (args) => (
    <CircularProgress {...args}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>12/15</div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Completed</div>
      </div>
    </CircularProgress>
  ),
};

// Showcase - All Sizes
export const AllSizes: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={75} size="small" showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Small</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={75} size="medium" showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Medium</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={75} size="large" showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Large</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={75} size={150} showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Custom (150px)</p>
      </div>
    </div>
  ),
};

// Showcase - Progress States
export const ProgressStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={0} showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>0%</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={25} showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>25%</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={50} showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>50%</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={75} showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>75%</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={100} showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>100%</p>
      </div>
    </div>
  ),
};

// Showcase - Color Variations
export const ColorVariations: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={30} pathColor="var(--color-error)" showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Error</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={60} pathColor="var(--color-warning)" showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Warning</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={75} pathColor="var(--color-primary)" showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Primary</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress value={90} pathColor="var(--color-success)" showValue />
        <p style={{ marginTop: '0.5rem', fontSize: '12px' }}>Success</p>
      </div>
    </div>
  ),
};

// Showcase - Custom Content Examples
export const CustomContentExamples: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <CircularProgress value={3} max={5} size="large">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>3/5</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Steps</div>
        </div>
      </CircularProgress>

      <CircularProgress value={100} size="large" pathColor="var(--color-success)">
        <span style={{ fontSize: '40px' }}>✓</span>
      </CircularProgress>

      <CircularProgress value={15} size="large" pathColor="var(--color-warning)">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px' }}>🔥</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>15</div>
        </div>
      </CircularProgress>

      <CircularProgress value={85} size="large" pathColor="var(--color-primary)">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>85%</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Mastery</div>
        </div>
      </CircularProgress>
    </div>
  ),
};

// Showcase - Learning Dashboard Use Cases
export const LearningUseCases: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Daily Streak</h4>
          <CircularProgress value={7} max={7} size="large" pathColor="var(--color-warning)">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px' }}>🔥</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>7</div>
            </div>
          </CircularProgress>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Tasks Completed</h4>
          <CircularProgress value={42} max={50} size="large">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>42/50</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Tasks</div>
            </div>
          </CircularProgress>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Course Progress</h4>
          <CircularProgress value={68} size="large" pathColor="var(--color-primary)" showValue />
        </div>
      </div>
    </div>
  ),
};
