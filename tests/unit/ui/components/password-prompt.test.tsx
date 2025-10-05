/**
 * PasswordPrompt Component Tests
 *
 * Tests for password authentication modal component.
 *
 * Feature: Shared Password Authentication
 * Issue: #35
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordPrompt } from '@/modules/ui/components/password-prompt';

describe('PasswordPrompt', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    title: 'Mathematik Grundlagen',
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Rendering', () => {
    it('renders dialog with title', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/Passwort erforderlich/)).toBeInTheDocument();
    });

    it('displays learning path title', () => {
      render(<PasswordPrompt {...defaultProps} />);

      expect(screen.getByText(/Mathematik Grundlagen/)).toBeInTheDocument();
    });

    it('renders password input field', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const input = screen.getByLabelText(/Passwort eingeben/);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders submit button', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const submitButton = screen.getByTestId('password-submit-button');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Entsperren');
    });

    it('renders cancel button', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const cancelButton = screen.getByTestId('password-cancel-button');
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveTextContent('Abbrechen');
    });

    it('displays error message when provided', () => {
      render(<PasswordPrompt {...defaultProps} errorMessage="Falsches Passwort" />);

      const error = screen.getByTestId('password-error');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Falsches Passwort');
    });

    it('does not display error when not provided', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const error = screen.queryByTestId('password-error');
      expect(error).not.toBeInTheDocument();
    });

    it('shows loading state on submit button', () => {
      render(<PasswordPrompt {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByTestId('password-submit-button');
      expect(submitButton).toHaveTextContent('Prüfe...');
    });
  });

  describe('User Interactions', () => {
    it('calls onSubmit with password when form submitted', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} />);

      const input = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('password-submit-button');

      await user.type(input, 'TestPassword123');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('TestPassword123');
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit on Enter key press', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} />);

      const input = screen.getByTestId('password-input');

      await user.type(input, 'TestPassword123{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledWith('TestPassword123');
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} />);

      const cancelButton = screen.getByTestId('password-cancel-button');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onCancel when overlay clicked', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} data-testid="password-prompt" />);

      const dialog = screen.getByTestId('password-prompt');
      await user.click(dialog);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when modal content clicked', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} />);

      const input = screen.getByTestId('password-input');
      await user.click(input);

      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel on Escape key press', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('updates input value when typing', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} />);

      const input = screen.getByTestId('password-input') as HTMLInputElement;

      await user.type(input, 'MyPassword');

      expect(input.value).toBe('MyPassword');
    });

    it('does not submit when password is empty', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} />);

      const submitButton = screen.getByTestId('password-submit-button');
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not submit when password is only whitespace', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} />);

      const input = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('password-submit-button');

      await user.type(input, '   ');
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('disables submit button when password is empty', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const submitButton = screen.getByTestId('password-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when password entered', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} />);

      const input = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('password-submit-button');

      expect(submitButton).toBeDisabled();

      await user.type(input, 'Password123');

      expect(submitButton).not.toBeDisabled();
    });

    it('disables buttons when loading', () => {
      render(<PasswordPrompt {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByTestId('password-submit-button');
      const cancelButton = screen.getByTestId('password-cancel-button');

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('disables input when loading', () => {
      render(<PasswordPrompt {...defaultProps} isLoading={true} />);

      const input = screen.getByTestId('password-input');
      expect(input).toBeDisabled();
    });

    it('does not submit when loading', async () => {
      const user = userEvent.setup();
      render(<PasswordPrompt {...defaultProps} isLoading={true} />);

      const input = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('password-submit-button');

      await user.type(input, 'Password123');
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has dialog role', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to title', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'password-prompt-title');

      const title = document.getElementById('password-prompt-title');
      expect(title).toBeInTheDocument();
    });

    it('input has correct aria-invalid when error present', () => {
      render(<PasswordPrompt {...defaultProps} errorMessage="Wrong password" />);

      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('input has aria-describedby pointing to error', () => {
      render(<PasswordPrompt {...defaultProps} errorMessage="Wrong password" />);

      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('aria-describedby', 'password-error');

      const error = document.getElementById('password-error');
      expect(error).toBeInTheDocument();
    });

    it('error has alert role', () => {
      render(<PasswordPrompt {...defaultProps} errorMessage="Wrong password" />);

      const error = screen.getByTestId('password-error');
      expect(error).toHaveAttribute('role', 'alert');
    });

    it('focuses input on mount', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const input = screen.getByTestId('password-input');
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Form Behavior', () => {
    it('has autocomplete="off" on input', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('submit button has type="submit"', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const submitButton = screen.getByTestId('password-submit-button');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('cancel button has type="button"', () => {
      render(<PasswordPrompt {...defaultProps} />);

      const cancelButton = screen.getByTestId('password-cancel-button');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });
  });
});
