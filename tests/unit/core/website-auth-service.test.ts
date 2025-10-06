/**
 * Website Authentication Service Tests
 *
 * These tests validate the WebsiteAuthService and password hashing functions.
 *
 * Feature: Website Password Protection
 * Branch: feature/website-password-protection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  WebsiteAuthService,
} from '../../../src/modules/core/services/website-auth-service';

describe('hashPassword()', () => {
  it('should hash a password using SHA-256', async () => {
    const password = 'test123';
    const hash = await hashPassword(password);

    // SHA-256 should produce a 64-character hex string
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should produce consistent hashes for the same password', async () => {
    const password = 'consistent';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different passwords', async () => {
    const hash1 = await hashPassword('password1');
    const hash2 = await hashPassword('password2');

    expect(hash1).not.toBe(hash2);
  });

  it('should handle special characters', async () => {
    const password = '!@#$%^&*()_+-={}[]|:";\'<>?,./';
    const hash = await hashPassword(password);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should handle unicode characters', async () => {
    const password = '密码测试ÄÖÜäöü';
    const hash = await hashPassword(password);

    expect(hash).toHaveLength(64);
  });

  it('should handle the actual password "lernenmachtspass"', async () => {
    const password = 'lernenmachtspass';
    const expectedHash = 'b0a7aa881e35ee7fd26630533f82bb07910c5a236c72fac9342077ee15ab72db';
    const actualHash = await hashPassword(password);

    expect(actualHash).toBe(expectedHash);
  });

  it('should throw error for empty password', async () => {
    await expect(hashPassword('')).rejects.toThrow('Passwort darf nicht leer sein.');
  });

  it('should throw error for password exceeding max length', async () => {
    const longPassword = 'a'.repeat(1001);
    await expect(hashPassword(longPassword)).rejects.toThrow('Passwort ist zu lang.');
  });

  it('should accept password at max length', async () => {
    const maxLengthPassword = 'a'.repeat(1000);
    const hash = await hashPassword(maxLengthPassword);

    expect(hash).toHaveLength(64);
  });
});

describe('verifyPassword()', () => {
  it('should return true for correct password', async () => {
    const password = 'correctPassword';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const correctPassword = 'correct';
    const wrongPassword = 'wrong';
    const hash = await hashPassword(correctPassword);

    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  it('should be case-sensitive', async () => {
    const password = 'CaseSensitive';
    const hash = await hashPassword(password);

    expect(await verifyPassword('CaseSensitive', hash)).toBe(true);
    expect(await verifyPassword('casesensitive', hash)).toBe(false);
    expect(await verifyPassword('CASESENSITIVE', hash)).toBe(false);
  });

  it('should handle uppercase hash strings', async () => {
    const password = 'test';
    const hash = await hashPassword(password);
    const upperHash = hash.toUpperCase();

    const isValid = await verifyPassword(password, upperHash);
    expect(isValid).toBe(true);
  });

  it('should verify the actual password "lernenmachtspass"', async () => {
    const password = 'lernenmachtspass';
    const hash = 'b0a7aa881e35ee7fd26630533f82bb07910c5a236c72fac9342077ee15ab72db';

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject wrong password against known hash', async () => {
    const wrongPassword = 'wrongpassword';
    const correctHash = 'b0a7aa881e35ee7fd26630533f82bb07910c5a236c72fac9342077ee15ab72db';

    const isValid = await verifyPassword(wrongPassword, correctHash);
    expect(isValid).toBe(false);
  });
});

describe('WebsiteAuthService', () => {
  let service: WebsiteAuthService;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      get length() {
        return Object.keys(localStorageMock).length;
      },
      key: vi.fn((index: number) => Object.keys(localStorageMock)[index] || null),
    };

    service = new WebsiteAuthService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isAuthenticated()', () => {
    it('should return false when not authenticated', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when authenticated', () => {
      localStorageMock['mindforge.website.auth'] = 'authenticated';
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false for other values', () => {
      localStorageMock['mindforge.website.auth'] = 'other';
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should handle localStorage errors gracefully', () => {
      global.localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('setAuthenticated()', () => {
    it('should set authentication status', () => {
      service.setAuthenticated();

      expect(localStorage.setItem).toHaveBeenCalledWith('mindforge.website.auth', 'authenticated');
      expect(localStorageMock['mindforge.website.auth']).toBe('authenticated');
    });

    it('should throw error when localStorage fails', () => {
      global.localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => service.setAuthenticated()).toThrow(
        'Authentifizierung konnte nicht gespeichert werden.'
      );
    });
  });

  describe('clearAuthentication()', () => {
    it('should clear authentication status', () => {
      localStorageMock['mindforge.website.auth'] = 'authenticated';
      localStorageMock['mindforge.website.attempts'] = '{"count":3}';

      service.clearAuthentication();

      expect(localStorage.removeItem).toHaveBeenCalledWith('mindforge.website.auth');
      expect(localStorage.removeItem).toHaveBeenCalledWith('mindforge.website.attempts');
      expect(localStorageMock['mindforge.website.auth']).toBeUndefined();
      expect(localStorageMock['mindforge.website.attempts']).toBeUndefined();
    });

    it('should handle localStorage errors gracefully', () => {
      global.localStorage.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      // Should not throw, just log warning
      expect(() => service.clearAuthentication()).not.toThrow();
    });
  });

  describe('authenticate()', () => {
    const correctPassword = 'lernenmachtspass';
    const correctHash = 'b0a7aa881e35ee7fd26630533f82bb07910c5a236c72fac9342077ee15ab72db';

    it('should authenticate with correct password', async () => {
      const result = await service.authenticate(correctPassword, correctHash);

      expect(result).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should fail with incorrect password', async () => {
      const result = await service.authenticate('wrongpassword', correctHash);

      expect(result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should clear failed attempts on successful authentication', async () => {
      // Record some failed attempts
      localStorageMock['mindforge.website.attempts'] = JSON.stringify({
        count: 3,
        lastAttempt: Date.now(),
      });

      await service.authenticate(correctPassword, correctHash);

      expect(localStorageMock['mindforge.website.attempts']).toBeUndefined();
    });

    it('should record failed attempts', async () => {
      await service.authenticate('wrong', correctHash);

      expect(localStorageMock['mindforge.website.attempts']).toBeDefined();

      const attempts = JSON.parse(localStorageMock['mindforge.website.attempts']);
      expect(attempts.count).toBe(1);
      expect(attempts.lastAttempt).toBeDefined();
    });

    it('should increment failed attempt counter', async () => {
      await service.authenticate('wrong1', correctHash);
      await service.authenticate('wrong2', correctHash);
      await service.authenticate('wrong3', correctHash);

      const attempts = JSON.parse(localStorageMock['mindforge.website.attempts']);
      expect(attempts.count).toBe(3);
    });
  });

  describe('Rate Limiting', () => {
    const correctPassword = 'lernenmachtspass';
    const correctHash = 'b0a7aa881e35ee7fd26630533f82bb07910c5a236c72fac9342077ee15ab72db';

    it('should allow authentication when under max attempts', async () => {
      localStorageMock['mindforge.website.attempts'] = JSON.stringify({
        count: 4,
        lastAttempt: Date.now(),
      });

      await expect(service.authenticate('test', correctHash)).resolves.toBe(false);
    });

    it('should block authentication after max attempts', async () => {
      localStorageMock['mindforge.website.attempts'] = JSON.stringify({
        count: 5,
        lastAttempt: Date.now(),
      });

      await expect(service.authenticate('test', correctHash)).rejects.toThrow(
        /Zu viele fehlgeschlagene Versuche/
      );
    });

    it('should include remaining time in rate limit error', async () => {
      localStorageMock['mindforge.website.attempts'] = JSON.stringify({
        count: 5,
        lastAttempt: Date.now(),
      });

      await expect(service.authenticate('test', correctHash)).rejects.toThrow(/Minute\(n\) erneut/);
    });

    it('should allow authentication after rate limit window expires', async () => {
      // 5 minutes + 1 second ago
      const pastTime = Date.now() - (300000 + 1000);

      localStorageMock['mindforge.website.attempts'] = JSON.stringify({
        count: 5,
        lastAttempt: pastTime,
      });

      const result = await service.authenticate('wrong', correctHash);

      expect(result).toBe(false); // Wrong password, but not rate limited
    });

    it('should clear attempts after rate limit window expires', async () => {
      const pastTime = Date.now() - (300000 + 1000);

      localStorageMock['mindforge.website.attempts'] = JSON.stringify({
        count: 5,
        lastAttempt: pastTime,
      });

      await service.authenticate('wrong', correctHash);

      // Old attempts should be cleared, new attempt should start fresh
      const attempts = JSON.parse(localStorageMock['mindforge.website.attempts']);
      expect(attempts.count).toBe(1);
    });

    it('should calculate remaining minutes correctly', async () => {
      // 4 minutes ago (1 minute remaining)
      const fourMinutesAgo = Date.now() - 240000;

      localStorageMock['mindforge.website.attempts'] = JSON.stringify({
        count: 5,
        lastAttempt: fourMinutesAgo,
      });

      try {
        await service.authenticate('test', correctHash);
        expect.fail('Should have thrown rate limit error');
      } catch (error: any) {
        expect(error.message).toMatch(/1 Minute\(n\)/);
      }
    });

    it('should handle localStorage errors during rate limit check', async () => {
      global.localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      // Should not throw, should allow authentication attempt
      await expect(service.authenticate('test', correctHash)).resolves.toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle corrupted attempts data', async () => {
      localStorageMock['mindforge.website.attempts'] = 'corrupted json';

      // Should not throw, should proceed normally
      await expect(service.authenticate('test', 'hash')).resolves.toBe(false);
    });

    it('should handle missing lastAttempt in attempts data', async () => {
      localStorageMock['mindforge.website.attempts'] = JSON.stringify({
        count: 5,
        // Missing lastAttempt
      });

      // Should handle gracefully
      await expect(service.authenticate('test', 'hash')).resolves.toBe(false);
    });

    it('should handle empty hash gracefully', async () => {
      await expect(service.authenticate('password', '')).resolves.toBe(false);
    });

    it('should preserve authentication across multiple checks', () => {
      service.setAuthenticated();

      expect(service.isAuthenticated()).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    const password = 'lernenmachtspass';
    const hash = 'b0a7aa881e35ee7fd26630533f82bb07910c5a236c72fac9342077ee15ab72db';

    it('should handle complete authentication flow', async () => {
      // Initial state: not authenticated
      expect(service.isAuthenticated()).toBe(false);

      // Authenticate successfully
      const result = await service.authenticate(password, hash);
      expect(result).toBe(true);

      // Now authenticated
      expect(service.isAuthenticated()).toBe(true);

      // Clear authentication
      service.clearAuthentication();

      // Not authenticated anymore
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should handle failed attempts followed by success', async () => {
      // Make 3 failed attempts
      await service.authenticate('wrong1', hash);
      await service.authenticate('wrong2', hash);
      await service.authenticate('wrong3', hash);

      // Check attempts were recorded
      expect(JSON.parse(localStorageMock['mindforge.website.attempts']).count).toBe(3);

      // Succeed on 4th try
      const result = await service.authenticate(password, hash);
      expect(result).toBe(true);

      // Attempts should be cleared
      expect(localStorageMock['mindforge.website.attempts']).toBeUndefined();
    });

    it('should enforce rate limit across attempts', async () => {
      // Make 5 failed attempts to trigger rate limit
      for (let i = 0; i < 5; i++) {
        await service.authenticate(`wrong${i}`, hash);
      }

      // 6th attempt should be rate limited
      await expect(service.authenticate(password, hash)).rejects.toThrow(/Zu viele/);

      // Still not authenticated
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
