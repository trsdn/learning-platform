/**
 * WebsiteLoginScreen Component Tests
 *
 * These tests validate the WebsiteLoginScreen component's rendering,
 * interaction, and accessibility.
 *
 * Feature: Website Password Protection
 * Branch: feature/website-password-protection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WebsiteLoginScreen, type WebsiteLoginScreenProps } from '@ui/components/website-login-screen';

describe('WebsiteLoginScreen', () => {
  let defaultProps: WebsiteLoginScreenProps;

  beforeEach(() => {
    defaultProps = {
      onSubmit: vi.fn(),
      errorMessage: undefined,
      isLoading: false,
    };
  });

  describe('Rendering', () => {
    it('should render the login screen', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      expect(screen.getByTestId('website-login-screen')).toBeInTheDocument();
    });

    it('should render the title', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      expect(screen.getByText(/MindForge Academy/i)).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      expect(screen.getByText(/Zugang zur Lernplattform/i)).toBeInTheDocument();
    });

    it('should render the password input field', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      const input = screen.getByTestId('website-password-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render the submit button', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      expect(screen.getByTestId('website-login-submit')).toBeInTheDocument();
    });

    it('should render the security warning', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      expect(screen.getByText(/client-seitige Authentifizierung/i)).toBeInTheDocument();
    });

    it('should render with placeholder text', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      const input = screen.getByPlaceholderText('Passwort');
      expect(input).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      expect(screen.getByLabelText('Passwort eingeben')).toBeInTheDocument();
    });
  });

  describe('Auto-Focus', () => {
    it('should auto-focus the password input on mount', async () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      const input = screen.getByTestId('website-password-input');

      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });
  });

  describe('Error Display', () => {
    it('should not display error message by default', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      expect(screen.queryByTestId('website-password-error')).not.toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      const errorMessage = 'Das eingegebene Passwort ist nicht korrekt.';
      render(<WebsiteLoginScreen {...defaultProps} errorMessage={errorMessage} />);

      const error = screen.getByTestId('website-password-error');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent(errorMessage);
    });

    it('should have alert role for error message', () => {
      render(<WebsiteLoginScreen {...defaultProps} errorMessage="Error occurred" />);
      const error = screen.getByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('should link error to input via aria-describedby', () => {
      render(<WebsiteLoginScreen {...defaultProps} errorMessage="Error message" />);
      const input = screen.getByTestId('website-password-input');
      expect(input).toHaveAttribute('aria-describedby', 'password-error');
    });

    it('should mark input as invalid when error exists', () => {
      render(<WebsiteLoginScreen {...defaultProps} errorMessage="Invalid password" />);
      const input = screen.getByTestId('website-password-input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Loading State', () => {
    it('should show loading text when isLoading is true', () => {
      render(<WebsiteLoginScreen {...defaultProps} isLoading={true} />);
      const button = screen.getByTestId('website-login-submit');
      expect(button).toHaveTextContent('Wird überprüft...');
    });

    it('should show normal text when not loading', () => {
      render(<WebsiteLoginScreen {...defaultProps} isLoading={false} />);
      const button = screen.getByTestId('website-login-submit');
      expect(button).toHaveTextContent('Anmelden');
    });

    it('should disable input when loading', () => {
      render(<WebsiteLoginScreen {...defaultProps} isLoading={true} />);
      const input = screen.getByTestId('website-password-input');
      expect(input).toBeDisabled();
    });

    it('should disable button when loading', () => {
      render(<WebsiteLoginScreen {...defaultProps} isLoading={true} />);
      const button = screen.getByTestId('website-login-submit');
      expect(button).toBeDisabled();
    });
  });

  describe('Button State', () => {
    it('should disable button when password is empty', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      const button = screen.getByTestId('website-login-submit');
      expect(button).toBeDisabled();
    });

    it('should disable button when password is only whitespace', async () => {
      const user = userEvent.setup();
      render(<WebsiteLoginScreen {...defaultProps} />);

      const input = screen.getByTestId('website-password-input');
      await user.type(input, '   ');

      const button = screen.getByTestId('website-login-submit');
      expect(button).toBeDisabled();
    });

    it('should enable button when password has content', async () => {
      const user = userEvent.setup();
      render(<WebsiteLoginScreen {...defaultProps} />);

      const input = screen.getByTestId('website-password-input');
      await user.type(input, 'password123');

      const button = screen.getByTestId('website-login-submit');
      expect(button).not.toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup();
      render(<WebsiteLoginScreen {...defaultProps} />);

      const input = screen.getByTestId('website-password-input') as HTMLInputElement;
      await user.type(input, 'mypassword');

      expect(input.value).toBe('mypassword');
    });

    it('should call onSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByTestId('website-password-input');
      await user.type(input, 'testpassword');

      const button = screen.getByTestId('website-login-submit');
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledWith('testpassword');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByTestId('website-password-input');
      await user.type(input, 'testpassword');
      await user.keyboard('{Enter}');

      expect(onSubmit).toHaveBeenCalledWith('testpassword');
    });

    it('should not call onSubmit when password is empty', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />);

      const button = screen.getByTestId('website-login-submit');
      await user.click(button);

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should not call onSubmit when password is whitespace only', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByTestId('website-password-input');
      await user.type(input, '   ');

      // Try to submit by clicking (button will be disabled)
      const button = screen.getByTestId('website-login-submit');
      fireEvent.click(button);

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should not call onSubmit when loading', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} isLoading={true} />);

      const input = screen.getByTestId('website-password-input');
      // Can't type in disabled input, set value directly for testing
      fireEvent.change(input, { target: { value: 'password' } });

      const button = screen.getByTestId('website-login-submit');
      await user.click(button);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should submit form on Enter keydown', async () => {
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByTestId('website-password-input');
      fireEvent.change(input, { target: { value: 'password' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(onSubmit).toHaveBeenCalledWith('password');
    });

    it('should not submit on other keys', async () => {
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByTestId('website-password-input');
      fireEvent.change(input, { target: { value: 'password' } });
      fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Behavior', () => {
    it('should prevent default form submission', () => {
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByTestId('website-password-input');
      fireEvent.change(input, { target: { value: 'password' } });

      const button = screen.getByTestId('website-login-submit');
      const form = button.closest('form') as HTMLFormElement;

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility - ARIA Attributes', () => {
    it('should have proper aria-invalid when no error', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      const input = screen.getByTestId('website-password-input');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have proper aria-invalid when error exists', () => {
      render(<WebsiteLoginScreen {...defaultProps} errorMessage="Error" />);
      const input = screen.getByTestId('website-password-input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not have aria-describedby when no error', () => {
      render(<WebsiteLoginScreen {...defaultProps} />);
      const input = screen.getByTestId('website-password-input');
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in password', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByTestId('website-password-input');
      const specialPassword = '!@#$%^&*()_+-={}[]|:";\'<>?,./';
      // Use fireEvent.change for special characters that conflict with keyboard syntax
      fireEvent.change(input, { target: { value: specialPassword } });

      const button = screen.getByTestId('website-login-submit');
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledWith(specialPassword);
    });

    it('should handle unicode characters in password', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByTestId('website-password-input');
      const unicodePassword = 'テスト密码Пароль';
      fireEvent.change(input, { target: { value: unicodePassword } });

      const button = screen.getByTestId('website-login-submit');
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledWith(unicodePassword);
    });

    it('should handle long passwords', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByTestId('website-password-input');
      const longPassword = 'a'.repeat(500);
      fireEvent.change(input, { target: { value: longPassword } });

      const button = screen.getByTestId('website-login-submit');
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledWith(longPassword);
    });

    it('should clear error message styling when errorMessage becomes undefined', () => {
      const { rerender } = render(
        <WebsiteLoginScreen {...defaultProps} errorMessage="Initial error" />
      );

      expect(screen.getByTestId('website-password-error')).toBeInTheDocument();

      rerender(<WebsiteLoginScreen {...defaultProps} errorMessage={undefined} />);

      expect(screen.queryByTestId('website-password-error')).not.toBeInTheDocument();
    });
  });

  describe('Visual Structure', () => {
    it('should have full-screen fixed positioning', () => {
      const { container } = render(<WebsiteLoginScreen {...defaultProps} />);
      const screen = container.querySelector('[data-testid="website-login-screen"]');

      expect(screen).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
      });
    });

    it('should have centered content', () => {
      const { container } = render(<WebsiteLoginScreen {...defaultProps} />);
      const screen = container.querySelector('[data-testid="website-login-screen"]');

      expect(screen).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
    });

    it('should have high z-index for overlay', () => {
      const { container } = render(<WebsiteLoginScreen {...defaultProps} />);
      const screen = container.querySelector('[data-testid="website-login-screen"]');

      expect(screen).toHaveStyle({
        zIndex: '10000',
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete login flow', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      const { rerender } = render(
        <WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />
      );

      // Type password
      const input = screen.getByTestId('website-password-input');
      await user.type(input, 'lernenmachtspass');

      // Submit
      const button = screen.getByTestId('website-login-submit');
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledWith('lernenmachtspass');

      // Simulate loading state
      rerender(
        <WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} isLoading={true} />
      );

      expect(screen.getByTestId('website-login-submit')).toBeDisabled();
      expect(screen.getByText('Wird überprüft...')).toBeInTheDocument();
    });

    it('should handle error state after failed login', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      const { rerender } = render(
        <WebsiteLoginScreen {...defaultProps} onSubmit={onSubmit} />
      );

      // Type wrong password
      const input = screen.getByTestId('website-password-input');
      await user.type(input, 'wrongpassword');

      // Submit
      const button = screen.getByTestId('website-login-submit');
      await user.click(button);

      // Simulate error state
      rerender(
        <WebsiteLoginScreen
          {...defaultProps}
          onSubmit={onSubmit}
          errorMessage="Das eingegebene Passwort ist nicht korrekt."
        />
      );

      expect(screen.getByTestId('website-password-error')).toBeInTheDocument();
      expect(screen.getByText(/nicht korrekt/i)).toBeInTheDocument();
    });
  });
});
