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
  const serviceRef = useRef<IWakeLockService | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Initialize service on mount
  useEffect(() => {
    serviceRef.current = getWakeLockService();
  }, []);

  // Configure enabled check based on settings
  useEffect(() => {
    const service = serviceRef.current;
    if (!service) return;

    service.setEnabledCheck(() => {
      if (!settings) return false;
      // Check if wake lock is enabled in settings
      if (!settings.interaction.wakeLockEnabled) return false;
      return true;
    });
  }, [settings]);

  const acquire = useCallback(async () => {
    if (!settings?.interaction.wakeLockEnabled) return;

    const success = await serviceRef.current?.acquire();
    setIsActive(success ?? false);
  }, [settings?.interaction.wakeLockEnabled]);

  const release = useCallback(async () => {
    await serviceRef.current?.release();
    setIsActive(false);
  }, []);

  const isSupported = serviceRef.current?.isSupported() ?? false;

  return {
    isSupported,
    isActive,
    acquire,
    release,
  };
}
