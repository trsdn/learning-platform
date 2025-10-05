/**
 * AuthService Unit Tests
 *
 * Tests for password-based authentication service for learning paths.
 *
 * Feature: Shared Password Authentication
 * Issue: #35
 * Phase: Implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  AuthService,
  authService,
} from '../../../src/modules/core/services/auth-service';

describe('AuthService', () => {
  let service: AuthService;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      key: vi.fn((index: number) => {
        const keys = Object.keys(localStorageMock);
        return keys[index] ?? null;
      }),
      get length() {
        return Object.keys(localStorageMock).length;
      },
    } as any;

    // Mock crypto.subtle for SHA-256
    if (!global.crypto) {
      global.crypto = {} as any;
    }
    if (!global.crypto.subtle) {
      global.crypto.subtle = {
        digest: vi.fn(async (algorithm: string, data: BufferSource) => {
          // Simple mock hash - in real tests this would be more sophisticated
          const text = new TextDecoder().decode(data);
          const hash = new Uint8Array(32);
          for (let i = 0; i < text.length && i < 32; i++) {
            hash[i] = text.charCodeAt(i);
          }
          return hash.buffer;
        }),
      } as any;
    }

    service = new AuthService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('hashPassword()', () => {
    it('should hash a password to hex string', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);

      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^[0-9a-f]+$/); // Should be hex
    });

    it('should produce consistent hashes for same password', async () => {
      const password = 'SamePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await hashPassword('Password1');
      const hash2 = await hashPassword('Password2');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', async () => {
      const hash = await hashPassword('');
      expect(typeof hash).toBe('string');
    });

    it('should handle special characters', async () => {
      const hash = await hashPassword('Pä$$w0rd!@#');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPassword()', () => {
    it('should verify correct password', async () => {
      const password = 'CorrectPassword';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const correctPassword = 'CorrectPassword';
      const wrongPassword = 'WrongPassword';
      const hash = await hashPassword(correctPassword);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'Password';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('password', hash);

      expect(isValid).toBe(false);
    });

    it('should handle uppercase hash', async () => {
      const password = 'TestPassword';
      const hash = await hashPassword(password);
      const upperHash = hash.toUpperCase();
      const isValid = await verifyPassword(password, upperHash);

      expect(isValid).toBe(true);
    });
  });

  describe('isAuthenticated()', () => {
    it('should return false when not authenticated', () => {
      const result = service.isAuthenticated('math-basics');
      expect(result).toBe(false);
    });

    it('should return true when authenticated', () => {
      service.setAuthenticated('math-basics');
      const result = service.isAuthenticated('math-basics');
      expect(result).toBe(true);
    });

    it('should be scoped per learning path', () => {
      service.setAuthenticated('math-basics');

      expect(service.isAuthenticated('math-basics')).toBe(true);
      expect(service.isAuthenticated('biology-intro')).toBe(false);
    });

    it('should handle localStorage errors gracefully', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      const result = service.isAuthenticated('test-path');
      expect(result).toBe(false);

      localStorage.getItem = originalGetItem;
    });
  });

  describe('setAuthenticated()', () => {
    it('should mark learning path as authenticated', () => {
      service.setAuthenticated('math-basics');

      expect(localStorageMock['mindforge.auth.math-basics']).toBe('authenticated');
    });

    it('should persist multiple learning paths independently', () => {
      service.setAuthenticated('math-basics');
      service.setAuthenticated('biology-intro');

      expect(service.isAuthenticated('math-basics')).toBe(true);
      expect(service.isAuthenticated('biology-intro')).toBe(true);
    });

    it('should throw error on localStorage failure', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });

      expect(() => service.setAuthenticated('test-path')).toThrow(
        'Authentifizierung konnte nicht gespeichert werden.'
      );

      localStorage.setItem = originalSetItem;
    });
  });

  describe('clearAuthentication()', () => {
    it('should remove authentication for specific learning path', () => {
      service.setAuthenticated('math-basics');
      service.setAuthenticated('biology-intro');

      service.clearAuthentication('math-basics');

      expect(service.isAuthenticated('math-basics')).toBe(false);
      expect(service.isAuthenticated('biology-intro')).toBe(true);
    });

    it('should not throw if path not authenticated', () => {
      expect(() => service.clearAuthentication('non-existent')).not.toThrow();
    });

    it('should handle localStorage errors gracefully', () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => service.clearAuthentication('test-path')).not.toThrow();

      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('clearAll()', () => {
    it('should remove all authentication data', () => {
      service.setAuthenticated('path1');
      service.setAuthenticated('path2');
      service.setAuthenticated('path3');

      service.clearAll();

      expect(service.isAuthenticated('path1')).toBe(false);
      expect(service.isAuthenticated('path2')).toBe(false);
      expect(service.isAuthenticated('path3')).toBe(false);
    });

    it('should only remove auth-related keys', () => {
      service.setAuthenticated('math-basics');
      localStorageMock['mindforge.settings'] = '{"theme":"dark"}';

      service.clearAll();

      expect(service.isAuthenticated('math-basics')).toBe(false);
      expect(localStorageMock['mindforge.settings']).toBe('{"theme":"dark"}');
    });

    it('should handle localStorage errors gracefully', () => {
      const originalKey = localStorage.key;
      localStorage.key = vi.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => service.clearAll()).not.toThrow();

      localStorage.key = originalKey;
    });
  });

  describe('authenticate()', () => {
    it('should authenticate with correct password', async () => {
      const password = 'SecretPassword123';
      const hash = await hashPassword(password);

      const result = await service.authenticate('math-basics', password, hash);

      expect(result).toBe(true);
      expect(service.isAuthenticated('math-basics')).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const correctPassword = 'CorrectPassword';
      const wrongPassword = 'WrongPassword';
      const hash = await hashPassword(correctPassword);

      const result = await service.authenticate('math-basics', wrongPassword, hash);

      expect(result).toBe(false);
      expect(service.isAuthenticated('math-basics')).toBe(false);
    });

    it('should not set authentication on wrong password', async () => {
      const hash = await hashPassword('correct');

      await service.authenticate('math-basics', 'wrong', hash);

      expect(service.isAuthenticated('math-basics')).toBe(false);
    });
  });

  describe('Singleton export', () => {
    it('should export singleton instance', () => {
      expect(authService).toBeInstanceOf(AuthService);
    });

    it('should maintain state across singleton access', () => {
      authService.setAuthenticated('test-path');
      expect(authService.isAuthenticated('test-path')).toBe(true);
    });
  });
});
