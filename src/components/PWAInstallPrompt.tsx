import React, { useEffect, useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

/**
 * PWA Installation Prompt Component
 * Displays a user-friendly prompt to install the app as a PWA
 * Includes proper ARIA labels and keyboard navigation support
 */
export const PWAInstallPrompt: React.FC = () => {
  const { canInstall, isInstalled, isSupported, install, dismissPrompt } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const success = await install();

      if (success) {
        console.log('PWA installed successfully');
        // Analytics tracking could go here
      } else {
        console.log('PWA installation cancelled by user');
      }
    } catch (error) {
      console.error('PWA installation error:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    dismissPrompt();
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'install' | 'dismiss') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action === 'install' ? handleInstall() : handleDismiss();
    }
  };

  // Don't show if already installed, dismissed, can't install, or browser doesn't support
  if (isInstalled || dismissed || !canInstall || !isSupported) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
      className="pwa-install-prompt"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '450px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1000,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div style={{ flex: 1 }}>
        <h3
          id="pwa-install-title"
          style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          App installieren
        </h3>
        <p
          id="pwa-install-description"
          style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.5',
          }}
        >
          Installieren Sie MindForge Academy für schnelleren Zugriff und vollständige Offline-Nutzung.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleDismiss}
          onKeyDown={(e) => handleKeyDown(e, 'dismiss')}
          aria-label="Installation später durchführen"
          style={{
            padding: '10px 20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: 'white',
            color: '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid #2563eb';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          Später
        </button>

        <button
          onClick={handleInstall}
          onKeyDown={(e) => handleKeyDown(e, 'install')}
          disabled={installing}
          aria-label="App jetzt installieren"
          aria-busy={installing}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: installing ? '#93c5fd' : '#2563eb',
            color: 'white',
            cursor: installing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 0.2s',
            opacity: installing ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!installing) {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }
          }}
          onMouseLeave={(e) => {
            if (!installing) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid #2563eb';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          {installing ? 'Installiere...' : 'Installieren'}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .pwa-install-prompt {
            left: 10px;
            right: 10px;
            bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
};
