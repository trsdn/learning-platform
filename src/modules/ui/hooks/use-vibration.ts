/**
 * useVibration Hook
 *
 * Provides haptic feedback integration with user settings.
 * Connects VibrationService with AppSettings for enabled checks.
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  getVibrationService,
  type IVibrationService,
} from '../../core/services/vibration-service';
import { useAppSettings } from './use-app-settings';
import type { AppSettings } from '../../core/entities/app-settings';

export interface UseVibrationReturn {
  /** Whether the Vibration API is supported on this device */
  isSupported: boolean;
  /** Vibrate for correct answer (if enabled in settings) */
  vibrateCorrect: () => void;
  /** Vibrate for incorrect answer (if enabled in settings) */
  vibrateIncorrect: () => void;
  /** Vibrate for session completion (if enabled in settings) */
  vibrateSessionComplete: () => void;
  /** Cancel any ongoing vibration */
  cancel: () => void;
}

/**
 * Hook for haptic feedback with settings integration
 *
 * Provides vibration functions that automatically respect user settings
 * including master toggle, individual feedback type toggles, and reduced
 * motion preferences.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { vibrateCorrect, isSupported } = useVibration();
 *
 *   const handleSuccess = () => {
 *     vibrateCorrect(); // Automatically checks settings
 *   };
 *
 *   return <button onClick={handleSuccess}>Submit</button>;
 * }
 * ```
 *
 * @see {@link IVibrationService} for low-level vibration control
 * @see {@link AppSettings.interaction} for related settings
 *
 * @returns Object containing vibration functions and support status
 */
export function useVibration(): UseVibrationReturn {
  const { settings } = useAppSettings();
  // Initialize service synchronously to ensure isSupported is accurate on first render
  const serviceRef = useRef<IVibrationService>(getVibrationService());
  // Use ref to always have latest settings without triggering callback recreation
  const settingsRef = useRef<AppSettings | null>(settings);

  // Keep settings ref in sync
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Configure enabled check callback
  // This callback reads from settingsRef to always get latest settings
  useEffect(() => {
    serviceRef.current.setEnabledCheck(() => {
      const currentSettings = settingsRef.current;
      if (!currentSettings) return false;
      // Master toggle must be enabled
      if (!currentSettings.interaction.vibrationsEnabled) return false;
      // Respect reduced motion preference
      if (currentSettings.theme.reducedMotion) return false;
      return true;
    });
  }, []);

  // Stable callbacks - use refs to avoid recreation on settings change
  const vibrateCorrect = useCallback(() => {
    const s = settingsRef.current;
    if (!s?.interaction.vibrationOnCorrect) return;
    serviceRef.current.vibrateSuccess();
  }, []);

  const vibrateIncorrect = useCallback(() => {
    const s = settingsRef.current;
    if (!s?.interaction.vibrationOnIncorrect) return;
    serviceRef.current.vibrateError();
  }, []);

  const vibrateSessionComplete = useCallback(() => {
    const s = settingsRef.current;
    if (!s?.interaction.vibrationOnSessionComplete) return;
    serviceRef.current.vibrateSessionComplete();
  }, []);

  const cancel = useCallback(() => {
    serviceRef.current.cancel();
  }, []);

  const isSupported = serviceRef.current.isSupported();

  return {
    isSupported,
    vibrateCorrect,
    vibrateIncorrect,
    vibrateSessionComplete,
    cancel,
  };
}
