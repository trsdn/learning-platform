/**
 * useWakeLock Hook
 *
 * Keeps the screen on during practice sessions.
 * Connects WakeLockService with AppSettings for enabled checks.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getWakeLockService, type IWakeLockService } from '../../core/services/wake-lock-service';
import { useAppSettings } from './use-app-settings';

export interface UseWakeLockReturn {
  /** Whether the Wake Lock API is supported on this device */
  isSupported: boolean;
  /** Whether wake lock is currently active */
  isActive: boolean;
  /** Acquire wake lock to keep screen on */
  acquire: () => Promise<void>;
  /** Release wake lock */
  release: () => Promise<void>;
}

/**
 * Hook for screen wake lock with settings integration
 */
export function useWakeLock(): UseWakeLockReturn {
  const { settings } = useAppSettings();
  // Initialize service synchronously to avoid race conditions
  const serviceRef = useRef<IWakeLockService>(getWakeLockService());
  const [isActive, setIsActive] = useState(false);
  // isSupported is constant - Wake Lock API support doesn't change at runtime
  const isSupported = serviceRef.current.isSupported();

  // Configure enabled check based on settings
  useEffect(() => {
    serviceRef.current.setEnabledCheck(() => {
      if (!settings) return false;
      // Check if wake lock is enabled in settings
      if (!settings.interaction.wakeLockEnabled) return false;
      return true;
    });
  }, [settings]);

  const acquire = useCallback(async () => {
    if (!settings?.interaction.wakeLockEnabled) return;

    const success = await serviceRef.current.acquire();
    setIsActive(success);
  }, [settings?.interaction.wakeLockEnabled]);

  const release = useCallback(async () => {
    await serviceRef.current.release();
    setIsActive(false);
  }, []);

  return {
    isSupported,
    isActive,
    acquire,
    release,
  };
}
