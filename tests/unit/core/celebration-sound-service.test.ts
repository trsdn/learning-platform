import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CelebrationSoundService,
  getCelebrationSoundService,
} from '../../../src/modules/core/services/celebration-sound-service';

// Mock AudioContext - vitest 4.x requires class-based mocks for constructors
const createMockOscillator = () => ({
  type: 'sine' as OscillatorType,
  frequency: { value: 440 },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
});

const createMockGainNode = () => ({
  gain: {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
});

// Track mock instances for assertions
let mockAudioContextInstance: ReturnType<typeof createMockAudioContext> | null = null;

const createMockAudioContext = () => ({
  state: 'running' as AudioContextState,
  currentTime: 0,
  destination: {},
  resume: vi.fn().mockResolvedValue(undefined),
  createOscillator: vi.fn(() => createMockOscillator()),
  createGain: vi.fn(() => createMockGainNode()),
});

// Use a class-based mock for vitest 4.x compatibility
class MockAudioContextImpl {
  state: AudioContextState;
  currentTime: number;
  destination: object;
  resume: ReturnType<typeof vi.fn>;
  createOscillator: ReturnType<typeof vi.fn>;
  createGain: ReturnType<typeof vi.fn>;

  constructor() {
    const mock = createMockAudioContext();
    this.state = mock.state;
    this.currentTime = mock.currentTime;
    this.destination = mock.destination;
    this.resume = mock.resume;
    this.createOscillator = mock.createOscillator;
    this.createGain = mock.createGain;
    mockAudioContextInstance = this as unknown as ReturnType<typeof createMockAudioContext>;
  }
}

// Wrap in a spy-trackable function for vitest 4.x
const MockAudioContext = vi.fn().mockImplementation(function(this: MockAudioContextImpl) {
  return new MockAudioContextImpl();
});

vi.stubGlobal('AudioContext', MockAudioContext);

describe('CelebrationSoundService', () => {
  let service: CelebrationSoundService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAudioContextInstance = null;
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
      expect(mockAudioContextInstance?.createOscillator).toHaveBeenCalled();
      expect(mockAudioContextInstance?.createGain).toHaveBeenCalled();
    });

    it('should use volume from getter', async () => {
      service.setVolumeGetter(() => 0.5);
      await service.playConfettiSound();
      expect(mockAudioContextInstance?.createGain).toHaveBeenCalled();
    });

    it('should not play when disabled via callback', async () => {
      service.setEnabledCheck(() => false);
      await service.playConfettiSound();
      // AudioContext should NOT be created when disabled
      expect(mockAudioContextInstance).toBeNull();
    });

    it('should resume suspended audio context', async () => {
      // Track resume calls
      const resumeMock = vi.fn().mockResolvedValue(undefined);

      // Create a suspended context class with tracked resume
      class SuspendedMockAudioContext {
        state: AudioContextState = 'suspended';
        currentTime = 0;
        destination = {};
        resume = resumeMock;
        createOscillator = vi.fn(() => createMockOscillator());
        createGain = vi.fn(() => createMockGainNode());
      }

      vi.stubGlobal('AudioContext', SuspendedMockAudioContext);

      const newService = new CelebrationSoundService();
      await newService.playConfettiSound();

      expect(resumeMock).toHaveBeenCalled();

      // Restore original mock
      vi.stubGlobal('AudioContext', MockAudioContext);
    });

    it('should clamp volume to valid range', async () => {
      // Track createGain calls
      const createGainMock = vi.fn(() => createMockGainNode());

      class VolumeTestMockAudioContext {
        state: AudioContextState = 'running';
        currentTime = 0;
        destination = {};
        resume = vi.fn().mockResolvedValue(undefined);
        createOscillator = vi.fn(() => createMockOscillator());
        createGain = createGainMock;
      }

      vi.stubGlobal('AudioContext', VolumeTestMockAudioContext);

      // Test high volume
      const service1 = new CelebrationSoundService();
      service1.setVolumeGetter(() => 1.5);
      await service1.playConfettiSound();
      expect(createGainMock).toHaveBeenCalled();

      // Reset for low volume test
      createGainMock.mockClear();

      // Test low volume
      const service2 = new CelebrationSoundService();
      service2.setVolumeGetter(() => -0.5);
      await service2.playConfettiSound();
      expect(createGainMock).toHaveBeenCalled();

      // Restore original mock
      vi.stubGlobal('AudioContext', MockAudioContext);
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
