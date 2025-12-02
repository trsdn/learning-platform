import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';

const meta = {
  title: 'Common/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    showLabel: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Basic Icons
const CloseIcon = () => <span style={{ fontSize: '1.2em' }}>✕</span>;
const ArrowUpIcon = () => <span style={{ fontSize: '1.2em' }}>↑</span>;
const ArrowDownIcon = () => <span style={{ fontSize: '1.2em' }}>↓</span>;
const SettingsIcon = () => <span style={{ fontSize: '1.2em' }}>⚙</span>;
const PlayIcon = () => <span style={{ fontSize: '1.2em' }}>▶</span>;
const TrashIcon = () => <span style={{ fontSize: '1.2em' }}>🗑</span>;

// Variants
export const Default: Story = {
  args: {
    icon: <CloseIcon />,
    label: 'Close',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    icon: <PlayIcon />,
    label: 'Play',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    icon: <SettingsIcon />,
    label: 'Settings',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    icon: <CloseIcon />,
    label: 'Close',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    icon: <TrashIcon />,
    label: 'Delete',
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: 'small',
    icon: <ArrowUpIcon />,
    label: 'Move up',
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
    icon: <ArrowUpIcon />,
    label: 'Move up',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    icon: <ArrowUpIcon />,
    label: 'Move up',
  },
};

// With Label
export const WithLabel: Story = {
  args: {
    icon: <SettingsIcon />,
    label: 'Settings',
    showLabel: true,
  },
};

// Disabled
export const Disabled: Story = {
  args: {
    icon: <CloseIcon />,
    label: 'Close',
    disabled: true,
  },
};

// Navigation Example
export const NavigationArrows: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <IconButton icon={<ArrowUpIcon />} label="Move up" variant="ghost" />
      <IconButton icon={<ArrowDownIcon />} label="Move down" variant="ghost" />
    </div>
  ),
};

// All Variants Grid
export const AllVariants: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <IconButton variant="primary" icon={<PlayIcon />} label="Primary" />
      <IconButton variant="secondary" icon={<SettingsIcon />} label="Secondary" />
      <IconButton variant="ghost" icon={<CloseIcon />} label="Ghost" />
      <IconButton variant="danger" icon={<TrashIcon />} label="Danger" />
    </div>
  ),
};
