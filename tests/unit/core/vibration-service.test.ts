/**
 * Vibration Service Unit Tests
 *
 * TDD: Tests written before implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock navigator.vibrate
const mockVibrate = vi.fn();

describe('VibrationService', () => {
  beforeEach(() => {
    vi.resetModules();
    mockVibrate.mockClear();

    // Setup navigator.vibrate mock
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isSupported', () => {
    it('should return true when Vibration API is available', async () => {
      const { VibrationService } = await import(
        '@/modules/core/services/vibration-service'
      );
      const service = new VibrationService();

      expect(service.isSupported()).toBe(true);
    });

    it('should return false when Vibration API is not available', async () => {
      // Delete vibrate from navigator
      const originalVibrate = navigator.vibrate;
      // @ts-expect-error - intentionally removing property for test
      delete navigator.vibrate;

      const { VibrationService } = await import(
        '@/modules/core/services/vibration-service'
      );
      const service = new VibrationService();

      const result = service.isSupported();

      // Restore
      Object.defineProperty(navigator, 'vibrate', {
        value: originalVibrate,
        writable: true,
        configurable: true,
      });

      expect(result).toBe(false);
    });
  });

  describe('vibrateSuccess', () => {
    it('should vibrate with success pattern [100]', async () => {
      const { VibrationService } = await import(
        '@/modules/core/services/vibration-service'
      );
      const service = new VibrationService();

      service.vibrateSuccess();

      expect(mockVibrate).toHaveBeenCalledWith([100]);
    });

    it('should not throw when Vibration API is not available', async () => {
      // Delete vibrate from navigator
      const originalVibrate = navigator.vibrate;
      // @ts-expect-error - intentionally removing property for test
      delete navigator.vibrate;

      const { VibrationService } = await import(
        '@/modules/core/services/vibration-service'
      );
      const service = new VibrationService();

      expect(() => service.vibrateSuccess()).not.toThrow();

      // Restore
      Object.defineProperty(navigator, 'vibrate', {
        value: originalVibrate,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('vibrateError', () => {
    it('should vibrate with error pattern [50, 50, 50]', async () => {
      const { VibrationService } = await import(
        '@/modules/core/services/vibration-service'
      );
      const service = new VibrationService();

      service.vibrateError();

      expect(mockVibrate).toHaveBeenCalledWith([50, 50, 50]);
    });
  });

  describe('vibrateTap', () => {
    it('should vibrate with light tap pattern [10]', async () => {
      const { VibrationService } = await import(
        '@/modules/core/services/vibration-service'
      );
      const service = new VibrationService();

      service.vibrateTap();

      expect(mockVibrate).toHaveBeenCalledWith([10]);
    });
  });

  describe('vibrateSessionComplete', () => {
    it('should vibrate with session complete pattern [100, 50, 100]', async () => {
      const { VibrationService } = await import(
        '@/modules/core/services/vibration-service'
      );
      const service = new VibrationService();

      service.vibrateSessionComplete();

      expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100]);
    });
  });

  describe('vibrate with settings check', () => {
    it('should not vibrate when disabled via callback', async () => {
      const { VibrationService } = await import(
        '@/modules/core/services/vibration-service'
      );
      const service = new VibrationService();

      // Set enabled check that returns false
      service.setEnabledCheck(() => false);

      service.vibrateSuccess();

      expect(mockVibrate).not.toHaveBeenCalled();
    });

    it('should vibrate when enabled via callback', async () => {
      const { VibrationService } = await import(
        '@/modules/core/services/vibration-service'
      );
      const service = new VibrationService();

      // Set enabled check that returns true
      service.setEnabledCheck(() => true);

      service.vibrateSuccess();

      expect(mockVibrate).toHaveBeenCalledWith([100]);
    });
  });

  describe('cancel', () => {
    it('should cancel ongoing vibration by calling vibrate(0)', async () => {
      const { VibrationService } = await import(
        '@/modules/core/services/vibration-service'
      );
      const service = new VibrationService();

      service.cancel();

      expect(mockVibrate).toHaveBeenCalledWith(0);
    });
  });
});
