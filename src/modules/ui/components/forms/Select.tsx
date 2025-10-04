import React from 'react';
import clsx from 'clsx';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /**
   * Current selected value
   */
  value: string;

  /**
   * Change handler
   */
  onChange: (value: string) => void;

  /**
   * Array of options
   */
  options: SelectOption[];

  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Placeholder text when no value selected
   */
  placeholder?: string;

  /**
   * Whether the select is in an error state
   * @default false
   */
  error?: boolean;

  /**
   * Whether the select is in a success state
   * @default false
   */
  success?: boolean;

  /**
   * Full width of container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;

  /**
   * ID for the select element
   */
  id?: string;
}

/**
 * Select Component
 *
 * A reusable select dropdown component with validation states.
 * Used in matching tasks and other scenarios requiring selection.
 *
 * @example
 * ```tsx
 * <Select
 *   value={selectedOption}
 *   onChange={setSelectedOption}
 *   options={[
 *     { value: 'a', label: 'Option A' },
 *     { value: 'b', label: 'Option B' },
 *   ]}
 *   placeholder="Choose an option"
 * />
 * ```
 */
export function Select({
  value,
  onChange,
  options,
  disabled = false,
  placeholder,
  error = false,
  success = false,
  fullWidth = false,
  className,
  style,
  id,
}: SelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={style}
      className={clsx(
        styles.select,
        fullWidth && styles['select--full-width'],
        error && styles['select--error'],
        success && styles['select--success'],
        className
      )}
      aria-invalid={error ? "true" : "false"}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}

      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
