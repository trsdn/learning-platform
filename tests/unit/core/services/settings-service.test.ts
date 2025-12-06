/**
 * Tests for SettingsService
 *
 * Tests the settings service which handles:
 * - Loading and saving app settings from localStorage
 * - Validating settings
 * - Applying theme, font scale, and reduced motion to DOM
 * - Importing and exporting settings
 * - Storage estimation
 * - System theme detection and media query handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SettingsService,
  type DatabaseUsageEstimate,
} from '@/modules/core/services/settings-service';
import {
  DEFAULT_APP_SETTINGS,
  type AppSettings,
  validateAppSettings,
} from '@/modules/core/entities/app-settings';

// Mock validateAppSettings
vi.mock('@/modules/core/entities/app-settings', async () => {
  const actual = await vi.importActual('@/modules/core/entities/app-settings');
  return {
    ...actual,
    validateAppSettings: vi.fn((settings: unknown) => {
      // Use the actual validation function by default
      const actualModule = actual as typeof import('@/modules/core/entities/app-settings');
      return actualModule.validateAppSettings(settings);
    }),
  };
});

describe('SettingsService', () => {
  let service: SettingsService;
  let mockMediaQuery: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };
  let originalMatchMedia: typeof window.matchMedia | undefined;
  let originalNavigatorStorage: typeof navigator.storage | undefined;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock matchMedia
    mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn(() => mockMediaQuery as unknown as MediaQueryList);

    // Mock navigator.storage
    originalNavigatorStorage = navigator.storage;
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: vi.fn(),
      },
      configurable: true,
    });

    // Mock document methods
    vi.spyOn(document.documentElement.style, 'fontSize', 'set');
    vi.spyOn(document.documentElement.classList, 'toggle');
    vi.spyOn(document.documentElement, 'setAttribute');
    vi.spyOn(window, 'dispatchEvent');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Create a new service instance
    service = new SettingsService();
  });

  afterEach(() => {
    // Restore mocks
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    }
    if (originalNavigatorStorage !== undefined) {
      Object.defineProperty(navigator, 'storage', {
        value: originalNavigatorStorage,
        configurable: true,
      });
    }
    service.dispose();
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default settings', () => {
      const settings = service.getSettings();
      expect(settings).toEqual(DEFAULT_APP_SETTINGS);
    });

    it('should set up media query listener when matchMedia is available', () => {
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should handle SSR environment without matchMedia', () => {
      // Dispose current service
      service.dispose();

      // Mock SSR environment
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR scenario
      delete global.window;

      // Should not throw
      expect(() => {
        service = new SettingsService();
      }).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('load()', () => {
    it('should return default settings when no stored settings exist', () => {
      const settings = service.load();

      expect(settings).toEqual(DEFAULT_APP_SETTINGS);
      expect(localStorage.getItem('mindforge.app-settings.v1')).toBeNull();
    });

    it('should apply default settings to DOM when no stored settings exist', () => {
      service.load();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light'
      );
      expect(document.documentElement.style.fontSize).toBe('16px');
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'reduced-motion',
        false
      );
    });

    it('should emit update event when loading default settings', () => {
      service.load();

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'app:settings:updated',
        })
      );
    });

    it('should load and validate stored settings', () => {
      const storedSettings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          mode: 'dark',
          fontScale: 'large',
        },
        lastSavedAt: '2024-01-01T00:00:00.000Z',
      };

      localStorage.setItem('mindforge.app-settings.v1', JSON.stringify(storedSettings));

      const settings = service.load();

      expect(settings.theme.mode).toBe('dark');
      expect(settings.theme.fontScale).toBe('large');
      expect(validateAppSettings).toHaveBeenCalled();
    });

    it('should apply stored settings to DOM', () => {
      const storedSettings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: {
          mode: 'dark',
          fontScale: 'x-large',
          animationsEnabled: false,
          reducedMotion: true,
        },
      };

      localStorage.setItem('mindforge.app-settings.v1', JSON.stringify(storedSettings));

      service.load();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
      expect(document.documentElement.style.fontSize).toBe('20px');
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'reduced-motion',
        true
      );
    });

    it('should reset to defaults on invalid JSON', () => {
      localStorage.setItem('mindforge.app-settings.v1', 'invalid json');

      const settings = service.load();

      expect(settings).toEqual(DEFAULT_APP_SETTINGS);
      expect(console.warn).toHaveBeenCalledWith(
        '[Settings] Failed to load settings, resetting to defaults.',
        expect.any(Error)
      );
    });

    it('should persist defaults after invalid JSON error', () => {
      localStorage.setItem('mindforge.app-settings.v1', 'invalid json');

      service.load();

      const stored = localStorage.getItem('mindforge.app-settings.v1');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toMatchObject(DEFAULT_APP_SETTINGS);
    });

    it('should handle validation failures gracefully', () => {
      vi.mocked(validateAppSettings).mockImplementationOnce(() => {
        throw new Error('Validation failed');
      });

      localStorage.setItem('mindforge.app-settings.v1', JSON.stringify({}));

      const settings = service.load();

      expect(settings).toEqual(DEFAULT_APP_SETTINGS);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('save()', () => {
    it('should save settings to localStorage', () => {
      const newSettings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          mode: 'dark',
        },
      };

      service.save(newSettings);

      const stored = localStorage.getItem('mindforge.app-settings.v1');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.theme.mode).toBe('dark');
    });

    it('should add timestamp when saving', () => {
      const beforeSave = new Date().toISOString();

      const saved = service.save(DEFAULT_APP_SETTINGS);

      expect(saved.lastSavedAt).toBeDefined();
      expect(saved.lastSavedAt).not.toBeNull();

      const savedTimestamp = new Date(saved.lastSavedAt!).getTime();
      const beforeTimestamp = new Date(beforeSave).getTime();

      expect(savedTimestamp).toBeGreaterThanOrEqual(beforeTimestamp);
    });

    it('should update internal state', () => {
      const newSettings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          fontScale: 'large',
        },
      };

      service.save(newSettings);

      const current = service.getSettings();
      expect(current.theme.fontScale).toBe('large');
    });

    it('should apply theme to DOM', () => {
      const newSettings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          mode: 'dark',
        },
      };

      service.save(newSettings);

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
    });

    it('should apply font scale to DOM', () => {
      const newSettings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          fontScale: 'small',
        },
      };

      service.save(newSettings);

      expect(document.documentElement.style.fontSize).toBe('15px');
    });

    it('should apply reduced motion when enabled', () => {
      const newSettings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          reducedMotion: true,
        },
      };

      service.save(newSettings);

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'reduced-motion',
        true
      );
    });

    it('should apply reduced motion when animations disabled', () => {
      const newSettings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          animationsEnabled: false,
          reducedMotion: false,
        },
      };

      service.save(newSettings);

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'reduced-motion',
        true
      );
    });

    it('should emit update event', () => {
      service.save(DEFAULT_APP_SETTINGS);

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'app:settings:updated',
          detail: expect.objectContaining({
            settings: expect.any(Object),
          }),
        })
      );
    });

    it('should return saved settings with timestamp', () => {
      const saved = service.save(DEFAULT_APP_SETTINGS);

      expect(saved.lastSavedAt).toBeDefined();
      expect(saved.lastSavedAt).not.toBeNull();
      // Compare all properties except lastSavedAt
      expect(saved.version).toBe(DEFAULT_APP_SETTINGS.version);
      expect(saved.theme).toEqual(DEFAULT_APP_SETTINGS.theme);
      expect(saved.audio).toEqual(DEFAULT_APP_SETTINGS.audio);
    });
  });

  describe('update()', () => {
    it('should call updater function with current settings', () => {
      const updater = vi.fn((prev: AppSettings) => prev);

      service.update(updater);

      expect(updater).toHaveBeenCalledWith(DEFAULT_APP_SETTINGS);
    });

    it('should validate updated settings', () => {
      const updater = (prev: AppSettings) => ({
        ...prev,
        theme: { ...prev.theme, mode: 'dark' as const },
      });

      service.update(updater);

      expect(validateAppSettings).toHaveBeenCalled();
    });

    it('should save updated settings', () => {
      const updater = (prev: AppSettings) => ({
        ...prev,
        theme: { ...prev.theme, mode: 'dark' as const },
      });

      const result = service.update(updater);

      expect(result.theme.mode).toBe('dark');

      const stored = localStorage.getItem('mindforge.app-settings.v1');
      const parsed = JSON.parse(stored!);
      expect(parsed.theme.mode).toBe('dark');
    });

    it('should apply updated settings to DOM', () => {
      const updater = (prev: AppSettings) => ({
        ...prev,
        theme: { ...prev.theme, fontScale: 'x-large' as const },
      });

      service.update(updater);

      expect(document.documentElement.style.fontSize).toBe('20px');
    });
  });

  describe('reset()', () => {
    it('should reset to default settings', () => {
      // First save some custom settings
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' },
      });

      const reset = service.reset();

      expect(reset.theme.mode).toBe('system');
      expect(reset.lastSavedAt).not.toBeNull();
      // Compare all properties except lastSavedAt
      expect(reset.version).toBe(DEFAULT_APP_SETTINGS.version);
      expect(reset.theme).toEqual(DEFAULT_APP_SETTINGS.theme);
      expect(reset.audio).toEqual(DEFAULT_APP_SETTINGS.audio);
    });

    it('should add timestamp when resetting', () => {
      const reset = service.reset();

      expect(reset.lastSavedAt).toBeDefined();
      expect(reset.lastSavedAt).not.toBeNull();
    });

    it('should persist reset settings to localStorage', () => {
      service.reset();

      const stored = localStorage.getItem('mindforge.app-settings.v1');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.lastSavedAt).not.toBeNull();
      // Compare all properties except lastSavedAt
      expect(parsed.version).toBe(DEFAULT_APP_SETTINGS.version);
      expect(parsed.theme).toEqual(DEFAULT_APP_SETTINGS.theme);
      expect(parsed.audio).toEqual(DEFAULT_APP_SETTINGS.audio);
    });

    it('should apply default settings to DOM', () => {
      // Change settings first
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: {
          mode: 'dark',
          fontScale: 'x-large',
          animationsEnabled: false,
          reducedMotion: true,
        },
      });

      // Reset
      service.reset();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light'
      );
      expect(document.documentElement.style.fontSize).toBe('16px');
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'reduced-motion',
        false
      );
    });

    it('should emit update event', () => {
      service.reset();

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'app:settings:updated',
        })
      );
    });
  });

  describe('export()', () => {
    it('should return JSON string', () => {
      const exported = service.export();

      expect(typeof exported).toBe('string');
      expect(() => JSON.parse(exported)).not.toThrow();
    });

    it('should include export timestamp', () => {
      const beforeExport = new Date().toISOString();
      const exported = service.export();
      const parsed = JSON.parse(exported);

      expect(parsed.exportedAt).toBeDefined();

      const exportedTimestamp = new Date(parsed.exportedAt).getTime();
      const beforeTimestamp = new Date(beforeExport).getTime();

      expect(exportedTimestamp).toBeGreaterThanOrEqual(beforeTimestamp);
    });

    it('should include current settings', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' },
      });

      const exported = service.export();
      const parsed = JSON.parse(exported);

      expect(parsed.settings).toBeDefined();
      expect(parsed.settings.theme.mode).toBe('dark');
    });

    it('should format JSON with indentation', () => {
      const exported = service.export();

      // JSON.stringify with null, 2 produces newlines
      expect(exported).toContain('\n');
      expect(exported).toContain('  '); // 2 space indent
    });
  });

  describe('import()', () => {
    it('should import settings from valid JSON', () => {
      const settingsToImport: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' },
      };

      const json = JSON.stringify({ settings: settingsToImport });

      const imported = service.import(json);

      expect(imported.theme.mode).toBe('dark');
    });

    it('should import from export format with exportedAt', () => {
      const settingsToImport: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, fontScale: 'large' },
      };

      const json = JSON.stringify({
        exportedAt: new Date().toISOString(),
        settings: settingsToImport,
      });

      const imported = service.import(json);

      expect(imported.theme.fontScale).toBe('large');
    });

    it('should import from plain settings JSON', () => {
      const settingsToImport: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' },
      };

      const json = JSON.stringify(settingsToImport);

      const imported = service.import(json);

      expect(imported.theme.mode).toBe('dark');
    });

    it('should validate imported settings', () => {
      const json = JSON.stringify(DEFAULT_APP_SETTINGS);

      service.import(json);

      expect(validateAppSettings).toHaveBeenCalled();
    });

    it('should save imported settings', () => {
      const settingsToImport: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' },
      };

      const json = JSON.stringify(settingsToImport);

      service.import(json);

      const stored = localStorage.getItem('mindforge.app-settings.v1');
      const parsed = JSON.parse(stored!);
      expect(parsed.theme.mode).toBe('dark');
    });

    it('should apply imported settings to DOM', () => {
      const settingsToImport: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: {
          mode: 'dark',
          fontScale: 'x-large',
          animationsEnabled: true,
          reducedMotion: false,
        },
      };

      const json = JSON.stringify(settingsToImport);

      service.import(json);

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
      expect(document.documentElement.style.fontSize).toBe('20px');
    });

    it('should throw error with German message for invalid JSON', () => {
      expect(() => {
        service.import('invalid json');
      }).toThrow('Ungültige Einstellungsdatei.');
    });

    it('should throw error with German message for validation failures', () => {
      vi.mocked(validateAppSettings).mockImplementationOnce(() => {
        throw new Error('Validation error');
      });

      expect(() => {
        service.import(JSON.stringify({}));
      }).toThrow('Ungültige Einstellungsdatei.');
    });

    it('should log error on import failure', () => {
      try {
        service.import('invalid');
      } catch {
        // Expected to throw
      }

      expect(console.error).toHaveBeenCalledWith(
        '[Settings] Failed to import settings',
        expect.any(Error)
      );
    });
  });

  describe('estimateStorageUsage()', () => {
    it('should return storage estimate when available', async () => {
      const mockEstimate = { usage: 1024, quota: 1024000 };
      vi.mocked(navigator.storage.estimate).mockResolvedValue(mockEstimate);

      const estimate = await service.estimateStorageUsage();

      expect(estimate.usage).toBe(1024);
      expect(estimate.quota).toBe(1024000);
    });

    it('should handle null values in estimate', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValue({});

      const estimate = await service.estimateStorageUsage();

      expect(estimate.usage).toBeNull();
      expect(estimate.quota).toBeNull();
    });

    it('should return null values when storage API unavailable', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: undefined,
        configurable: true,
      });

      const estimate = await service.estimateStorageUsage();

      expect(estimate.usage).toBeNull();
      expect(estimate.quota).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(navigator.storage.estimate).mockRejectedValue(
        new Error('Storage error')
      );

      const estimate = await service.estimateStorageUsage();

      expect(estimate.usage).toBeNull();
      expect(estimate.quota).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[Settings] Failed to estimate storage usage',
        expect.any(Error)
      );
    });
  });

  describe('Theme Resolution', () => {
    it('should resolve system theme to light when matchMedia returns false', () => {
      mockMediaQuery.matches = false;

      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'system' },
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light'
      );
    });

    it('should resolve system theme to dark when matchMedia returns true', () => {
      mockMediaQuery.matches = true;

      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'system' },
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
    });

    it('should use light theme directly when mode is light', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'light' },
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light'
      );
    });

    it('should use dark theme directly when mode is dark', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' },
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
    });

    it('should default to light theme in SSR environment', () => {
      service.dispose();

      // Mock SSR
      const originalMatchMedia = window.matchMedia;
      // @ts-expect-error - Testing SSR
      window.matchMedia = undefined;

      service = new SettingsService();
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'system' },
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light'
      );

      window.matchMedia = originalMatchMedia;
    });
  });

  describe('Font Scale Application', () => {
    it('should apply small font scale (15px)', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, fontScale: 'small' },
      });

      expect(document.documentElement.style.fontSize).toBe('15px');
    });

    it('should apply medium font scale (16px)', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, fontScale: 'medium' },
      });

      expect(document.documentElement.style.fontSize).toBe('16px');
    });

    it('should apply large font scale (18px)', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, fontScale: 'large' },
      });

      expect(document.documentElement.style.fontSize).toBe('18px');
    });

    it('should apply x-large font scale (20px)', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, fontScale: 'x-large' },
      });

      expect(document.documentElement.style.fontSize).toBe('20px');
    });

    it('should not throw in SSR environment', () => {
      service.dispose();

      const originalDocument = global.document;
      // @ts-expect-error - Testing SSR
      delete global.document;

      service = new SettingsService();

      expect(() => {
        service.save({
          ...DEFAULT_APP_SETTINGS,
          theme: { ...DEFAULT_APP_SETTINGS.theme, fontScale: 'large' },
        });
      }).not.toThrow();

      global.document = originalDocument;
    });
  });

  describe('Reduced Motion Application', () => {
    it('should add reduced-motion class when reducedMotion is true', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          reducedMotion: true,
          animationsEnabled: true,
        },
      });

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'reduced-motion',
        true
      );
    });

    it('should add reduced-motion class when animationsEnabled is false', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          reducedMotion: false,
          animationsEnabled: false,
        },
      });

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'reduced-motion',
        true
      );
    });

    it('should not add reduced-motion class when both are false/true', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          reducedMotion: false,
          animationsEnabled: true,
        },
      });

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'reduced-motion',
        false
      );
    });

    it('should prioritize reducedMotion over animationsEnabled', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: {
          ...DEFAULT_APP_SETTINGS.theme,
          reducedMotion: true,
          animationsEnabled: true,
        },
      });

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'reduced-motion',
        true
      );
    });

    it('should not throw in SSR environment', () => {
      service.dispose();

      const originalDocument = global.document;
      // @ts-expect-error - Testing SSR
      delete global.document;

      service = new SettingsService();

      expect(() => {
        service.save({
          ...DEFAULT_APP_SETTINGS,
          theme: { ...DEFAULT_APP_SETTINGS.theme, reducedMotion: true },
        });
      }).not.toThrow();

      global.document = originalDocument;
    });
  });

  describe('System Theme Change Handler', () => {
    it('should reapply theme when system theme changes and mode is system', () => {
      // Get the handler that was registered in constructor
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];

      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'system' },
      });

      // Clear previous calls
      vi.clearAllMocks();

      // Simulate system theme change
      mockMediaQuery.matches = true;
      changeHandler();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
    });

    it('should emit update event when system theme changes', () => {
      // Get the handler that was registered in constructor
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];

      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'system' },
      });

      vi.clearAllMocks();

      changeHandler();

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'app:settings:updated',
        })
      );
    });

    it('should not reapply theme when mode is not system', () => {
      // Get the handler that was registered in constructor
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];

      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'light' },
      });

      vi.clearAllMocks();

      mockMediaQuery.matches = true;
      changeHandler();

      // Should still be light, not dark
      expect(document.documentElement.setAttribute).not.toHaveBeenCalled();
    });

    it('should not emit event when mode is not system', () => {
      // Get the handler that was registered in constructor
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];

      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' },
      });

      vi.clearAllMocks();

      changeHandler();

      expect(window.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('dispose()', () => {
    it('should remove media query listener', () => {
      service.dispose();

      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should handle dispose when mediaQuery is null', () => {
      service.dispose();

      // Create service without matchMedia
      const originalMatchMedia = window.matchMedia;
      // @ts-expect-error - Testing edge case
      window.matchMedia = undefined;

      const serviceWithoutMediaQuery = new SettingsService();

      expect(() => {
        serviceWithoutMediaQuery.dispose();
      }).not.toThrow();

      window.matchMedia = originalMatchMedia;
    });

    it('should be safe to call multiple times', () => {
      service.dispose();
      service.dispose();

      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSettings()', () => {
    it('should return current settings', () => {
      const settings = service.getSettings();

      expect(settings).toEqual(DEFAULT_APP_SETTINGS);
    });

    it('should return updated settings after save', () => {
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' },
      });

      const settings = service.getSettings();

      expect(settings.theme.mode).toBe('dark');
    });

    it('should return a reference to current settings', () => {
      const settings1 = service.getSettings();
      const settings2 = service.getSettings();

      expect(settings1).toBe(settings2);
    });
  });

  describe('Event Emission', () => {
    it('should not emit events in SSR environment', () => {
      service.dispose();

      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR
      delete global.window;

      service = new SettingsService();
      service.save(DEFAULT_APP_SETTINGS);

      global.window = originalWindow;

      // Window.dispatchEvent should not have been called in SSR
      expect(window.dispatchEvent).not.toHaveBeenCalled();
    });

    it('should include settings in event detail', () => {
      const newSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' as const },
      };

      service.save(newSettings);

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'app:settings:updated',
          detail: expect.objectContaining({
            settings: expect.objectContaining({
              theme: expect.objectContaining({
                mode: 'dark',
              }),
            }),
          }),
        })
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: load -> update -> export -> reset -> import', () => {
      // Load initial settings
      service.load();

      // Update settings
      service.update((prev) => ({
        ...prev,
        theme: { ...prev.theme, mode: 'dark', fontScale: 'large' },
      }));

      // Export settings
      const exported = service.export();
      expect(exported).toContain('"mode": "dark"');
      expect(exported).toContain('"fontScale": "large"');

      // Reset to defaults
      const reset = service.reset();
      expect(reset.theme.mode).toBe('system');
      expect(reset.theme.fontScale).toBe('medium');

      // Import previously exported settings
      const imported = service.import(exported);
      expect(imported.theme.mode).toBe('dark');
      expect(imported.theme.fontScale).toBe('large');
    });

    it('should maintain settings across service instances', () => {
      // Save settings with first instance
      service.save({
        ...DEFAULT_APP_SETTINGS,
        theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' },
      });

      service.dispose();

      // Create new instance
      const newService = new SettingsService();
      const loaded = newService.load();

      expect(loaded.theme.mode).toBe('dark');

      newService.dispose();
    });

    it('should apply all settings correctly on load', () => {
      const complexSettings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        theme: {
          mode: 'dark',
          fontScale: 'x-large',
          animationsEnabled: false,
          reducedMotion: true,
        },
      };

      localStorage.setItem('mindforge.app-settings.v1', JSON.stringify(complexSettings));

      service.load();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
      expect(document.documentElement.style.fontSize).toBe('20px');
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'reduced-motion',
        true
      );
    });
  });

  describe('DatabaseUsageEstimate Type', () => {
    it('should match expected interface', async () => {
      vi.mocked(navigator.storage.estimate).mockResolvedValue({
        usage: 1024,
        quota: 1024000,
      });

      const estimate: DatabaseUsageEstimate = await service.estimateStorageUsage();

      expect(estimate).toHaveProperty('usage');
      expect(estimate).toHaveProperty('quota');
      expect(typeof estimate.usage === 'number' || estimate.usage === null).toBe(true);
      expect(typeof estimate.quota === 'number' || estimate.quota === null).toBe(true);
    });
  });
});
