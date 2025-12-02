import type { Meta, StoryObj } from '@storybook/react';
import { ErrorMessage, InlineError, FullPageError } from './error-message';
import { ErrorCategory, type StructuredError } from '../../../core/utils/error-handler';

// ErrorMessage stories
const errorMessageMeta = {
  title: 'Error/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showDetails: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorMessage>;

export default errorMessageMeta;
type ErrorMessageStory = StoryObj<typeof errorMessageMeta>;
type RenderStory = StoryObj<Meta>;

// Mock errors
const networkError: StructuredError = {
  message: 'Failed to fetch data from server',
  userMessage: 'Unable to connect to the server. Please check your internet connection.',
  category: ErrorCategory.NETWORK,
  isRetryable: true,
  code: 'NETWORK_ERROR',
  context: { url: '/api/data' },
};

const authError: StructuredError = {
  message: 'JWT token expired',
  userMessage: 'Your session has expired. Please log in again.',
  category: ErrorCategory.AUTHENTICATION,
  isRetryable: false,
  code: 'AUTH_EXPIRED',
};

const validationError: StructuredError = {
  message: 'Invalid input format',
  userMessage: 'Please check your input and try again.',
  category: ErrorCategory.VALIDATION,
  isRetryable: false,
  code: 'VALIDATION_ERROR',
};

const databaseError: StructuredError = {
  message: 'Database connection failed',
  userMessage: 'We\'re having trouble accessing your data. Please try again later.',
  category: ErrorCategory.DATABASE,
  isRetryable: true,
  code: 'DB_CONNECTION',
};

const timeoutError: StructuredError = {
  message: 'Request timed out after 30s',
  userMessage: 'The request took too long. Please try again.',
  category: ErrorCategory.TIMEOUT,
  isRetryable: true,
  code: 'TIMEOUT',
};

const rateLimitError: StructuredError = {
  message: 'Rate limit exceeded',
  userMessage: 'Too many requests. Please wait a moment before trying again.',
  category: ErrorCategory.RATE_LIMIT,
  isRetryable: true,
  code: 'RATE_LIMIT',
};

const unknownError: StructuredError = {
  message: 'An unexpected error occurred',
  userMessage: 'Something went wrong. Please try again.',
  category: ErrorCategory.UNKNOWN,
  isRetryable: true,
  code: 'UNKNOWN',
};

// Network error
export const NetworkError: ErrorMessageStory = {
  args: {
    error: networkError,
    onRetry: () => console.log('Retry clicked'),
    showDetails: false,
  },
};

// Authentication error
export const AuthenticationError: ErrorMessageStory = {
  args: {
    error: authError,
    showDetails: false,
  },
};

// Validation error
export const ValidationError: ErrorMessageStory = {
  args: {
    error: validationError,
    showDetails: false,
  },
};

// Database error
export const DatabaseError: ErrorMessageStory = {
  args: {
    error: databaseError,
    onRetry: () => console.log('Retry clicked'),
    showDetails: false,
  },
};

// Timeout error
export const TimeoutError: ErrorMessageStory = {
  args: {
    error: timeoutError,
    onRetry: () => console.log('Retry clicked'),
    showDetails: false,
  },
};

// With technical details
export const WithDetails: ErrorMessageStory = {
  args: {
    error: networkError,
    onRetry: () => console.log('Retry clicked'),
    showDetails: true,
  },
};

// Null error (should render nothing)
export const NullError: ErrorMessageStory = {
  args: {
    error: null,
    showDetails: false,
  },
};

// All error categories
export const AllCategories: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <ErrorMessage error={networkError} onRetry={() => {}} />
      <ErrorMessage error={authError} />
      <ErrorMessage error={validationError} />
      <ErrorMessage error={databaseError} onRetry={() => {}} />
      <ErrorMessage error={timeoutError} onRetry={() => {}} />
      <ErrorMessage error={rateLimitError} onRetry={() => {}} />
      <ErrorMessage error={unknownError} onRetry={() => {}} />
    </div>
  ),
};

// InlineError story
export const Inline: RenderStory = {
  render: () => (
    <div style={{ width: '300px' }}>
      <InlineError message="This field is required" />
    </div>
  ),
};

// Multiple inline errors
export const MultipleInlineErrors: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '300px' }}>
      <InlineError message="Email is required" />
      <InlineError message="Password must be at least 8 characters" />
      <InlineError message="Please accept the terms and conditions" />
    </div>
  ),
};

// FullPageError story
export const FullPage: RenderStory = {
  render: () => (
    <div style={{ width: '600px', height: '400px', position: 'relative' }}>
      <FullPageError
        error={networkError}
        onRetry={() => console.log('Retry')}
        onGoHome={() => console.log('Go home')}
        showDetails={true}
      />
    </div>
  ),
};

// FullPageError without retry
export const FullPageNoRetry: RenderStory = {
  render: () => (
    <div style={{ width: '600px', height: '400px', position: 'relative' }}>
      <FullPageError
        error={authError}
        onGoHome={() => console.log('Go home')}
        showDetails={false}
      />
    </div>
  ),
};
