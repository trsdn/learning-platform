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

const STORAGE_KEY_PREFIX = 'mindforge.auth.';

/**
 * Hash a password using SHA-256
 * @param password - Plain text password to hash
 * @returns Promise resolving to hex-encoded SHA-256 hash
 */
export async function hashPassword(password: string): Promise<string> {
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
   */
  async authenticate(
    learningPathId: string,
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    const isValid = await verifyPassword(password, passwordHash);
    if (isValid) {
      this.setAuthenticated(learningPathId);
    }
    return isValid;
  }

  /**
   * Get LocalStorage key for a learning path
   */
  private getStorageKey(learningPathId: string): string {
    return `${STORAGE_KEY_PREFIX}${learningPathId}`;
  }
}

// Singleton instance
export const authService = new AuthService();
