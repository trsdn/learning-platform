/**
 * Confetti Service Implementation
 *
 * Provides celebration animations for achievements.
 * Uses canvas-confetti with graceful degradation and lazy loading.
 */

import type { ConfettiStyle, ConfettiIntensity } from '../entities/app-settings';

// Type for the confetti function
type ConfettiFn = (options?: {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  shapes?: ('square' | 'circle')[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}) => Promise<null> | null;

// Intensity configurations
interface IntensityConfig {
  particleCount: number;
  spread: number;
  duration: number;
}

const INTENSITY_CONFIG: Record<ConfettiIntensity, IntensityConfig> = {
  light: { particleCount: 50, spread: 55, duration: 2000 },
  medium: { particleCount: 100, spread: 70, duration: 3000 },
  strong: { particleCount: 200, spread: 90, duration: 4000 },
};

// Color palette for confetti
const CONFETTI_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4ade80', '#fbbf24', '#fb7185'];

/**
 * Confetti trigger types for analytics and customization
 */
export type ConfettiTrigger =
  | 'perfect-session'
  | 'streak-milestone'
  | 'level-up'
  | 'first-achievement'
  | 'special-event';

/**
 * Confetti Service Interface
 */
export interface IConfettiService {
  isSupported(): boolean;
  fire(style: ConfettiStyle, intensity: ConfettiIntensity): Promise<void>;
  fireStandard(intensity: ConfettiIntensity): Promise<void>;
  fireFirework(intensity: ConfettiIntensity): Promise<void>;
  fireCannon(intensity: ConfettiIntensity): Promise<void>;
  fireEmoji(intensity: ConfettiIntensity): Promise<void>;
  cancel(): void;
  setEnabledCheck(check: () => boolean): void;
  setAccessibilityCheck(check: () => boolean): void;
}

/**
 * ConfettiService implementation using canvas-confetti
 */
export class ConfettiService implements IConfettiService {
  private enabledCheck: (() => boolean) | null = null;
  private accessibilityCheck: (() => boolean) | null = null;
  private confettiFn: ConfettiFn | null = null;
  private resetFn: (() => void) | null = null;
  private activeIntervals: number[] = [];

  /**
   * Check if confetti can be displayed
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * Set a callback to check if confetti is enabled in settings
   */
  setEnabledCheck(check: () => boolean): void {
    this.enabledCheck = check;
  }

  /**
   * Set a callback to check if animations should be skipped for accessibility
   */
  setAccessibilityCheck(check: () => boolean): void {
    this.accessibilityCheck = check;
  }

  /**
   * Lazy load the canvas-confetti library
   */
  private async loadConfetti(): Promise<ConfettiFn | null> {
    if (!this.isSupported()) return null;

    if (!this.confettiFn) {
      try {
        const confettiModule = await import('canvas-confetti');
        // canvas-confetti exports the function as default
        this.confettiFn = confettiModule.default as unknown as ConfettiFn;
        // Store reset function for cleanup
        this.resetFn = (confettiModule.default as unknown as { reset?: () => void }).reset ?? null;
      } catch (error) {
        console.warn('[Confetti] Failed to load canvas-confetti:', error);
        return null;
      }
    }
    return this.confettiFn;
  }

  /**
   * Check if confetti should be skipped due to settings or accessibility
   */
  private shouldSkip(): boolean {
    // Check if enabled in settings
    if (this.enabledCheck && !this.enabledCheck()) {
      return true;
    }

    // Check accessibility settings
    if (this.accessibilityCheck && this.accessibilityCheck()) {
      return true;
    }

    // Check system preference for reduced motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return true;
    }

    return false;
  }

  /**
   * Get device-optimized configuration
   */
  private getDeviceConfig(intensity: ConfettiIntensity): IntensityConfig {
    const baseConfig = INTENSITY_CONFIG[intensity];

    // Reduce particles on mobile devices
    const isMobile = typeof navigator !== 'undefined' && /mobile/i.test(navigator.userAgent);
    const isLowEnd =
      typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 4) < 4;

    if (isMobile || isLowEnd) {
      return {
        particleCount: Math.floor(baseConfig.particleCount * 0.5),
        spread: baseConfig.spread,
        duration: Math.floor(baseConfig.duration * 0.7),
      };
    }

    return baseConfig;
  }

  /**
   * Fire confetti with the specified style and intensity
   */
  async fire(style: ConfettiStyle, intensity: ConfettiIntensity): Promise<void> {
    switch (style) {
      case 'standard':
        return this.fireStandard(intensity);
      case 'firework':
        return this.fireFirework(intensity);
      case 'cannon':
        return this.fireCannon(intensity);
      case 'emoji':
        return this.fireEmoji(intensity);
      default:
        return this.fireStandard(intensity);
    }
  }

  /**
   * Standard confetti burst from center
   */
  async fireStandard(intensity: ConfettiIntensity): Promise<void> {
    if (this.shouldSkip()) return;

    const confetti = await this.loadConfetti();
    if (!confetti) return;

    const config = this.getDeviceConfig(intensity);

    await confetti({
      particleCount: config.particleCount,
      spread: config.spread,
      origin: { y: 0.6 },
      colors: CONFETTI_COLORS,
    });
  }

  /**
   * Firework effect - multiple bursts from random positions
   */
  async fireFirework(intensity: ConfettiIntensity): Promise<void> {
    if (this.shouldSkip()) return;

    const confetti = await this.loadConfetti();
    if (!confetti) return;

    const config = this.getDeviceConfig(intensity);
    const animationEnd = Date.now() + config.duration;

    const frame = (): void => {
      if (Date.now() >= animationEnd) return;

      confetti({
        particleCount: Math.floor(config.particleCount / 5),
        angle: Math.random() * 360,
        spread: config.spread,
        startVelocity: 30 + Math.random() * 20,
        origin: { x: Math.random(), y: Math.random() * 0.4 },
        colors: CONFETTI_COLORS,
        ticks: 200,
        gravity: 0.8,
      });

      const intervalId = window.setTimeout(frame, 250);
      this.activeIntervals.push(intervalId);
    };

    frame();
  }

  /**
   * Cannon effect - shoots from both bottom corners
   */
  async fireCannon(intensity: ConfettiIntensity): Promise<void> {
    if (this.shouldSkip()) return;

    const confetti = await this.loadConfetti();
    if (!confetti) return;

    const config = this.getDeviceConfig(intensity);

    // Left cannon
    confetti({
      particleCount: Math.floor(config.particleCount / 2),
      angle: 60,
      spread: 45,
      origin: { x: 0, y: 1 },
      startVelocity: 55,
      colors: CONFETTI_COLORS,
      gravity: 1.2,
    });

    // Right cannon
    confetti({
      particleCount: Math.floor(config.particleCount / 2),
      angle: 120,
      spread: 45,
      origin: { x: 1, y: 1 },
      startVelocity: 55,
      colors: CONFETTI_COLORS,
      gravity: 1.2,
    });
  }

  /**
   * Emoji-style confetti with shapes and larger particles
   */
  async fireEmoji(intensity: ConfettiIntensity): Promise<void> {
    if (this.shouldSkip()) return;

    const confetti = await this.loadConfetti();
    if (!confetti) return;

    const config = this.getDeviceConfig(intensity);
    const animationEnd = Date.now() + config.duration;

    const frame = (): void => {
      if (Date.now() >= animationEnd) return;

      // Left side
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: CONFETTI_COLORS,
        shapes: ['circle', 'square'],
        scalar: 1.5,
      });

      // Right side
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: CONFETTI_COLORS,
        shapes: ['circle', 'square'],
        scalar: 1.5,
      });

      const timeoutId = window.requestAnimationFrame(() => {
        const intervalId = window.setTimeout(frame, 30);
        this.activeIntervals.push(intervalId);
      });
      this.activeIntervals.push(timeoutId);
    };

    frame();
  }

  /**
   * Cancel all active confetti animations
   */
  cancel(): void {
    // Clear all active intervals
    for (const id of this.activeIntervals) {
      window.clearTimeout(id);
      window.cancelAnimationFrame(id);
    }
    this.activeIntervals = [];

    // Reset canvas-confetti if loaded
    if (this.resetFn) {
      this.resetFn();
    }
  }
}

// Singleton instance
let confettiServiceInstance: ConfettiService | null = null;

/**
 * Get the ConfettiService singleton instance
 */
export function getConfettiService(): ConfettiService {
  if (!confettiServiceInstance) {
    confettiServiceInstance = new ConfettiService();
  }
  return confettiServiceInstance;
}
