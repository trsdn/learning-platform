/**
 * Tests for FeedbackCard Component
 *
 * Tests the feedback card functionality including:
 * - Rendering with required and optional props
 * - Variant styles (success, error, warning, info)
 * - Title and message display
 * - Dismissible functionality
 * - Custom children content
 * - Accessibility (role, aria-live)
 * - Icon rendering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import '../../../../setup/a11y-matchers';
import { FeedbackCard } from '@/modules/ui/components/common/FeedbackCard';

// Mock the Card component
vi.mock('@/modules/ui/components/common/Card', () => ({
  Card: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
}));

describe('FeedbackCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<FeedbackCard variant="success" message="Success message" />);

      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('renders without optional props', () => {
      render(<FeedbackCard variant="info" />);

      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
    });

    it('renders with title and message', () => {
      render(
        <FeedbackCard
          variant="success"
          title="Great Job!"
          message="Your answer is correct"
        />
      );

      expect(screen.getByText('Great Job!')).toBeInTheDocument();
      expect(screen.getByText('Your answer is correct')).toBeInTheDocument();
    });

    it('renders with only title', () => {
      render(<FeedbackCard variant="info" title="Information" />);

      expect(screen.getByText('Information')).toBeInTheDocument();
    });

    it('renders with only message', () => {
      render(<FeedbackCard variant="warning" message="Warning text" />);

      expect(screen.getByText('Warning text')).toBeInTheDocument();
    });
  });

  // Variant tests
  describe('Variants', () => {
    it('renders success variant with correct icon', () => {
      render(<FeedbackCard variant="success" message="Success" />);

      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('renders error variant with correct icon', () => {
      render(<FeedbackCard variant="error" message="Error" />);

      expect(screen.getByText('✗')).toBeInTheDocument();
    });

    it('renders warning variant with correct icon', () => {
      render(<FeedbackCard variant="warning" message="Warning" />);

      expect(screen.getByText('⚠')).toBeInTheDocument();
    });

    it('renders info variant with correct icon', () => {
      render(<FeedbackCard variant="info" message="Info" />);

      expect(screen.getByText('ℹ')).toBeInTheDocument();
    });

    it('applies correct CSS class for success variant', () => {
      const { container } = render(
        <FeedbackCard variant="success" message="Success" />
      );

      const feedbackElement = container.querySelector('[class*="feedback--success"]');
      expect(feedbackElement).toBeInTheDocument();
    });

    it('applies correct CSS class for error variant', () => {
      const { container } = render(
        <FeedbackCard variant="error" message="Error" />
      );

      const feedbackElement = container.querySelector('[class*="feedback--error"]');
      expect(feedbackElement).toBeInTheDocument();
    });

    it('applies correct CSS class for warning variant', () => {
      const { container } = render(
        <FeedbackCard variant="warning" message="Warning" />
      );

      const feedbackElement = container.querySelector('[class*="feedback--warning"]');
      expect(feedbackElement).toBeInTheDocument();
    });

    it('applies correct CSS class for info variant', () => {
      const { container } = render(
        <FeedbackCard variant="info" message="Info" />
      );

      const feedbackElement = container.querySelector('[class*="feedback--info"]');
      expect(feedbackElement).toBeInTheDocument();
    });
  });

  // Children vs Message tests
  describe('Children vs Message', () => {
    it('renders custom children instead of message', () => {
      render(
        <FeedbackCard variant="info" message="This should not appear">
          <p>Custom content</p>
        </FeedbackCard>
      );

      expect(screen.getByText('Custom content')).toBeInTheDocument();
      expect(screen.queryByText('This should not appear')).not.toBeInTheDocument();
    });

    it('renders children with complex content', () => {
      render(
        <FeedbackCard variant="success">
          <div>
            <h4>Custom Title</h4>
            <p>Custom paragraph</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </FeedbackCard>
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom paragraph')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('prioritizes children over message prop', () => {
      render(
        <FeedbackCard variant="error" message="Message text">
          <span>Children text</span>
        </FeedbackCard>
      );

      expect(screen.getByText('Children text')).toBeInTheDocument();
      expect(screen.queryByText('Message text')).not.toBeInTheDocument();
    });
  });

  // Dismissible functionality tests
  describe('Dismissible Functionality', () => {
    it('does not show dismiss button by default', () => {
      render(<FeedbackCard variant="info" message="Info" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows dismiss button when dismissible is true and onDismiss provided', () => {
      const onDismiss = vi.fn();
      render(
        <FeedbackCard
          variant="info"
          message="Dismissible info"
          dismissible
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByRole('button');
      expect(dismissButton).toBeInTheDocument();
    });

    it('does not show dismiss button when dismissible is true but no onDismiss', () => {
      render(
        <FeedbackCard
          variant="info"
          message="Info"
          dismissible
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not show dismiss button when onDismiss provided but dismissible is false', () => {
      const onDismiss = vi.fn();
      render(
        <FeedbackCard
          variant="info"
          message="Info"
          dismissible={false}
          onDismiss={onDismiss}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();

      render(
        <FeedbackCard
          variant="success"
          message="Success message"
          dismissible
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByRole('button');
      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('dismiss button has correct aria-label for success variant', () => {
      const onDismiss = vi.fn();
      render(
        <FeedbackCard
          variant="success"
          message="Success"
          dismissible
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByRole('button');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss success message');
    });

    it('dismiss button has correct aria-label for error variant', () => {
      const onDismiss = vi.fn();
      render(
        <FeedbackCard
          variant="error"
          message="Error"
          dismissible
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByRole('button');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss error message');
    });

    it('dismiss button has correct aria-label for warning variant', () => {
      const onDismiss = vi.fn();
      render(
        <FeedbackCard
          variant="warning"
          message="Warning"
          dismissible
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByRole('button');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss warning message');
    });

    it('dismiss button has correct aria-label for info variant', () => {
      const onDismiss = vi.fn();
      render(
        <FeedbackCard
          variant="info"
          message="Info"
          dismissible
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByRole('button');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss info message');
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has alert role for error variant', () => {
      render(<FeedbackCard variant="error" message="Error message" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'alert');
    });

    it('has alert role for warning variant', () => {
      render(<FeedbackCard variant="warning" message="Warning message" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'alert');
    });

    it('has status role for success variant', () => {
      render(<FeedbackCard variant="success" message="Success message" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'status');
    });

    it('has status role for info variant', () => {
      render(<FeedbackCard variant="info" message="Info message" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'status');
    });

    it('has assertive aria-live for error variant', () => {
      render(<FeedbackCard variant="error" message="Error" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('aria-live', 'assertive');
    });

    it('has assertive aria-live for warning variant', () => {
      render(<FeedbackCard variant="warning" message="Warning" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('aria-live', 'assertive');
    });

    it('has polite aria-live for success variant', () => {
      render(<FeedbackCard variant="success" message="Success" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('aria-live', 'polite');
    });

    it('has polite aria-live for info variant', () => {
      render(<FeedbackCard variant="info" message="Info" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-atomic="true"', () => {
      render(<FeedbackCard variant="info" message="Info" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('aria-atomic', 'true');
    });

    it('icon has aria-hidden="true"', () => {
      const { container } = render(
        <FeedbackCard variant="success" message="Success" />
      );

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('✓');
    });

    it('has no WCAG violations with success variant', async () => {
      const { container } = render(
        <FeedbackCard
          variant="success"
          title="Success"
          message="Operation completed successfully"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with error variant', async () => {
      const { container } = render(
        <FeedbackCard
          variant="error"
          title="Error"
          message="Operation failed"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with dismissible card', async () => {
      const onDismiss = vi.fn();
      const { container } = render(
        <FeedbackCard
          variant="warning"
          message="Warning message"
          dismissible
          onDismiss={onDismiss}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with all variants', async () => {
      const { container } = render(
        <div>
          <FeedbackCard variant="success" message="Success" />
          <FeedbackCard variant="error" message="Error" />
          <FeedbackCard variant="warning" message="Warning" />
          <FeedbackCard variant="info" message="Info" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // Custom styling tests
  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <FeedbackCard
          variant="info"
          message="Info"
          className="custom-feedback"
        />
      );

      const feedbackElement = container.querySelector('.custom-feedback');
      expect(feedbackElement).toBeInTheDocument();
    });

    it('applies custom style', () => {
      render(
        <FeedbackCard
          variant="info"
          message="Info"
          // eslint-disable-next-line no-restricted-syntax
          style={{ marginTop: '20px' }}
        />
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveStyle({ marginTop: '20px' });
    });

    it('forwards additional HTML attributes', () => {
      render(
        <FeedbackCard
          variant="info"
          message="Info"
          data-custom="test-value"
          id="feedback-id"
        />
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('data-custom', 'test-value');
      expect(card).toHaveAttribute('id', 'feedback-id');
    });
  });

  // Integration tests
  describe('Integration', () => {
    it('renders multiple feedback cards correctly', () => {
      render(
        <div>
          <FeedbackCard variant="success" message="Success 1" />
          <FeedbackCard variant="error" message="Error 1" />
          <FeedbackCard variant="warning" message="Warning 1" />
        </div>
      );

      expect(screen.getByText('Success 1')).toBeInTheDocument();
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Warning 1')).toBeInTheDocument();
    });

    it('handles multiple dismissible cards independently', async () => {
      const user = userEvent.setup();
      const onDismiss1 = vi.fn();
      const onDismiss2 = vi.fn();

      render(
        <div>
          <FeedbackCard
            variant="success"
            message="Message 1"
            dismissible
            onDismiss={onDismiss1}
          />
          <FeedbackCard
            variant="error"
            message="Message 2"
            dismissible
            onDismiss={onDismiss2}
          />
        </div>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      await user.click(buttons[0]);
      expect(onDismiss1).toHaveBeenCalledTimes(1);
      expect(onDismiss2).toHaveBeenCalledTimes(0);

      await user.click(buttons[1]);
      expect(onDismiss1).toHaveBeenCalledTimes(1);
      expect(onDismiss2).toHaveBeenCalledTimes(1);
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles empty message gracefully', () => {
      render(<FeedbackCard variant="info" message="" />);

      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
    });

    it('handles long message text', () => {
      const longMessage = 'A'.repeat(500);
      render(<FeedbackCard variant="info" message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles special characters in message', () => {
      const specialChars = `<>&"'`;
      render(<FeedbackCard variant="info" message={specialChars} />);

      expect(screen.getByText(specialChars)).toBeInTheDocument();
    });

    it('handles null/undefined children gracefully', () => {
      render(<FeedbackCard variant="info">{null}</FeedbackCard>);

      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
    });

    it('handles multiple dismiss button clicks', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();

      render(
        <FeedbackCard
          variant="info"
          message="Info"
          dismissible
          onDismiss={onDismiss}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(onDismiss).toHaveBeenCalledTimes(3);
    });
  });

  // Title rendering tests
  describe('Title Rendering', () => {
    it('renders title as h4 element', () => {
      const { container } = render(
        <FeedbackCard variant="info" title="Test Title" />
      );

      const title = container.querySelector('h4');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Test Title');
    });

    it('does not render title element when title is not provided', () => {
      const { container } = render(
        <FeedbackCard variant="info" message="Message only" />
      );

      const title = container.querySelector('h4');
      expect(title).not.toBeInTheDocument();
    });

    it('renders both title and message in correct order', () => {
      const { container } = render(
        <FeedbackCard
          variant="success"
          title="Success Title"
          message="Success message"
        />
      );

      const title = container.querySelector('h4');
      const message = container.querySelector('p');

      expect(title).toBeInTheDocument();
      expect(message).toBeInTheDocument();
      expect(title?.textContent).toBe('Success Title');
      expect(message?.textContent).toBe('Success message');
    });
  });
});
