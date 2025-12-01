import styles from './MasteryBar.module.css';

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
    <div className={styles['mastery-bar']}>
      <div className={styles['mastery-bar__header']}>
        <span className={styles['mastery-bar__label']}>
          {label}
        </span>
        <span className={styles['mastery-bar__count']}>
          {count}
        </span>
      </div>
      <div className={styles['mastery-bar__track']}>
        <div
          className={styles['mastery-bar__fill']}
          // eslint-disable-next-line no-restricted-syntax -- Dynamic color and width based on props
          style={{
            background: color,
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

export default MasteryBar;
