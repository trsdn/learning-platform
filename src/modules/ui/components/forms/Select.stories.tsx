import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select } from './Select';

const meta = {
  title: 'Forms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'boolean' },
    success: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '250px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Sample options
const germanArticles = [
  { value: 'der', label: 'der (masculine)' },
  { value: 'die', label: 'die (feminine)' },
  { value: 'das', label: 'das (neuter)' },
];

const languageOptions = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
];

// Interactive wrapper
const SelectWrapper = (args: React.ComponentProps<typeof Select>) => {
  const [value, setValue] = useState(args.value || '');
  return (
    <Select
      {...args}
      value={value}
      onChange={setValue}
    />
  );
};

// Basic
export const Default: Story = {
  args: {
    value: '',
    onChange: () => {},
    options: germanArticles,
    placeholder: 'Select an article',
  },
  render: (args) => <SelectWrapper {...args} />,
};

export const WithValue: Story = {
  args: {
    value: 'der',
    onChange: () => {},
    options: germanArticles,
  },
  render: (args) => <SelectWrapper {...args} />,
};

// States
export const Success: Story = {
  args: {
    value: 'der',
    onChange: () => {},
    options: germanArticles,
    success: true,
  },
  render: (args) => <SelectWrapper {...args} />,
};

export const Error: Story = {
  args: {
    value: 'die',
    onChange: () => {},
    options: germanArticles,
    error: true,
  },
  render: (args) => <SelectWrapper {...args} />,
};

export const Disabled: Story = {
  args: {
    value: 'der',
    onChange: () => {},
    options: germanArticles,
    disabled: true,
  },
  render: (args) => <SelectWrapper {...args} />,
};

// With Disabled Option
export const WithDisabledOption: Story = {
  args: {
    value: '',
    onChange: () => {},
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B (disabled)', disabled: true },
      { value: 'c', label: 'Option C' },
    ],
    placeholder: 'Choose an option',
  },
  render: (args) => <SelectWrapper {...args} />,
};

// Full Width
export const FullWidth: Story = {
  args: {
    value: '',
    onChange: () => {},
    options: languageOptions,
    placeholder: 'Select language',
    fullWidth: true,
  },
  render: (args) => <SelectWrapper {...args} />,
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

// Matching Task Example
export const MatchingTask: RenderStory = {
  render: () => {
    const MatchingDemo = () => {
      const [answer, setAnswer] = useState('');
      const [showFeedback, setShowFeedback] = useState(false);
      const correctAnswer = 'der';

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            Which article goes with &quot;Hund&quot;?
          </p>
          <Select
            value={answer}
            onChange={setAnswer}
            options={germanArticles}
            placeholder="Select the correct article"
            success={showFeedback && answer === correctAnswer}
            error={showFeedback && answer !== correctAnswer && answer !== ''}
          />
          <button
            onClick={() => setShowFeedback(true)}
            disabled={!answer}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: answer ? 'var(--color-primary)' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: answer ? 'pointer' : 'not-allowed',
            }}
          >
            Check Answer
          </button>
          {showFeedback && (
            <p style={{
              margin: 0,
              color: answer === correctAnswer ? 'var(--color-success)' : 'var(--color-error)'
            }}>
              {answer === correctAnswer
                ? 'Correct! "der Hund" is masculine.'
                : 'Incorrect. "Hund" is masculine (der).'}
            </p>
          )}
        </div>
      );
    };
    return <MatchingDemo />;
  },
};

// All States
export const AllStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '250px' }}>
      <Select
        value=""
        onChange={() => {}}
        options={germanArticles}
        placeholder="Default"
      />
      <Select
        value="der"
        onChange={() => {}}
        options={germanArticles}
      />
      <Select
        value="der"
        onChange={() => {}}
        options={germanArticles}
        success
      />
      <Select
        value="die"
        onChange={() => {}}
        options={germanArticles}
        error
      />
      <Select
        value="der"
        onChange={() => {}}
        options={germanArticles}
        disabled
      />
    </div>
  ),
};
