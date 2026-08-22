/**
 * Authentication Modal
 *
 * Provides a tabbed interface for user authentication:
 * - Login tab: Email/password, magic link, OAuth
 * - Sign up tab: Email/password registration
 * - Password reset: Email-based password recovery
 * - Recovery: Setting a new password after following a reset link
 */

import React, { useState } from 'react';
import { useAuth } from '@/modules/ui/contexts/auth-context';
import { getAuthErrorMessage } from '@/modules/core/services/supabase-auth-service';
import type { AuthError } from '@supabase/supabase-js';

type AuthTab = 'login' | 'signup' | 'reset' | 'recovery';

/** Matches the minimum length enforced on the sign up form. */
const MIN_PASSWORD_LENGTH = 6;

interface AuthModalProps {
  onClose?: () => void;
  defaultTab?: AuthTab;
}

export function AuthModal({ onClose, defaultTab = 'login' }: AuthModalProps) {
  const { signIn, signUp, resetPassword, updatePassword } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setError(null);
    setSuccess(null);
  };

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn({ email, password });

    if (error) {
      setError(getAuthErrorMessage(error as AuthError | null));
      setLoading(false);
    } else {
      // Success - context will handle state update
      onClose?.();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await signUp({ email, password, ...(displayName && { displayName }) });

    setLoading(false);

    if (error) {
      setError(getAuthErrorMessage(error as AuthError | null));
    } else {
      setSuccess('Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.');
      resetForm();
    }
  };



  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await resetPassword(email);

    setLoading(false);

    if (error) {
      setError(getAuthErrorMessage(error as AuthError | null));
    } else {
      setSuccess('Passwort-Reset-Link wurde an Ihre E-Mail-Adresse gesendet.');
      setEmail('');
    }
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);

    const { error } = await updatePassword(password);

    setLoading(false);

    if (error) {
      setError(getAuthErrorMessage(error as AuthError | null));
      return;
    }

    setPassword('');
    setConfirmPassword('');
    setSuccess('Passwort erfolgreich geändert. Du bist jetzt angemeldet.');
    onClose?.();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>🧠 MindForge Academy</h2>
          {onClose && (
            <button className="close-button" onClick={onClose} aria-label="Schließen">
              ✕
            </button>
          )}
        </div>

        {/* Tabs - Registration disabled, login only */}
        {activeTab !== 'recovery' && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => handleTabChange('login')}
            >
              Anmelden
            </button>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="auth-message error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="auth-message success" role="status">
            <span>✅</span> {success}
          </div>
        )}

        {/* Login Tab */}
        {activeTab === 'login' && (
          <div className="auth-content">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-email">E-Mail</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Passwort</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Anmelden...' : '🔑 Anmelden'}
              </button>
            </form>

            <button
              type="button"
              className="link-button"
              onClick={() => handleTabChange('reset')}
            >
              Passwort vergessen?
            </button>
          </div>
        )}

        {/* Sign Up Tab */}
        {activeTab === 'signup' && (
          <div className="auth-content">
            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <label htmlFor="signup-name">Name (optional)</label>
                <input
                  id="signup-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Dein Name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">E-Mail</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Passwort</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Registrieren...' : '✨ Konto erstellen'}
              </button>
            </form>

            <p className="auth-note">
              Mit der Registrierung akzeptierst du unsere Nutzungsbedingungen.
            </p>
          </div>
        )}

        {/* Password Reset Tab */}
        {activeTab === 'reset' && (
          <div className="auth-content">
            <p className="auth-description">
              Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.
            </p>

            <form onSubmit={handlePasswordReset}>
              <div className="form-group">
                <label htmlFor="reset-email">E-Mail</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Senden...' : '📧 Reset-Link senden'}
              </button>
            </form>

            <button
              type="button"
              className="link-button"
              onClick={() => handleTabChange('login')}
            >
              ← Zurück zur Anmeldung
            </button>
          </div>
        )}

        {/* New Password (opened from a recovery link) */}
        {activeTab === 'recovery' && (
          <div className="auth-content">
            <p className="auth-description">
              Wähle ein neues Passwort für dein Konto.
            </p>

            <form onSubmit={handleNewPassword}>
              <div className="form-group">
                <label htmlFor="recovery-password">Neues Passwort</label>
                <input
                  id="recovery-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Mindestens ${MIN_PASSWORD_LENGTH} Zeichen`}
                  autoComplete="new-password"
                  aria-describedby="recovery-password-hint"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  disabled={loading}
                />
                <p id="recovery-password-hint" className="auth-note">
                  Mindestens {MIN_PASSWORD_LENGTH} Zeichen.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="recovery-password-confirm">Passwort bestätigen</label>
                <input
                  id="recovery-password-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Speichern...' : '🔒 Passwort speichern'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
