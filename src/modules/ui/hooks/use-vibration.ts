/**
 * useVibration Hook
 *
 * Provides haptic feedback integration with user settings.
 * Connects VibrationService with AppSettings for enabled checks.
 */

import { useCallback, useEffect, useRef } from 'react';
import { getVibrationService, type IVibrationService } from '../../core/services/vibration-service';
import { useAppSettings } from './use-app-settings';

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
 */
export function useVibration(): UseVibrationReturn {
  const { settings } = useAppSettings();
  const serviceRef = useRef<IVibrationService | null>(null);

  // Initialize service on mount
  useEffect(() => {
    serviceRef.current = getVibrationService();
  }, []);

  // Configure enabled check based on settings
  useEffect(() => {
    const service = serviceRef.current;
    if (!service) return;

    service.setEnabledCheck(() => {
      if (!settings) return false;
      // Master toggle must be enabled
      if (!settings.interaction.vibrationsEnabled) return false;
      // Respect reduced motion preference
      if (settings.theme.reducedMotion) return false;
      return true;
    });
  }, [settings]);

  const vibrateCorrect = useCallback(() => {
    if (!settings?.interaction.vibrationOnCorrect) return;
    serviceRef.current?.vibrateSuccess();
  }, [settings?.interaction.vibrationOnCorrect]);

  const vibrateIncorrect = useCallback(() => {
    if (!settings?.interaction.vibrationOnIncorrect) return;
    serviceRef.current?.vibrateError();
  }, [settings?.interaction.vibrationOnIncorrect]);

  const vibrateSessionComplete = useCallback(() => {
    if (!settings?.interaction.vibrationOnSessionComplete) return;
    serviceRef.current?.vibrateSessionComplete();
  }, [settings?.interaction.vibrationOnSessionComplete]);

  const cancel = useCallback(() => {
    serviceRef.current?.cancel();
  }, []);

  const isSupported = serviceRef.current?.isSupported() ?? false;

  return {
    isSupported,
    vibrateCorrect,
    vibrateIncorrect,
    vibrateSessionComplete,
    cancel,
  };
}
