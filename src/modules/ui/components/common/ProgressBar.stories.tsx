import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'Common/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 100 } },
    max: { control: { type: 'number', min: 1 } },
    variant: {
      control: 'select',
      options: ['default', 'gradient', 'striped', 'animated-striped'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    labelPosition: {
      control: 'select',
      options: ['inside', 'outside', 'top'],
    },
    color: { control: 'color' },
    showLabel: { control: 'boolean' },
    disableAnimation: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Basic Examples
export const Default: Story = {
  args: {
    value: 60,
  },
};

export const WithLabel: Story = {
  args: {
    value: 75,
    showLabel: true,
  },
};

export const LabelOutside: Story = {
  args: {
    value: 65,
    showLabel: true,
    labelPosition: 'outside',
  },
};

export const LabelTop: Story = {
  args: {
    value: 80,
    showLabel: true,
    labelPosition: 'top',
  },
};

export const LabelInside: Story = {
  args: {
    value: 70,
    showLabel: true,
    labelPosition: 'inside',
  },
};

// Variants
export const GradientVariant: Story = {
  args: {
    value: 75,
    variant: 'gradient',
    showLabel: true,
  },
};

export const StripedVariant: Story = {
  args: {
    value: 60,
    variant: 'striped',
    showLabel: true,
  },
};

export const AnimatedStripedVariant: Story = {
  args: {
    value: 45,
    variant: 'animated-striped',
    showLabel: true,
  },
};

// Sizes
export const SmallSize: Story = {
  args: {
    value: 50,
    size: 'small',
    showLabel: true,
  },
};

export const MediumSize: Story = {
  args: {
    value: 50,
    size: 'medium',
    showLabel: true,
  },
};

export const LargeSize: Story = {
  args: {
    value: 50,
    size: 'large',
    showLabel: true,
  },
};

// Custom Colors
export const CustomGreen: Story = {
  args: {
    value: 85,
    color: 'var(--color-success)',
    showLabel: true,
  },
};

export const CustomBlue: Story = {
  args: {
    value: 65,
    color: 'var(--color-primary)',
    showLabel: true,
  },
};

export const CustomRed: Story = {
  args: {
    value: 25,
    color: 'var(--color-error)',
    showLabel: true,
  },
};

// Edge Cases
export const Empty: Story = {
  args: {
    value: 0,
    showLabel: true,
  },
};

export const Full: Story = {
  args: {
    value: 100,
    showLabel: true,
  },
};

export const LowPercentage: Story = {
  args: {
    value: 5,
    showLabel: true,
    labelPosition: 'inside',
  },
};

export const HighPercentage: Story = {
  args: {
    value: 95,
    showLabel: true,
    labelPosition: 'inside',
  },
};

// Custom Max
export const CustomMax: Story = {
  args: {
    value: 7,
    max: 10,
    showLabel: true,
  },
};

export const TaskProgress: Story = {
  args: {
    value: 15,
    max: 20,
    showLabel: true,
    labelPosition: 'outside',
  },
};

// Custom Label Formatter
export const CustomLabelFormat: Story = {
  args: {
    value: 7,
    max: 10,
    showLabel: true,
    formatLabel: (val, max) => `${val} of ${max} completed`,
  },
};

// Showcase - All Variants
export const AllVariants: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '400px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Default</h4>
        <ProgressBar value={75} showLabel />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Gradient</h4>
        <ProgressBar value={75} variant="gradient" showLabel />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Striped</h4>
        <ProgressBar value={75} variant="striped" showLabel />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Animated Striped</h4>
        <ProgressBar value={75} variant="animated-striped" showLabel />
      </div>
    </div>
  ),
};

// Showcase - All Sizes
export const AllSizes: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '400px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Small</h4>
        <ProgressBar value={65} size="small" showLabel />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Medium</h4>
        <ProgressBar value={65} size="medium" showLabel />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Large</h4>
        <ProgressBar value={65} size="large" showLabel />
      </div>
    </div>
  ),
};

// Showcase - Label Positions
export const AllLabelPositions: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '400px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Inside</h4>
        <ProgressBar value={70} showLabel labelPosition="inside" />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Outside</h4>
        <ProgressBar value={70} showLabel labelPosition="outside" />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Top</h4>
        <ProgressBar value={70} showLabel labelPosition="top" />
      </div>
    </div>
  ),
};

// Showcase - Progress States
export const ProgressStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <ProgressBar value={0} showLabel labelPosition="outside" />
      <ProgressBar value={25} showLabel labelPosition="outside" />
      <ProgressBar value={50} showLabel labelPosition="outside" />
      <ProgressBar value={75} showLabel labelPosition="outside" />
      <ProgressBar value={100} showLabel labelPosition="outside" />
    </div>
  ),
};

// Showcase - Learning Progress Example
export const LearningProgress: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '400px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Course Progress</h4>
        <ProgressBar
          value={12}
          max={15}
          showLabel
          labelPosition="top"
          color="var(--color-primary)"
        />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Daily Goal</h4>
        <ProgressBar
          value={7}
          max={10}
          variant="gradient"
          showLabel
          labelPosition="outside"
        />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Mastery Level</h4>
        <ProgressBar
          value={85}
          variant="animated-striped"
          showLabel
          color="var(--color-success)"
        />
      </div>
    </div>
  ),
};

// Showcase - Color Auto-Selection
export const ColorAutoSelection: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Low Progress (Red)</h4>
        <ProgressBar value={25} showLabel />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Medium Progress (Yellow)</h4>
        <ProgressBar value={60} showLabel />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>High Progress (Green)</h4>
        <ProgressBar value={85} showLabel />
      </div>
    </div>
  ),
};
