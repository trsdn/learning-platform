/**
 * Tests for the password recovery form in AuthModal.
 *
 * Password reset emails used to land on a screen that offered no way to choose
 * a new password, so recovery could never be completed. These tests pin the
 * form's validation and the call into `updatePassword()`.
 *
 * Covers the fix for #232.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import '../../../../setup/a11y-matchers';
import { AuthModal } from '@/modules/ui/components/auth/auth-modal';

const updatePassword = vi.fn();

vi.mock('@/modules/ui/contexts/auth-context', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword,
  }),
}));

vi.mock('@/modules/core/services/supabase-auth-service', () => ({
  getAuthErrorMessage: (error: { message?: string } | null) =>
    error?.message ?? 'Unbekannter Fehler',
}));

describe('AuthModal password recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updatePassword.mockResolvedValue({ error: null });
  });

  const renderRecovery = (onClose = vi.fn()) => {
    render(<AuthModal defaultTab="recovery" onClose={onClose} />);
    return { onClose, user: userEvent.setup() };
  };

  const fields = () => ({
    password: screen.getByLabelText('Neues Passwort'),
    confirmation: screen.getByLabelText('Passwort bestätigen'),
    submit: screen.getByRole('button', { name: /Passwort speichern/ }),
  });

  it('offers a confirmed new-password form', () => {
    renderRecovery();

    const { password, confirmation } = fields();

    expect(password).toHaveAttribute('type', 'password');
    expect(password).toHaveAttribute('autocomplete', 'new-password');
    expect(confirmation).toHaveAttribute('type', 'password');
  });

  it('hides the sign-in tabs while recovering', () => {
    renderRecovery();

    expect(screen.queryByRole('button', { name: 'Anmelden' })).not.toBeInTheDocument();
  });

  it('saves the new password and closes', async () => {
    const { onClose, user } = renderRecovery();
    const { password, confirmation, submit } = fields();

    await user.type(password, 'newPassword123');
    await user.type(confirmation, 'newPassword123');
    await user.click(submit);

    await waitFor(() => expect(updatePassword).toHaveBeenCalledWith('newPassword123'));
    expect(onClose).toHaveBeenCalled();
  });

  it('rejects mismatched passwords without calling the service', async () => {
    const { onClose, user } = renderRecovery();
    const { password, confirmation, submit } = fields();

    await user.type(password, 'newPassword123');
    await user.type(confirmation, 'differentPassword');
    await user.click(submit);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Die Passwörter stimmen nicht überein.'
    );
    expect(updatePassword).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('reports why a rejected password could not be saved', async () => {
    updatePassword.mockResolvedValue({ error: { message: 'Passwort ist zu schwach' } });

    const { onClose, user } = renderRecovery();
    const { password, confirmation, submit } = fields();

    await user.type(password, 'newPassword123');
    await user.type(confirmation, 'newPassword123');
    await user.click(submit);

    expect(await screen.findByRole('alert')).toHaveTextContent('Passwort ist zu schwach');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('has no WCAG violations', async () => {
    const { container } = render(<AuthModal defaultTab="recovery" onClose={vi.fn()} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
