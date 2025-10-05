import {
  DEFAULT_APP_SETTINGS,
  type AppSettings,
  type ThemeMode,
  validateAppSettings,
} from '../entities/app-settings';

const STORAGE_KEY = 'mindforge.app-settings.v1';

function resolveEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return mode;
}

function applyFontScale(scale: AppSettings['theme']['fontScale']): void {
  if (typeof document === 'undefined') return;
  const map: Record<AppSettings['theme']['fontScale'], string> = {
    small: '15px',
    medium: '16px',
    large: '18px',
    'x-large': '20px',
  };
  document.documentElement.style.fontSize = map[scale];
}

function applyReducedMotion(enabled: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('reduced-motion', enabled);
}

function applyTheme(themeMode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const effective = resolveEffectiveTheme(themeMode);
  document.documentElement.setAttribute('data-theme', effective);
}

export class SettingsService {
  private currentSettings: AppSettings = { ...DEFAULT_APP_SETTINGS };
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
    }
  }

  load(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.applySettings(DEFAULT_APP_SETTINGS);
        this.currentSettings = { ...DEFAULT_APP_SETTINGS };
        this.emitUpdate();
        return this.currentSettings;
      }
      const parsed = validateAppSettings(JSON.parse(raw));
      this.currentSettings = parsed;
      this.applySettings(parsed);
      this.emitUpdate();
      return parsed;
    } catch (error) {
      console.warn('[Settings] Failed to load settings, resetting to defaults.', error);
      this.currentSettings = { ...DEFAULT_APP_SETTINGS };
      this.persist(this.currentSettings);
      this.applySettings(this.currentSettings);
      this.emitUpdate();
      return this.currentSettings;
    }
  }

  save(settings: AppSettings): AppSettings {
    const merged = {
      ...settings,
      lastSavedAt: new Date().toISOString(),
    } satisfies AppSettings;
    this.currentSettings = merged;
    this.persist(merged);
    this.applySettings(merged);
    this.emitUpdate();
    return merged;
  }

  update(updater: (prev: AppSettings) => AppSettings): AppSettings {
    const next = updater(this.currentSettings);
    return this.save(validateAppSettings(next));
  }

  reset(): AppSettings {
    const defaults = {
      ...DEFAULT_APP_SETTINGS,
      lastSavedAt: new Date().toISOString(),
    };
    this.currentSettings = defaults;
    this.persist(defaults);
    this.applySettings(defaults);
    this.emitUpdate();
    return defaults;
  }

  export(): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings: this.currentSettings,
    };
    return JSON.stringify(payload, null, 2);
  }

  import(json: string): AppSettings {
    try {
      const parsed = JSON.parse(json);
      const candidate = parsed?.settings ?? parsed;
      const validated = validateAppSettings(candidate);
      return this.save(validated);
    } catch (error) {
      console.error('[Settings] Failed to import settings', error);
      throw new Error('Ungültige Einstellungsdatei.');
    }
  }

  async estimateStorageUsage(): Promise<DatabaseUsageEstimate> {
    if (navigator.storage?.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage ?? null,
          quota: estimate.quota ?? null,
        };
      } catch (error) {
        console.warn('[Settings] Failed to estimate storage usage', error);
      }
    }
    return { usage: null, quota: null };
  }

  private persist(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  private applySettings(settings: AppSettings): void {
    applyTheme(settings.theme.mode);
    applyFontScale(settings.theme.fontScale);
    applyReducedMotion(settings.theme.reducedMotion || !settings.theme.animationsEnabled);
  }

  private handleSystemThemeChange = () => {
    if (this.currentSettings.theme.mode === 'system') {
      applyTheme('system');
      this.emitUpdate();
    }
  };

  private emitUpdate(): void {
    if (typeof window === 'undefined') return;
    const detail = { settings: this.currentSettings };
    window.dispatchEvent(new CustomEvent('app:settings:updated', { detail }));
  }

  dispose(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }
  }

  getSettings(): AppSettings {
    return this.currentSettings;
  }
}

export const settingsService = new SettingsService();

export interface DatabaseUsageEstimate {
  usage: number | null;
  quota: number | null;
}
