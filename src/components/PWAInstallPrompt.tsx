import React, { useEffect, useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { logger } from '@/utils/logger';
import styles from './PWAInstallPrompt.module.css';

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
        logger.debug('PWA installed successfully');
        // Analytics tracking could go here
      } else {
        logger.debug('PWA installation cancelled by user');
      }
    } catch (error) {
      logger.error('PWA installation error:', error);
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
      className={styles.prompt}
    >
      <div className={styles.content}>
        <h3
          id="pwa-install-title"
          className={styles.title}
        >
          App installieren
        </h3>
        <p
          id="pwa-install-description"
          className={styles.description}
        >
          Installieren Sie MindForge Academy für schnelleren Zugriff und vollständige Offline-Nutzung.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleDismiss}
          onKeyDown={(e) => handleKeyDown(e, 'dismiss')}
          aria-label="Installation später durchführen"
          className={styles.dismissButton}
        >
          Später
        </button>

        <button
          onClick={handleInstall}
          onKeyDown={(e) => handleKeyDown(e, 'install')}
          disabled={installing}
          aria-label="App jetzt installieren"
          aria-busy={installing}
          className={styles.installButton}
        >
          {installing ? 'Installiere...' : 'Installieren'}
        </button>
      </div>
    </div>
  );
};
