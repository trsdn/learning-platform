/**
 * Authentication Service
 *
 * Provides password-based authentication for learning paths using SHA-256 hashing.
 * Session state is persisted in LocalStorage for convenience.
 *
 * SECURITY NOTE: This is client-side authentication only and is NOT secure against
 * determined attackers. Suitable for classroom/family scenarios where the goal is
 * convenience rather than security.
 */

// Constants
const STORAGE_KEY_PREFIX = 'mindforge.auth.';
const RATE_LIMIT_KEY_PREFIX = 'mindforge.auth.attempts.';
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
 * Authentication service for password-protected learning paths
 */
export class AuthService {
  /**
   * Check if user is authenticated for a specific learning path
   * @param learningPathId - ID of the learning path to check
   * @returns true if authenticated, false otherwise
   */
  isAuthenticated(learningPathId: string): boolean {
    try {
      const key = this.getStorageKey(learningPathId);
      const value = localStorage.getItem(key);
      return value === 'authenticated';
    } catch (error) {
      console.warn('[Auth] Failed to check authentication status', error);
      return false;
    }
  }

  /**
   * Mark user as authenticated for a specific learning path
   * @param learningPathId - ID of the learning path
   */
  setAuthenticated(learningPathId: string): void {
    try {
      const key = this.getStorageKey(learningPathId);
      localStorage.setItem(key, 'authenticated');
    } catch (error) {
      console.error('[Auth] Failed to set authentication', error);
      throw new Error('Authentifizierung konnte nicht gespeichert werden.');
    }
  }

  /**
   * Clear authentication for a specific learning path
   * @param learningPathId - ID of the learning path
   */
  clearAuthentication(learningPathId: string): void {
    try {
      const key = this.getStorageKey(learningPathId);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('[Auth] Failed to clear authentication', error);
    }
  }

  /**
   * Clear all authentication data
   */
  clearAll(): void {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX)) {
          keys.push(key);
        }
      }
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('[Auth] Failed to clear all authentication', error);
    }
  }

  /**
   * Verify password and authenticate if correct
   * @param learningPathId - ID of the learning path
   * @param password - Password to verify
   * @param passwordHash - Expected password hash from learning path metadata
   * @returns Promise resolving to true if authentication successful, false otherwise
   * @throws Error if rate limited
   */
  async authenticate(
    learningPathId: string,
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    // Check rate limiting
    this.checkRateLimit(learningPathId);

    const isValid = await verifyPassword(password, passwordHash);

    if (isValid) {
      this.setAuthenticated(learningPathId);
      this.clearAttempts(learningPathId); // Clear failed attempts on success
    } else {
      this.recordFailedAttempt(learningPathId);
    }

    return isValid;
  }

  /**
   * Check if rate limit has been exceeded
   * @param learningPathId - ID of the learning path
   * @throws Error if rate limited
   */
  private checkRateLimit(learningPathId: string): void {
    try {
      const key = this.getRateLimitKey(learningPathId);
      const data = localStorage.getItem(key);

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
        localStorage.removeItem(key);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Zu viele')) {
        throw error; // Re-throw rate limit errors
      }
      console.warn('[Auth] Failed to check rate limit', error);
    }
  }

  /**
   * Record a failed authentication attempt
   * @param learningPathId - ID of the learning path
   */
  private recordFailedAttempt(learningPathId: string): void {
    try {
      const key = this.getRateLimitKey(learningPathId);
      const data = localStorage.getItem(key);

      const attempts = data ? JSON.parse(data) : { count: 0, lastAttempt: 0 };
      attempts.count += 1;
      attempts.lastAttempt = Date.now();

      localStorage.setItem(key, JSON.stringify(attempts));
    } catch (error) {
      console.warn('[Auth] Failed to record failed attempt', error);
    }
  }

  /**
   * Clear failed attempts for a learning path
   * @param learningPathId - ID of the learning path
   */
  private clearAttempts(learningPathId: string): void {
    try {
      const key = this.getRateLimitKey(learningPathId);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('[Auth] Failed to clear attempts', error);
    }
  }

  /**
   * Get LocalStorage key for a learning path
   */
  private getStorageKey(learningPathId: string): string {
    return `${STORAGE_KEY_PREFIX}${learningPathId}`;
  }

  /**
   * Get LocalStorage key for rate limiting
   */
  private getRateLimitKey(learningPathId: string): string {
    return `${RATE_LIMIT_KEY_PREFIX}${learningPathId}`;
  }
}

// Singleton instance
export const authService = new AuthService();
