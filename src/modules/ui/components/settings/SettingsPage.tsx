import { useState } from 'react';
import clsx from 'clsx';
import { useAppSettings } from '../../hooks/use-app-settings';
import { useAudioSettings } from '../../hooks/use-audio-settings';
import type { AppSettings, ThemeMode, FontScale, ConfettiStyle, ConfettiIntensity } from '../../../core/entities/app-settings';
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

export function SettingsPage({ onClose }: SettingsPageProps) {
  const {
    settings,
    loading,
    saveState,
    updateSettings,
    resetSettings,
  } = useAppSettings();
  const { settings: audioSettings, updateSettings: updateAudioSettings } = useAudioSettings();
  const [searchQuery, setSearchQuery] = useState('');

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

  if (loading || !settings) {
    return (
      <div className={styles.settingsPage}>
        <p>Lade Einstellungen...</p>
      </div>
    );
  }

  const sections: SectionDefinition[] = (() => {
    const themeSection: SectionDefinition = {
      id: 'theme',
      icon: '🎨',
      title: 'Darstellung & Theme',
      keywords: ['theme', 'dark', 'light', 'schrift', 'font', 'animation'],
      content: (
        <div className={styles.settingGroup}>
          <fieldset className={styles.settingItem}>
            <legend className={styles.settingLabel}>Theme</legend>
            <div className={styles.radioGroup} role="radiogroup" aria-label="Theme auswählen">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <label
                  key={mode}
                  className={clsx(styles.radioOption, settings.theme.mode === mode && styles['radioOption--active'])}
                >
                  <input
                    type="radio"
                    name="theme-mode"
                    checked={settings.theme.mode === mode}
                    onChange={() => handleThemeModeChange(mode)}
                  />
                  {mode === 'light' ? 'Hell' : mode === 'dark' ? 'Dunkel' : 'System'}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.settingItem}>
            <legend className={styles.settingLabel}>Schriftgröße</legend>
            <div className={styles.radioGroup} role="radiogroup" aria-label="Schriftgröße auswählen">
              {(['small', 'medium', 'large', 'x-large'] as FontScale[]).map((scale) => (
                <label
                  key={scale}
                  className={clsx(styles.radioOption, settings.theme.fontScale === scale && styles['radioOption--active'])}
                >
                  <input
                    type="radio"
                    name="font-scale"
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
          </fieldset>

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

    const sessionSection: SectionDefinition = {
      id: 'session',
      icon: '📝',
      title: 'Sitzungs-Einstellungen',
      keywords: ['session', 'sitzung', 'fragen', 'wiederholung'],
      content: (
        <div className={styles.settingGroup}>
          <fieldset className={styles.settingItem}>
            <legend className={styles.settingLabel}>Anzahl der Fragen pro Sitzung</legend>
            <div className={styles.radioGroup} role="radiogroup" aria-label="Anzahl der Fragen auswählen">
              {[5, 10, 15, 20, 25, 30].map((count) => (
                <label
                  key={count}
                  className={clsx(styles.radioOption, settings.learning.sessionSize === count && styles['radioOption--active'])}
                >
                  <input
                    type="radio"
                    name="session-size"
                    checked={settings.learning.sessionSize === count}
                    onChange={() =>
                      updateSettings((prev) => ({
                        ...prev,
                        learning: { ...prev.learning, sessionSize: count },
                      }))
                    }
                  />
                  {count}
                </label>
              ))}
            </div>
          </fieldset>

          <label className={styles.checkboxOption} htmlFor="repeat-difficult-tasks">
            <input
              id="repeat-difficult-tasks"
              type="checkbox"
              checked={settings.learning.repeatDifficultTasks}
              onChange={(event) =>
                updateSettings((prev) => ({
                  ...prev,
                  learning: { ...prev.learning, repeatDifficultTasks: event.target.checked },
                }))
              }
            />
            Wiederholungsfragen einbeziehen
          </label>
          <p className={styles.settingDescription} id="repeat-difficult-tasks-desc">
            Fragen, die du bereits beantwortet hast und die zur Wiederholung fällig sind, werden in die Sitzung aufgenommen.
          </p>
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
            Audio automatisch abspielen
          </label>
          <p className={styles.settingDescription}>
            Steuert, ob Vokabelkarten automatisch die Aussprache wiedergeben.
          </p>
        </div>
      ),
    };

    const isVibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

    const hapticSection: SectionDefinition = {
      id: 'haptic',
      icon: '📳',
      title: 'Haptisches Feedback',
      keywords: ['vibration', 'haptisch', 'feedback', 'mobil'],
      content: (
        <div className={styles.settingGroup}>
          {!isVibrationSupported && (
            <div className={styles.infoCard} id="vibration-unsupported-notice">
              Vibration wird auf diesem Gerät nicht unterstützt (nur Android-Browser).
            </div>
          )}
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.interaction.vibrationsEnabled}
              disabled={!isVibrationSupported}
              aria-describedby={!isVibrationSupported ? 'vibration-unsupported-notice' : undefined}
              onChange={(event) =>
                updateSettings((prev) => ({
                  ...prev,
                  interaction: { ...prev.interaction, vibrationsEnabled: event.target.checked },
                }))
              }
            />
            Vibrationen aktivieren
          </label>
          <div className={styles.toggleGroup}>
            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={settings.interaction.vibrationOnCorrect}
                disabled={!isVibrationSupported || !settings.interaction.vibrationsEnabled}
                aria-describedby={!isVibrationSupported ? 'vibration-unsupported-notice' : undefined}
                onChange={(event) =>
                  updateSettings((prev) => ({
                    ...prev,
                    interaction: { ...prev.interaction, vibrationOnCorrect: event.target.checked },
                  }))
                }
              />
              Bei richtigen Antworten
            </label>
            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={settings.interaction.vibrationOnIncorrect}
                disabled={!isVibrationSupported || !settings.interaction.vibrationsEnabled}
                aria-describedby={!isVibrationSupported ? 'vibration-unsupported-notice' : undefined}
                onChange={(event) =>
                  updateSettings((prev) => ({
                    ...prev,
                    interaction: { ...prev.interaction, vibrationOnIncorrect: event.target.checked },
                  }))
                }
              />
              Bei falschen Antworten
            </label>
            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={settings.interaction.vibrationOnSessionComplete}
                disabled={!isVibrationSupported || !settings.interaction.vibrationsEnabled}
                aria-describedby={!isVibrationSupported ? 'vibration-unsupported-notice' : undefined}
                onChange={(event) =>
                  updateSettings((prev) => ({
                    ...prev,
                    interaction: { ...prev.interaction, vibrationOnSessionComplete: event.target.checked },
                  }))
                }
              />
              Bei Session-Abschluss
            </label>
          </div>
          <p className={styles.settingDescription}>
            Haptisches Feedback bei Antworten. Respektiert die Einstellung &bdquo;Reduzierte Bewegungen&ldquo;.
          </p>
        </div>
      ),
    };

    const confettiSection: SectionDefinition = {
      id: 'confetti',
      icon: '🎉',
      title: 'Konfetti & Animationen',
      keywords: ['konfetti', 'confetti', 'animation', 'feier', 'celebration'],
      content: (
        <div className={styles.settingGroup}>
          <p className={styles.settingDescription}>
            Feiere deine Erfolge mit bunten Konfetti-Animationen!
          </p>

          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.interaction.confettiEnabled}
              onChange={(event) =>
                updateSettings((prev) => ({
                  ...prev,
                  interaction: { ...prev.interaction, confettiEnabled: event.target.checked },
                }))
              }
            />
            Konfetti aktivieren
          </label>

          {settings.interaction.confettiEnabled && (
            <>
              <fieldset className={styles.settingItem}>
                <legend className={styles.settingLabel}>Konfetti-Stil</legend>
                <div className={styles.radioGroup} role="radiogroup" aria-label="Konfetti-Stil auswählen">
                  {([
                    { value: 'standard', label: 'Standard' },
                    { value: 'firework', label: 'Feuerwerk' },
                    { value: 'cannon', label: 'Kanone' },
                    { value: 'emoji', label: 'Emoji' },
                  ] as { value: ConfettiStyle; label: string }[]).map((option) => (
                    <label
                      key={option.value}
                      className={clsx(
                        styles.radioOption,
                        settings.interaction.confettiStyle === option.value && styles['radioOption--active']
                      )}
                    >
                      <input
                        type="radio"
                        name="confetti-style"
                        checked={settings.interaction.confettiStyle === option.value}
                        onChange={() =>
                          updateSettings((prev) => ({
                            ...prev,
                            interaction: { ...prev.interaction, confettiStyle: option.value },
                          }))
                        }
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className={styles.settingItem}>
                <legend className={styles.settingLabel}>Intensität</legend>
                <div className={styles.radioGroup} role="radiogroup" aria-label="Konfetti-Intensität auswählen">
                  {([
                    { value: 'light', label: 'Leicht' },
                    { value: 'medium', label: 'Mittel' },
                    { value: 'strong', label: 'Stark' },
                  ] as { value: ConfettiIntensity; label: string }[]).map((option) => (
                    <label
                      key={option.value}
                      className={clsx(
                        styles.radioOption,
                        settings.interaction.confettiIntensity === option.value && styles['radioOption--active']
                      )}
                    >
                      <input
                        type="radio"
                        name="confetti-intensity"
                        checked={settings.interaction.confettiIntensity === option.value}
                        onChange={() =>
                          updateSettings((prev) => ({
                            ...prev,
                            interaction: { ...prev.interaction, confettiIntensity: option.value },
                          }))
                        }
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className={styles.checkboxOption}>
                <input
                  type="checkbox"
                  checked={settings.interaction.confettiSoundEnabled}
                  onChange={(event) =>
                    updateSettings((prev) => ({
                      ...prev,
                      interaction: { ...prev.interaction, confettiSoundEnabled: event.target.checked },
                    }))
                  }
                />
                Sound bei Konfetti abspielen
              </label>
            </>
          )}

          <div className={styles.infoCard}>
            <strong>Wann wird Konfetti ausgelöst?</strong>
            <ul className={styles.infoList}>
              <li>✨ Perfekte Sitzung (100% richtig, mind. 5 Fragen)</li>
              <li>🔥 Streak-Meilensteine (7, 30, 100 Tage)</li>
              <li>🎯 Lernpfad abgeschlossen</li>
            </ul>
          </div>
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
            <div>Version: {import.meta.env.VITE_APP_VERSION ?? 'unknown'}</div>
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

    return [themeSection, sessionSection, audioSection, hapticSection, confettiSection, infoSection];
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
        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Einstellungen durchsuchen..."
          aria-label="Einstellungen durchsuchen"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
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
