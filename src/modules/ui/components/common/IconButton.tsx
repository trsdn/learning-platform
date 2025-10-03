import React from 'react';
import { colors, spacing, borderRadius, typography, transitions } from '@ui/design-tokens';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type IconButtonSize = 'small' | 'medium' | 'large';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant of the button
   * @default 'ghost'
   */
  variant?: IconButtonVariant;

  /**
   * Size of the button
   * @default 'medium'
   */
  size?: IconButtonSize;

  /**
   * Icon to display (should be an SVG or icon component)
   */
  icon: React.ReactNode;

  /**
   * Optional label for accessibility
   * If provided, will be shown as a tooltip on hover
   */
  label?: string;

  /**
   * Whether to show the label next to the icon
   * @default false
   */
  showLabel?: boolean;
}

/**
 * IconButton Component
 *
 * A button component specifically designed for icon-only or icon+label buttons.
 * Commonly used for actions like close, up/down arrows, settings, etc.
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon={<CloseIcon />}
 *   label="Close"
 *   onClick={handleClose}
 * />
 *
 * <IconButton
 *   icon={<ArrowUpIcon />}
 *   label="Move up"
 *   variant="secondary"
 *   size="small"
 * />
 *
 * <IconButton
 *   icon={<SettingsIcon />}
 *   label="Settings"
 *   showLabel
 * />
 * ```
 */
export function IconButton({
  variant = 'ghost',
  size = 'medium',
  icon,
  label,
  showLabel = false,
  disabled = false,
  className = '',
  style = {},
  ...props
}: IconButtonProps) {
  // Get variant styles
  const variantStyles = getVariantStyles(variant, disabled);

  // Get size styles
  const sizeStyles = getSizeStyles(size);

  // Combine all styles
  const buttonStyles: React.CSSProperties = {
    // Base styles
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: showLabel ? spacing[2] : 0,
    border: 'none',
    borderRadius: borderRadius.md,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: transitions.presets.colors,
    textDecoration: 'none',
    userSelect: 'none',
    outline: 'none',
    padding: showLabel ? `${spacing[2]} ${spacing[3]}` : spacing[2],

    // Variant styles
    ...variantStyles,

    // Size styles
    ...sizeStyles,

    // Opacity for disabled state
    opacity: disabled ? 0.6 : 1,

    // Custom styles
    ...style,
  };

  return (
    <button
      {...props}
      disabled={disabled}
      style={buttonStyles}
      className={className}
      title={label}
      aria-label={label}
      onMouseEnter={(e) => {
        if (!disabled) {
          const hoverStyles = getVariantHoverStyles(variant);
          Object.assign(e.currentTarget.style, hoverStyles);
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, variantStyles);
        }
        props.onMouseLeave?.(e);
      }}
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
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </span>
      {showLabel && label && (
        <span style={{ fontSize: typography.fontSize.sm }}>{label}</span>
      )}
    </button>
  );
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

function getVariantStyles(variant: IconButtonVariant, isDisabled: boolean): React.CSSProperties {
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
        backgroundColor: colors.neutral[100],
        color: colors.neutral[700],
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

function getVariantHoverStyles(variant: IconButtonVariant): React.CSSProperties {
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
        backgroundColor: colors.neutral[200],
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

function getSizeStyles(size: IconButtonSize): React.CSSProperties {
  switch (size) {
    case 'small':
      return {
        minWidth: spacing[7],
        minHeight: spacing[7],
        fontSize: typography.fontSize.sm,
      };

    case 'medium':
      return {
        minWidth: spacing[9],
        minHeight: spacing[9],
        fontSize: typography.fontSize.base,
      };

    case 'large':
      return {
        minWidth: spacing[11],
        minHeight: spacing[11],
        fontSize: typography.fontSize.lg,
      };

    default:
      return {};
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default IconButton;
