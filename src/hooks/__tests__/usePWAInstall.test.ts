import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { usePWAInstall } from '../usePWAInstall';

// Type for BeforeInstallPromptEvent mock
interface MockBeforeInstallPromptEvent {
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: string; platform: string }>;
  platforms: string[];
}

describe('usePWAInstall', () => {
  let mockDeferredPrompt: MockBeforeInstallPromptEvent;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock beforeinstallprompt event
    mockDeferredPrompt = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      platforms: ['web'],
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isSupported).toBe(true); // Service worker supported in test env
  });

  it('should detect browser support correctly', () => {
    // Mock no service worker support
    const originalServiceWorker = navigator.serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isSupported).toBe(false);

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalServiceWorker,
      configurable: true,
    });
  });

  it('should detect when app can be installed', async () => {
    const { result } = renderHook(() => usePWAInstall());

    // Simulate beforeinstallprompt event
    await act(async () => {
      const event = new Event('beforeinstallprompt');
      Object.assign(event, mockDeferredPrompt);
      window.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.canInstall).toBe(true);
  });

  it('should handle installation flow successfully', async () => {
    const { result } = renderHook(() => usePWAInstall());

    // Setup installable state
    await act(async () => {
      const event = new Event('beforeinstallprompt');
      Object.assign(event, mockDeferredPrompt);
      window.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Trigger installation
    let installResult: boolean = false;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(mockDeferredPrompt.prompt).toHaveBeenCalled();
    expect(installResult).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('should handle installation cancellation', async () => {
    // Mock user dismissing the prompt
    mockDeferredPrompt.userChoice = Promise.resolve({
      outcome: 'dismissed',
      platform: 'web',
    });

    const { result } = renderHook(() => usePWAInstall());

    // Setup installable state
    await act(async () => {
      const event = new Event('beforeinstallprompt');
      Object.assign(event, mockDeferredPrompt);
      window.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Trigger installation
    let installResult: boolean = true;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(installResult).toBe(false);
  });

  it('should handle installation errors gracefully', async () => {
    // Mock error during installation
    mockDeferredPrompt.prompt = vi.fn().mockRejectedValue(new Error('Installation failed'));

    const { result } = renderHook(() => usePWAInstall());

    // Setup installable state
    await act(async () => {
      const event = new Event('beforeinstallprompt');
      Object.assign(event, mockDeferredPrompt);
      window.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Trigger installation
    let installResult: boolean = true;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(installResult).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during PWA installation:',
      expect.any(Error)
    );
    expect(result.current.canInstall).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('should detect when app is already installed (standalone mode)', () => {
    // Mock standalone display mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('should detect iOS standalone mode', () => {
    // Mock iOS standalone mode
    Object.defineProperty(navigator, 'standalone', {
      value: true,
      configurable: true,
    });

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(true);
  });

  it('should handle dismissPrompt correctly', async () => {
    const { result } = renderHook(() => usePWAInstall());

    // Setup installable state
    await act(async () => {
      const event = new Event('beforeinstallprompt');
      Object.assign(event, mockDeferredPrompt);
      window.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.canInstall).toBe(true);

    // Dismiss the prompt
    act(() => {
      result.current.dismissPrompt();
    });

    expect(result.current.canInstall).toBe(false);
  });

  it('should handle appinstalled event', async () => {
    const { result } = renderHook(() => usePWAInstall());

    // Setup installable state first
    await act(async () => {
      const beforeEvent = new Event('beforeinstallprompt');
      Object.assign(beforeEvent, mockDeferredPrompt);
      window.dispatchEvent(beforeEvent);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.canInstall).toBe(true);

    // Simulate app installed
    await act(async () => {
      const installedEvent = new Event('appinstalled');
      window.dispatchEvent(installedEvent);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('should return false when installing without prompt', async () => {
    const { result } = renderHook(() => usePWAInstall());

    // Spy on console.warn
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Try to install without prompt
    let installResult: boolean = true;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(installResult).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith('No install prompt available');

    consoleWarnSpy.mockRestore();
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => usePWAInstall());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    );
  });
});
