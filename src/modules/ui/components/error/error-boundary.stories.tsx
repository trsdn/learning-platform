import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ErrorBoundary } from './error-boundary';
import { ErrorCategory, type StructuredError } from '../../../core/utils/error-handler';
import { FullPageError } from './error-message';

// Since ErrorBoundary is a class component that catches React errors,
// we demonstrate its behavior through controlled error simulation

const meta = {
  title: 'Error/ErrorBoundary',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type RenderStory = StoryObj<Meta>;

// Component that can throw an error on demand
const BuggyCounter = ({ shouldError = false }: { shouldError: boolean }) => {
  if (shouldError) {
    throw new Error('Simulated error for demonstration');
  }
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      background: 'var(--surface-color)',
      borderRadius: '12px',
    }}>
      <h2>Content loaded successfully!</h2>
      <p>This component is wrapped in an ErrorBoundary.</p>
    </div>
  );
};

// Interactive demo component
const ErrorBoundaryDemo = () => {
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => {
            setHasError(true);
          }}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '0.5rem',
            background: 'var(--color-error)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Trigger Error
        </button>
        <button
          onClick={() => {
            setHasError(false);
            setKey(k => k + 1);
          }}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      <ErrorBoundary
        key={key}
        showDetails={true}
        onError={(error) => console.log('Error caught:', error)}
      >
        <BuggyCounter shouldError={hasError} />
      </ErrorBoundary>
    </div>
  );
};

// Mock error states since we can't easily trigger real errors in Storybook
const mockNetworkError: StructuredError = {
  message: 'Failed to fetch data',
  userMessage: 'Unable to connect to the server. Please check your internet connection.',
  category: ErrorCategory.NETWORK,
  isRetryable: true,
  code: 'NETWORK_ERROR',
};

const mockAuthError: StructuredError = {
  message: 'Session expired',
  userMessage: 'Your session has expired. Please log in again.',
  category: ErrorCategory.AUTHENTICATION,
  isRetryable: false,
  code: 'AUTH_EXPIRED',
};

const mockDatabaseError: StructuredError = {
  message: 'Database connection failed',
  userMessage: 'We\'re having trouble accessing your data. Please try again later.',
  category: ErrorCategory.DATABASE,
  isRetryable: true,
  code: 'DB_ERROR',
};

// Interactive demo
export const InteractiveDemo: RenderStory = {
  render: () => <ErrorBoundaryDemo />,
};

// Default fallback UI (what ErrorBoundary shows when an error occurs)
export const DefaultFallback: RenderStory = {
  render: () => (
    <div style={{ height: '500px', position: 'relative' }}>
      <FullPageError
        error={mockNetworkError}
        onRetry={() => console.log('Retry clicked')}
        onGoHome={() => console.log('Go home clicked')}
        showDetails={true}
      />
    </div>
  ),
};

// Non-retryable error
export const NonRetryableError: RenderStory = {
  render: () => (
    <div style={{ height: '500px', position: 'relative' }}>
      <FullPageError
        error={mockAuthError}
        onGoHome={() => console.log('Go home clicked')}
        showDetails={true}
      />
    </div>
  ),
};

// Custom fallback example
export const CustomFallback: RenderStory = {
  render: () => {
    const CustomFallbackUI = ({ error, resetError }: { error: StructuredError; resetError: () => void }) => (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
        borderRadius: '16px',
        margin: '2rem',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
        <h2 style={{ margin: '0 0 1rem 0', color: '#991b1b' }}>Oops! Something broke</h2>
        <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>{error.userMessage}</p>
        <button
          onClick={resetError}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Try Again
        </button>
      </div>
    );

    return (
      <CustomFallbackUI
        error={mockNetworkError}
        resetError={() => console.log('Reset clicked')}
      />
    );
  },
};

