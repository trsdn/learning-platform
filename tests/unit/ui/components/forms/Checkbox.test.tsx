/**
 * Tests for Checkbox Component
 *
 * Tests the checkbox functionality including:
 * - Rendering with required and optional props
 * - Controlled mode
 * - Value changes and onChange callbacks
 * - Disabled states
 * - Accessibility (labels, roles, aria attributes)
 * - Validation states (error, success)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '@/modules/ui/components/forms/Checkbox';

// Mock CSS module
vi.mock('@/modules/ui/components/forms/Checkbox.module.css', () => ({
  default: {
    'checkbox-container': 'checkbox-container',
    'checkbox-container--disabled': 'checkbox-container--disabled',
    'checkbox-wrapper': 'checkbox-wrapper',
    'checkbox': 'checkbox',
    'checkbox--with-label': 'checkbox--with-label',
    'checkbox--error': 'checkbox--error',
    'checkbox--success': 'checkbox--success',
    'checkbox__checkmark': 'checkbox__checkmark',
    'checkbox__checkmark--visible': 'checkbox__checkmark--visible',
    'checkbox__label': 'checkbox__label',
    'checkbox__label--disabled': 'checkbox__label--disabled',
  },
}));

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('should render unchecked checkbox', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('should render checked checkbox', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={true} onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });

    it('should render with label text', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} label="Accept terms" />);

      expect(screen.getByText('Accept terms')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render with React node label', () => {
      const handleChange = vi.fn();
      const label = (
        <span>
          I agree to <a href="/terms">terms</a>
        </span>
      );
      render(<Checkbox checked={false} onChange={handleChange} label={label} />);

      expect(screen.getByText('I agree to')).toBeInTheDocument();
      expect(screen.getByText('terms')).toBeInTheDocument();
    });

    it('should render without label', () => {
      const handleChange = vi.fn();
      const { container } = render(<Checkbox checked={false} onChange={handleChange} />);

      expect(container.querySelector('.checkbox__label')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const handleChange = vi.fn();
      const { container } = render(<Checkbox checked={false} onChange={handleChange} className="custom-class" />);

      const label = container.querySelector('label');
      expect(label).toHaveClass('custom-class');
    });

    it('should apply custom styles', () => {
      const handleChange = vi.fn();
      // eslint-disable-next-line no-restricted-syntax -- Testing inline style functionality
      const { container } = render(<Checkbox checked={false} onChange={handleChange} style={{ margin: '10px' }} />);

      const label = container.querySelector('label');
      expect(label).toHaveStyle({ margin: '10px' });
    });

    it('should use provided id', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} id="test-checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
    });

    it('should generate unique id when not provided', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <>
          <Checkbox checked={false} onChange={handleChange} />
          <Checkbox checked={false} onChange={handleChange} />
        </>
      );

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes[0].id).toBeTruthy();
      expect(checkboxes[1].id).toBeTruthy();
      expect(checkboxes[0].id).not.toBe(checkboxes[1].id);
    });
  });

  describe('Controlled Mode', () => {
    it('should reflect checked prop changes', () => {
      const handleChange = vi.fn();
      const { rerender } = render(<Checkbox checked={false} onChange={handleChange} />);

      let checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      rerender(<Checkbox checked={true} onChange={handleChange} />);
      checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should maintain controlled state', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox checked={false} onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
      // Checkbox should remain unchecked as it's controlled
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox checked={false} onChange={handleChange} label="Click me" />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.any(Object)
      }));
    });

    it('should call onChange when label is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox checked={false} onChange={handleChange} label="Click me" />);

      const label = screen.getByText('Click me');
      await user.click(label);

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should toggle between checked and unchecked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { rerender } = render(<Checkbox checked={false} onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);

      rerender(<Checkbox checked={true} onChange={handleChange} />);
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(2);
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox checked={false} onChange={handleChange} disabled />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should support keyboard interaction', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox checked={false} onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('should render as disabled', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} disabled />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should apply disabled class to container', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={false} onChange={handleChange} disabled label="Disabled" />
      );

      const labelElement = container.querySelector('label');
      expect(labelElement).toHaveClass('checkbox-container--disabled');
    });

    it('should apply disabled class to label text', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={false} onChange={handleChange} disabled label="Disabled" />
      );

      const labelText = container.querySelector('.checkbox__label');
      expect(labelText).toHaveClass('checkbox__label--disabled');
    });

    it('should not respond to clicks when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox checked={false} onChange={handleChange} disabled label="Disabled" />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Validation States', () => {
    it('should render error state', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={false} onChange={handleChange} error />
      );

      const checkbox = container.querySelector('.checkbox');
      expect(checkbox).toHaveClass('checkbox--error');
    });

    it('should render success state', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={false} onChange={handleChange} success />
      );

      const checkbox = container.querySelector('.checkbox');
      expect(checkbox).toHaveClass('checkbox--success');
    });

    it('should not apply validation classes by default', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={false} onChange={handleChange} />
      );

      const checkbox = container.querySelector('.checkbox');
      expect(checkbox).not.toHaveClass('checkbox--error');
      expect(checkbox).not.toHaveClass('checkbox--success');
    });

    it('should apply error state with checked checkbox', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={true} onChange={handleChange} error />
      );

      const checkbox = container.querySelector('.checkbox');
      expect(checkbox).toHaveClass('checkbox--error');
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('should apply success state with checked checkbox', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={true} onChange={handleChange} success />
      );

      const checkbox = container.querySelector('.checkbox');
      expect(checkbox).toHaveClass('checkbox--success');
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should have checkbox role', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should have correct aria-checked attribute', () => {
      const handleChange = vi.fn();
      const { rerender } = render(<Checkbox checked={false} onChange={handleChange} />);

      let checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      rerender(<Checkbox checked={true} onChange={handleChange} />);
      checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should have aria-invalid when error is true', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} error />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not have aria-invalid when error is false', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'false');
    });

    it('should associate label with input via htmlFor', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} id="test-id" label="Test Label" />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Test Label').closest('label');

      expect(checkbox.id).toBe('test-id');
      expect(label).toHaveAttribute('for', 'test-id');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox checked={false} onChange={handleChange} label="Keyboard test" />);

      const checkbox = screen.getByRole('checkbox');

      // Tab to checkbox
      await user.tab();
      expect(checkbox).toHaveFocus();

      // Space to toggle
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Checkmark Visibility', () => {
    it('should show checkmark when checked', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={true} onChange={handleChange} />
      );

      const checkmark = container.querySelector('.checkbox__checkmark');
      expect(checkmark).toHaveClass('checkbox__checkmark--visible');
    });

    it('should not show checkmark when unchecked', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={false} onChange={handleChange} />
      );

      const checkmark = container.querySelector('.checkbox__checkmark');
      expect(checkmark).not.toHaveClass('checkbox__checkmark--visible');
    });

    it('should toggle checkmark visibility with state changes', () => {
      const handleChange = vi.fn();
      const { container, rerender } = render(
        <Checkbox checked={false} onChange={handleChange} />
      );

      let checkmark = container.querySelector('.checkbox__checkmark');
      expect(checkmark).not.toHaveClass('checkbox__checkmark--visible');

      rerender(<Checkbox checked={true} onChange={handleChange} />);
      checkmark = container.querySelector('.checkbox__checkmark');
      expect(checkmark).toHaveClass('checkbox__checkmark--visible');
    });
  });

  describe('Label Association', () => {
    it('should apply with-label class when label is provided', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={false} onChange={handleChange} label="Test" />
      );

      const checkbox = container.querySelector('.checkbox');
      expect(checkbox).toHaveClass('checkbox--with-label');
    });

    it('should not apply with-label class when label is not provided', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={false} onChange={handleChange} />
      );

      const checkbox = container.querySelector('.checkbox');
      expect(checkbox).not.toHaveClass('checkbox--with-label');
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through additional props', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox
          checked={false}
          onChange={handleChange}
          data-testid="custom-checkbox"
          aria-describedby="description"
        />
      );

      const checkbox = screen.getByTestId('custom-checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'description');
    });

    it('should have type="checkbox"', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });
  });
});
