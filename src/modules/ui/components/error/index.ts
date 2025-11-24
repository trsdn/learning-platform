/**
 * Error handling components and utilities
 * Centralized exports for error UI components
 */

export {
  ErrorMessage,
  InlineError,
  FullPageError,
  type ErrorMessageProps,
  type InlineErrorProps,
  type FullPageErrorProps,
} from './error-message';

export {
  ConnectionStatusIndicator,
  ConnectionBadge,
  useConnectionStatus,
  type ConnectionStatusIndicatorProps,
} from './connection-status';

export {
  ErrorBoundary,
  SupabaseErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
  withSupabaseErrorBoundary,
} from './error-boundary';

// Import styles
import './error-message.css';
import './connection-status.css';
