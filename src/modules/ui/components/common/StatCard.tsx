import React from 'react';
import { Card } from './Card';
import {
  typography,
  semanticColors,
  spacing,
  colors,
} from '@ui/design-tokens';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The stat label/title
   */
  title: string;

  /**
   * The main value to display
   */
  value: string | number;

  /**
   * Optional subtitle/context below the value
   */
  subtitle?: string;

  /**
   * Accent color for visual distinction
   * @default colors.primary[500]
   */
  color?: string;

  /**
   * Optional icon element
   */
  icon?: React.ReactNode;
}

/**
 * StatCard Component
 *
 * A specialized card for displaying statistical information on dashboards.
 * Features a title, prominent value, optional subtitle, and color accent.
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Sessions"
 *   value="42"
 *   subtitle="this week"
 *   color="#3b82f6"
 * />
 *
 * <StatCard
 *   title="Accuracy"
 *   value="95%"
 *   subtitle="12/13 correct"
 *   color="#10b981"
 *   icon={<CheckIcon />}
 * />
 * ```
 */
export function StatCard({
  title,
  value,
  subtitle,
  color = colors.primary[500],
  icon,
  className = '',
  style = {},
  ...props
}: StatCardProps) {
  const containerStyles: React.CSSProperties = {
    borderLeft: `4px solid ${color}`,
    ...style,
  };

  return (
    <Card
      {...props}
      padding="medium"
      shadow
      border
      style={containerStyles}
      className={className}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[2],
        }}
      >
        {/* Title and Icon Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: semanticColors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: typography.letterSpacing.wide,
            }}
          >
            {title}
          </h3>
          {icon && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: color,
                fontSize: typography.fontSize.xl,
              }}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div
          style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: semanticColors.text.primary,
            lineHeight: typography.lineHeight.tight,
          }}
        >
          {value}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: semanticColors.text.tertiary,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default StatCard;
