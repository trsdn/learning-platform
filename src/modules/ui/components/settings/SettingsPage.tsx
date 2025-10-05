import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useAppSettings } from '../../hooks/use-app-settings';
import { useAudioSettings } from '../../hooks/use-audio-settings';
import type { AppSettings, ThemeMode, FontScale } from '../../../core/entities/app-settings';
import type { AudioSettings as LegacyAudioSettings } from '../../../core/entities/audio-settings';
import styles from './settings-page.module.css';

interface SettingsPageProps {
  onClose: () => void;
}

interface SectionDefinition {
  id: string;
  icon: string;
  title: string;
  keywords: string[];
  content: JSX.Element;
}

function formatBytes(bytes: number | null): string {
  if (bytes == null) return '–';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(1)} ${units[index]}`;
}

function formatDateTime(value: string | null): string {
  if (!value) return 'Nie';
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return value ?? '';
  }
}

const PRESETS = [
  {
    id: 'performance',
    label: '⚡ Performance-Modus',
    apply: (settings: AppSettings): AppSettings => ({
      ...settings,
      theme: { ...settings.theme, animationsEnabled: false, mode: 'dark' },
      audio: { ...settings.audio, autoPlayEnabled: false },
    }),
  },
  {
    id: 'accessibility',
    label: '♿ Barrierefreiheit',
    apply: (settings: AppSettings): AppSettings => ({
      ...settings,
      theme: { ...settings.theme, fontScale: 'x-large', reducedMotion: true, animationsEnabled: false, mode: 'light' },
    }),
  },
  {
    id: 'power-saver',
    label: '🔋 Energiesparen',
    apply: (settings: AppSettings): AppSettings => ({
      ...settings,
      audio: { ...settings.audio, autoPlayEnabled: false },
      theme: { ...settings.theme, animationsEnabled: false },
    }),
  },
];

export function SettingsPage({ onClose }: SettingsPageProps) {
  const {
    settings,
    loading,
    saveState,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettingsFromText,
    storageEstimate,
    refreshStorageEstimate,
  } = useAppSettings();
  const { settings: audioSettings, updateSettings: updateAudioSettings } = useAudioSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showImportError, setShowImportError] = useState<string | null>(null);

  const handleThemeModeChange = (mode: ThemeMode) => {
    updateSettings((prev) => ({
      ...prev,
      theme: { ...prev.theme, mode },
    }));
  };

  const handleFontScaleChange = (fontScale: FontScale) => {
    updateSettings((prev) => ({
      ...prev,
      theme: { ...prev.theme, fontScale },
    }));
  };

  const handleAudioUpdate = (updates: Partial<AppSettings['audio']>) => {
    updateSettings((prev) => ({
      ...prev,
      audio: { ...prev.audio, ...updates },
    }));
    if (audioSettings) {
      const mirrored: Partial<LegacyAudioSettings> = {};
      if (updates.autoPlayEnabled !== undefined) {
        mirrored.autoPlayEnabled = updates.autoPlayEnabled;
      }
      if (Object.keys(mirrored).length > 0) {
        updateAudioSettings(mirrored);
      }
    }
  };

  const handleDatabaseMetadataUpdate = useCallback((updates: Partial<AppSettings['database']>) => {
    updateSettings((prev) => ({
      ...prev,
      database: { ...prev.database, ...updates },
    }));
  }, [updateSettings]);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ lastUpdatedAt?: string; storageUsageBytes?: number }>).detail;
      if (detail?.lastUpdatedAt) {
        handleDatabaseMetadataUpdate({ lastUpdatedAt: detail.lastUpdatedAt });
      }
      if (typeof detail?.storageUsageBytes === 'number') {
        handleDatabaseMetadataUpdate({ storageUsageBytes: detail.storageUsageBytes });
      }
      void refreshStorageEstimate();
    };

    window.addEventListener('app:database:updated', listener);
    return () => {
      window.removeEventListener('app:database:updated', listener);
    };
  }, [handleDatabaseMetadataUpdate, refreshStorageEstimate]);

  if (loading || !settings) {
    return (
      <div className={styles.settingsPage}>
        <p>Lade Einstellungen...</p>
      </div>
    );
  }

  const handlePreset = (presetId: string) => {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    updateSettings(() => preset.apply(settings));
  };

  const handleExport = () => {
    const data = exportSettings();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindforge-settings-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : '';
        importSettingsFromText(text);
        setShowImportError(null);
      } catch (error) {
        console.error(error);
        setShowImportError('Import fehlgeschlagen. Bitte gültige JSON-Datei auswählen.');
      }
    };
    reader.onerror = () => {
      setShowImportError('Datei konnte nicht gelesen werden.');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const sections: SectionDefinition[] = (() => {
    const databaseSection: SectionDefinition = {
      id: 'database',
      icon: '📦',
      title: 'Datenbank & Speicherung',
      keywords: ['datenbank', 'speicherung', 'backup', 'import', 'export', 'speicher'],
      content: (
        <div className={styles.settingGroup}>
          <div className={styles.buttonRow}>
            <button
              type="button"
              onClick={() => {
                const confirmed = confirm('Datenbank neu laden? Lernpfade werden aktualisiert.');
                if (!confirmed) return;
                window.dispatchEvent(new CustomEvent('app:database:reseed'));
              }}
            >
              🔄 Datenbank Aktualisieren
            </button>
            <button
              type="button"
              className={clsx(styles.dangerButton)}
              onClick={() => {
                const confirmed = confirm('⚠️ Alle Daten löschen? Dies kann nicht rückgängig gemacht werden!');
                if (!confirmed) return;
                window.dispatchEvent(new CustomEvent('app:database:reset'));
              }}
            >
              🗑️ Alle Daten Löschen
            </button>
            <button type="button" onClick={handleExport}>
              📥 Daten Exportieren
            </button>
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              📤 Daten Importieren
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
          </div>
          {showImportError && (
            <div className={styles.infoCard} style={{ borderColor: '#f97316', color: '#b45309' }}>
              {showImportError}
            </div>
          )}
          <div className={styles.infoCard}>
            <div className={styles.infoGrid}>
              <div>💾 Speichernutzung: {formatBytes(storageEstimate?.usage ?? null)} / {formatBytes(storageEstimate?.quota ?? null)}</div>
              <div>📅 Letztes Update: {formatDateTime(settings.database.lastUpdatedAt)}</div>
            </div>
            <button
              type="button"
              style={{ marginTop: '0.75rem' }}
              onClick={() => {
                void refreshStorageEstimate();
              }}
            >
              Speichernutzung aktualisieren
            </button>
          </div>
        </div>
      ),
    };

    const themeSection: SectionDefinition = {
      id: 'theme',
      icon: '🎨',
      title: 'Darstellung & Theme',
      keywords: ['theme', 'dark', 'light', 'schrift', 'font', 'animation'],
      content: (
        <div className={styles.settingGroup}>
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>Theme</div>
            <div className={styles.radioGroup}>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <label
                  key={mode}
                  className={clsx(styles.radioOption, settings.theme.mode === mode && styles['radioOption--active'])}
                >
                  <input
                    type="radio"
                    checked={settings.theme.mode === mode}
                    onChange={() => handleThemeModeChange(mode)}
                  />
                  {mode === 'light' ? 'Hell' : mode === 'dark' ? 'Dunkel' : 'System'}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>Schriftgröße</div>
            <div className={styles.radioGroup}>
              {(['small', 'medium', 'large', 'x-large'] as FontScale[]).map((scale) => (
                <label
                  key={scale}
                  className={clsx(styles.radioOption, settings.theme.fontScale === scale && styles['radioOption--active'])}
                >
                  <input
                    type="radio"
                    checked={settings.theme.fontScale === scale}
                    onChange={() => handleFontScaleChange(scale)}
                  />
                  {scale === 'small'
                    ? 'Klein'
                    : scale === 'medium'
                      ? 'Mittel'
                      : scale === 'large'
                        ? 'Groß'
                        : 'Sehr groß'}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.toggleGroup}>
            <label className={styles.radioOption}>
              <input
                type="checkbox"
                checked={settings.theme.animationsEnabled}
                onChange={(event) =>
                  updateSettings((prev) => ({
                    ...prev,
                    theme: { ...prev.theme, animationsEnabled: event.target.checked },
                  }))
                }
              />
              Animationen aktivieren
            </label>
            <label className={styles.radioOption}>
              <input
                type="checkbox"
                checked={settings.theme.reducedMotion}
                onChange={(event) =>
                  updateSettings((prev) => ({
                    ...prev,
                    theme: { ...prev.theme, reducedMotion: event.target.checked },
                  }))
                }
              />
              Reduzierte Bewegungen
            </label>
          </div>
        </div>
      ),
    };

    const audioSection: SectionDefinition = {
      id: 'audio',
      icon: '🔊',
      title: 'Audio',
      keywords: ['audio', 'autoplay', 'sound'],
      content: (
        <div className={styles.settingGroup}>
          <label className={styles.radioOption}>
            <input
              type="checkbox"
              checked={settings.audio.autoPlayEnabled}
              onChange={(event) => handleAudioUpdate({ autoPlayEnabled: event.target.checked })}
            />
            Audio automatisch abspielen (Spanisch)
          </label>
          <p className={styles.settingDescription}>
            Steuert, ob Vokabelkarten automatisch die spanische Aussprache wiedergeben.
          </p>
        </div>
      ),
    };

    const infoSection: SectionDefinition = {
      id: 'info',
      icon: 'ℹ️',
      title: 'Info & Support',
      keywords: ['hilfe', 'faq', 'bug', 'feature', 'support'],
      content: (
        <div className={styles.settingGroup}>
          <div className={styles.infoCard}>
            <div>Version: 1.0.0</div>
            <div>Letzte Aktualisierung: {new Intl.DateTimeFormat('de-DE').format(new Date())}</div>
          </div>
          <div className={styles.buttonRow}>
            <a className={styles.linkButton} href="https://github.com/trsdn/learning-platform#readme" target="_blank" rel="noreferrer">
              📖 Dokumentation
            </a>
            <a className={styles.linkButton} href="https://github.com/trsdn/learning-platform/issues/new" target="_blank" rel="noreferrer">
              🐛 Bug melden
            </a>
            <a className={styles.linkButton} href="https://github.com/trsdn/learning-platform/issues/new" target="_blank" rel="noreferrer">
              💡 Feature vorschlagen
            </a>
            <a className={styles.linkButton} href="https://github.com/trsdn/learning-platform/discussions" target="_blank" rel="noreferrer">
              ❓ Hilfe & FAQ
            </a>
          </div>
          <div className={styles.settingDescription}>
            Entwickelt von @trsdn · Open Source auf GitHub
          </div>
        </div>
      ),
    };

    return [databaseSection, themeSection, audioSection, infoSection];
  })();

  const filteredSections = sections.filter((section) => {
    if (!searchQuery) return true;
    const target = `${section.title} ${section.keywords.join(' ')}`.toLowerCase();
    return target.includes(searchQuery.toLowerCase());
  });

  return (
    <div className={styles.settingsPage}>
      <header className={styles.settingsHeader}>
        <div className={styles.settingsTitle}>
          <h1>⚙️ Einstellungen</h1>
          <div className={clsx(styles.saveIndicator, saveState === 'saved' && styles['saveIndicator--saved'])}>
            {saveState === 'saving' && 'Speichere...'}
            {saveState === 'saved' && 'Gespeichert ✓'}
            {saveState === 'idle' && settings.lastSavedAt && `Zuletzt gespeichert: ${formatDateTime(settings.lastSavedAt)}`}
          </div>
        </div>
        <button className={styles.closeButton} type="button" onClick={onClose}>
          Schließen
        </button>
      </header>

      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Einstellungen durchsuchen..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className={styles.presets}>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={styles.presetButton}
            onClick={() => handlePreset(preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className={styles.sections}>
        {filteredSections.map((section) => (
          <CollapsibleSection key={section.id} icon={section.icon} title={section.title}>
            {section.content}
          </CollapsibleSection>
        ))}
      </div>

      <footer className={styles.footerActions}>
        <button className={styles.resetButton} type="button" onClick={resetSettings}>
          Auf Standardwerte zurücksetzen
        </button>
        <button className={styles.closeButton} type="button" onClick={onClose}>
          Fertig
        </button>
      </footer>
    </div>
  );
}

interface CollapsibleSectionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

function CollapsibleSection({ icon, title, children }: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(true);
  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <h2>
          <span className={styles.sectionHeaderIcon}>{icon}</span>
          {title}
        </h2>
        <span className={clsx(styles.sectionCaret, !expanded && styles['sectionCaret--collapsed'])}>▼</span>
      </button>
      {expanded && <div className={styles.sectionContent}>{children}</div>}
    </section>
  );
}
