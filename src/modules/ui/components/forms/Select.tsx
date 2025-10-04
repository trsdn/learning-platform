import React from 'react';
import {
  semanticColors,
  spacing,
  typography,
  borderRadius,
  transitions,
} from '@ui/design-tokens';

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
  className = '',
  style = {},
  id,
}: SelectProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const getBorderColor = () => {
    if (disabled) return semanticColors.border.light;
    if (error) return semanticColors.feedback.errorBorder;
    if (success) return semanticColors.feedback.successBorder;
    if (isFocused) return semanticColors.interactive.primary;
    return semanticColors.border.base;
  };

  const getBackgroundColor = () => {
    if (disabled) return semanticColors.background.tertiary;
    if (error) return semanticColors.feedback.errorLight;
    if (success) return semanticColors.feedback.successLight;
    return semanticColors.background.primary;
  };

  const selectStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    padding: `${spacing[2]} ${spacing[3]}`,
    paddingRight: spacing[8], // Room for dropdown arrow
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.sans,
    color: disabled ? semanticColors.text.disabled : semanticColors.text.primary,
    backgroundColor: getBackgroundColor(),
    border: `2px solid ${getBorderColor()}`,
    borderRadius: borderRadius.md,
    outline: 'none',
    transition: transitions.presets.fast,
    cursor: disabled ? 'not-allowed' : 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${spacing[2]} center`,
    boxShadow: isFocused && !disabled ? `0 0 0 3px ${semanticColors.interactive.primary}20` : 'none',
    ...style,
  };

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={selectStyles}
      className={className}
      aria-invalid={error ? "true" : "false"}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
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
