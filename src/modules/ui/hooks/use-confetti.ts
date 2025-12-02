/**
 * useConfetti Hook
 *
 * Provides confetti celebration animations with settings integration.
 * Connects ConfettiService with AppSettings for enabled/accessibility checks.
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  getConfettiService,
  type IConfettiService,
  type ConfettiTrigger,
} from '../../core/services/confetti-service';
import { getCelebrationSoundService } from '../../core/services/celebration-sound-service';
import { useAppSettings } from './use-app-settings';
import type { ConfettiStyle, ConfettiIntensity } from '../../core/entities/app-settings';

export interface ConfettiOptions {
  /** Override the confetti style from settings */
  style?: ConfettiStyle;
  /** Override the confetti intensity from settings */
  intensity?: ConfettiIntensity;
  /** Whether to play celebration sound */
  withSound?: boolean;
  /** Trigger type for analytics */
  trigger?: ConfettiTrigger;
}

export interface UseConfettiReturn {
  /** Whether confetti animations are supported on this device */
  isSupported: boolean;
  /** Whether confetti is enabled in settings */
  isEnabled: boolean;
  /** Fire confetti with optional overrides */
  fire: (options?: ConfettiOptions) => Promise<void>;
  /** Fire confetti for perfect session (100% accuracy, 5+ questions) */
  firePerfectSession: () => Promise<void>;
  /** Fire confetti for streak milestone */
  fireStreakMilestone: (days: number) => Promise<void>;
  /** Fire confetti for level up / learning path completion */
  fireLevelUp: () => Promise<void>;
  /** Fire confetti for first-time achievements */
  fireFirstAchievement: () => Promise<void>;
  /** Fire confetti for special events (birthday, new year, etc.) */
  fireSpecialEvent: () => Promise<void>;
  /** Cancel any active confetti animations */
  cancel: () => void;
}

/**
 * Hook for confetti celebrations with settings integration
 */
export function useConfetti(): UseConfettiReturn {
  const { settings } = useAppSettings();
  const serviceRef = useRef<IConfettiService | null>(null);
  const isSupportedRef = useRef(false);

  // Initialize service on mount
  useEffect(() => {
    serviceRef.current = getConfettiService();
    isSupportedRef.current = serviceRef.current.isSupported();
  }, []);

  // Configure enabled and accessibility checks based on settings
  useEffect(() => {
    const service = serviceRef.current;
    if (!service) return;

    // Check if confetti is enabled in settings
    service.setEnabledCheck(() => {
      if (!settings) return false;
      return settings.interaction.confettiEnabled;
    });

    // Check if animations should be skipped for accessibility
    service.setAccessibilityCheck(() => {
      if (!settings) return false;
      // Skip if reduced motion is enabled or animations are disabled
      return settings.theme.reducedMotion || !settings.theme.animationsEnabled;
    });
  }, [settings]);

  // Configure sound service
  useEffect(() => {
    if (!settings) return;

    const soundService = getCelebrationSoundService();

    // Check if both confetti sound and general sound effects are enabled
    soundService.setEnabledCheck(() => {
      return (
        settings.interaction.confettiSoundEnabled && settings.audio.soundEffectsEnabled
      );
    });

    // Use sound effects volume from settings
    soundService.setVolumeGetter(() => settings.audio.soundEffectsVolume);

    // Preload audio for faster playback
    soundService.preload();
  }, [settings]);

  /**
   * Fire confetti with optional overrides
   */
  const fire = useCallback(
    async (options?: ConfettiOptions) => {
      if (!settings?.interaction.confettiEnabled) return;

      const style = options?.style ?? settings.interaction.confettiStyle;
      const intensity = options?.intensity ?? settings.interaction.confettiIntensity;

      await serviceRef.current?.fire(style, intensity);

      // Play sound if requested and enabled
      if (options?.withSound !== false && settings.interaction.confettiSoundEnabled) {
        const soundService = getCelebrationSoundService();
        await soundService.playConfettiSound();
      }
    },
    [settings]
  );

  /**
   * Fire confetti for perfect session
   */
  const firePerfectSession = useCallback(async () => {
    await fire({ withSound: true, trigger: 'perfect-session' });
  }, [fire]);

  /**
   * Fire confetti for streak milestone with intensity based on days
   */
  const fireStreakMilestone = useCallback(
    async (days: number) => {
      // Increase intensity based on milestone
      let intensity: ConfettiIntensity = 'light';
      if (days >= 100) {
        intensity = 'strong';
      } else if (days >= 30) {
        intensity = 'medium';
      }

      await fire({ intensity, withSound: true, trigger: 'streak-milestone' });
    },
    [fire]
  );

  /**
   * Fire confetti for level up / learning path completion
   */
  const fireLevelUp = useCallback(async () => {
    await fire({ withSound: true, trigger: 'level-up' });
  }, [fire]);

  /**
   * Fire confetti for first-time achievements
   */
  const fireFirstAchievement = useCallback(async () => {
    // Use firework style for first achievements
    await fire({ style: 'firework', withSound: true, trigger: 'first-achievement' });
  }, [fire]);

  /**
   * Fire confetti for special events
   */
  const fireSpecialEvent = useCallback(async () => {
    // Use emoji style and strong intensity for special events
    await fire({
      style: 'emoji',
      intensity: 'strong',
      withSound: true,
      trigger: 'special-event',
    });
  }, [fire]);

  /**
   * Cancel any active confetti animations
   */
  const cancel = useCallback(() => {
    serviceRef.current?.cancel();
  }, []);

  return {
    isSupported: isSupportedRef.current,
    isEnabled: settings?.interaction.confettiEnabled ?? false,
    fire,
    firePerfectSession,
    fireStreakMilestone,
    fireLevelUp,
    fireFirstAchievement,
    fireSpecialEvent,
    cancel,
  };
}
