import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'Common/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    shadow: { control: 'boolean' },
    border: { control: 'boolean' },
    borderColor: { control: 'color' },
    backgroundColor: { control: 'color' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Basic
export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 style={{ margin: '0 0 0.5rem' }}>Card Title</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          This is the card content. Cards are versatile containers for grouping related content.
        </p>
      </div>
    ),
  },
};

// Padding Variants
export const SmallPadding: Story = {
  args: {
    padding: 'small',
    children: <p style={{ margin: 0 }}>Small padding card</p>,
  },
};

export const MediumPadding: Story = {
  args: {
    padding: 'medium',
    children: <p style={{ margin: 0 }}>Medium padding card</p>,
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'large',
    children: <p style={{ margin: 0 }}>Large padding card</p>,
  },
};

// Shadow and Border
export const WithShadow: Story = {
  args: {
    shadow: true,
    children: <p style={{ margin: 0 }}>Card with shadow</p>,
  },
};

export const WithoutShadow: Story = {
  args: {
    shadow: false,
    children: <p style={{ margin: 0 }}>Card without shadow</p>,
  },
};

export const WithBorder: Story = {
  args: {
    border: true,
    children: <p style={{ margin: 0 }}>Card with border</p>,
  },
};

export const WithoutBorder: Story = {
  args: {
    border: false,
    children: <p style={{ margin: 0 }}>Card without border</p>,
  },
};

// Custom Styling
export const CustomBorderColor: Story = {
  args: {
    borderColor: '#3b82f6',
    children: <p style={{ margin: 0 }}>Card with custom border color</p>,
  },
};

export const CustomBackgroundColor: Story = {
  args: {
    backgroundColor: '#f0f9ff',
    children: <p style={{ margin: 0 }}>Card with custom background</p>,
  },
};

// Complex Content
export const WithComplexContent: Story = {
  args: {
    padding: 'large',
    children: (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Learning Progress</h3>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Week 3</span>
        </div>
        <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)' }}>
          You&apos;ve completed 15 sessions this week. Keep up the great work!
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>42</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cards Reviewed</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>95%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accuracy</div>
          </div>
        </div>
      </div>
    ),
  },
};

// All Padding Sizes
export const AllPaddingSizes: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
      <Card padding="small">
        <p style={{ margin: 0 }}>Small padding</p>
      </Card>
      <Card padding="medium">
        <p style={{ margin: 0 }}>Medium padding</p>
      </Card>
      <Card padding="large">
        <p style={{ margin: 0 }}>Large padding</p>
      </Card>
    </div>
  ),
};
