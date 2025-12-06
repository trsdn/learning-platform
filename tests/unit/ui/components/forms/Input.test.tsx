/**
 * Tests for Input Component
 *
 * Tests the input functionality including:
 * - Rendering with required and optional props
 * - Controlled mode
 * - Value changes and onChange callbacks
 * - Disabled states
 * - Accessibility (aria attributes, helper text)
 * - Validation states (error, success)
 * - Full width mode
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/modules/ui/components/forms/Input';

// Mock CSS module
vi.mock('@/modules/ui/components/forms/Input.module.css', () => ({
  default: {
    'input-wrapper': 'input-wrapper',
    'input-wrapper--full-width': 'input-wrapper--full-width',
    'input': 'input',
    'input--full-width': 'input--full-width',
    'input--error': 'input--error',
    'input--success': 'input--success',
    'input__helper_text': 'input__helper_text',
    'input__helper-text--error': 'input__helper-text--error',
    'input__helper-text--success': 'input__helper-text--success',
  },
}));

describe('Input', () => {
  describe('Rendering', () => {
    it('should render with empty value', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    it('should render with initial value', () => {
      const handleChange = vi.fn();
      render(<Input value="Hello World" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Hello World');
    });

    it('should render with placeholder', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} placeholder="Enter text..." />);

      const input = screen.getByPlaceholderText('Enter text...');
      expect(input).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} helperText="This is helper text" />);

      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('should not render helper text when not provided', () => {
      const handleChange = vi.fn();
      const { container } = render(<Input value="" onChange={handleChange} />);

      const helperText = container.querySelector('.input__helper_text');
      expect(helperText).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} className="custom-input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('should apply custom styles', () => {
      const handleChange = vi.fn();
      // eslint-disable-next-line no-restricted-syntax -- Testing inline style functionality
      render(<Input value="" onChange={handleChange} style={{ padding: '20px' }} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveStyle({ padding: '20px' });
    });

    it('should use provided id', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} id="test-input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'test-input');
    });
  });

  describe('Controlled Mode', () => {
    it('should reflect value prop changes', () => {
      const handleChange = vi.fn();
      const { rerender } = render(<Input value="initial" onChange={handleChange} />);

      let input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial');

      rerender(<Input value="updated" onChange={handleChange} />);
      input = screen.getByRole('textbox');
      expect(input).toHaveValue('updated');
    });

    it('should maintain controlled state', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input value="controlled" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'x');

      expect(handleChange).toHaveBeenCalled();
      // Input should still have original value as it's controlled
      expect(input).toHaveValue('controlled');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'a');

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.any(Object)
      }));
    });

    it('should call onChange for each character typed', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');

      expect(handleChange).toHaveBeenCalledTimes(5);
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input value="" onChange={handleChange} disabled />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle paste events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.paste('pasted text');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle clear/delete operations', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input value="test" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should render as disabled', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should not respond to user input when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input value="disabled" onChange={handleChange} disabled />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('disabled');
    });

    it('should not be focusable when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input value="" onChange={handleChange} disabled />);

      const input = screen.getByRole('textbox');
      await user.tab();

      expect(input).not.toHaveFocus();
    });
  });

  describe('Validation States', () => {
    it('should render error state', () => {
      const handleChange = vi.fn();
      const { container } = render(<Input value="" onChange={handleChange} error />);

      const input = container.querySelector('.input');
      expect(input).toHaveClass('input--error');
    });

    it('should render success state', () => {
      const handleChange = vi.fn();
      const { container } = render(<Input value="" onChange={handleChange} success />);

      const input = container.querySelector('.input');
      expect(input).toHaveClass('input--success');
    });

    it('should not apply validation classes by default', () => {
      const handleChange = vi.fn();
      const { container } = render(<Input value="" onChange={handleChange} />);

      const input = container.querySelector('.input');
      expect(input).not.toHaveClass('input--error');
      expect(input).not.toHaveClass('input--success');
    });

    it('should apply error class to helper text', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Input value="" onChange={handleChange} error helperText="Error message" />
      );

      const helperText = container.querySelector('.input__helper_text');
      expect(helperText).toHaveClass('input__helper-text--error');
    });

    it('should apply success class to helper text', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Input value="" onChange={handleChange} success helperText="Success message" />
      );

      const helperText = container.querySelector('.input__helper_text');
      expect(helperText).toHaveClass('input__helper-text--success');
    });
  });

  describe('Full Width Mode', () => {
    it('should apply full width class to wrapper', () => {
      const handleChange = vi.fn();
      const { container } = render(<Input value="" onChange={handleChange} fullWidth />);

      const wrapper = container.querySelector('.input-wrapper');
      expect(wrapper).toHaveClass('input-wrapper--full-width');
    });

    it('should apply full width class to input', () => {
      const handleChange = vi.fn();
      const { container } = render(<Input value="" onChange={handleChange} fullWidth />);

      const input = container.querySelector('.input');
      expect(input).toHaveClass('input--full-width');
    });

    it('should not apply full width classes by default', () => {
      const handleChange = vi.fn();
      const { container } = render(<Input value="" onChange={handleChange} />);

      const wrapper = container.querySelector('.input-wrapper');
      const input = container.querySelector('.input');

      expect(wrapper).not.toHaveClass('input-wrapper--full-width');
      expect(input).not.toHaveClass('input--full-width');
    });
  });

  describe('Accessibility', () => {
    it('should have textbox role', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should have aria-invalid="false" by default', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-invalid="true" when error is true', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} error />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should associate helper text with aria-describedby', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} id="test-input" helperText="Helper text" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');

      const helperText = document.getElementById('test-input-helper');
      expect(helperText).toHaveTextContent('Helper text');
    });

    it('should generate aria-describedby even without explicit id', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} helperText="Helper text" />);

      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();

      const helperText = document.getElementById(describedBy!);
      expect(helperText).toHaveTextContent('Helper text');
    });

    it('should not have aria-describedby when no helper text', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('aria-describedby');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');

      // Tab to input
      await user.tab();
      expect(input).toHaveFocus();

      // Type in input
      await user.keyboard('test');
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Input Type', () => {
    it('should have type="text"', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through additional props', () => {
      const handleChange = vi.fn();
      render(
        <Input
          value=""
          onChange={handleChange}
          data-testid="custom-input"
          autoComplete="off"
        />
      );

      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('should support name attribute', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} name="username" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should support maxLength attribute', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} maxLength={10} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should support required attribute', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} required />);

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('should support readOnly attribute', () => {
      const handleChange = vi.fn();
      render(<Input value="readonly" onChange={handleChange} readOnly />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should handle numeric string value', () => {
      const handleChange = vi.fn();
      render(<Input value="12345" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('12345');
    });

    it('should handle special characters', () => {
      const handleChange = vi.fn();
      render(<Input value="!@#$%^&*()" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('!@#$%^&*()');
    });

    it('should handle long text values', () => {
      const handleChange = vi.fn();
      const longText = 'a'.repeat(1000);
      render(<Input value={longText} onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue(longText);
    });

    it('should handle unicode characters', () => {
      const handleChange = vi.fn();
      render(<Input value="Hello 世界 🌍" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Hello 世界 🌍');
    });
  });

  describe('Focus and Blur', () => {
    it('should handle focus events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      const handleChange = vi.fn();

      render(<Input value="" onChange={handleChange} onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle blur events', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      const handleChange = vi.fn();

      render(<Input value="" onChange={handleChange} onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });
});
