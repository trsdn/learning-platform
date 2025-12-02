/**
 * Wake Lock Service Implementation
 *
 * Prevents the screen from dimming or locking during practice sessions.
 * Uses the Screen Wake Lock API with graceful degradation.
 */

/**
 * Wake Lock Service Interface
 */
export interface IWakeLockService {
  isSupported(): boolean;
  acquire(): Promise<boolean>;
  release(): Promise<void>;
  isActive(): boolean;
  setEnabledCheck(check: () => boolean): void;
}

/**
 * WakeLockService implementation using the Screen Wake Lock API
 */
export class WakeLockService implements IWakeLockService {
  private wakeLock: WakeLockSentinel | null = null;
  private enabledCheck: (() => boolean) | null = null;
  private visibilityHandler: (() => void) | null = null;
  private shouldBeActive = false;

  /**
   * Check if the Wake Lock API is supported
   */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  /**
   * Set a callback to check if wake lock is enabled
   */
  setEnabledCheck(check: () => boolean): void {
    this.enabledCheck = check;
  }

  /**
   * Check if wake lock is currently active
   */
  isActive(): boolean {
    return this.wakeLock !== null;
  }

  /**
   * Acquire a wake lock to keep the screen on
   */
  async acquire(): Promise<boolean> {
    // Check if wake lock is supported
    if (!this.isSupported()) {
      return false;
    }

    // Check if wake lock is enabled via callback
    if (this.enabledCheck && !this.enabledCheck()) {
      return false;
    }

    // Already active
    if (this.wakeLock) {
      return true;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.shouldBeActive = true;

      // Handle wake lock release (e.g., when tab becomes hidden)
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
      });

      // Set up visibility change handler to re-acquire when tab becomes visible
      this.setupVisibilityHandler();

      return true;
    } catch {
      // Wake lock request failed (e.g., low battery, permission denied)
      return false;
    }
  }

  /**
   * Release the wake lock
   */
  async release(): Promise<void> {
    this.shouldBeActive = false;
    this.removeVisibilityHandler();

    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch {
        // Silently fail if release fails
      } finally {
        this.wakeLock = null;
      }
    }
  }

  /**
   * Set up handler to re-acquire wake lock when tab becomes visible
   */
  private setupVisibilityHandler(): void {
    if (this.visibilityHandler) {
      return; // Already set up
    }

    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible' && this.shouldBeActive && !this.wakeLock) {
        // Re-acquire wake lock when tab becomes visible again
        this.reacquire();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  /**
   * Remove visibility change handler
   */
  private removeVisibilityHandler(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  /**
   * Re-acquire wake lock (internal use after visibility change)
   */
  private async reacquire(): Promise<void> {
    if (!this.isSupported() || !this.shouldBeActive) {
      return;
    }

    // Check if still enabled
    if (this.enabledCheck && !this.enabledCheck()) {
      return;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
      });
    } catch {
      // Silently fail - wake lock re-acquisition failed
    }
  }
}

// Singleton instance
let wakeLockServiceInstance: WakeLockService | null = null;

/**
 * Get the WakeLockService singleton instance
 */
export function getWakeLockService(): WakeLockService {
  if (!wakeLockServiceInstance) {
    wakeLockServiceInstance = new WakeLockService();
  }
  return wakeLockServiceInstance;
}
