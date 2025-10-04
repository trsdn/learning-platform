import React from 'react';
import {
  semanticColors,
  spacing,
  typography,
  borderRadius,
  transitions,
  colors,
} from '@ui/design-tokens';

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
  className = '',
  style = {},
  id,
  ...props
}: CheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id || `checkbox-${generatedId}`;

  const getCheckboxColor = () => {
    if (disabled) return semanticColors.border.light;
    if (error) return semanticColors.feedback.errorBorder;
    if (success) return semanticColors.feedback.successBorder;
    if (checked) return colors.primary[500];
    return semanticColors.border.base;
  };

  const getBackgroundColor = () => {
    if (disabled && checked) return semanticColors.background.tertiary;
    if (checked) return colors.primary[500];
    if (error) return semanticColors.feedback.errorLight;
    if (success) return semanticColors.feedback.successLight;
    return semanticColors.background.primary;
  };

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    ...style,
  };

  const checkboxStyles: React.CSSProperties = {
    width: '1.25rem',
    height: '1.25rem',
    marginRight: label ? spacing[2] : 0,
    appearance: 'none',
    backgroundColor: getBackgroundColor(),
    border: `2px solid ${getCheckboxColor()}`,
    borderRadius: borderRadius.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: transitions.presets.fast,
    position: 'relative',
    flexShrink: 0,
  };

  // Checkmark styles (created using ::after pseudo-element via inline style workaround)
  const checkmarkOverlayStyles: React.CSSProperties = checked
    ? {
        position: 'absolute',
        left: '0.35rem',
        top: '0.15rem',
        width: '0.4rem',
        height: '0.7rem',
        border: 'solid white',
        borderWidth: '0 2px 2px 0',
        transform: 'rotate(45deg)',
        pointerEvents: 'none',
      }
    : { display: 'none' };

  return (
    <label htmlFor={checkboxId} style={containerStyles} className={className}>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <input
          {...props}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={checkboxStyles}
          aria-checked={checked}
          aria-invalid={error}
          onFocus={(e) => {
            if (!disabled) {
              e.currentTarget.style.outline = `2px solid ${colors.primary[300]}`;
              e.currentTarget.style.outlineOffset = '2px';
            }
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
            props.onBlur?.(e);
          }}
        />
        <div style={checkmarkOverlayStyles} />
      </div>

      {label && (
        <span
          style={{
            fontSize: typography.fontSize.base,
            color: disabled ? semanticColors.text.disabled : semanticColors.text.primary,
            lineHeight: typography.lineHeight.normal,
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
