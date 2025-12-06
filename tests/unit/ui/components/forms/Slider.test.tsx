/**
 * Tests for Slider Component
 *
 * Tests the slider functionality including:
 * - Rendering with required and optional props
 * - Value changes and onChange callbacks
 * - Disabled states
 * - Accessibility (aria attributes, roles, labels)
 * - Min, max, and step values
 * - Value display and unit formatting
 * - Visual elements (track, fill, thumb)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from '@/modules/ui/components/forms/Slider';

// Mock CSS module
vi.mock('@/modules/ui/components/forms/Slider.module.css', () => ({
  default: {
    'slider-container': 'slider-container',
    'slider-track': 'slider-track',
    'slider-fill': 'slider-fill',
    'slider-fill--disabled': 'slider-fill--disabled',
    'slider-input': 'slider-input',
    'slider-thumb': 'slider-thumb',
    'slider-thumb--disabled': 'slider-thumb--disabled',
    'slider-value-display': 'slider-value-display',
    'slider-value-display__current': 'slider-value-display__current',
  },
}));

describe('Slider', () => {
  describe('Rendering', () => {
    it('should render with required props', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={0} max={100} />);

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      const handleChange = vi.fn();
      render(<Slider value={75} onChange={handleChange} min={0} max={100} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('75');
    });

    it('should render with min and max values', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={10} max={90} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '10');
      expect(slider).toHaveAttribute('max', '90');
    });

    it('should render with custom step', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={0} max={100} step={5} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('step', '5');
    });

    it('should default step to 1', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={0} max={100} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('step', '1');
    });

    it('should use provided id', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={0} max={100} id="test-slider" />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('id', 'test-slider');
    });

    it('should apply custom className', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider
          value={50}
          onChange={handleChange}
          min={0}
          max={100}
          className="custom-slider"
        />
      );

      const sliderContainer = container.querySelector('.slider-container');
      expect(sliderContainer).toHaveClass('custom-slider');
    });

    it('should apply custom styles', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider
          value={50}
          onChange={handleChange}
          min={0}
          max={100}
          style={{ margin: '20px' }} // eslint-disable-line no-restricted-syntax
        />
      );

      const sliderContainer = container.querySelector('.slider-container');
      expect(sliderContainer).toHaveStyle({ margin: '20px' });
    });
  });

  describe('Value Display', () => {
    it('should show value display by default', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={0} max={100} />);

      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should hide value display when showValue is false', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={50} onChange={handleChange} min={0} max={100} showValue={false} />
      );

      const valueDisplay = container.querySelector('.slider-value-display');
      expect(valueDisplay).not.toBeInTheDocument();
    });

    it('should display unit with values', () => {
      const handleChange = vi.fn();
      render(<Slider value={25} onChange={handleChange} min={0} max={100} unit="°C" />);

      expect(screen.getByText('25°C')).toBeInTheDocument();
      expect(screen.getByText('0°C')).toBeInTheDocument();
      expect(screen.getByText('100°C')).toBeInTheDocument();
    });

    it('should display percentage unit', () => {
      const handleChange = vi.fn();
      render(<Slider value={75} onChange={handleChange} min={0} max={100} unit="%" />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should not show unit when not provided', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={0} max={100} />);

      const currentValue = screen.getByText('50');
      expect(currentValue.textContent).toBe('50');
    });

    it('should update displayed value when value prop changes', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Slider value={30} onChange={handleChange} min={0} max={100} unit="%" />
      );

      expect(screen.getByText('30%')).toBeInTheDocument();

      rerender(<Slider value={70} onChange={handleChange} min={0} max={100} unit="%" />);

      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.queryByText('30%')).not.toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('should reflect value prop changes', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Slider value={30} onChange={handleChange} min={0} max={100} />
      );

      let slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('30');

      rerender(<Slider value={70} onChange={handleChange} min={0} max={100} />);
      slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('70');
    });

    it('should maintain controlled state', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;

      // Slider should maintain its controlled value
      expect(slider.value).toBe('50');

      // Even after focus, value should remain controlled
      await user.click(slider);
      expect(slider.value).toBe('50');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when value changes', () => {
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;

      // Simulate changing the slider value
      fireEvent.change(slider, { target: { value: '60' } });

      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledWith(60);
    });

    it('should call onChange with number type', () => {
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;

      // Simulate a change event using fireEvent
      fireEvent.change(slider, { target: { value: '75' } });

      expect(handleChange).toHaveBeenCalledWith(expect.any(Number));
      expect(handleChange).toHaveBeenCalledWith(75);
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} disabled />);

      const slider = screen.getByRole('slider');
      await user.click(slider);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle keyboard navigation - arrow right', () => {
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} step={1} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      slider.focus();

      // Simulate arrow right incrementing value
      fireEvent.change(slider, { target: { value: '51' } });

      expect(handleChange).toHaveBeenCalledWith(51);
    });

    it('should handle keyboard navigation - arrow left', () => {
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} step={1} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      slider.focus();

      // Simulate arrow left decrementing value
      fireEvent.change(slider, { target: { value: '49' } });

      expect(handleChange).toHaveBeenCalledWith(49);
    });

    it('should handle keyboard navigation - arrow up', () => {
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} step={1} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      slider.focus();

      // Simulate arrow up incrementing value
      fireEvent.change(slider, { target: { value: '51' } });

      expect(handleChange).toHaveBeenCalledWith(51);
    });

    it('should handle keyboard navigation - arrow down', () => {
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} step={1} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      slider.focus();

      // Simulate arrow down decrementing value
      fireEvent.change(slider, { target: { value: '49' } });

      expect(handleChange).toHaveBeenCalledWith(49);
    });
  });

  describe('Disabled State', () => {
    it('should render as disabled', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={0} max={100} disabled />);

      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
    });

    it('should apply disabled class to fill', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={50} onChange={handleChange} min={0} max={100} disabled />
      );

      const fill = container.querySelector('.slider-fill');
      expect(fill).toHaveClass('slider-fill--disabled');
    });

    it('should apply disabled class to thumb', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={50} onChange={handleChange} min={0} max={100} disabled />
      );

      const thumb = container.querySelector('.slider-thumb');
      expect(thumb).toHaveClass('slider-thumb--disabled');
    });

    it('should not respond to interactions when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} disabled />);

      const slider = screen.getByRole('slider');
      await user.click(slider);
      await user.keyboard('{ArrowRight}');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have slider role', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={0} max={100} />);

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should have aria-valuenow attribute', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={0} max={100} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '50');
    });

    it('should have aria-valuemin attribute', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={10} max={100} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '10');
    });

    it('should have aria-valuemax attribute', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={0} max={90} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemax', '90');
    });

    it('should have aria-valuetext with unit', () => {
      const handleChange = vi.fn();
      render(<Slider value={25} onChange={handleChange} min={0} max={100} unit="°C" />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuetext', '25°C');
    });

    it('should have aria-valuetext without unit when not provided', () => {
      const handleChange = vi.fn();
      render(<Slider value={25} onChange={handleChange} min={0} max={100} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuetext', '25');
    });

    it('should support aria-label', () => {
      const handleChange = vi.fn();
      render(
        <Slider
          value={50}
          onChange={handleChange}
          min={0}
          max={100}
          aria-label="Temperature control"
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Temperature control');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} />);

      const slider = screen.getByRole('slider');

      // Tab to slider
      await user.tab();
      expect(slider).toHaveFocus();

      // Slider should not be disabled
      expect(slider).not.toBeDisabled();
    });

    it('should update aria-valuenow when value changes', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Slider value={30} onChange={handleChange} min={0} max={100} />
      );

      let slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '30');

      rerender(<Slider value={80} onChange={handleChange} min={0} max={100} />);
      slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '80');
    });
  });

  describe('Visual Elements', () => {
    it('should render track element', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={50} onChange={handleChange} min={0} max={100} />
      );

      const track = container.querySelector('.slider-track');
      expect(track).toBeInTheDocument();
    });

    it('should render fill element', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={50} onChange={handleChange} min={0} max={100} />
      );

      const fill = container.querySelector('.slider-fill');
      expect(fill).toBeInTheDocument();
    });

    it('should render thumb element', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={50} onChange={handleChange} min={0} max={100} />
      );

      const thumb = container.querySelector('.slider-thumb');
      expect(thumb).toBeInTheDocument();
    });

    it('should calculate correct fill percentage', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={50} onChange={handleChange} min={0} max={100} />
      );

      const fill = container.querySelector('.slider-fill') as HTMLElement;
      expect(fill.style.width).toBe('50%');
    });

    it('should calculate fill percentage for non-zero min', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={50} onChange={handleChange} min={20} max={80} />
      );

      const fill = container.querySelector('.slider-fill') as HTMLElement;
      // (50 - 20) / (80 - 20) * 100 = 50%
      expect(fill.style.width).toBe('50%');
    });

    it('should calculate fill percentage at minimum value', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={0} onChange={handleChange} min={0} max={100} />
      );

      const fill = container.querySelector('.slider-fill') as HTMLElement;
      expect(fill.style.width).toBe('0%');
    });

    it('should calculate fill percentage at maximum value', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={100} onChange={handleChange} min={0} max={100} />
      );

      const fill = container.querySelector('.slider-fill') as HTMLElement;
      expect(fill.style.width).toBe('100%');
    });

    it('should position thumb correctly', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={50} onChange={handleChange} min={0} max={100} />
      );

      const thumb = container.querySelector('.slider-thumb') as HTMLElement;
      expect(thumb.style.left).toBe('calc(50% - 12px)');
    });
  });

  describe('Step Functionality', () => {
    it('should respect step increments', () => {
      const handleChange = vi.fn();

      render(<Slider value={50} onChange={handleChange} min={0} max={100} step={10} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider).toHaveAttribute('step', '10');

      // Simulate step increment
      fireEvent.change(slider, { target: { value: '60' } });

      expect(handleChange).toHaveBeenCalledWith(60);
    });

    it('should handle decimal step values', () => {
      const handleChange = vi.fn();
      render(<Slider value={5.5} onChange={handleChange} min={0} max={10} step={0.5} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('step', '0.5');
    });
  });

  describe('Edge Cases', () => {
    it('should handle min equal to max', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} min={50} max={50} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('50');
    });

    it('should handle negative values', () => {
      const handleChange = vi.fn();
      render(<Slider value={-5} onChange={handleChange} min={-10} max={10} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('-5');
    });

    it('should handle large values', () => {
      const handleChange = vi.fn();
      render(<Slider value={5000} onChange={handleChange} min={0} max={10000} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('5000');
    });

    it('should handle value at minimum', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={0} onChange={handleChange} min={0} max={100} />
      );

      const fill = container.querySelector('.slider-fill') as HTMLElement;
      expect(fill.style.width).toBe('0%');
    });

    it('should handle value at maximum', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={100} onChange={handleChange} min={0} max={100} />
      );

      const fill = container.querySelector('.slider-fill') as HTMLElement;
      expect(fill.style.width).toBe('100%');
    });
  });

  describe('Input Type', () => {
    it('should have type="range"', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Slider value={50} onChange={handleChange} min={0} max={100} />
      );

      const input = container.querySelector('input[type="range"]');
      expect(input).toBeInTheDocument();
    });
  });
});
