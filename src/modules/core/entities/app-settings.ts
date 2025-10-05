/**
 * Application Settings Domain Model
 *
 * Centralises user preferences across the learning platform.
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontScale = 'small' | 'medium' | 'large' | 'x-large';

export interface ThemeSettings {
  mode: ThemeMode;
  fontScale: FontScale;
  animationsEnabled: boolean;
  reducedMotion: boolean;
}

export interface AudioPreferences {
  autoPlayEnabled: boolean;
  autoPlayRepeats: 1 | 2 | 3;
  autoPlayDelayMs: number;
  soundEffectsEnabled: boolean;
  soundEffectsVolume: number;
  successChimeEnabled: boolean;
  playbackRate: 0.5 | 0.75 | 1 | 1.25 | 1.5;
}

export type LearningAlgorithm = 'sm-2' | 'fsrs' | 'neural';

export interface LearningPreferences {
  algorithm: LearningAlgorithm;
  dailyGoal: number;
  sessionSize: number;
  repeatDifficultTasks: boolean;
  randomizeOrder: boolean;
}

export interface NotificationPreferences {
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  dailyReminderMessage: string;
  streakWarningEnabled: boolean;
  weeklyReportEnabled: boolean;
}

export type ConfettiStyle = 'standard' | 'firework' | 'emoji';
export type ConfettiIntensity = 'light' | 'medium' | 'strong';

export interface InteractionPreferences {
  vibrationsEnabled: boolean;
  vibrationOnCorrect: boolean;
  vibrationOnIncorrect: boolean;
  vibrationOnSessionComplete: boolean;
  confettiEnabled: boolean;
  confettiStyle: ConfettiStyle;
  confettiIntensity: ConfettiIntensity;
  wakeLockEnabled: boolean;
  keyboardShortcutsEnabled: boolean;
}

export type AIDepth = 'short' | 'medium' | 'detailed';

export interface AISettings {
  explanationsEnabled: boolean;
  explanationDepth: AIDepth;
  includeExamples: boolean;
  showLearningTips: boolean;
  trainingOptIn: boolean;
  dailyUsageLimit: number;
  usageToday: number;
}

export type DataStorageMode = 'local' | 'cloud';

export interface PrivacySettings {
  dataStorageMode: DataStorageMode;
  analyticsEnabled: boolean;
  errorReportsEnabled: boolean;
  betaFeaturesEnabled: boolean;
}

export type InterfaceLanguage = 'de' | 'en' | 'es';
export type DateFormat = 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export interface LanguageSettings {
  interfaceLanguage: InterfaceLanguage;
  timezone: string;
  dateFormat: DateFormat;
}

export interface DatabaseMetadata {
  lastUpdatedAt: string | null;
  storageUsageBytes: number | null;
}

export interface AppSettings {
  version: number;
  theme: ThemeSettings;
  audio: AudioPreferences;
  learning: LearningPreferences;
  notifications: NotificationPreferences;
  interaction: InteractionPreferences;
  ai: AISettings;
  privacy: PrivacySettings;
  language: LanguageSettings;
  database: DatabaseMetadata;
  lastSavedAt: string | null;
}

function resolveTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Europe/Berlin';
  } catch {
    return 'Europe/Berlin';
  }
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  version: 1,
  theme: {
    mode: 'system',
    fontScale: 'medium',
    animationsEnabled: true,
    reducedMotion: false,
  },
  audio: {
    autoPlayEnabled: true,
    autoPlayRepeats: 1,
    autoPlayDelayMs: 1000,
    soundEffectsEnabled: true,
    soundEffectsVolume: 0.8,
    successChimeEnabled: true,
    playbackRate: 1,
  },
  learning: {
    algorithm: 'fsrs',
    dailyGoal: 20,
    sessionSize: 10,
    repeatDifficultTasks: true,
    randomizeOrder: true,
  },
  notifications: {
    dailyReminderEnabled: false,
    dailyReminderTime: '18:00',
    dailyReminderMessage: 'Zeit zum Lernen! 📚',
    streakWarningEnabled: true,
    weeklyReportEnabled: false,
  },
  interaction: {
    vibrationsEnabled: true,
    vibrationOnCorrect: true,
    vibrationOnIncorrect: true,
    vibrationOnSessionComplete: false,
    confettiEnabled: true,
    confettiStyle: 'standard',
    confettiIntensity: 'medium',
    wakeLockEnabled: true,
    keyboardShortcutsEnabled: true,
  },
  ai: {
    explanationsEnabled: false,
    explanationDepth: 'medium',
    includeExamples: true,
    showLearningTips: true,
    trainingOptIn: false,
    dailyUsageLimit: 20,
    usageToday: 0,
  },
  privacy: {
    dataStorageMode: 'local',
    analyticsEnabled: false,
    errorReportsEnabled: false,
    betaFeaturesEnabled: false,
  },
  language: {
    interfaceLanguage: 'de',
    timezone: resolveTimezone(),
    dateFormat: 'DD.MM.YYYY',
  },
  database: {
    lastUpdatedAt: null,
    storageUsageBytes: null,
  },
  lastSavedAt: null,
};

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isFontScale(value: unknown): value is FontScale {
  return value === 'small' || value === 'medium' || value === 'large' || value === 'x-large';
}

function isPlaybackRate(value: unknown): value is AudioPreferences['playbackRate'] {
  return value === 0.5 || value === 0.75 || value === 1 || value === 1.25 || value === 1.5;
}

function isLearningAlgorithm(value: unknown): value is LearningAlgorithm {
  return value === 'sm-2' || value === 'fsrs' || value === 'neural';
}

function isConfettiStyle(value: unknown): value is ConfettiStyle {
  return value === 'standard' || value === 'firework' || value === 'emoji';
}

function isConfettiIntensity(value: unknown): value is ConfettiIntensity {
  return value === 'light' || value === 'medium' || value === 'strong';
}

function isAIDepth(value: unknown): value is AIDepth {
  return value === 'short' || value === 'medium' || value === 'detailed';
}

function isDataStorageMode(value: unknown): value is DataStorageMode {
  return value === 'local' || value === 'cloud';
}

function isInterfaceLanguage(value: unknown): value is InterfaceLanguage {
  return value === 'de' || value === 'en' || value === 'es';
}

function isDateFormat(value: unknown): value is DateFormat {
  return value === 'DD.MM.YYYY' || value === 'MM/DD/YYYY' || value === 'YYYY-MM-DD';
}

function sanitizeThemeSettings(raw: any): ThemeSettings {
  return {
    mode: isThemeMode(raw?.mode) ? raw.mode : DEFAULT_APP_SETTINGS.theme.mode,
    fontScale: isFontScale(raw?.fontScale) ? raw.fontScale : DEFAULT_APP_SETTINGS.theme.fontScale,
    animationsEnabled: Boolean(raw?.animationsEnabled ?? DEFAULT_APP_SETTINGS.theme.animationsEnabled),
    reducedMotion: Boolean(raw?.reducedMotion ?? DEFAULT_APP_SETTINGS.theme.reducedMotion),
  };
}

function sanitizeAudioPreferences(raw: any): AudioPreferences {
  const repeats = raw?.autoPlayRepeats;
  const repeatsValue: 1 | 2 | 3 = repeats === 2 || repeats === 3 ? repeats : 1;
  const delay = clamp(Number(raw?.autoPlayDelayMs ?? DEFAULT_APP_SETTINGS.audio.autoPlayDelayMs), 0, 5000);
  const volume = clamp(Number(raw?.soundEffectsVolume ?? DEFAULT_APP_SETTINGS.audio.soundEffectsVolume), 0, 1);
  return {
    autoPlayEnabled: Boolean(raw?.autoPlayEnabled ?? DEFAULT_APP_SETTINGS.audio.autoPlayEnabled),
    autoPlayRepeats: repeatsValue,
    autoPlayDelayMs: delay,
    soundEffectsEnabled: Boolean(raw?.soundEffectsEnabled ?? DEFAULT_APP_SETTINGS.audio.soundEffectsEnabled),
    soundEffectsVolume: volume,
    successChimeEnabled: Boolean(raw?.successChimeEnabled ?? DEFAULT_APP_SETTINGS.audio.successChimeEnabled),
    playbackRate: isPlaybackRate(raw?.playbackRate) ? raw.playbackRate : DEFAULT_APP_SETTINGS.audio.playbackRate,
  };
}

function sanitizeLearningPreferences(raw: any): LearningPreferences {
  const dailyGoal = clamp(Number(raw?.dailyGoal ?? DEFAULT_APP_SETTINGS.learning.dailyGoal), 1, 200);
  const sessionSize = clamp(Number(raw?.sessionSize ?? DEFAULT_APP_SETTINGS.learning.sessionSize), 1, 100);
  return {
    algorithm: isLearningAlgorithm(raw?.algorithm) ? raw.algorithm : DEFAULT_APP_SETTINGS.learning.algorithm,
    dailyGoal,
    sessionSize,
    repeatDifficultTasks: Boolean(raw?.repeatDifficultTasks ?? DEFAULT_APP_SETTINGS.learning.repeatDifficultTasks),
    randomizeOrder: Boolean(raw?.randomizeOrder ?? DEFAULT_APP_SETTINGS.learning.randomizeOrder),
  };
}

function sanitizeNotificationPreferences(raw: any): NotificationPreferences {
  const time = typeof raw?.dailyReminderTime === 'string' && /^\d{2}:\d{2}$/.test(raw.dailyReminderTime)
    ? raw.dailyReminderTime
    : DEFAULT_APP_SETTINGS.notifications.dailyReminderTime;
  const message = typeof raw?.dailyReminderMessage === 'string' && raw.dailyReminderMessage.length <= 120
    ? raw.dailyReminderMessage
    : DEFAULT_APP_SETTINGS.notifications.dailyReminderMessage;
  return {
    dailyReminderEnabled: Boolean(raw?.dailyReminderEnabled ?? DEFAULT_APP_SETTINGS.notifications.dailyReminderEnabled),
    dailyReminderTime: time,
    dailyReminderMessage: message,
    streakWarningEnabled: Boolean(raw?.streakWarningEnabled ?? DEFAULT_APP_SETTINGS.notifications.streakWarningEnabled),
    weeklyReportEnabled: Boolean(raw?.weeklyReportEnabled ?? DEFAULT_APP_SETTINGS.notifications.weeklyReportEnabled),
  };
}

function sanitizeInteractionPreferences(raw: any): InteractionPreferences {
  return {
    vibrationsEnabled: Boolean(raw?.vibrationsEnabled ?? DEFAULT_APP_SETTINGS.interaction.vibrationsEnabled),
    vibrationOnCorrect: Boolean(raw?.vibrationOnCorrect ?? DEFAULT_APP_SETTINGS.interaction.vibrationOnCorrect),
    vibrationOnIncorrect: Boolean(raw?.vibrationOnIncorrect ?? DEFAULT_APP_SETTINGS.interaction.vibrationOnIncorrect),
    vibrationOnSessionComplete: Boolean(raw?.vibrationOnSessionComplete ?? DEFAULT_APP_SETTINGS.interaction.vibrationOnSessionComplete),
    confettiEnabled: Boolean(raw?.confettiEnabled ?? DEFAULT_APP_SETTINGS.interaction.confettiEnabled),
    confettiStyle: isConfettiStyle(raw?.confettiStyle) ? raw.confettiStyle : DEFAULT_APP_SETTINGS.interaction.confettiStyle,
    confettiIntensity: isConfettiIntensity(raw?.confettiIntensity) ? raw.confettiIntensity : DEFAULT_APP_SETTINGS.interaction.confettiIntensity,
    wakeLockEnabled: Boolean(raw?.wakeLockEnabled ?? DEFAULT_APP_SETTINGS.interaction.wakeLockEnabled),
    keyboardShortcutsEnabled: Boolean(raw?.keyboardShortcutsEnabled ?? DEFAULT_APP_SETTINGS.interaction.keyboardShortcutsEnabled),
  };
}

function sanitizeAISettings(raw: any): AISettings {
  const dailyUsageLimit = clamp(Number(raw?.dailyUsageLimit ?? DEFAULT_APP_SETTINGS.ai.dailyUsageLimit), 0, 9999);
  const usageToday = clamp(Number(raw?.usageToday ?? DEFAULT_APP_SETTINGS.ai.usageToday), 0, dailyUsageLimit);
  return {
    explanationsEnabled: Boolean(raw?.explanationsEnabled ?? DEFAULT_APP_SETTINGS.ai.explanationsEnabled),
    explanationDepth: isAIDepth(raw?.explanationDepth) ? raw.explanationDepth : DEFAULT_APP_SETTINGS.ai.explanationDepth,
    includeExamples: Boolean(raw?.includeExamples ?? DEFAULT_APP_SETTINGS.ai.includeExamples),
    showLearningTips: Boolean(raw?.showLearningTips ?? DEFAULT_APP_SETTINGS.ai.showLearningTips),
    trainingOptIn: Boolean(raw?.trainingOptIn ?? DEFAULT_APP_SETTINGS.ai.trainingOptIn),
    dailyUsageLimit,
    usageToday,
  };
}

function sanitizePrivacySettings(raw: any): PrivacySettings {
  return {
    dataStorageMode: isDataStorageMode(raw?.dataStorageMode) ? raw.dataStorageMode : DEFAULT_APP_SETTINGS.privacy.dataStorageMode,
    analyticsEnabled: Boolean(raw?.analyticsEnabled ?? DEFAULT_APP_SETTINGS.privacy.analyticsEnabled),
    errorReportsEnabled: Boolean(raw?.errorReportsEnabled ?? DEFAULT_APP_SETTINGS.privacy.errorReportsEnabled),
    betaFeaturesEnabled: Boolean(raw?.betaFeaturesEnabled ?? DEFAULT_APP_SETTINGS.privacy.betaFeaturesEnabled),
  };
}

function sanitizeLanguageSettings(raw: any): LanguageSettings {
  return {
    interfaceLanguage: isInterfaceLanguage(raw?.interfaceLanguage) ? raw.interfaceLanguage : DEFAULT_APP_SETTINGS.language.interfaceLanguage,
    timezone: typeof raw?.timezone === 'string' && raw.timezone.length > 0 ? raw.timezone : resolveTimezone(),
    dateFormat: isDateFormat(raw?.dateFormat) ? raw.dateFormat : DEFAULT_APP_SETTINGS.language.dateFormat,
  };
}

function sanitizeDatabaseMetadata(raw: any): DatabaseMetadata {
  const lastUpdatedAt = typeof raw?.lastUpdatedAt === 'string' || raw?.lastUpdatedAt === null
    ? raw.lastUpdatedAt
    : DEFAULT_APP_SETTINGS.database.lastUpdatedAt;
  const storageUsage = typeof raw?.storageUsageBytes === 'number' || raw?.storageUsageBytes === null
    ? raw.storageUsageBytes
    : DEFAULT_APP_SETTINGS.database.storageUsageBytes;
  return {
    lastUpdatedAt,
    storageUsageBytes: storageUsage,
  };
}

export function validateAppSettings(raw: unknown): AppSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_APP_SETTINGS };
  }

  const candidate = raw as Partial<AppSettings>;
  const version = typeof candidate.version === 'number' ? candidate.version : DEFAULT_APP_SETTINGS.version;
  const lastSavedAt = typeof candidate.lastSavedAt === 'string' || candidate.lastSavedAt === null
    ? candidate.lastSavedAt
    : DEFAULT_APP_SETTINGS.lastSavedAt;

  return {
    version,
    theme: sanitizeThemeSettings(candidate.theme),
    audio: sanitizeAudioPreferences(candidate.audio),
    learning: sanitizeLearningPreferences(candidate.learning),
    notifications: sanitizeNotificationPreferences(candidate.notifications),
    interaction: sanitizeInteractionPreferences(candidate.interaction),
    ai: sanitizeAISettings(candidate.ai),
    privacy: sanitizePrivacySettings(candidate.privacy),
    language: sanitizeLanguageSettings(candidate.language),
    database: sanitizeDatabaseMetadata(candidate.database),
    lastSavedAt,
  };
}

