/**
 * React Error Boundary for catching and handling errors in component tree
 * Includes specific handling for Supabase errors
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { categorizeError, type StructuredError } from '../../../core/utils/error-handler';
import { FullPageError } from './error-message';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: StructuredError, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: StructuredError | null;
}

/**
 * Error Boundary component for catching React errors
 * Wraps components that may throw errors during rendering
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Categorize the error
    const structuredError = categorizeError(error, {
      source: 'error-boundary',
      componentStack: 'See error info',
    });

    return {
      hasError: true,
      error: structuredError,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('Error Boundary caught error:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleGoHome = (): void => {
    this.resetError();
    // Navigate to home page
    window.location.href = '/';
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default error UI
      const retryHandler = this.state.error.isRetryable ? this.resetError : undefined;
      return (
        <FullPageError
          error={this.state.error}
          {...(retryHandler && { onRetry: retryHandler })}
          onGoHome={this.handleGoHome}
          showDetails={this.props.showDetails ?? process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized error boundary for Supabase operations
 * Can be placed around components that make database calls
 */
interface SupabaseErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

export class SupabaseErrorBoundary extends Component<
  SupabaseErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: SupabaseErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const structuredError = categorizeError(error, {
      source: 'supabase-error-boundary',
    });

    return {
      hasError: true,
      error: structuredError,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Supabase Error Boundary caught error:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
    });

    // Log Supabase-specific errors
    if (error.message?.includes('supabase') || error.message?.includes('postgrest')) {
      console.error('Supabase operation failed:', {
        message: error.message,
        stack: error.stack,
      });
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });

    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const retryHandler = this.state.error.isRetryable ? this.resetError : undefined;
      return (
        <div className="supabase-error-boundary">
          <FullPageError
            error={this.state.error}
            {...(retryHandler && { onRetry: retryHandler })}
            showDetails={this.props.showDetails ?? process.env.NODE_ENV === 'development'}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary alternative (React 18+)
 * Note: This is a workaround since React doesn't have hook-based error boundaries yet
 */
interface UseErrorHandlerOptions {
  onError?: (error: Error) => void;
  resetKeys?: unknown[];
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): {
  error: StructuredError | null;
  resetError: () => void;
  handleError: (error: unknown) => void;
} {
  const [error, setError] = React.useState<StructuredError | null>(null);

  React.useEffect(() => {
    if (error && options.onError) {
      const originalError = error.originalError;
      options.onError(originalError instanceof Error ? originalError : new Error(error.message));
    }
  }, [error, options.onError]);

  // Reset error when reset keys change
  React.useEffect(() => {
    if (error) {
      setError(null);
    }
  }, options.resetKeys || []);

  const handleError = React.useCallback((err: unknown) => {
    const structuredError = categorizeError(err);
    setError(structuredError);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, resetError, handleError };
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

/**
 * HOC specifically for Supabase operations
 */
export function withSupabaseErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<SupabaseErrorBoundaryProps, 'children'>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <SupabaseErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </SupabaseErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withSupabaseErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
