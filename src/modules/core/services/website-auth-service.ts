/**
 * Website Authentication Service
 *
 * Provides password-based authentication for the entire website using SHA-256 hashing.
 * Session state is persisted in LocalStorage.
 *
 * SECURITY NOTE: This is client-side authentication only and is NOT secure against
 * determined attackers. Suitable for classroom/family scenarios where the goal is
 * convenience rather than security.
 */

// Constants
const STORAGE_KEY = 'mindforge.website.auth';
const RATE_LIMIT_KEY = 'mindforge.website.attempts';
const MAX_PASSWORD_LENGTH = 1000; // Prevent DoS attacks
const MAX_ATTEMPTS = 5; // Maximum failed attempts before rate limiting
const RATE_LIMIT_WINDOW_MS = 300000; // 5 minutes in milliseconds

/**
 * Hash a password using SHA-256
 * @param password - Plain text password to hash
 * @returns Promise resolving to hex-encoded SHA-256 hash
 */
export async function hashPassword(password: string): Promise<string> {
  // Input validation
  if (!password || password.length === 0) {
    throw new Error('Passwort darf nicht leer sein.');
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new Error('Passwort ist zu lang.');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify a password against a stored hash
 * @param password - Plain text password to verify
 * @param expectedHash - Expected SHA-256 hash (hex-encoded)
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(password: string, expectedHash: string): Promise<boolean> {
  const actualHash = await hashPassword(password);
  return actualHash === expectedHash.toLowerCase();
}

/**
 * Website authentication service
 */
export class WebsiteAuthService {
  /**
   * Check if user is authenticated for website access
   * @returns true if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'authenticated';
    } catch (error) {
      console.warn('[WebsiteAuth] Failed to check authentication status', error);
      return false;
    }
  }

  /**
   * Mark user as authenticated for website access
   */
  setAuthenticated(): void {
    try {
      localStorage.setItem(STORAGE_KEY, 'authenticated');
    } catch (error) {
      console.error('[WebsiteAuth] Failed to set authentication', error);
      throw new Error('Authentifizierung konnte nicht gespeichert werden.');
    }
  }

  /**
   * Clear authentication (logout)
   */
  clearAuthentication(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(RATE_LIMIT_KEY);
    } catch (error) {
      console.warn('[WebsiteAuth] Failed to clear authentication', error);
    }
  }

  /**
   * Verify password and authenticate if correct
   * @param password - Password to verify
   * @param expectedHash - Expected password hash from environment
   * @returns Promise resolving to true if authentication successful, false otherwise
   * @throws Error if rate limited
   */
  async authenticate(password: string, expectedHash: string): Promise<boolean> {
    // Check rate limiting
    this.checkRateLimit();

    const isValid = await verifyPassword(password, expectedHash);

    if (isValid) {
      this.setAuthenticated();
      this.clearAttempts(); // Clear failed attempts on success
    } else {
      this.recordFailedAttempt();
    }

    return isValid;
  }

  /**
   * Check if rate limit has been exceeded
   * @throws Error if rate limited
   */
  private checkRateLimit(): void {
    try {
      const data = localStorage.getItem(RATE_LIMIT_KEY);

      if (!data) return; // No attempts recorded

      const attempts = JSON.parse(data);
      const now = Date.now();
      const timePassed = now - attempts.lastAttempt;

      if (attempts.count >= MAX_ATTEMPTS && timePassed < RATE_LIMIT_WINDOW_MS) {
        const remainingMinutes = Math.ceil((RATE_LIMIT_WINDOW_MS - timePassed) / 60000);
        throw new Error(
          `Zu viele fehlgeschlagene Versuche. Bitte versuchen Sie es in ${remainingMinutes} Minute(n) erneut.`
        );
      }

      // Rate limit window has passed, reset counter
      if (timePassed >= RATE_LIMIT_WINDOW_MS) {
        localStorage.removeItem(RATE_LIMIT_KEY);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Zu viele')) {
        throw error; // Re-throw rate limit errors
      }
      console.warn('[WebsiteAuth] Failed to check rate limit', error);
    }
  }

  /**
   * Record a failed authentication attempt
   */
  private recordFailedAttempt(): void {
    try {
      const data = localStorage.getItem(RATE_LIMIT_KEY);

      const attempts = data ? JSON.parse(data) : { count: 0, lastAttempt: 0 };
      attempts.count += 1;
      attempts.lastAttempt = Date.now();

      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.warn('[WebsiteAuth] Failed to record failed attempt', error);
    }
  }

  /**
   * Clear failed attempts
   */
  private clearAttempts(): void {
    try {
      localStorage.removeItem(RATE_LIMIT_KEY);
    } catch (error) {
      console.warn('[WebsiteAuth] Failed to clear attempts', error);
    }
  }
}

// Singleton instance
export const websiteAuthService = new WebsiteAuthService();
