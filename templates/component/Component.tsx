import clsx from 'clsx';
import styles from './Component.module.css';

interface ComponentProps {
  /**
   * Main content to display
   */
  children?: React.ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Inline styles for truly dynamic values only
   * (e.g., colors based on state, percentage widths)
   */
  style?: React.CSSProperties;

  /**
   * Component variant
   */
  variant?: 'primary' | 'secondary' | 'ghost';

  /**
   * Component size
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
}

/**
 * Component - A reusable UI component with CSS Modules
 *
 * @example
 * <Component variant="primary" size="medium">
 *   Content here
 * </Component>
 */
export function Component({
  children,
  className,
  style,
  variant = 'primary',
  size = 'medium',
  disabled = false,
}: ComponentProps) {
  return (
    <div
      className={clsx(
        styles.component,
        styles[`component--${variant}`],
        styles[`component--${size}`],
        disabled && styles['component--disabled'],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
