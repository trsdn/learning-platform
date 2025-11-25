/**
 * Authentication Modal
 *
 * Provides a tabbed interface for user authentication:
 * - Login tab: Email/password, magic link, OAuth
 * - Sign up tab: Email/password registration
 * - Password reset: Email-based password recovery
 */

import React, { useState } from 'react';
import { useAuth } from '@/modules/ui/contexts/auth-context';
import { getAuthErrorMessage } from '@/modules/core/services/supabase-auth-service';

type AuthTab = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  onClose?: () => void;
  defaultTab?: AuthTab;
}

export function AuthModal({ onClose, defaultTab = 'login' }: AuthModalProps) {
  const { signIn, signUp, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
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
      setError(getAuthErrorMessage(error as any));
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
      setError(getAuthErrorMessage(error as any));
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
      setError(getAuthErrorMessage(error as any));
    } else {
      setSuccess('Passwort-Reset-Link wurde an Ihre E-Mail-Adresse gesendet.');
      setEmail('');
    }
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
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Anmelden
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="auth-message error">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="auth-message success">
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
      </div>
    </div>
  );
}
