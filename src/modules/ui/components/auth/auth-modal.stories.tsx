import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

// Since AuthModal uses the useAuth hook, we create a mock version for Storybook

const meta = {
  title: 'Features/AuthModal',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type RenderStory = StoryObj<Meta>;

type AuthTab = 'login' | 'signup' | 'reset';

// Mock AuthModal component
const MockAuthModal = ({
  defaultTab = 'login',
  onClose,
  loading = false,
  error = null,
  success = null,
}: {
  defaultTab?: AuthTab;
  onClose?: () => void;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="auth-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-color)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>MindForge Academy</h2>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Schließen"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: 'transparent',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >

            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem',
        }}>
          <button
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              background: activeTab === 'login' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'login' ? 'white' : 'var(--text-color)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onClick={() => handleTabChange('login')}
          >
            Anmelden
          </button>
          <button
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              background: activeTab === 'signup' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'signup' ? 'white' : 'var(--text-color)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onClick={() => handleTabChange('signup')}
          >
            Registrieren
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            marginBottom: '1rem',
            color: 'var(--color-error)',
          }}>
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '8px',
            marginBottom: '1rem',
            color: 'var(--color-success)',
          }}>
            <span>✅</span> {success}
          </div>
        )}

        {/* Login Tab */}
        {activeTab === 'login' && (
          <div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="login-email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  E-Mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="login-password" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  Passwort
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '⏳ Anmelden...' : '🔑 Anmelden'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => handleTabChange('reset')}
              style={{
                marginTop: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Passwort vergessen?
            </button>
          </div>
        )}

        {/* Sign Up Tab */}
        {activeTab === 'signup' && (
          <div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="signup-name" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  Name (optional)
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Dein Name"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="signup-email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  E-Mail
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="signup-password" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  Passwort
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '⏳ Registrieren...' : '✨ Konto erstellen'}
              </button>
            </form>

            <p style={{
              marginTop: '1rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}>
              Mit der Registrierung akzeptierst du unsere Nutzungsbedingungen.
            </p>
          </div>
        )}

        {/* Password Reset Tab */}
        {activeTab === 'reset' && (
          <div>
            <p style={{
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}>
              Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.
            </p>

            <form onSubmit={(e) => e.preventDefault()}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="reset-email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  E-Mail
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '⏳ Senden...' : '📧 Reset-Link senden'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => handleTabChange('login')}
              style={{
                marginTop: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
               Zurück zur Anmeldung
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Stories
export const LoginTab: RenderStory = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MockAuthModal
        defaultTab="login"
        onClose={() => console.log('Close modal')}
      />
    </div>
  ),
};

export const SignUpTab: RenderStory = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MockAuthModal
        defaultTab="signup"
        onClose={() => console.log('Close modal')}
      />
    </div>
  ),
};

export const PasswordReset: RenderStory = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MockAuthModal
        defaultTab="reset"
        onClose={() => console.log('Close modal')}
      />
    </div>
  ),
};

export const Loading: RenderStory = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MockAuthModal
        defaultTab="login"
        onClose={() => console.log('Close modal')}
        loading={true}
      />
    </div>
  ),
};

export const WithError: RenderStory = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MockAuthModal
        defaultTab="login"
        onClose={() => console.log('Close modal')}
        error="Ungültige E-Mail oder Passwort. Bitte versuchen Sie es erneut."
      />
    </div>
  ),
};

export const WithSuccess: RenderStory = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MockAuthModal
        defaultTab="signup"
        onClose={() => console.log('Close modal')}
        success="Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse."
      />
    </div>
  ),
};

export const ResetSuccess: RenderStory = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MockAuthModal
        defaultTab="reset"
        onClose={() => console.log('Close modal')}
        success="Passwort-Reset-Link wurde an Ihre E-Mail-Adresse gesendet."
      />
    </div>
  ),
};

export const NoCloseButton: RenderStory = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MockAuthModal
        defaultTab="login"
      />
    </div>
  ),
};
