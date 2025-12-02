import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackCard } from './FeedbackCard';

const meta = {
  title: 'Common/FeedbackCard',
  component: FeedbackCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
    },
    dismissible: { control: 'boolean' },
  },
} satisfies Meta<typeof FeedbackCard>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Variants
export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Correct!',
    message: 'Your answer is correct. Great job!',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Incorrect',
    message: 'That wasn\'t quite right. The correct answer was "der Hund".',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Almost!',
    message: 'Your answer was close but had a small mistake.',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Tip',
    message: 'Remember: German nouns are always capitalized!',
  },
};

// Without Title
export const WithoutTitle: Story = {
  args: {
    variant: 'success',
    message: 'Your progress has been saved.',
  },
};

// Dismissible
export const Dismissible: Story = {
  args: {
    variant: 'info',
    title: 'New Feature',
    message: 'We\'ve added audio pronunciation for vocabulary items!',
    dismissible: true,
    onDismiss: () => console.log('Dismissed'),
  },
};

// With Custom Content
export const WithCustomContent: Story = {
  args: {
    variant: 'success',
    title: 'Session Complete!',
    children: (
      <div>
        <p style={{ margin: '0 0 0.5rem' }}>You reviewed 15 cards in this session.</p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>12 correct answers</li>
          <li>3 need more practice</li>
        </ul>
      </div>
    ),
  },
};

// Learning Feedback Examples
export const CorrectAnswer: Story = {
  args: {
    variant: 'success',
    title: 'Richtig!',
    message: '"der Hund" bedeutet "the dog".',
  },
};

export const WrongAnswer: Story = {
  args: {
    variant: 'error',
    title: 'Leider falsch',
    message: 'Die richtige Antwort ist "die Katze" (feminine).',
  },
};

export const HintMessage: Story = {
  args: {
    variant: 'info',
    message: 'Tipp: Das Wort beginnt mit "Sch..."',
  },
};

// All Variants Grid
export const AllVariants: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      <FeedbackCard variant="success" title="Success" message="Operation completed successfully." />
      <FeedbackCard variant="error" title="Error" message="Something went wrong. Please try again." />
      <FeedbackCard variant="warning" title="Warning" message="Please review your input carefully." />
      <FeedbackCard variant="info" title="Info" message="Here's some helpful information." />
    </div>
  ),
};

// Dismissible Demo
export const DismissibleDemo: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      <FeedbackCard
        variant="info"
        title="Dismissible Info"
        message="Click the X to dismiss this message."
        dismissible
        onDismiss={() => alert('Dismissed!')}
      />
      <FeedbackCard
        variant="warning"
        title="Dismissible Warning"
        message="This warning can be dismissed."
        dismissible
        onDismiss={() => alert('Dismissed!')}
      />
    </div>
  ),
};