// Supabase error boundary example
export const SupabaseErrorFallback: RenderStory = {
  render: () => (
    <div style={{ height: '500px', position: 'relative' }}>
      <FullPageError
        error={mockDatabaseError}
        onRetry={() => console.log('Retry database operation')}
        showDetails={true}
      />
    </div>
  ),
};

// Normal state (no error)
export const NoError: RenderStory = {
  render: () => (
    <ErrorBoundary>
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'var(--surface-color)',
        borderRadius: '12px',
        margin: '2rem',
      }}>
        <h2 style={{ color: 'var(--color-success)' }}>Everything is working!</h2>
        <p>This content is wrapped in an ErrorBoundary.</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          If an error occurs, it will be caught and a fallback UI will be displayed.
        </p>
      </div>
    </ErrorBoundary>
  ),
};

// HOC usage example
export const HOCExample: RenderStory = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <div style={{
        padding: '1.5rem',
        background: 'var(--surface-color)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Using withErrorBoundary HOC</h3>
        <pre style={{
          background: 'var(--background-color)',
          padding: '1rem',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '0.875rem',
        }}>
{`import { withErrorBoundary } from './error-boundary';

const MyComponent = () => {
  return <div>My component content</div>;
};

// Wrap with error boundary
export const SafeMyComponent = withErrorBoundary(MyComponent, {
  showDetails: true,
  onError: (error) => {
    // Log to error tracking service
    console.error('Component error:', error);
  },
});`}
        </pre>
      </div>

      <div style={{
        padding: '1.5rem',
        background: 'var(--surface-color)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginTop: '1rem',
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Using withSupabaseErrorBoundary HOC</h3>
        <pre style={{
          background: 'var(--background-color)',
          padding: '1rem',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '0.875rem',
        }}>
{`import { withSupabaseErrorBoundary } from './error-boundary';

const DataComponent = () => {
  // Component that fetches from Supabase
  return <div>Data loaded</div>;
};

// Wrap with Supabase-specific error boundary
export const SafeDataComponent = withSupabaseErrorBoundary(
  DataComponent,
  {
    showDetails: process.env.NODE_ENV === 'development',
    onRetry: () => {
      // Refetch data
    },
  }
);`}
        </pre>
      </div>
    </div>
  ),
};

// Documentation story
export const Documentation: RenderStory = {
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ErrorBoundary Components</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Overview</h2>
        <p>
          Error boundaries are React components that catch JavaScript errors anywhere in their
          child component tree, log those errors, and display a fallback UI instead of the
          crashed component tree.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Available Components</h2>
        <ul>
          <li><strong>ErrorBoundary</strong> - General-purpose error boundary</li>
          <li><strong>SupabaseErrorBoundary</strong> - Specialized for database operations</li>
          <li><strong>withErrorBoundary</strong> - HOC to wrap components</li>
          <li><strong>withSupabaseErrorBoundary</strong> - HOC for database components</li>
          <li><strong>useErrorHandler</strong> - Hook for async error handling</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Usage Example</h2>
        <pre style={{
          background: 'var(--background-color)',
          padding: '1rem',
          borderRadius: '8px',
          overflow: 'auto',
        }}>
{`<ErrorBoundary
  showDetails={true}
  onError={(error, info) => {
    // Log to error tracking service
  }}
  fallback={(error, resetError) => (
    <CustomErrorUI error={error} onReset={resetError} />
  )}
>
  <MyComponent />
</ErrorBoundary>`}
        </pre>
      </section>

      <section>
        <h2>Error Categories</h2>
        <p>Errors are automatically categorized for appropriate handling:</p>
        <ul>
          <li>NETWORK - Connection issues</li>
          <li>AUTHENTICATION - Session/login problems</li>
          <li>AUTHORIZATION - Permission issues</li>
          <li>VALIDATION - Input/data validation</li>
          <li>DATABASE - Database operations</li>
          <li>RATE_LIMIT - Too many requests</li>
          <li>TIMEOUT - Request timeouts</li>
          <li>UNKNOWN - Other errors</li>
        </ul>
      </section>
    </div>
  ),
};
