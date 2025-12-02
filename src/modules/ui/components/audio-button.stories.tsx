import type { Meta, StoryObj } from '@storybook/react';
import { AudioButton, AudioButtonInline } from './audio-button';

const meta = {
  title: 'Features/AudioButton',
  component: AudioButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof AudioButton>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Default (with audio URL)
export const Default: Story = {
  args: {
    text: 'Hund',
    audioUrl: '/audio/german/hund.mp3',
  },
};

// Without audio URL (disabled state)
export const NoAudio: Story = {
  args: {
    text: 'Katze',
    audioUrl: null,
  },
};

// Disabled
export const Disabled: Story = {
  args: {
    text: 'Vogel',
    audioUrl: '/audio/german/vogel.mp3',
    disabled: true,
  },
};

// Small size
export const Small: Story = {
  args: {
    text: 'klein',
    audioUrl: '/audio/german/klein.mp3',
    size: 'small',
  },
};

// Medium size
export const Medium: Story = {
  args: {
    text: 'mittel',
    audioUrl: '/audio/german/mittel.mp3',
    size: 'medium',
  },
};

// Large size
export const Large: Story = {
  args: {
    text: 'groß',
    audioUrl: '/audio/german/gross.mp3',
    size: 'large',
  },
};

// All sizes comparison
export const AllSizes: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <AudioButton text="Small" audioUrl="/audio/test.mp3" size="small" />
      <AudioButton text="Medium" audioUrl="/audio/test.mp3" size="medium" />
      <AudioButton text="Large" audioUrl="/audio/test.mp3" size="large" />
    </div>
  ),
};

// States comparison
export const AllStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <AudioButton text="With Audio" audioUrl="/audio/test.mp3" />
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Active</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <AudioButton text="No Audio" audioUrl={null} />
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>No Audio</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <AudioButton text="Disabled" audioUrl="/audio/test.mp3" disabled />
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Disabled</p>
      </div>
    </div>
  ),
};

// AudioButtonInline story
export const InlineWithText: RenderStory = {
  render: () => (
    <div style={{ fontSize: '1.25rem' }}>
      <AudioButtonInline text="Guten Tag" />
    </div>
  ),
};

// Multiple inline buttons in text
export const InlineInSentence: RenderStory = {
  render: () => (
    <div style={{ fontSize: '1rem', lineHeight: '2' }}>
      <p>
        The word <AudioButtonInline text="Hund" /> means dog,
        and <AudioButtonInline text="Katze" /> means cat.
      </p>
    </div>
  ),
};
