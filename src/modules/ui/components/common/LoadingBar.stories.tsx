import type { Meta, StoryObj } from '@storybook/react';
import { LoadingBar } from './LoadingBar';

const meta = {
  title: 'Common/LoadingBar',
  component: LoadingBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['indeterminate', 'shimmer', 'pulse'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: { control: 'color' },
    isLoading: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoadingBar>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Basic Examples
export const Default: Story = {
  args: {
    isLoading: true,
  },
};

export const Indeterminate: Story = {
  args: {
    variant: 'indeterminate',
    isLoading: true,
  },
};

export const Shimmer: Story = {
  args: {
    variant: 'shimmer',
    isLoading: true,
  },
};

export const Pulse: Story = {
  args: {
    variant: 'pulse',
    isLoading: true,
  },
};

// Sizes
export const SmallSize: Story = {
  args: {
    variant: 'indeterminate',
    size: 'small',
    isLoading: true,
  },
};

export const MediumSize: Story = {
  args: {
    variant: 'indeterminate',
    size: 'medium',
    isLoading: true,
  },
};

export const LargeSize: Story = {
  args: {
    variant: 'indeterminate',
    size: 'large',
    isLoading: true,
  },
};

// Custom Colors
export const CustomBlue: Story = {
  args: {
    variant: 'indeterminate',
    color: 'var(--color-primary)',
    isLoading: true,
  },
};

export const CustomGreen: Story = {
  args: {
    variant: 'indeterminate',
    color: 'var(--color-success)',
    isLoading: true,
  },
};

export const CustomOrange: Story = {
  args: {
    variant: 'shimmer',
    color: 'var(--color-warning)',
    isLoading: true,
  },
};

export const CustomPurple: Story = {
  args: {
    variant: 'pulse',
    color: '#8b5cf6',
    isLoading: true,
  },
};

// Loading States
export const Active: Story = {
  args: {
    variant: 'indeterminate',
    isLoading: true,
  },
};

export const Inactive: Story = {
  args: {
    variant: 'indeterminate',
    isLoading: false,
  },
};

// Showcase - All Variants
export const AllVariants: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '400px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Indeterminate (Sliding)</h4>
        <LoadingBar variant="indeterminate" isLoading />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Shimmer</h4>
        <LoadingBar variant="shimmer" isLoading />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Pulse</h4>
        <LoadingBar variant="pulse" isLoading />
      </div>
    </div>
  ),
};

// Showcase - All Sizes
export const AllSizes: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '400px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Small</h4>
        <LoadingBar variant="indeterminate" size="small" isLoading />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Medium</h4>
        <LoadingBar variant="indeterminate" size="medium" isLoading />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Large</h4>
        <LoadingBar variant="indeterminate" size="large" isLoading />
      </div>
    </div>
  ),
};

// Showcase - Color Variations
export const ColorVariations: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '400px' }}>
      <LoadingBar variant="indeterminate" color="var(--color-primary)" isLoading />
      <LoadingBar variant="shimmer" color="var(--color-success)" isLoading />
      <LoadingBar variant="pulse" color="var(--color-warning)" isLoading />
      <LoadingBar variant="indeterminate" color="var(--color-error)" isLoading />
      <LoadingBar variant="shimmer" color="#8b5cf6" isLoading />
    </div>
  ),
};

// Showcase - Variants with Different Sizes
export const VariantsAndSizes: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '400px' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Indeterminate - Small</h4>
        <LoadingBar variant="indeterminate" size="small" isLoading />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Shimmer - Medium</h4>
        <LoadingBar variant="shimmer" size="medium" isLoading />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '14px' }}>Pulse - Large</h4>
        <LoadingBar variant="pulse" size="large" isLoading />
      </div>
    </div>
  ),
};

// Showcase - Use Cases
export const UseCaseAPICall: RenderStory = {
  render: () => (
    <div style={{ width: '400px' }}>
      <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '16px' }}>Fetching Data...</h3>
        <LoadingBar variant="indeterminate" isLoading />
        <p style={{ marginTop: '1rem', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Please wait while we load your learning progress.
        </p>
      </div>
    </div>
  ),
};

export const UseCaseAnswerChecking: RenderStory = {
  render: () => (
    <div style={{ width: '400px' }}>
      <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '16px' }}>Checking Answer...</h3>
        <LoadingBar variant="shimmer" color="var(--color-primary)" isLoading />
        <p style={{ marginTop: '1rem', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Our AI is evaluating your response.
        </p>
      </div>
    </div>
  ),
};

export const UseCaseGeneratingExplanation: RenderStory = {
  render: () => (
    <div style={{ width: '400px' }}>
      <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '16px' }}>Generating Explanation...</h3>
        <LoadingBar variant="pulse" color="var(--color-success)" isLoading />
        <p style={{ marginTop: '1rem', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Creating a personalized explanation for you.
        </p>
      </div>
    </div>
  ),
};

export const UseCasePageTransition: RenderStory = {
  render: () => (
    <div style={{ width: '400px' }}>
      <div
        style={{
          position: 'relative',
          padding: '2rem',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <LoadingBar variant="indeterminate" size="small" isLoading />
        </div>
        <h3 style={{ marginTop: '0.5rem', fontSize: '16px' }}>Loading Next Task...</h3>
      </div>
    </div>
  ),
};

// Showcase - Multiple Loading States
export const MultipleLoadingStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '500px' }}>
      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>Card 1 - Loading</h4>
        <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <LoadingBar variant="shimmer" size="small" isLoading />
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>Card 2 - Loading</h4>
        <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <LoadingBar variant="pulse" size="small" isLoading />
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '14px' }}>Card 3 - Loading</h4>
        <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <LoadingBar variant="indeterminate" size="small" isLoading />
        </div>
      </div>
    </div>
  ),
};
