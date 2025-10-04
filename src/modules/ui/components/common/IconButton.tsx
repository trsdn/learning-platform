import React from 'react';
import clsx from 'clsx';
import styles from './IconButton.module.css';

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
  className,
  style,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={style}
      className={clsx(
        styles['icon-button'],
        styles[`icon-button--${variant}`],
        styles[`icon-button--${size}`],
        showLabel && styles['icon-button--with-label'],
        className
      )}
      title={label}
      aria-label={label}
    >
      <span className={styles['icon-button__icon']}>
        {icon}
      </span>
      {showLabel && label && (
        <span className={styles['icon-button__label']}>{label}</span>
      )}
    </button>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default IconButton;
