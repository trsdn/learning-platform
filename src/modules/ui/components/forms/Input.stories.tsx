import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from './Input';

const meta = {
  title: 'Forms/Input',
  component: Input,
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
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Interactive wrapper for controlled input
const InputWrapper = (args: React.ComponentProps<typeof Input>) => {
  const [value, setValue] = useState(args.value || '');
  return (
    <Input
      {...args}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

// Basic
export const Default: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Enter text...',
  },
  render: (args) => <InputWrapper {...args} />,
};

export const WithValue: Story = {
  args: {
    value: 'Hello World',
    onChange: () => {},
  },
  render: (args) => <InputWrapper {...args} />,
};

// States
export const Error: Story = {
  args: {
    value: 'Wrong answer',
    onChange: () => {},
    error: true,
    helperText: 'This answer is incorrect',
  },
  render: (args) => <InputWrapper {...args} />,
};

export const Success: Story = {
  args: {
    value: 'Correct answer',
    onChange: () => {},
    success: true,
    helperText: 'Well done!',
  },
  render: (args) => <InputWrapper {...args} />,
};

export const Disabled: Story = {
  args: {
    value: 'Disabled input',
    onChange: () => {},
    disabled: true,
  },
  render: (args) => <InputWrapper {...args} />,
};

// With Helper Text
export const WithHelperText: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Enter your answer',
    helperText: 'Type the German translation',
  },
  render: (args) => <InputWrapper {...args} />,
};

// Full Width
export const FullWidth: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Full width input',
    fullWidth: true,
  },
  render: (args) => <InputWrapper {...args} />,
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

// Learning Task Examples
export const ClozeDeletion: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Fill in the blank',
    helperText: 'Ich ___ ein Buch. (lese)',
  },
  render: (args) => <InputWrapper {...args} />,
};

export const CorrectAnswer: Story = {
  args: {
    value: 'lese',
    onChange: () => {},
    success: true,
    helperText: 'Richtig! "lese" ist korrekt.',
  },
  render: (args) => <InputWrapper {...args} />,
};

export const IncorrectAnswer: Story = {
  args: {
    value: 'lest',
    onChange: () => {},
    error: true,
    helperText: 'Die richtige Antwort ist "lese".',
  },
  render: (args) => <InputWrapper {...args} />,
};

// All States
export const AllStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input value="" onChange={() => {}} placeholder="Default state" />
      <Input value="With value" onChange={() => {}} />
      <Input value="Success" onChange={() => {}} success helperText="Correct!" />
      <Input value="Error" onChange={() => {}} error helperText="Incorrect" />
      <Input value="Disabled" onChange={() => {}} disabled />
    </div>
  ),
};
