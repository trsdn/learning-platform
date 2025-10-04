import React from 'react';
import clsx from 'clsx';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /**
   * Whether the checkbox is checked
   */
  checked: boolean;

  /**
   * Change handler
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Label content (text or React node)
   */
  label?: React.ReactNode;

  /**
   * Whether the checkbox is in an error state
   * @default false
   */
  error?: boolean;

  /**
   * Whether the checkbox is in a success state
   * @default false
   */
  success?: boolean;
}

/**
 * Checkbox Component
 *
 * A reusable checkbox component with custom styling and validation states.
 * Used in multiple-select tasks.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   checked={isSelected}
 *   onChange={(e) => setIsSelected(e.target.checked)}
 *   label="Option A"
 *   success={showFeedback && isCorrect}
 *   error={showFeedback && !isCorrect}
 * />
 * ```
 */
export function Checkbox({
  checked,
  onChange,
  label,
  error = false,
  success = false,
  disabled = false,
  className,
  style,
  id,
  ...props
}: CheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id || `checkbox-${generatedId}`;

  return (
    <label
      htmlFor={checkboxId}
      style={style}
      className={clsx(
        styles['checkbox-container'],
        disabled && styles['checkbox-container--disabled'],
        className
      )}
    >
      <div className={styles['checkbox-wrapper']}>
        <input
          {...props}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={clsx(
            styles.checkbox,
            label && styles['checkbox--with-label'],
            error && styles['checkbox--error'],
            success && styles['checkbox--success']
          )}
          aria-checked={checked}
          aria-invalid={error}
        />
        <div
          className={clsx(
            styles.checkbox__checkmark,
            checked && styles['checkbox__checkmark--visible']
          )}
        />
      </div>

      {label && (
        <span
          className={clsx(
            styles.checkbox__label,
            disabled && styles['checkbox__label--disabled']
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
