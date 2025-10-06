import React, { useState, useEffect, useRef } from 'react';

export interface WebsiteLoginScreenProps {
  onSubmit: (password: string) => void;
  errorMessage?: string;
  isLoading?: boolean;
}

/**
 * Full-screen login gate for website access
 */
export function WebsiteLoginScreen({ onSubmit, errorMessage, isLoading }: WebsiteLoginScreenProps) {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus password input on mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() && !isLoading) {
      onSubmit(password);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-primary)',
        fontFamily: 'system-ui, sans-serif',
        zIndex: 10000,
      }}
      data-testid="website-login-screen"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠 MindForge Academy</h1>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
            🔒 Zugang zur Lernplattform
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="website-password"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              Passwort eingeben
            </label>
            <input
              ref={inputRef}
              type="password"
              id="website-password"
              data-testid="website-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Passwort"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid var(--color-bg-tertiary)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              aria-invalid={!!errorMessage}
              aria-describedby={errorMessage ? 'password-error' : undefined}
            />
          </div>

          {errorMessage && (
            <div
              id="password-error"
              data-testid="website-password-error"
              role="alert"
              style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: 'var(--color-error-bg, #fee)',
                color: 'var(--color-error, #c00)',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            data-testid="website-login-submit"
            disabled={isLoading || !password.trim()}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: 500,
              color: '#fff',
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading || !password.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !password.trim() ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {isLoading ? 'Wird überprüft...' : 'Anmelden'}
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong>⚠️ Hinweis:</strong> Diese Plattform verwendet client-seitige Authentifizierung für
          Klassenzimmer und Familien. Nicht für sensible Daten geeignet.
        </div>
      </div>
    </div>
  );
}
