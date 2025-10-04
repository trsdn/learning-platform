import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallHook {
  canInstall: boolean;
  isInstalled: boolean;
  isSupported: boolean;
  install: () => Promise<boolean>;
  dismissPrompt: () => void;
}

/**
 * Hook to manage PWA installation state and behavior
 * Handles browser compatibility, installation flow, and error cases
 */
export const usePWAInstall = (): PWAInstallHook => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check browser support for PWA features
    const checkSupport = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasManifest = 'onbeforeinstallprompt' in window;
      return hasServiceWorker && hasManifest;
    };

    setIsSupported(checkSupport());

    // Check if app is already installed (standalone mode)
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      }
      // iOS-specific check
      if ((navigator as any).standalone === true) {
        return true;
      }
      return false;
    };

    if (checkInstalled()) {
      setIsInstalled(true);
      setCanInstall(false);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setCanInstall(true);

      // Log for analytics (optional)
      console.log('PWA install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setInstallPrompt(null);

      // Log for analytics (optional)
      console.log('PWA successfully installed');
    };

    // Check for existing prompt on mount
    if (isSupported) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      if (isSupported) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, [isSupported]);

  /**
   * Trigger PWA installation prompt
   * Returns true if user accepted, false if dismissed or error occurred
   */
  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      console.warn('No install prompt available');
      return false;
    }

    if (!isSupported) {
      console.warn('PWA installation not supported in this browser');
      return false;
    }

    try {
      // Show the install prompt
      await installPrompt.prompt();

      // Wait for user choice
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted PWA installation');
        setInstallPrompt(null);
        setCanInstall(false);
        return true;
      } else {
        console.log('User dismissed PWA installation');
        return false;
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
      // Reset state on error
      setInstallPrompt(null);
      setCanInstall(false);
      return false;
    }
  }, [installPrompt, isSupported]);

  /**
   * Dismiss the install prompt without installing
   */
  const dismissPrompt = useCallback(() => {
    setInstallPrompt(null);
    setCanInstall(false);
  }, []);

  return {
    canInstall,
    isInstalled,
    isSupported,
    install,
    dismissPrompt,
  };
};
