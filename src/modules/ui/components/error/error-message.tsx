/**
 * ErrorMessage component for displaying user-friendly error messages
 */

import React from 'react';
import { ErrorCategory, type StructuredError } from '../../../core/utils/error-handler';

export interface ErrorMessageProps {
  error: StructuredError | null;
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
}

/**
 * Get icon for error category
 */
function getErrorIcon(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return '🌐';
    case ErrorCategory.AUTHENTICATION:
      return '🔐';
    case ErrorCategory.AUTHORIZATION:
      return '🚫';
    case ErrorCategory.VALIDATION:
      return '⚠️';
    case ErrorCategory.DATABASE:
      return '💾';
    case ErrorCategory.RATE_LIMIT:
      return '⏱️';
    case ErrorCategory.TIMEOUT:
      return '⌛';
    default:
      return '❌';
  }
}

/**
 * Get color class for error category
 */
function getErrorColorClass(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'error-network';
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return 'error-auth';
    case ErrorCategory.VALIDATION:
      return 'error-validation';
    case ErrorCategory.TIMEOUT:
      return 'error-timeout';
    default:
      return 'error-general';
  }
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  showDetails = false,
  className = '',
}) => {
  if (!error) {
    return null;
  }

  const icon = getErrorIcon(error.category);
  const colorClass = getErrorColorClass(error.category);

  return (
    <div className={`error-message ${colorClass} ${className}`} role="alert">
      <div className="error-message__header">
        <span className="error-message__icon" aria-hidden="true">
          {icon}
        </span>
        <div className="error-message__content">
          <p className="error-message__text">{error.userMessage}</p>
          {showDetails && error.message && (
            <details className="error-message__details">
              <summary>Technical details</summary>
              <pre className="error-message__technical">
                {error.code && <div>Code: {error.code}</div>}
                <div>Message: {error.message}</div>
                {error.context && (
                  <div>Context: {JSON.stringify(error.context, null, 2)}</div>
                )}
              </pre>
            </details>
          )}
        </div>
      </div>

      {error.isRetryable && onRetry && (
        <div className="error-message__actions">
          <button
            type="button"
            onClick={onRetry}
            className="error-message__retry-button"
            aria-label="Retry operation"
          >
            🔄 Retry
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Inline error message for forms and small components
 */
export interface InlineErrorProps {
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, className = '' }) => {
  return (
    <div className={`inline-error ${className}`} role="alert">
      <span className="inline-error__icon" aria-hidden="true">
        ⚠️
      </span>
      <span className="inline-error__message">{message}</span>
    </div>
  );
};

/**
 * Full-page error component for critical failures
 */
export interface FullPageErrorProps {
  error: StructuredError;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
}

export const FullPageError: React.FC<FullPageErrorProps> = ({
  error,
  onRetry,
  onGoHome,
  showDetails = false,
}) => {
  const icon = getErrorIcon(error.category);

  return (
    <div className="full-page-error">
      <div className="full-page-error__container">
        <div className="full-page-error__icon" aria-hidden="true">
          {icon}
        </div>
        <h1 className="full-page-error__title">Something went wrong</h1>
        <p className="full-page-error__message">{error.userMessage}</p>

        {showDetails && error.message && (
          <details className="full-page-error__details">
            <summary>Technical details</summary>
            <pre className="full-page-error__technical">
              {error.code && <div>Code: {error.code}</div>}
              <div>Message: {error.message}</div>
              {error.context && (
                <div>Context: {JSON.stringify(error.context, null, 2)}</div>
              )}
            </pre>
          </details>
        )}

        <div className="full-page-error__actions">
          {error.isRetryable && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="full-page-error__button full-page-error__button--primary"
            >
              🔄 Try Again
            </button>
          )}
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="full-page-error__button full-page-error__button--secondary"
            >
              🏠 Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
