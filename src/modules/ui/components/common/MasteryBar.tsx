import {
  spacing,
  typography,
  semanticColors,
  borderRadius,
  transitions,
} from '@ui/design-tokens';

export interface MasteryBarProps {
  /**
   * Label displayed above the progress bar
   */
  label: string;

  /**
   * Count value displayed
   */
  count: number;

  /**
   * Color of the progress bar
   */
  color: string;

  /**
   * Maximum count for calculating percentage
   * If not provided, bar shows as full when count > 0
   */
  max?: number;
}

/**
 * Mastery Bar Component
 *
 * Displays a labeled progress indicator for mastery levels.
 * Used in the dashboard to show progress across different mastery categories.
 *
 * @example
 * ```tsx
 * <MasteryBar
 *   label="Gemeistert"
 *   count={12}
 *   max={50}
 *   color={colors.success[500]}
 * />
 * ```
 */
export function MasteryBar({ label, count, color, max }: MasteryBarProps) {
  const percentage = max && max > 0 ? (count / max) * 100 : count > 0 ? 100 : 0;

  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: spacing[2],
        }}
      >
        <span
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: typography.fontSize.sm,
            color: semanticColors.text.secondary,
          }}
        >
          {count}
        </span>
      </div>
      <div
        style={{
          background: semanticColors.background.tertiary,
          height: '8px',
          borderRadius: borderRadius.md,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: color,
            height: '100%',
            width: `${percentage}%`,
            transition: transitions.presets.base,
          }}
        />
      </div>
    </div>
  );
}

export default MasteryBar;
