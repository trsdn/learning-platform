import React from 'react';
import { colors, spacing, typography, transitions, components } from '@ui/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Whether the button takes up the full width of its container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Optional icon to display before the button text
   */
  startIcon?: React.ReactNode;

  /**
   * Optional icon to display after the button text
   */
  endIcon?: React.ReactNode;
}

/**
 * Button Component
 *
 * A reusable button component with multiple variants, sizes, and states.
 * Built with design tokens for consistency across the application.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 *
 * <Button variant="secondary" size="small" loading>
 *   Loading...
 * </Button>
 *
 * <Button variant="danger" startIcon={<TrashIcon />}>
 *   Delete
 * </Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  children,
  className = '',
  style = {},
  ...props
}: ButtonProps) {
  // Get variant styles
  const variantStyles = getVariantStyles(variant);

  // Get size styles
  const sizeStyles = getSizeStyles(size);

  // Combine all styles
  const buttonStyles: React.CSSProperties = {
    // Base styles
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    border: 'none',
    borderRadius: components.button.borderRadius,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: transitions.presets.colors,
    textDecoration: 'none',
    userSelect: 'none',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',

    // Variant styles
    ...variantStyles,

    // Size styles
    ...sizeStyles,

    // Opacity for disabled/loading state
    opacity: disabled || loading ? 0.6 : 1,

    // Custom styles
    ...style,
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={buttonStyles}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          const hoverStyles = getVariantHoverStyles(variant);
          Object.assign(e.currentTarget.style, hoverStyles);
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, variantStyles);
        }
        props.onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.outline = `2px solid ${colors.primary[300]}`;
          e.currentTarget.style.outlineOffset = '2px';
        }
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
        props.onBlur?.(e);
      }}
    >
      {loading ? (
        <>
          <LoadingSpinner size={size} />
          {children}
        </>
      ) : (
        <>
          {startIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{startIcon}</span>}
          {children}
          {endIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{endIcon}</span>}
        </>
      )}
    </button>
  );
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

function getVariantStyles(variant: ButtonVariant): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    border: '2px solid transparent',
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: colors.primary[500],
        color: colors.neutral[0],
      };

    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: colors.neutral[200],
        color: colors.neutral[700],
      };

    case 'ghost':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: colors.neutral[700],
        border: `2px solid ${colors.neutral[300]}`,
      };

    case 'danger':
      return {
        ...baseStyles,
        backgroundColor: colors.error[500],
        color: colors.neutral[0],
      };

    default:
      return baseStyles;
  }
}

function getVariantHoverStyles(variant: ButtonVariant): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary[600],
      };

    case 'secondary':
      return {
        backgroundColor: colors.neutral[300],
      };

    case 'ghost':
      return {
        backgroundColor: colors.neutral[50],
        borderColor: colors.neutral[400],
      };

    case 'danger':
      return {
        backgroundColor: colors.error[600],
      };

    default:
      return {};
  }
}

// ============================================================================
// SIZE STYLES
// ============================================================================

function getSizeStyles(size: ButtonSize): React.CSSProperties {
  switch (size) {
    case 'small':
      return {
        height: components.button.height.sm,
        padding: components.button.padding.sm,
        fontSize: components.button.fontSize.sm,
      };

    case 'medium':
      return {
        height: components.button.height.md,
        padding: components.button.padding.md,
        fontSize: components.button.fontSize.md,
      };

    case 'large':
      return {
        height: components.button.height.lg,
        padding: components.button.padding.lg,
        fontSize: components.button.fontSize.lg,
      };

    default:
      return {};
  }
}

// ============================================================================
// LOADING SPINNER
// ============================================================================

interface LoadingSpinnerProps {
  size: ButtonSize;
}

function LoadingSpinner({ size }: LoadingSpinnerProps) {
  const spinnerSize = size === 'small' ? '12px' : size === 'large' ? '18px' : '16px';

  return (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: 'spin 1s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default Button;
