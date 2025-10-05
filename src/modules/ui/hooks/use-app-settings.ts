import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppSettings } from '../../core/entities/app-settings';
import { validateAppSettings } from '../../core/entities/app-settings';
import { settingsService, type DatabaseUsageEstimate } from '../../core/services/settings-service';

export type SaveState = 'idle' | 'saving' | 'saved';

export interface UseAppSettingsReturn {
  settings: AppSettings | null;
  loading: boolean;
  saveState: SaveState;
  updateSettings: (updates: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettingsFromText: (payload: string) => void;
  storageEstimate: DatabaseUsageEstimate | null;
  refreshStorageEstimate: () => Promise<void>;
}

const SAVE_STATE_RESET_DELAY = 2000;

export function useAppSettings(): UseAppSettingsReturn {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [storageEstimate, setStorageEstimate] = useState<DatabaseUsageEstimate | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const settingsRef = useRef<AppSettings | null>(null);

  useEffect(() => {
    const loaded = settingsService.load();
    settingsRef.current = loaded;
    setSettings(loaded);
    setLoading(false);
    void settingsService.estimateStorageUsage().then((estimate) => {
      setStorageEstimate(estimate);
    });

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const scheduleResetSaveState = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setSaveState('idle');
      timeoutRef.current = null;
    }, SAVE_STATE_RESET_DELAY);
  }, []);

  const updateSettings = useCallback<UseAppSettingsReturn['updateSettings']>((updates) => {
    if (!settingsRef.current) return;
    setSaveState('saving');

    const next = typeof updates === 'function'
      ? updates(settingsRef.current)
      : { ...settingsRef.current, ...updates };

    const validated = validateAppSettings(next);
    const saved = settingsService.save(validated);
    settingsRef.current = saved;
    setSettings(saved);
    setSaveState('saved');
    scheduleResetSaveState();
  }, [scheduleResetSaveState]);

  const resetSettings = useCallback(() => {
    setSaveState('saving');
    const reset = settingsService.reset();
    settingsRef.current = reset;
    setSettings(reset);
    setSaveState('saved');
    scheduleResetSaveState();
  }, [scheduleResetSaveState]);

  const exportSettings = useCallback(() => {
    return settingsService.export();
  }, []);

  const importSettingsFromText = useCallback((payload: string) => {
    setSaveState('saving');
    const imported = settingsService.import(payload);
    settingsRef.current = imported;
    setSettings(imported);
    setSaveState('saved');
    scheduleResetSaveState();
  }, [scheduleResetSaveState]);

  const refreshStorageEstimate = useCallback(async () => {
    const estimate = await settingsService.estimateStorageUsage();
    setStorageEstimate(estimate);
  }, []);

  return {
    settings,
    loading,
    saveState,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettingsFromText,
    storageEstimate,
    refreshStorageEstimate,
  };
}

