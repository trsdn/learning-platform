import React from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /**
   * Current input value
   */
  value: string;

  /**
   * Change handler
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Whether the input is in an error state
   * @default false
   */
  error?: boolean;

  /**
   * Whether the input is in a success state
   * @default false
   */
  success?: boolean;

  /**
   * Helper text displayed below the input
   */
  helperText?: string;

  /**
   * Whether the input should take full width of container
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Input Component
 *
 * A reusable text input component with validation states and accessibility features.
 * Used in cloze deletion, text input tasks, and word scramble.
 *
 * @example
 * ```tsx
 * <Input
 *   value={answer}
 *   onChange={(e) => setAnswer(e.target.value)}
 *   placeholder="Enter your answer"
 *   error={showFeedback && !isCorrect}
 *   success={showFeedback && isCorrect}
 * />
 * ```
 */
export function Input({
  value,
  onChange,
  error = false,
  success = false,
  helperText,
  fullWidth = false,
  disabled = false,
  className,
  style,
  id,
  ...props
}: InputProps) {
  const helperId = helperText ? `${id || 'input'}-helper` : undefined;

  return (
    <div
      className={clsx(
        styles['input-wrapper'],
        fullWidth && styles['input-wrapper--full-width']
      )}
    >
      <input
        {...props}
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={style}
        className={clsx(
          styles.input,
          fullWidth && styles['input--full-width'],
          error && styles['input--error'],
          success && styles['input--success'],
          className
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={helperId}
      />

      {helperText && (
        <div
          id={helperId}
          className={clsx(
            styles.input__helper_text,
            error && styles['input__helper-text--error'],
            success && styles['input__helper-text--success']
          )}
        >
          {helperText}
        </div>
      )}
    </div>
  );
}

export default Input;
