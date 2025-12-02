import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfettiService, getConfettiService } from '../../../src/modules/core/services/confetti-service';

// Mock canvas-confetti
const mockConfetti = vi.fn().mockResolvedValue(undefined);
vi.mock('canvas-confetti', () => ({
  default: mockConfetti,
}));

describe('ConfettiService', () => {
  let service: ConfettiService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ConfettiService();
  });

  afterEach(() => {
    service.cancel();
  });

  describe('isSupported', () => {
    it('should return true when window and document are available', () => {
      expect(service.isSupported()).toBe(true);
    });
  });

  describe('setEnabledCheck', () => {
    it('should accept a callback function', () => {
      const check = vi.fn().mockReturnValue(true);
      expect(() => service.setEnabledCheck(check)).not.toThrow();
    });
  });

  describe('setAccessibilityCheck', () => {
    it('should accept a callback function', () => {
      const check = vi.fn().mockReturnValue(false);
      expect(() => service.setAccessibilityCheck(check)).not.toThrow();
    });
  });

  describe('fire', () => {
    it('should call fireStandard when style is standard', async () => {
      const spy = vi.spyOn(service, 'fireStandard');
      await service.fire('standard', 'medium');
      expect(spy).toHaveBeenCalledWith('medium');
    });

    it('should call fireFirework when style is firework', async () => {
      const spy = vi.spyOn(service, 'fireFirework');
      await service.fire('firework', 'medium');
      expect(spy).toHaveBeenCalledWith('medium');
    });

    it('should call fireCannon when style is cannon', async () => {
      const spy = vi.spyOn(service, 'fireCannon');
      await service.fire('cannon', 'medium');
      expect(spy).toHaveBeenCalledWith('medium');
    });

    it('should call fireEmoji when style is emoji', async () => {
      const spy = vi.spyOn(service, 'fireEmoji');
      await service.fire('emoji', 'medium');
      expect(spy).toHaveBeenCalledWith('medium');
    });

    it('should default to fireStandard for unknown style', async () => {
      const spy = vi.spyOn(service, 'fireStandard');
      // @ts-expect-error - testing invalid input
      await service.fire('unknown', 'medium');
      expect(spy).toHaveBeenCalledWith('medium');
    });
  });

  describe('fireStandard', () => {
    it('should call confetti with correct configuration', async () => {
      await service.fireStandard('medium');
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: expect.any(Number),
          spread: expect.any(Number),
          origin: { y: 0.6 },
          colors: expect.any(Array),
        })
      );
    });

    it('should not fire when disabled via callback', async () => {
      service.setEnabledCheck(() => false);
      await service.fireStandard('medium');
      expect(mockConfetti).not.toHaveBeenCalled();
    });

    it('should not fire when accessibility check returns true', async () => {
      service.setAccessibilityCheck(() => true);
      await service.fireStandard('medium');
      expect(mockConfetti).not.toHaveBeenCalled();
    });

    it('should use light intensity config', async () => {
      await service.fireStandard('light');
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 50,
          spread: 55,
        })
      );
    });

    it('should use medium intensity config', async () => {
      await service.fireStandard('medium');
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 100,
          spread: 70,
        })
      );
    });

    it('should use strong intensity config', async () => {
      await service.fireStandard('strong');
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 200,
          spread: 90,
        })
      );
    });
  });

  describe('fireCannon', () => {
    it('should fire from both left and right sides', async () => {
      await service.fireCannon('medium');
      expect(mockConfetti).toHaveBeenCalledTimes(2);

      // Left cannon
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          angle: 60,
          origin: { x: 0, y: 1 },
        })
      );

      // Right cannon
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          angle: 120,
          origin: { x: 1, y: 1 },
        })
      );
    });
  });

  describe('cancel', () => {
    it('should clear active intervals without throwing', () => {
      expect(() => service.cancel()).not.toThrow();
    });
  });
});

describe('getConfettiService', () => {
  it('should return a ConfettiService instance', () => {
    const service = getConfettiService();
    expect(service).toBeInstanceOf(ConfettiService);
  });

  it('should return the same singleton instance', () => {
    const service1 = getConfettiService();
    const service2 = getConfettiService();
    expect(service1).toBe(service2);
  });
});
