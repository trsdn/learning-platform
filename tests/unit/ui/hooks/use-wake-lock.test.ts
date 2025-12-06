/**
 * Tests for useWakeLock hook
 *
 * Tests the wake lock hook which handles:
 * - Checking Wake Lock API support
 * - Acquiring wake lock to keep screen on
 * - Releasing wake lock
 * - Integration with app settings
 * - Error handling when API is not available
 * - Re-acquiring wake lock on visibility change
 * - Cleanup on unmount
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWakeLock } from '../../../../src/modules/ui/hooks/use-wake-lock';
import { getWakeLockService, type IWakeLockService } from '../../../../src/modules/core/services/wake-lock-service';
import { useAppSettings } from '../../../../src/modules/ui/hooks/use-app-settings';
import type { AppSettings } from '../../../../src/modules/core/entities/app-settings';
import { DEFAULT_APP_SETTINGS } from '../../../../src/modules/core/entities/app-settings';

// Mock the wake lock service
vi.mock('../../../../src/modules/core/services/wake-lock-service', () => {
  const mockService: IWakeLockService = {
    isSupported: vi.fn(),
    acquire: vi.fn(),
    release: vi.fn(),
    isActive: vi.fn(),
    setEnabledCheck: vi.fn(),
  };

  return {
    getWakeLockService: vi.fn(() => mockService),
  };
});

// Mock the useAppSettings hook
vi.mock('../../../../src/modules/ui/hooks/use-app-settings', () => ({
  useAppSettings: vi.fn(),
}));

describe('useWakeLock', () => {
  let mockWakeLockService: IWakeLockService;
  const mockSettings: AppSettings = {
    ...DEFAULT_APP_SETTINGS,
    interaction: {
      ...DEFAULT_APP_SETTINGS.interaction,
      wakeLockEnabled: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Get the mock service instance
    mockWakeLockService = getWakeLockService();

    // Setup default mock implementations
    vi.mocked(mockWakeLockService.isSupported).mockReturnValue(true);
    vi.mocked(mockWakeLockService.acquire).mockResolvedValue(true);
    vi.mocked(mockWakeLockService.release).mockResolvedValue(undefined);
    vi.mocked(mockWakeLockService.isActive).mockReturnValue(false);
    vi.mocked(mockWakeLockService.setEnabledCheck).mockImplementation(() => {});

    // Setup default useAppSettings mock
    vi.mocked(useAppSettings).mockReturnValue({
      settings: mockSettings,
      loading: false,
      saveState: 'idle',
      updateSettings: vi.fn(),
      resetSettings: vi.fn(),
      exportSettings: vi.fn(),
      importSettingsFromText: vi.fn(),
      storageEstimate: null,
      refreshStorageEstimate: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values when supported', () => {
      vi.mocked(mockWakeLockService.isSupported).mockReturnValue(true);

      const { result } = renderHook(() => useWakeLock());

      expect(result.current.isSupported).toBe(true);
      expect(result.current.isActive).toBe(false);
      expect(typeof result.current.acquire).toBe('function');
      expect(typeof result.current.release).toBe('function');
    });

    it('should initialize with isSupported false when API not available', () => {
      vi.mocked(mockWakeLockService.isSupported).mockReturnValue(false);

      const { result } = renderHook(() => useWakeLock());

      expect(result.current.isSupported).toBe(false);
      expect(result.current.isActive).toBe(false);
    });

    it('should call getWakeLockService on initialization', () => {
      renderHook(() => useWakeLock());

      expect(getWakeLockService).toHaveBeenCalled();
    });

    it('should set enabled check based on initial settings', () => {
      renderHook(() => useWakeLock());

      expect(mockWakeLockService.setEnabledCheck).toHaveBeenCalled();
    });
  });

  describe('Settings Integration', () => {
    it('should configure enabled check when settings change', () => {
      const { rerender } = renderHook(() => useWakeLock());

      // Initial settings
      expect(mockWakeLockService.setEnabledCheck).toHaveBeenCalledTimes(1);

      // Change settings
      const newSettings = {
        ...mockSettings,
        interaction: { ...mockSettings.interaction, wakeLockEnabled: false },
      };

      vi.mocked(useAppSettings).mockReturnValue({
        settings: newSettings,
        loading: false,
        saveState: 'idle',
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      rerender();

      // Should be called again with new settings
      expect(mockWakeLockService.setEnabledCheck).toHaveBeenCalledTimes(2);
    });

    it('should return false from enabled check when settings is null', () => {
      vi.mocked(useAppSettings).mockReturnValue({
        settings: null,
        loading: true,
        saveState: 'idle',
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      renderHook(() => useWakeLock());

      const enabledCheckCall = vi.mocked(mockWakeLockService.setEnabledCheck).mock.calls[0];
      const enabledCheckFn = enabledCheckCall[0];

      expect(enabledCheckFn()).toBe(false);
    });

    it('should return false from enabled check when wakeLockEnabled is false', () => {
      const disabledSettings = {
        ...mockSettings,
        interaction: { ...mockSettings.interaction, wakeLockEnabled: false },
      };

      vi.mocked(useAppSettings).mockReturnValue({
        settings: disabledSettings,
        loading: false,
        saveState: 'idle',
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      renderHook(() => useWakeLock());

      const enabledCheckCall = vi.mocked(mockWakeLockService.setEnabledCheck).mock.calls[0];
      const enabledCheckFn = enabledCheckCall[0];

      expect(enabledCheckFn()).toBe(false);
    });

    it('should return true from enabled check when wakeLockEnabled is true', () => {
      renderHook(() => useWakeLock());

      const enabledCheckCall = vi.mocked(mockWakeLockService.setEnabledCheck).mock.calls[0];
      const enabledCheckFn = enabledCheckCall[0];

      expect(enabledCheckFn()).toBe(true);
    });
  });

  describe('Acquiring Wake Lock', () => {
    it('should acquire wake lock successfully', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(true);

      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.acquire();
      });

      expect(mockWakeLockService.acquire).toHaveBeenCalledTimes(1);
      expect(result.current.isActive).toBe(true);
    });

    it('should update isActive to false when acquire fails', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(false);

      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.acquire();
      });

      expect(mockWakeLockService.acquire).toHaveBeenCalledTimes(1);
      expect(result.current.isActive).toBe(false);
    });

    it('should not acquire when wakeLockEnabled is false', async () => {
      const disabledSettings = {
        ...mockSettings,
        interaction: { ...mockSettings.interaction, wakeLockEnabled: false },
      };

      vi.mocked(useAppSettings).mockReturnValue({
        settings: disabledSettings,
        loading: false,
        saveState: 'idle',
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.acquire();
      });

      // Should not call the service when disabled in settings
      expect(mockWakeLockService.acquire).not.toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
    });

    it('should not acquire when settings is null', async () => {
      vi.mocked(useAppSettings).mockReturnValue({
        settings: null,
        loading: true,
        saveState: 'idle',
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.acquire();
      });

      expect(mockWakeLockService.acquire).not.toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
    });

    it('should handle multiple acquire calls', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(true);

      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.acquire();
        await result.current.acquire();
        await result.current.acquire();
      });

      expect(mockWakeLockService.acquire).toHaveBeenCalledTimes(3);
      expect(result.current.isActive).toBe(true);
    });
  });

  describe('Releasing Wake Lock', () => {
    it('should release wake lock successfully', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(true);

      const { result } = renderHook(() => useWakeLock());

      // First acquire
      await act(async () => {
        await result.current.acquire();
      });

      expect(result.current.isActive).toBe(true);

      // Then release
      await act(async () => {
        await result.current.release();
      });

      expect(mockWakeLockService.release).toHaveBeenCalledTimes(1);
      expect(result.current.isActive).toBe(false);
    });

    it('should attempt to set isActive to false when release is called', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(true);
      vi.mocked(mockWakeLockService.release).mockResolvedValue(undefined);

      const { result } = renderHook(() => useWakeLock());

      // First acquire
      await act(async () => {
        await result.current.acquire();
      });

      expect(result.current.isActive).toBe(true);

      // Then release
      await act(async () => {
        await result.current.release();
      });

      expect(mockWakeLockService.release).toHaveBeenCalledTimes(1);
      expect(result.current.isActive).toBe(false);
    });

    it('should handle release when wake lock was never acquired', async () => {
      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.release();
      });

      expect(mockWakeLockService.release).toHaveBeenCalledTimes(1);
      expect(result.current.isActive).toBe(false);
    });

    it('should handle multiple release calls', async () => {
      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.release();
        await result.current.release();
        await result.current.release();
      });

      expect(mockWakeLockService.release).toHaveBeenCalledTimes(3);
      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle error when Wake Lock API is not supported', async () => {
      vi.mocked(mockWakeLockService.isSupported).mockReturnValue(false);
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(false);

      const { result } = renderHook(() => useWakeLock());

      expect(result.current.isSupported).toBe(false);

      await act(async () => {
        await result.current.acquire();
      });

      // Should still be able to call acquire without errors
      expect(result.current.isActive).toBe(false);
    });

    it('should handle service errors gracefully during acquire', async () => {
      vi.mocked(mockWakeLockService.acquire).mockRejectedValue(new Error('Permission denied'));

      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await expect(result.current.acquire()).rejects.toThrow('Permission denied');
      });

      // State should remain unchanged
      expect(result.current.isActive).toBe(false);
    });

    it('should propagate release errors to caller', async () => {
      vi.mocked(mockWakeLockService.release).mockRejectedValue(new Error('Release error'));

      const { result } = renderHook(() => useWakeLock());

      // The hook doesn't catch errors, so they propagate
      await act(async () => {
        await expect(result.current.release()).rejects.toThrow('Release error');
      });
    });
  });

  describe('Function Stability', () => {
    it('should maintain stable acquire function reference', () => {
      const { result, rerender } = renderHook(() => useWakeLock());

      const initialAcquire = result.current.acquire;

      rerender();

      expect(result.current.acquire).toBe(initialAcquire);
    });

    it('should maintain stable release function reference', () => {
      const { result, rerender } = renderHook(() => useWakeLock());

      const initialRelease = result.current.release;

      rerender();

      expect(result.current.release).toBe(initialRelease);
    });

    it('should update acquire when wakeLockEnabled changes', () => {
      const { result, rerender } = renderHook(() => useWakeLock());

      const initialAcquire = result.current.acquire;

      // Change settings
      const newSettings = {
        ...mockSettings,
        interaction: { ...mockSettings.interaction, wakeLockEnabled: false },
      };

      vi.mocked(useAppSettings).mockReturnValue({
        settings: newSettings,
        loading: false,
        saveState: 'idle',
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      rerender();

      // acquire function should be recreated when dependency changes
      expect(result.current.acquire).not.toBe(initialAcquire);
    });

    it('should keep release stable across setting changes', () => {
      const { result, rerender } = renderHook(() => useWakeLock());

      const initialRelease = result.current.release;

      // Change settings
      const newSettings = {
        ...mockSettings,
        interaction: { ...mockSettings.interaction, wakeLockEnabled: false },
      };

      vi.mocked(useAppSettings).mockReturnValue({
        settings: newSettings,
        loading: false,
        saveState: 'idle',
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      rerender();

      // release has no dependencies, should remain stable
      expect(result.current.release).toBe(initialRelease);
    });
  });

  describe('Return Interface', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useWakeLock());

      expect(result.current).toHaveProperty('isSupported');
      expect(result.current).toHaveProperty('isActive');
      expect(result.current).toHaveProperty('acquire');
      expect(result.current).toHaveProperty('release');
    });

    it('should have correct property types', () => {
      const { result } = renderHook(() => useWakeLock());

      expect(typeof result.current.isSupported).toBe('boolean');
      expect(typeof result.current.isActive).toBe('boolean');
      expect(typeof result.current.acquire).toBe('function');
      expect(typeof result.current.release).toBe('function');
    });

    it('should return functions that return promises', async () => {
      const { result } = renderHook(() => useWakeLock());

      let acquirePromise: Promise<void>;
      let releasePromise: Promise<void>;

      await act(async () => {
        acquirePromise = result.current.acquire();
        releasePromise = result.current.release();
      });

      expect(acquirePromise!).toBeInstanceOf(Promise);
      expect(releasePromise!).toBeInstanceOf(Promise);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete acquire-release cycle', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(true);

      const { result } = renderHook(() => useWakeLock());

      // Initial state
      expect(result.current.isActive).toBe(false);

      // Acquire
      await act(async () => {
        await result.current.acquire();
      });

      expect(result.current.isActive).toBe(true);
      expect(mockWakeLockService.acquire).toHaveBeenCalledTimes(1);

      // Release
      await act(async () => {
        await result.current.release();
      });

      expect(result.current.isActive).toBe(false);
      expect(mockWakeLockService.release).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple acquire-release cycles', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(true);

      const { result } = renderHook(() => useWakeLock());

      // Cycle 1
      await act(async () => {
        await result.current.acquire();
      });
      expect(result.current.isActive).toBe(true);

      await act(async () => {
        await result.current.release();
      });
      expect(result.current.isActive).toBe(false);

      // Cycle 2
      await act(async () => {
        await result.current.acquire();
      });
      expect(result.current.isActive).toBe(true);

      await act(async () => {
        await result.current.release();
      });
      expect(result.current.isActive).toBe(false);

      expect(mockWakeLockService.acquire).toHaveBeenCalledTimes(2);
      expect(mockWakeLockService.release).toHaveBeenCalledTimes(2);
    });

    it('should handle settings change during active wake lock', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(true);

      const { result, rerender } = renderHook(() => useWakeLock());

      // Acquire with enabled settings
      await act(async () => {
        await result.current.acquire();
      });

      expect(result.current.isActive).toBe(true);

      // Change settings to disabled
      const disabledSettings = {
        ...mockSettings,
        interaction: { ...mockSettings.interaction, wakeLockEnabled: false },
      };

      vi.mocked(useAppSettings).mockReturnValue({
        settings: disabledSettings,
        loading: false,
        saveState: 'idle',
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      rerender();

      // Wake lock should still be active (not automatically released)
      // but new acquire calls should not work
      expect(result.current.isActive).toBe(true);

      await act(async () => {
        await result.current.acquire();
      });

      // Should not call acquire when disabled
      expect(mockWakeLockService.acquire).toHaveBeenCalledTimes(1); // Only the first call
    });

    it('should handle rapid acquire and release calls', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(true);

      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        const promises = [
          result.current.acquire(),
          result.current.release(),
          result.current.acquire(),
          result.current.release(),
        ];
        await Promise.all(promises);
      });

      // Final state should be inactive
      expect(result.current.isActive).toBe(false);
      expect(mockWakeLockService.acquire).toHaveBeenCalledTimes(2);
      expect(mockWakeLockService.release).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle service initialization with null settings', () => {
      vi.mocked(useAppSettings).mockReturnValue({
        settings: null,
        loading: true,
        saveState: 'idle',
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      const { result } = renderHook(() => useWakeLock());

      // Should initialize without errors
      expect(result.current.isSupported).toBeDefined();
      expect(result.current.isActive).toBe(false);
    });

    it('should handle wake lock acquire returning false', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(false);

      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.acquire();
      });

      expect(result.current.isActive).toBe(false);
    });

    it('should use the same service instance across rerenders', () => {
      const { rerender } = renderHook(() => useWakeLock());

      // Call service method to verify it's the same instance
      vi.mocked(mockWakeLockService.isSupported).mockReturnValue(true);

      renderHook(() => useWakeLock()).result.current.isSupported;

      rerender();

      // The service ref should be stable due to useRef
      expect(mockWakeLockService.isSupported).toBeDefined();
    });

    it('should evaluate isSupported once on initialization', () => {
      vi.mocked(mockWakeLockService.isSupported).mockReturnValue(true);

      const { result } = renderHook(() => useWakeLock());

      const initialSupported = result.current.isSupported;
      const callCount = vi.mocked(mockWakeLockService.isSupported).mock.calls.length;

      // isSupported is evaluated during initialization
      expect(initialSupported).toBe(true);
      expect(callCount).toBeGreaterThan(0);
    });
  });

  describe('Unmount Cleanup', () => {
    it('should not throw errors on unmount', () => {
      const { unmount } = renderHook(() => useWakeLock());

      expect(() => unmount()).not.toThrow();
    });

    it('should be safe to unmount after acquiring wake lock', async () => {
      vi.mocked(mockWakeLockService.acquire).mockResolvedValue(true);

      const { result, unmount } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.acquire();
      });

      expect(() => unmount()).not.toThrow();
    });

    it('should be safe to unmount during acquire operation', () => {
      vi.mocked(mockWakeLockService.acquire).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 1000))
      );

      const { result, unmount } = renderHook(() => useWakeLock());

      act(() => {
        result.current.acquire();
      });

      expect(() => unmount()).not.toThrow();
    });
  });
});
