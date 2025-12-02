import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    error: { control: 'boolean' },
    success: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Interactive wrapper for controlled checkbox
const CheckboxWrapper = (args: React.ComponentProps<typeof Checkbox>) => {
  const [checked, setChecked] = useState(args.checked || false);
  return (
    <Checkbox
      {...args}
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
};

// Basic
export const Default: Story = {
  args: {
    checked: false,
    onChange: () => {},
    label: 'Checkbox option',
  },
  render: (args) => <CheckboxWrapper {...args} />,
};

export const Checked: Story = {
  args: {
    checked: true,
    onChange: () => {},
    label: 'Checked option',
  },
  render: (args) => <CheckboxWrapper {...args} />,
};

export const Unchecked: Story = {
  args: {
    checked: false,
    onChange: () => {},
    label: 'Unchecked option',
  },
  render: (args) => <CheckboxWrapper {...args} />,
};

// Without Label
export const WithoutLabel: Story = {
  args: {
    checked: false,
    onChange: () => {},
  },
  render: (args) => <CheckboxWrapper {...args} />,
};

// States
export const Success: Story = {
  args: {
    checked: true,
    onChange: () => {},
    label: 'Correct answer',
    success: true,
  },
  render: (args) => <CheckboxWrapper {...args} />,
};

export const Error: Story = {
  args: {
    checked: true,
    onChange: () => {},
    label: 'Wrong answer',
    error: true,
  },
  render: (args) => <CheckboxWrapper {...args} />,
};

export const Disabled: Story = {
  args: {
    checked: false,
    onChange: () => {},
    label: 'Disabled option',
    disabled: true,
  },
  render: (args) => <CheckboxWrapper {...args} />,
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    onChange: () => {},
    label: 'Disabled checked',
    disabled: true,
  },
  render: (args) => <CheckboxWrapper {...args} />,
};

// Multiple Select Example
export const MultipleSelectTask: RenderStory = {
  render: () => {
    const MultiSelectDemo = () => {
      const [selected, setSelected] = useState<string[]>([]);
      const [showFeedback, setShowFeedback] = useState(false);

      const options = [
        { id: 'a', label: 'der Hund', correct: true },
        { id: 'b', label: 'die Katze', correct: true },
        { id: 'c', label: 'das Auto', correct: false },
        { id: 'd', label: 'der Vogel', correct: true },
      ];

      const toggle = (id: string) => {
        setSelected(prev =>
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 500 }}>
            Select all animals:
          </p>
          {options.map(opt => (
            <Checkbox
              key={opt.id}
              checked={selected.includes(opt.id)}
              onChange={() => toggle(opt.id)}
              label={opt.label}
              success={showFeedback && selected.includes(opt.id) && opt.correct}
              error={showFeedback && selected.includes(opt.id) && !opt.correct}
            />
          ))}
          <button
            onClick={() => setShowFeedback(true)}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Check Answers
          </button>
        </div>
      );
    };
    return <MultiSelectDemo />;
  },
};

// All States
export const AllStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Checkbox checked={false} onChange={() => {}} label="Unchecked" />
      <Checkbox checked={true} onChange={() => {}} label="Checked" />
      <Checkbox checked={true} onChange={() => {}} label="Success" success />
      <Checkbox checked={true} onChange={() => {}} label="Error" error />
      <Checkbox checked={false} onChange={() => {}} label="Disabled" disabled />
      <Checkbox checked={true} onChange={() => {}} label="Disabled Checked" disabled />
    </div>
  ),
};
