/**
 * Vibration Service Implementation
 *
 * Provides haptic feedback for user interactions.
 * Uses the Vibration API with graceful degradation.
 */

// Vibration patterns (in milliseconds)
const PATTERNS = {
  success: [100],
  error: [50, 50, 50],
  tap: [10],
  sessionComplete: [100, 50, 100],
} as const;

/**
 * Vibration Service Interface
 */
export interface IVibrationService {
  isSupported(): boolean;
  vibrateSuccess(): void;
  vibrateError(): void;
  vibrateTap(): void;
  vibrateSessionComplete(): void;
  cancel(): void;
  setEnabledCheck(check: () => boolean): void;
}

/**
 * VibrationService implementation using the Vibration API
 */
export class VibrationService implements IVibrationService {
  private enabledCheck: (() => boolean) | null = null;

  /**
   * Check if the Vibration API is supported
   */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  /**
   * Set a callback to check if vibration is enabled
   */
  setEnabledCheck(check: () => boolean): void {
    this.enabledCheck = check;
  }

  /**
   * Internal method to perform vibration
   */
  private vibrate(pattern: readonly number[]): void {
    // Check if vibration is supported
    if (!this.isSupported()) {
      return;
    }

    // Check if vibration is enabled via callback
    if (this.enabledCheck && !this.enabledCheck()) {
      return;
    }

    // Perform vibration
    try {
      navigator.vibrate([...pattern]);
    } catch {
      // Silently fail if vibration is not allowed
    }
  }

  /**
   * Vibrate on correct answer
   */
  vibrateSuccess(): void {
    this.vibrate(PATTERNS.success);
  }

  /**
   * Vibrate on incorrect answer
   */
  vibrateError(): void {
    this.vibrate(PATTERNS.error);
  }

  /**
   * Light tap feedback
   */
  vibrateTap(): void {
    this.vibrate(PATTERNS.tap);
  }

  /**
   * Vibrate on session completion
   */
  vibrateSessionComplete(): void {
    this.vibrate(PATTERNS.sessionComplete);
  }

  /**
   * Cancel any ongoing vibration
   */
  cancel(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate(0);
      } catch {
        // Silently fail
      }
    }
  }
}

// Singleton instance
let vibrationServiceInstance: VibrationService | null = null;

/**
 * Get the VibrationService singleton instance
 */
export function getVibrationService(): VibrationService {
  if (!vibrationServiceInstance) {
    vibrationServiceInstance = new VibrationService();
  }
  return vibrationServiceInstance;
}
