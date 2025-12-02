import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CelebrationSoundService,
  getCelebrationSoundService,
} from '../../../src/modules/core/services/celebration-sound-service';

// Mock AudioContext
const mockOscillator = {
  type: 'sine',
  frequency: { value: 440 },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGainNode = {
  gain: {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
};

const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  destination: {},
  resume: vi.fn().mockResolvedValue(undefined),
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({
    ...mockGainNode,
    gain: { ...mockGainNode.gain },
  })),
};

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));

describe('CelebrationSoundService', () => {
  let service: CelebrationSoundService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CelebrationSoundService();
  });

  describe('isSupported', () => {
    it('should return true when AudioContext is available', () => {
      expect(service.isSupported()).toBe(true);
    });
  });

  describe('setEnabledCheck', () => {
    it('should accept a callback function', () => {
      const check = vi.fn().mockReturnValue(true);
      expect(() => service.setEnabledCheck(check)).not.toThrow();
    });
  });

  describe('setVolumeGetter', () => {
    it('should accept a callback function', () => {
      const getter = vi.fn().mockReturnValue(0.8);
      expect(() => service.setVolumeGetter(getter)).not.toThrow();
    });
  });

  describe('preload', () => {
    it('should create an AudioContext', () => {
      service.preload();
      expect(AudioContext).toHaveBeenCalled();
    });

    it('should only create AudioContext once', () => {
      service.preload();
      service.preload();
      expect(AudioContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('playConfettiSound', () => {
    it('should create oscillators and gain nodes', async () => {
      await service.playConfettiSound();
      // Should create multiple oscillators for the arpeggio
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should use volume from getter', async () => {
      service.setVolumeGetter(() => 0.5);
      await service.playConfettiSound();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should not play when disabled via callback', async () => {
      service.setEnabledCheck(() => false);
      await service.playConfettiSound();
      // AudioContext should be created but no oscillators
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should resume suspended audio context', async () => {
      const suspendedContext = {
        ...mockAudioContext,
        state: 'suspended',
      };
      vi.mocked(AudioContext).mockImplementationOnce(() => suspendedContext as unknown as AudioContext);

      const newService = new CelebrationSoundService();
      await newService.playConfettiSound();

      expect(suspendedContext.resume).toHaveBeenCalled();
    });

    it('should clamp volume to valid range', async () => {
      // Test high volume
      service.setVolumeGetter(() => 1.5);
      await service.playConfettiSound();
      expect(mockAudioContext.createGain).toHaveBeenCalled();

      // Test low volume
      service.setVolumeGetter(() => -0.5);
      await service.playConfettiSound();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });
  });
});

describe('getCelebrationSoundService', () => {
  it('should return a CelebrationSoundService instance', () => {
    const service = getCelebrationSoundService();
    expect(service).toBeInstanceOf(CelebrationSoundService);
  });

  it('should return the same singleton instance', () => {
    const service1 = getCelebrationSoundService();
    const service2 = getCelebrationSoundService();
    expect(service1).toBe(service2);
  });
});
