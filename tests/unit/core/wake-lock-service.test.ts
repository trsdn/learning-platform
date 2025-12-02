/**
 * Wake Lock Service Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock WakeLockSentinel
const mockRelease = vi.fn().mockResolvedValue(undefined);
const mockAddEventListener = vi.fn();
const mockWakeLockSentinel = {
  release: mockRelease,
  addEventListener: mockAddEventListener,
  released: false,
  type: 'screen' as const,
};

// Mock navigator.wakeLock
const mockRequest = vi.fn().mockResolvedValue(mockWakeLockSentinel);
const mockWakeLock = {
  request: mockRequest,
};

describe('WakeLockService', () => {
  beforeEach(() => {
    vi.resetModules();
    mockRequest.mockClear();
    mockRelease.mockClear();
    mockAddEventListener.mockClear();
    mockRequest.mockResolvedValue(mockWakeLockSentinel);

    // Setup navigator.wakeLock mock
    Object.defineProperty(navigator, 'wakeLock', {
      value: mockWakeLock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isSupported', () => {
    it('should return true when Wake Lock API is available', async () => {
      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      expect(service.isSupported()).toBe(true);
    });

    it('should return false when Wake Lock API is not available', async () => {
      // Delete wakeLock from navigator
      const originalWakeLock = navigator.wakeLock;
      // @ts-expect-error - intentionally removing property for test
      delete navigator.wakeLock;

      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      const result = service.isSupported();

      // Restore
      Object.defineProperty(navigator, 'wakeLock', {
        value: originalWakeLock,
        writable: true,
        configurable: true,
      });

      expect(result).toBe(false);
    });
  });

  describe('acquire', () => {
    it('should request a screen wake lock', async () => {
      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      const result = await service.acquire();

      expect(mockRequest).toHaveBeenCalledWith('screen');
      expect(result).toBe(true);
    });

    it('should return true when wake lock is already acquired', async () => {
      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      await service.acquire();
      mockRequest.mockClear();

      const result = await service.acquire();

      expect(mockRequest).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when Wake Lock API is not supported', async () => {
      const originalWakeLock = navigator.wakeLock;
      // @ts-expect-error - intentionally removing property for test
      delete navigator.wakeLock;

      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      const result = await service.acquire();

      // Restore
      Object.defineProperty(navigator, 'wakeLock', {
        value: originalWakeLock,
        writable: true,
        configurable: true,
      });

      expect(result).toBe(false);
    });

    it('should return false when request fails', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Low battery'));

      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      const result = await service.acquire();

      expect(result).toBe(false);
    });

    it('should not acquire when disabled via callback', async () => {
      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      service.setEnabledCheck(() => false);

      const result = await service.acquire();

      expect(mockRequest).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should acquire when enabled via callback', async () => {
      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      service.setEnabledCheck(() => true);

      const result = await service.acquire();

      expect(mockRequest).toHaveBeenCalledWith('screen');
      expect(result).toBe(true);
    });
  });

  describe('release', () => {
    it('should release the wake lock', async () => {
      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      await service.acquire();
      await service.release();

      expect(mockRelease).toHaveBeenCalled();
    });

    it('should not throw when no wake lock is active', async () => {
      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      await expect(service.release()).resolves.not.toThrow();
    });

    it('should handle release errors gracefully', async () => {
      mockRelease.mockRejectedValueOnce(new Error('Release failed'));

      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      await service.acquire();

      await expect(service.release()).resolves.not.toThrow();
    });
  });

  describe('isActive', () => {
    it('should return false initially', async () => {
      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      expect(service.isActive()).toBe(false);
    });

    it('should return true after acquiring', async () => {
      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      await service.acquire();

      expect(service.isActive()).toBe(true);
    });

    it('should return false after releasing', async () => {
      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      await service.acquire();
      await service.release();

      expect(service.isActive()).toBe(false);
    });
  });

  describe('visibility change handling', () => {
    it('should add visibility change listener on acquire', async () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      await service.acquire();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should remove visibility change listener on release', async () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { WakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );
      const service = new WakeLockService();

      await service.acquire();
      await service.release();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('getWakeLockService', () => {
    it('should return the same singleton instance', async () => {
      const { getWakeLockService } = await import(
        '@/modules/core/services/wake-lock-service'
      );

      const instance1 = getWakeLockService();
      const instance2 = getWakeLockService();

      expect(instance1).toBe(instance2);
    });
  });
});
