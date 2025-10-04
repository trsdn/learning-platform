import React from 'react';
import {
  semanticColors,
  spacing,
  typography,
  borderRadius,
  transitions,
} from '@ui/design-tokens';

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
  className = '',
  style = {},
  id,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const helperId = helperText ? `${id || 'input'}-helper` : undefined;

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

  const inputStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.sans,
    color: disabled ? semanticColors.text.disabled : semanticColors.text.primary,
    backgroundColor: getBackgroundColor(),
    border: `2px solid ${getBorderColor()}`,
    borderRadius: borderRadius.md,
    outline: 'none',
    transition: transitions.presets.fast,
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: isFocused && !disabled ? `0 0 0 3px ${semanticColors.interactive.primary}20` : 'none',
    ...style,
  };

  return (
    <div style={{ display: 'inline-block', width: fullWidth ? '100%' : 'auto' }}>
      <input
        {...props}
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={inputStyles}
        className={className}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={helperId}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      />

      {helperText && (
        <div
          id={helperId}
          style={{
            marginTop: spacing[1],
            fontSize: typography.fontSize.sm,
            color: error
              ? semanticColors.feedback.error
              : success
              ? semanticColors.feedback.success
              : semanticColors.text.secondary,
          }}
        >
          {helperText}
        </div>
      )}
    </div>
  );
}

export default Input;
