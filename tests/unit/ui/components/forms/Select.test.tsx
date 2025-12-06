/**
 * Tests for Select Component
 *
 * Tests the select functionality including:
 * - Rendering with required and optional props
 * - Options rendering
 * - Value changes and onChange callbacks
 * - Disabled states (component and individual options)
 * - Accessibility (aria attributes, roles)
 * - Validation states (error, success)
 * - Full width mode
 * - Placeholder functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectOption } from '@/modules/ui/components/forms/Select';

// Mock CSS module
vi.mock('@/modules/ui/components/forms/Select.module.css', () => ({
  default: {
    'select': 'select',
    'select--full-width': 'select--full-width',
    'select--error': 'select--error',
    'select--success': 'select--success',
  },
}));

const mockOptions: SelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('Select', () => {
  describe('Rendering', () => {
    it('should render with empty value', () => {
      const handleChange = vi.fn();
      render(<Select value="" onChange={handleChange} options={mockOptions} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      const handleChange = vi.fn();
      render(<Select value="option2" onChange={handleChange} options={mockOptions} />);

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });

    it('should render all options', () => {
      const handleChange = vi.fn();
      render(<Select value="" onChange={handleChange} options={mockOptions} />);

      expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      const handleChange = vi.fn();
      render(
        <Select
          value=""
          onChange={handleChange}
          options={mockOptions}
          placeholder="Select an option"
        />
      );

      expect(screen.getByRole('option', { name: 'Select an option' })).toBeInTheDocument();
    });

    it('should make placeholder option disabled', () => {
      const handleChange = vi.fn();
      render(
        <Select
          value=""
          onChange={handleChange}
          options={mockOptions}
          placeholder="Select an option"
        />
      );

      const placeholderOption = screen.getByRole('option', { name: 'Select an option' }) as HTMLOptionElement;
      expect(placeholderOption).toBeDisabled();
    });

    it('should not render placeholder when not provided', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select value="option1" onChange={handleChange} options={mockOptions} />
      );

      const select = container.querySelector('select');
      expect(select?.querySelectorAll('option').length).toBe(mockOptions.length);
    });

    it('should apply custom className', () => {
      const handleChange = vi.fn();
      render(
        <Select
          value=""
          onChange={handleChange}
          options={mockOptions}
          className="custom-select"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('custom-select');
    });

    it('should apply custom styles', () => {
      const handleChange = vi.fn();
       
      render(
        <Select
          value=""
          onChange={handleChange}
          options={mockOptions}
          style={{ padding: '20px' }} // eslint-disable-line no-restricted-syntax
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveStyle({ padding: '20px' });
    });

    it('should use provided id', () => {
      const handleChange = vi.fn();
      render(
        <Select
          value=""
          onChange={handleChange}
          options={mockOptions}
          id="test-select"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('id', 'test-select');
    });
  });

  describe('Options', () => {
    it('should render options with correct values', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select value="" onChange={handleChange} options={mockOptions} />
      );

      const optionElements = container.querySelectorAll('option');
      const dataOptions = Array.from(optionElements).filter(opt => opt.value !== '');

      expect(dataOptions).toHaveLength(3);
      expect(dataOptions[0]).toHaveValue('option1');
      expect(dataOptions[1]).toHaveValue('option2');
      expect(dataOptions[2]).toHaveValue('option3');
    });

    it('should render options with correct labels', () => {
      const handleChange = vi.fn();
      render(<Select value="" onChange={handleChange} options={mockOptions} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should handle disabled options', () => {
      const handleChange = vi.fn();
      const optionsWithDisabled: SelectOption[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
        { value: 'option3', label: 'Option 3' },
      ];

      render(<Select value="" onChange={handleChange} options={optionsWithDisabled} />);

      const option2 = screen.getByRole('option', { name: 'Option 2' }) as HTMLOptionElement;
      expect(option2).toBeDisabled();
    });

    it('should render empty options array', () => {
      const handleChange = vi.fn();
      const { container } = render(<Select value="" onChange={handleChange} options={[]} />);

      const select = container.querySelector('select');
      expect(select?.querySelectorAll('option').length).toBe(0);
    });

    it('should handle options with special characters', () => {
      const handleChange = vi.fn();
      const specialOptions: SelectOption[] = [
        { value: 'opt1', label: 'Option with "quotes"' },
        { value: 'opt2', label: 'Option with <tags>' },
        { value: 'opt3', label: 'Option & symbols' },
      ];

      render(<Select value="" onChange={handleChange} options={specialOptions} />);

      expect(screen.getByText('Option with "quotes"')).toBeInTheDocument();
      expect(screen.getByText('Option with <tags>')).toBeInTheDocument();
      expect(screen.getByText('Option & symbols')).toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('should reflect value prop changes', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Select value="option1" onChange={handleChange} options={mockOptions} />
      );

      let select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('option1');

      rerender(<Select value="option2" onChange={handleChange} options={mockOptions} />);
      select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });

    it('should maintain controlled state', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Select value="option1" onChange={handleChange} options={mockOptions} />);

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      await user.selectOptions(select, 'option2');

      expect(handleChange).toHaveBeenCalledWith('option2');
      // Select should still have original value as it's controlled
      expect(select.value).toBe('option1');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when option is selected', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Select value="" onChange={handleChange} options={mockOptions} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option2');

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('should call onChange with correct value for each selection', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { rerender } = render(
        <Select value="" onChange={handleChange} options={mockOptions} />
      );

      const select = screen.getByRole('combobox');

      await user.selectOptions(select, 'option1');
      expect(handleChange).toHaveBeenLastCalledWith('option1');

      rerender(<Select value="option1" onChange={handleChange} options={mockOptions} />);

      await user.selectOptions(select, 'option2');
      expect(handleChange).toHaveBeenLastCalledWith('option2');
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Select value="" onChange={handleChange} options={mockOptions} disabled />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option1');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Select value="" onChange={handleChange} options={mockOptions} />);

      const select = screen.getByRole('combobox');

      // Focus the select
      await user.click(select);

      // Select should be focusable
      expect(select).toHaveFocus();
    });
  });

  describe('Disabled State', () => {
    it('should render as disabled', () => {
      const handleChange = vi.fn();
      render(<Select value="" onChange={handleChange} options={mockOptions} disabled />);

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('should not respond to user interactions when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Select value="" onChange={handleChange} options={mockOptions} disabled />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option1');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should not be focusable when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Select value="" onChange={handleChange} options={mockOptions} disabled />);

      const select = screen.getByRole('combobox');
      await user.tab();

      expect(select).not.toHaveFocus();
    });
  });

  describe('Validation States', () => {
    it('should render error state', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select value="" onChange={handleChange} options={mockOptions} error />
      );

      const select = container.querySelector('.select');
      expect(select).toHaveClass('select--error');
    });

    it('should render success state', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select value="" onChange={handleChange} options={mockOptions} success />
      );

      const select = container.querySelector('.select');
      expect(select).toHaveClass('select--success');
    });

    it('should not apply validation classes by default', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select value="" onChange={handleChange} options={mockOptions} />
      );

      const select = container.querySelector('.select');
      expect(select).not.toHaveClass('select--error');
      expect(select).not.toHaveClass('select--success');
    });
  });

  describe('Full Width Mode', () => {
    it('should apply full width class', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select value="" onChange={handleChange} options={mockOptions} fullWidth />
      );

      const select = container.querySelector('.select');
      expect(select).toHaveClass('select--full-width');
    });

    it('should not apply full width class by default', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select value="" onChange={handleChange} options={mockOptions} />
      );

      const select = container.querySelector('.select');
      expect(select).not.toHaveClass('select--full-width');
    });
  });

  describe('Accessibility', () => {
    it('should have combobox role', () => {
      const handleChange = vi.fn();
      render(<Select value="" onChange={handleChange} options={mockOptions} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should have aria-invalid="false" by default', () => {
      const handleChange = vi.fn();
      render(<Select value="" onChange={handleChange} options={mockOptions} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-invalid="true" when error is true', () => {
      const handleChange = vi.fn();
      render(<Select value="" onChange={handleChange} options={mockOptions} error />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Select value="" onChange={handleChange} options={mockOptions} />);

      const select = screen.getByRole('combobox');

      // Tab to select
      await user.tab();
      expect(select).toHaveFocus();

      // Select should be navigable
      expect(select).not.toBeDisabled();
    });

    it('should have option role for each option', () => {
      const handleChange = vi.fn();
      render(<Select value="" onChange={handleChange} options={mockOptions} />);

      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(mockOptions.length);
    });
  });

  describe('Placeholder Value', () => {
    it('should have empty string value for placeholder', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Select
          value=""
          onChange={handleChange}
          options={mockOptions}
          placeholder="Choose one"
        />
      );

      const placeholderOption = container.querySelector('option[disabled]') as HTMLOptionElement;
      expect(placeholderOption?.value).toBe('');
    });

    it('should not select disabled placeholder when user tries', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select
          value="option1"
          onChange={handleChange}
          options={mockOptions}
          placeholder="Choose one"
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;

      // Try to select the placeholder (empty string)
      await user.selectOptions(select, '');

      // The browser should prevent selecting a disabled option
      expect(select.value).toBe('option1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle many options', () => {
      const handleChange = vi.fn();
      const manyOptions: SelectOption[] = Array.from({ length: 100 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      render(<Select value="" onChange={handleChange} options={manyOptions} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should handle options with duplicate values', () => {
      const handleChange = vi.fn();
      const duplicateOptions: SelectOption[] = [
        { value: 'same', label: 'First' },
        { value: 'same', label: 'Second' },
      ];

      render(<Select value="" onChange={handleChange} options={duplicateOptions} />);

      // Both should render, but keys will handle uniqueness
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should handle empty string as valid option value', () => {
      const handleChange = vi.fn();
      const optionsWithEmpty: SelectOption[] = [
        { value: '', label: 'None' },
        { value: 'option1', label: 'Option 1' },
      ];

      render(<Select value="" onChange={handleChange} options={optionsWithEmpty} />);

      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('should handle long option labels', () => {
      const handleChange = vi.fn();
      const longLabelOptions: SelectOption[] = [
        { value: 'opt1', label: 'This is a very long option label that might wrap or overflow' },
      ];

      render(<Select value="" onChange={handleChange} options={longLabelOptions} />);

      expect(screen.getByText('This is a very long option label that might wrap or overflow')).toBeInTheDocument();
    });
  });

  describe('Dynamic Options', () => {
    it('should update when options change', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Select value="" onChange={handleChange} options={mockOptions} />
      );

      expect(screen.getAllByRole('option').length).toBe(mockOptions.length);

      const newOptions: SelectOption[] = [
        { value: 'new1', label: 'New 1' },
        { value: 'new2', label: 'New 2' },
      ];

      rerender(<Select value="" onChange={handleChange} options={newOptions} />);

      expect(screen.getByText('New 1')).toBeInTheDocument();
      expect(screen.getByText('New 2')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });
});
