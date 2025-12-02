import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from './Slider';

const meta = {
  title: 'Forms/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'number' } },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    step: { control: { type: 'number' } },
    disabled: { control: 'boolean' },
    showValue: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;
type RenderStory = StoryObj<Meta>;

// Interactive wrapper
const SliderWrapper = (args: React.ComponentProps<typeof Slider>) => {
  const [value, setValue] = useState(args.value);
  return (
    <Slider
      {...args}
      value={value}
      onChange={setValue}
    />
  );
};

// Basic
export const Default: Story = {
  args: {
    value: 50,
    onChange: () => {},
    min: 0,
    max: 100,
  },
  render: (args) => <SliderWrapper {...args} />,
};

export const WithUnit: Story = {
  args: {
    value: 25,
    onChange: () => {},
    min: 0,
    max: 100,
    unit: '%',
  },
  render: (args) => <SliderWrapper {...args} />,
};

export const Temperature: Story = {
  args: {
    value: 20,
    onChange: () => {},
    min: -10,
    max: 40,
    unit: '°C',
    'aria-label': 'Temperature',
  },
  render: (args) => <SliderWrapper {...args} />,
};

// Different Ranges
export const SmallRange: Story = {
  args: {
    value: 5,
    onChange: () => {},
    min: 1,
    max: 10,
    step: 1,
  },
  render: (args) => <SliderWrapper {...args} />,
};

export const LargeRange: Story = {
  args: {
    value: 500,
    onChange: () => {},
    min: 0,
    max: 1000,
    step: 50,
  },
  render: (args) => <SliderWrapper {...args} />,
};

export const DecimalSteps: Story = {
  args: {
    value: 2.5,
    onChange: () => {},
    min: 0,
    max: 5,
    step: 0.5,
  },
  render: (args) => <SliderWrapper {...args} />,
};

// States
export const Disabled: Story = {
  args: {
    value: 50,
    onChange: () => {},
    min: 0,
    max: 100,
    disabled: true,
  },
  render: (args) => <SliderWrapper {...args} />,
};

export const WithoutValueDisplay: Story = {
  args: {
    value: 50,
    onChange: () => {},
    min: 0,
    max: 100,
    showValue: false,
  },
  render: (args) => <SliderWrapper {...args} />,
};

// Learning Task Example
export const SliderTask: RenderStory = {
  render: () => {
    const SliderTaskDemo = () => {
      const [value, setValue] = useState(1850);
      const [showFeedback, setShowFeedback] = useState(false);
      const correctAnswer = 1871;
      const tolerance = 5;

      const isCorrect = Math.abs(value - correctAnswer) <= tolerance;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            In welchem Jahr wurde das Deutsche Reich gegründet?
          </p>
          <Slider
            value={value}
            onChange={setValue}
            min={1800}
            max={1920}
            step={1}
            disabled={showFeedback}
            aria-label="Year selection"
          />
          <button
            onClick={() => setShowFeedback(true)}
            disabled={showFeedback}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: showFeedback ? '#ccc' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: showFeedback ? 'not-allowed' : 'pointer',
            }}
          >
            Check Answer
          </button>
          {showFeedback && (
            <p style={{
              margin: 0,
              color: isCorrect ? 'var(--color-success)' : 'var(--color-error)'
            }}>
              {isCorrect
                ? `Correct! The German Empire was founded in ${correctAnswer}.`
                : `Not quite. The correct answer is ${correctAnswer}. You selected ${value}.`}
            </p>
          )}
        </div>
      );
    };
    return <SliderTaskDemo />;
  },
};

// Volume Control Example
export const VolumeControl: RenderStory = {
  render: () => {
    const VolumeDemo = () => {
      const [volume, setVolume] = useState(70);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🔈</span>
            <span style={{ fontWeight: 500 }}>Volume</span>
          </div>
          <Slider
            value={volume}
            onChange={setVolume}
            min={0}
            max={100}
            unit="%"
            aria-label="Volume"
          />
        </div>
      );
    };
    return <VolumeDemo />;
  },
};

// All States
export const AllStates: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '300px' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Default</p>
        <Slider value={50} onChange={() => {}} min={0} max={100} />
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>With Unit</p>
        <Slider value={25} onChange={() => {}} min={0} max={100} unit="%" />
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Disabled</p>
        <Slider value={75} onChange={() => {}} min={0} max={100} disabled />
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Without Value Display</p>
        <Slider value={60} onChange={() => {}} min={0} max={100} showValue={false} />
      </div>
    </div>
  ),
};
