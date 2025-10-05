import React, { useState, useEffect, useRef } from 'react';

/**
 * Password Prompt Component
 *
 * Modal dialog for entering password to access password-protected learning paths.
 * German language interface with accessibility features.
 */

export interface PasswordPromptProps {
  /** Title of the learning path being accessed */
  title: string;
  /** Called when user submits password - receives the entered password */
  onSubmit: (password: string) => void;
  /** Called when user cancels authentication */
  onCancel: () => void;
  /** Error message to display (e.g., "Falsches Passwort") */
  errorMessage?: string;
  /** Whether authentication is in progress */
  isLoading?: boolean;
  /** Test ID for testing */
  'data-testid'?: string;
}

export const PasswordPrompt: React.FC<PasswordPromptProps> = ({
  title,
  onSubmit,
  onCancel,
  errorMessage,
  isLoading = false,
  'data-testid': dataTestId,
}) => {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() && !isLoading) {
      onSubmit(password);
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-primary)',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
    boxShadow: 'var(--shadow-xl)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: 'var(--color-text-primary)',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    marginBottom: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '0.5rem',
    color: 'var(--color-text-primary)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    fontSize: '16px',
    border: errorMessage ? '2px solid var(--color-error)' : '2px solid var(--color-border)',
    borderRadius: '8px',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const errorStyle: React.CSSProperties = {
    color: 'var(--color-error)',
    fontSize: '14px',
    marginTop: '0.5rem',
    minHeight: '20px',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
  };

  const buttonBaseStyle: React.CSSProperties = {
    flex: 1,
    padding: '0.75rem 1.5rem',
    fontSize: '16px',
    fontWeight: 500,
    borderRadius: '8px',
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  };

  const submitButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    opacity: isLoading || !password.trim() ? 0.5 : 1,
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    border: '2px solid var(--color-border)',
  };

  return (
    <div
      style={overlayStyle}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-prompt-title"
      data-testid={dataTestId}
    >
      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <h2 id="password-prompt-title" style={titleStyle}>
          🔒 Passwort erforderlich
        </h2>
        <p style={subtitleStyle}>
          Dieser Lernpfad ist passwortgeschützt: <strong>{title}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="password-input" style={labelStyle}>
            Passwort eingeben
          </label>
          <input
            ref={inputRef}
            id="password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            disabled={isLoading}
            autoComplete="off"
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? 'password-error' : undefined}
            data-testid="password-input"
          />
          {errorMessage && (
            <div
              id="password-error"
              role="alert"
              style={errorStyle}
              data-testid="password-error"
            >
              {errorMessage}
            </div>
          )}

          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={onCancel}
              style={cancelButtonStyle}
              disabled={isLoading}
              data-testid="password-cancel-button"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              style={submitButtonStyle}
              disabled={isLoading || !password.trim()}
              data-testid="password-submit-button"
            >
              {isLoading ? 'Prüfe...' : 'Entsperren'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
