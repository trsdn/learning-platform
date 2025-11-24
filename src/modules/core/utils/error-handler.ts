/**
 * Centralized error handling utilities for Supabase operations
 * Provides error categorization, user-friendly messages, and retry logic
 */

import { PostgrestError } from '@supabase/supabase-js';

/**
 * Error categories for different types of failures
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Structured error information
 */
export interface StructuredError {
  category: ErrorCategory;
  code?: string;
  message: string;
  userMessage: string;
  isRetryable: boolean;
  originalError?: any;
  context?: Record<string, any>;
}

/**
 * Supabase error codes mapping
 */
const SUPABASE_ERROR_CODES: Record<string, { category: ErrorCategory; userMessage: string; retryable: boolean }> = {
  // Not found
  PGRST116: {
    category: ErrorCategory.DATABASE,
    userMessage: 'The requested resource was not found.',
    retryable: false,
  },
  // JWT errors
  PGRST301: {
    category: ErrorCategory.AUTHENTICATION,
    userMessage: 'Your session has expired. Please sign in again.',
    retryable: false,
  },
  PGRST302: {
    category: ErrorCategory.AUTHENTICATION,
    userMessage: 'Authentication failed. Please sign in again.',
    retryable: false,
  },
  // Constraint violations
  '23503': {
    category: ErrorCategory.VALIDATION,
    userMessage: 'This operation would violate data integrity rules.',
    retryable: false,
  },
  '23505': {
    category: ErrorCategory.VALIDATION,
    userMessage: 'This record already exists.',
    retryable: false,
  },
  // Permission errors
  '42501': {
    category: ErrorCategory.AUTHORIZATION,
    userMessage: 'You do not have permission to perform this action.',
    retryable: false,
  },
  // Connection errors
  '53300': {
    category: ErrorCategory.DATABASE,
    userMessage: 'Database connection limit reached. Please try again in a moment.',
    retryable: true,
  },
  '08000': {
    category: ErrorCategory.NETWORK,
    userMessage: 'Connection failed. Please check your internet connection.',
    retryable: true,
  },
  '08003': {
    category: ErrorCategory.NETWORK,
    userMessage: 'Connection does not exist. Please try again.',
    retryable: true,
  },
  '08006': {
    category: ErrorCategory.NETWORK,
    userMessage: 'Connection failure. Please try again.',
    retryable: true,
  },
  // Timeout
  '57014': {
    category: ErrorCategory.TIMEOUT,
    userMessage: 'The operation took too long. Please try again.',
    retryable: true,
  },
};

/**
 * Categorize and structure a Supabase error
 */
export function categorizeError(error: any, context?: Record<string, any>): StructuredError {
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      category: ErrorCategory.NETWORK,
      message: 'Network request failed',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      isRetryable: true,
      originalError: error,
      ...(context && { context }),
    };
  }

  // Handle timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return {
      category: ErrorCategory.TIMEOUT,
      message: 'Request timeout',
      userMessage: 'The operation took too long. Please try again.',
      isRetryable: true,
      originalError: error,
      ...(context && { context }),
    };
  }

  // Handle Supabase PostgrestError
  if (isPostgrestError(error)) {
    const errorCode = error.code;
    const knownError = SUPABASE_ERROR_CODES[errorCode];

    if (knownError) {
      return {
        category: knownError.category,
        code: errorCode,
        message: error.message,
        userMessage: knownError.userMessage,
        isRetryable: knownError.retryable,
        originalError: error,
        ...(context && { context }),
      };
    }

    // Unknown PostgrestError
    return {
      category: ErrorCategory.DATABASE,
      code: errorCode,
      message: error.message,
      userMessage: 'A database error occurred. Please try again.',
      isRetryable: false,
      originalError: error,
      ...(context && { context }),
    };
  }

  // Handle generic errors
  return {
    category: ErrorCategory.UNKNOWN,
    message: error?.message || 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.',
    isRetryable: true,
    originalError: error,
    ...(context && { context }),
  };
}

/**
 * Type guard for PostgrestError
 */
function isPostgrestError(error: any): error is PostgrestError {
  return error && typeof error === 'object' && 'code' in error && 'message' in error && 'details' in error;
}

/**
 * Log error with context for debugging
 */
export function logError(error: StructuredError, operation: string): void {
  const logData = {
    timestamp: new Date().toISOString(),
    operation,
    category: error.category,
    code: error.code,
    message: error.message,
    userMessage: error.userMessage,
    isRetryable: error.isRetryable,
    context: error.context,
  };

  // Always log to console for debugging
  console.error(`[${operation}] Error:`, logData);

  // In production, you could send to error tracking service
  // Example: Sentry.captureException(error.originalError, { extra: logData });
}

/**
 * Options for retry logic
 */
export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeout?: number;
  shouldRetry?: (error: StructuredError, attempt: number) => boolean;
  onRetry?: (error: StructuredError, attempt: number) => void;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  timeout: 30000, // 30 seconds
  shouldRetry: (error: StructuredError, _attempt: number) => {
    // Don't retry if error is not retryable
    if (!error.isRetryable) {
      return false;
    }
    // Don't retry validation or authorization errors
    if (
      error.category === ErrorCategory.VALIDATION ||
      error.category === ErrorCategory.AUTHORIZATION
    ) {
      return false;
    }
    return true;
  },
  onRetry: (_error: StructuredError, attempt: number) => {
    console.warn(`Retrying operation (attempt ${attempt})...`);
  },
};

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wrap an async operation with retry logic and error handling
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: StructuredError | null = null;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          const timeoutError = new Error('Operation timeout');
          timeoutError.name = 'AbortError';
          reject(timeoutError);
        }, opts.timeout);
      });

      // Race between operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error) {
      // Categorize the error
      lastError = categorizeError(error, { operation: operationName, attempt });

      // Log the error
      logError(lastError, operationName);

      // Check if we should retry
      const shouldRetry = attempt <= opts.maxRetries && opts.shouldRetry(lastError, attempt);

      if (!shouldRetry) {
        throw lastError;
      }

      // Call onRetry callback
      opts.onRetry(lastError, attempt);

      // Calculate backoff delay and wait
      const delay = calculateBackoff(attempt, opts.baseDelay, opts.maxDelay);
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Check if error is a specific category
 */
export function isErrorCategory(error: StructuredError, category: ErrorCategory): boolean {
  return error.category === category;
}

/**
 * Check if error requires authentication
 */
export function requiresReAuthentication(error: StructuredError): boolean {
  return (
    error.category === ErrorCategory.AUTHENTICATION &&
    (error.code === 'PGRST301' || error.code === 'PGRST302')
  );
}

/**
 * Handle errors in React components - returns error for state management
 */
export function handleComponentError(error: any, operation: string): StructuredError {
  const structuredError = categorizeError(error, { source: 'component', operation });
  logError(structuredError, operation);
  return structuredError;
}
