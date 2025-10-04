import React from 'react';
import clsx from 'clsx';
import { Card } from './Card';
import { semanticColors } from '@ui/design-tokens';
import styles from './FeedbackCard.module.css';

export type FeedbackVariant = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant determining color scheme
   */
  variant: FeedbackVariant;

  /**
   * Optional title/heading
   */
  title?: string;

  /**
   * Main message content
   */
  message?: string;

  /**
   * Whether the card can be dismissed
   * @default false
   */
  dismissible?: boolean;

  /**
   * Callback when dismissed
   */
  onDismiss?: () => void;

  /**
   * Custom content (overrides message if provided)
   */
  children?: React.ReactNode;
}

/**
 * FeedbackCard Component
 *
 * A specialized card for displaying feedback messages (success, error, warning, info).
 * Features color-coded variants, optional icons, and dismiss functionality.
 *
 * @example
 * ```tsx
 * <FeedbackCard
 *   variant="success"
 *   title="Success!"
 *   message="Your answer is correct"
 * />
 *
 * <FeedbackCard
 *   variant="error"
 *   message="Incorrect answer. Try again!"
 *   dismissible
 *   onDismiss={handleDismiss}
 * />
 *
 * <FeedbackCard variant="warning">
 *   <p>Custom warning content</p>
 * </FeedbackCard>
 * ```
 */
export function FeedbackCard({
  variant,
  title,
  message,
  dismissible = false,
  onDismiss,
  children,
  className,
  style,
  ...props
}: FeedbackCardProps) {
  const colors = React.useMemo(() => getVariantColors(variant), [variant]);
  const icon = React.useMemo(() => getVariantIcon(variant), [variant]);

  return (
    <Card
      {...props}
      padding="medium"
      shadow={false}
      border
      borderColor={colors.border}
      backgroundColor={colors.background}
      style={style}
      className={clsx(styles[`feedback--${variant}`], className)}
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      aria-live={variant === 'error' || variant === 'warning' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className={styles['feedback-content']}>
        {/* Icon */}
        <div className={styles['feedback-icon']} aria-hidden="true">
          {icon}
        </div>

        {/* Content */}
        <div className={styles['feedback-text']}>
          {title && (
            <h4 className={styles['feedback-title']}>
              {title}
            </h4>
          )}

          {children ? (
            <div className={styles['feedback-children']}>
              {children}
            </div>
          ) : (
            message && (
              <p className={styles['feedback-message']}>
                {message}
              </p>
            )
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={styles['feedback-dismiss']}
            aria-label={`Dismiss ${variant} message`}
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// VARIANT HELPERS
// ============================================================================

interface VariantColors {
  background: string;
  border: string;
  text: string;
}

function getVariantColors(variant: FeedbackVariant): VariantColors {
  switch (variant) {
    case 'success':
      return {
        background: semanticColors.feedback.successLight,
        border: semanticColors.feedback.successBorder,
        text: semanticColors.feedback.success,
      };

    case 'error':
      return {
        background: semanticColors.feedback.errorLight,
        border: semanticColors.feedback.errorBorder,
        text: semanticColors.feedback.error,
      };

    case 'warning':
      return {
        background: semanticColors.feedback.warningLight,
        border: semanticColors.feedback.warningBorder,
        text: semanticColors.feedback.warning,
      };

    case 'info':
      return {
        background: semanticColors.feedback.infoLight,
        border: semanticColors.feedback.infoBorder,
        text: semanticColors.feedback.info,
      };

    default:
      return {
        background: semanticColors.feedback.infoLight,
        border: semanticColors.feedback.infoBorder,
        text: semanticColors.feedback.info,
      };
  }
}

function getVariantIcon(variant: FeedbackVariant): string {
  switch (variant) {
    case 'success':
      return '✓';
    case 'error':
      return '✗';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    default:
      return 'ℹ';
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FeedbackCard;
