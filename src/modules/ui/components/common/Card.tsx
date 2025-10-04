import React from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

export type CardPadding = 'small' | 'medium' | 'large';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Padding size variant
   * @default 'medium'
   */
  padding?: CardPadding;

  /**
   * Whether to show shadow
   * @default true
   */
  shadow?: boolean;

  /**
   * Whether to show border
   * @default true
   */
  border?: boolean;

  /**
   * Custom border color (overrides default)
   */
  borderColor?: string;

  /**
   * Background color (overrides default)
   */
  backgroundColor?: string;

  /**
   * Card content
   */
  children: React.ReactNode;
}

/**
 * Card Component
 *
 * A versatile container component with consistent styling using CSS Modules.
 * Serves as the foundation for more specialized card components.
 *
 * @example
 * ```tsx
 * <Card padding="medium" shadow>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * <Card padding="large" border={false}>
 *   <div>Custom content</div>
 * </Card>
 * ```
 */
export function Card({
  padding = 'medium',
  shadow = true,
  border = true,
  borderColor,
  backgroundColor,
  children,
  className,
  style,
  ...props
}: CardProps) {
  // Build inline styles for custom overrides only
  const customStyles: React.CSSProperties = {
    ...(backgroundColor && { backgroundColor }),
    ...(borderColor && { borderColor }),
    ...style,
  };

  return (
    <div
      {...props}
      style={customStyles}
      className={clsx(
        styles.card,
        styles[`card--padding-${padding}`],
        shadow ? styles['card--shadow'] : styles['card--no-shadow'],
        border ? styles['card--border'] : styles['card--no-border'],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default Card;
