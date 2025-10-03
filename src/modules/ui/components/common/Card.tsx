import React from 'react';
import {
  semanticColors,
  components,
  transitions,
} from '@ui/design-tokens';

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
 * A versatile container component with consistent styling using design tokens.
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
  className = '',
  style = {},
  ...props
}: CardProps) {
  const paddingValue = getPaddingValue(padding);

  const cardStyles: React.CSSProperties = {
    backgroundColor: backgroundColor || semanticColors.background.primary,
    borderRadius: components.card.borderRadius,
    border: border
      ? `1px solid ${borderColor || semanticColors.border.light}`
      : 'none',
    boxShadow: shadow ? components.card.shadow : 'none',
    padding: paddingValue,
    transition: transitions.presets.fast,
    ...style,
  };

  return (
    <div {...props} style={cardStyles} className={className}>
      {children}
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPaddingValue(padding: CardPadding): string {
  switch (padding) {
    case 'small':
      return components.card.padding.sm;
    case 'medium':
      return components.card.padding.md;
    case 'large':
      return components.card.padding.lg;
    default:
      return components.card.padding.md;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default Card;
