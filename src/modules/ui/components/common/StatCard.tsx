import React from 'react';
import { Card } from './Card';
import { colors } from '@ui/design-tokens';
import styles from './StatCard.module.css';

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
  className,
  style,
  ...props
}: StatCardProps) {
  return (
    <Card
      {...props}
      padding="medium"
      shadow
      border
      style={{ borderLeft: `4px solid ${color}`, ...style }}
      className={className}
    >
      <div className={styles['stat-card__container']}>
        {/* Title and Icon Row */}
        <div className={styles['stat-card__header']}>
          <h3 className={styles['stat-card__title']}>
            {title}
          </h3>
          {icon && (
            <div className={styles['stat-card__icon']} style={{ color }}>
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className={styles['stat-card__value']}>
          {value}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className={styles['stat-card__subtitle']}>
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
