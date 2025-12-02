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

export type ConfettiStyle = 'standard' | 'firework' | 'cannon' | 'emoji';
export type ConfettiIntensity = 'light' | 'medium' | 'strong';

export interface InteractionPreferences {
  vibrationsEnabled: boolean;
  vibrationOnCorrect: boolean;
  vibrationOnIncorrect: boolean;
  vibrationOnSessionComplete: boolean;
  confettiEnabled: boolean;
  confettiStyle: ConfettiStyle;
  confettiIntensity: ConfettiIntensity;
  confettiSoundEnabled: boolean;
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
    confettiSoundEnabled: false,
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
  return value === 'standard' || value === 'firework' || value === 'cannon' || value === 'emoji';
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

function sanitizeThemeSettings(raw: unknown): ThemeSettings {
  const rawObj = raw as Record<string, unknown> | null | undefined;
  return {
    mode: isThemeMode(rawObj?.mode) ? (rawObj.mode as ThemeMode) : DEFAULT_APP_SETTINGS.theme.mode,
    fontScale: isFontScale(rawObj?.fontScale) ? (rawObj.fontScale as FontScale) : DEFAULT_APP_SETTINGS.theme.fontScale,
    animationsEnabled: Boolean(rawObj?.animationsEnabled ?? DEFAULT_APP_SETTINGS.theme.animationsEnabled),
    reducedMotion: Boolean(rawObj?.reducedMotion ?? DEFAULT_APP_SETTINGS.theme.reducedMotion),
  };
}

function sanitizeAudioPreferences(raw: unknown): AudioPreferences {
  const repeats = (raw as Record<string, unknown> | null | undefined)?.autoPlayRepeats;
  const repeatsValue: 1 | 2 | 3 = repeats === 2 || repeats === 3 ? repeats : 1;
  const delay = clamp(Number((raw as Record<string, unknown> | null | undefined)?.autoPlayDelayMs ?? DEFAULT_APP_SETTINGS.audio.autoPlayDelayMs), 0, 5000);
  const volume = clamp(Number((raw as Record<string, unknown> | null | undefined)?.soundEffectsVolume ?? DEFAULT_APP_SETTINGS.audio.soundEffectsVolume), 0, 1);
  return {
    autoPlayEnabled: Boolean((raw as Record<string, unknown> | null | undefined)?.autoPlayEnabled ?? DEFAULT_APP_SETTINGS.audio.autoPlayEnabled),
    autoPlayRepeats: repeatsValue,
    autoPlayDelayMs: delay,
    soundEffectsEnabled: Boolean((raw as Record<string, unknown> | null | undefined)?.soundEffectsEnabled ?? DEFAULT_APP_SETTINGS.audio.soundEffectsEnabled),
    soundEffectsVolume: volume,
    successChimeEnabled: Boolean((raw as Record<string, unknown> | null | undefined)?.successChimeEnabled ?? DEFAULT_APP_SETTINGS.audio.successChimeEnabled),
    playbackRate: isPlaybackRate((raw as Record<string, unknown> | null | undefined)?.playbackRate) ? (raw as Record<string, unknown>).playbackRate as AudioPreferences['playbackRate'] : DEFAULT_APP_SETTINGS.audio.playbackRate,
  };
}

function sanitizeLearningPreferences(raw: unknown): LearningPreferences {
  const dailyGoal = clamp(Number((raw as Record<string, unknown> | null | undefined)?.dailyGoal ?? DEFAULT_APP_SETTINGS.learning.dailyGoal), 1, 200);
  const sessionSize = clamp(Number((raw as Record<string, unknown> | null | undefined)?.sessionSize ?? DEFAULT_APP_SETTINGS.learning.sessionSize), 1, 100);
  return {
    algorithm: isLearningAlgorithm((raw as Record<string, unknown> | null | undefined)?.algorithm) ? (raw as Record<string, unknown>).algorithm as LearningAlgorithm : DEFAULT_APP_SETTINGS.learning.algorithm,
    dailyGoal,
    sessionSize,
    repeatDifficultTasks: Boolean((raw as Record<string, unknown> | null | undefined)?.repeatDifficultTasks ?? DEFAULT_APP_SETTINGS.learning.repeatDifficultTasks),
    randomizeOrder: Boolean((raw as Record<string, unknown> | null | undefined)?.randomizeOrder ?? DEFAULT_APP_SETTINGS.learning.randomizeOrder),
  };
}

function sanitizeNotificationPreferences(raw: unknown): NotificationPreferences {
  const rawObj = raw as Record<string, unknown> | null | undefined;
  const time = typeof rawObj?.dailyReminderTime === 'string' && /^\d{2}:\d{2}$/.test(rawObj.dailyReminderTime)
    ? rawObj.dailyReminderTime
    : DEFAULT_APP_SETTINGS.notifications.dailyReminderTime;
  const message = typeof rawObj?.dailyReminderMessage === 'string' && rawObj.dailyReminderMessage.length <= 120
    ? rawObj.dailyReminderMessage
    : DEFAULT_APP_SETTINGS.notifications.dailyReminderMessage;
  return {
    dailyReminderEnabled: Boolean(rawObj?.dailyReminderEnabled ?? DEFAULT_APP_SETTINGS.notifications.dailyReminderEnabled),
    dailyReminderTime: time,
    dailyReminderMessage: message,
    streakWarningEnabled: Boolean(rawObj?.streakWarningEnabled ?? DEFAULT_APP_SETTINGS.notifications.streakWarningEnabled),
    weeklyReportEnabled: Boolean(rawObj?.weeklyReportEnabled ?? DEFAULT_APP_SETTINGS.notifications.weeklyReportEnabled),
  };
}

function sanitizeInteractionPreferences(raw: unknown): InteractionPreferences {
  const rawObj = raw as Record<string, unknown> | null | undefined;
  return {
    vibrationsEnabled: Boolean(rawObj?.vibrationsEnabled ?? DEFAULT_APP_SETTINGS.interaction.vibrationsEnabled),
    vibrationOnCorrect: Boolean(rawObj?.vibrationOnCorrect ?? DEFAULT_APP_SETTINGS.interaction.vibrationOnCorrect),
    vibrationOnIncorrect: Boolean(rawObj?.vibrationOnIncorrect ?? DEFAULT_APP_SETTINGS.interaction.vibrationOnIncorrect),
    vibrationOnSessionComplete: Boolean(rawObj?.vibrationOnSessionComplete ?? DEFAULT_APP_SETTINGS.interaction.vibrationOnSessionComplete),
    confettiEnabled: Boolean(rawObj?.confettiEnabled ?? DEFAULT_APP_SETTINGS.interaction.confettiEnabled),
    confettiStyle: isConfettiStyle(rawObj?.confettiStyle) ? (rawObj.confettiStyle as ConfettiStyle) : DEFAULT_APP_SETTINGS.interaction.confettiStyle,
    confettiIntensity: isConfettiIntensity(rawObj?.confettiIntensity) ? (rawObj.confettiIntensity as ConfettiIntensity) : DEFAULT_APP_SETTINGS.interaction.confettiIntensity,
    confettiSoundEnabled: Boolean(rawObj?.confettiSoundEnabled ?? DEFAULT_APP_SETTINGS.interaction.confettiSoundEnabled),
    wakeLockEnabled: Boolean(rawObj?.wakeLockEnabled ?? DEFAULT_APP_SETTINGS.interaction.wakeLockEnabled),
    keyboardShortcutsEnabled: Boolean(rawObj?.keyboardShortcutsEnabled ?? DEFAULT_APP_SETTINGS.interaction.keyboardShortcutsEnabled),
  };
}

function sanitizeAISettings(raw: unknown): AISettings {
  const rawObj = raw as Record<string, unknown> | null | undefined;
  const dailyUsageLimit = clamp(Number(rawObj?.dailyUsageLimit ?? DEFAULT_APP_SETTINGS.ai.dailyUsageLimit), 0, 9999);
  const usageToday = clamp(Number(rawObj?.usageToday ?? DEFAULT_APP_SETTINGS.ai.usageToday), 0, dailyUsageLimit);
  return {
    explanationsEnabled: Boolean(rawObj?.explanationsEnabled ?? DEFAULT_APP_SETTINGS.ai.explanationsEnabled),
    explanationDepth: isAIDepth(rawObj?.explanationDepth) ? (rawObj.explanationDepth as AIDepth) : DEFAULT_APP_SETTINGS.ai.explanationDepth,
    includeExamples: Boolean(rawObj?.includeExamples ?? DEFAULT_APP_SETTINGS.ai.includeExamples),
    showLearningTips: Boolean(rawObj?.showLearningTips ?? DEFAULT_APP_SETTINGS.ai.showLearningTips),
    trainingOptIn: Boolean(rawObj?.trainingOptIn ?? DEFAULT_APP_SETTINGS.ai.trainingOptIn),
    dailyUsageLimit,
    usageToday,
  };
}

function sanitizePrivacySettings(raw: unknown): PrivacySettings {
  const rawObj = raw as Record<string, unknown> | null | undefined;
  return {
    dataStorageMode: isDataStorageMode(rawObj?.dataStorageMode) ? (rawObj.dataStorageMode as DataStorageMode) : DEFAULT_APP_SETTINGS.privacy.dataStorageMode,
    analyticsEnabled: Boolean(rawObj?.analyticsEnabled ?? DEFAULT_APP_SETTINGS.privacy.analyticsEnabled),
    errorReportsEnabled: Boolean(rawObj?.errorReportsEnabled ?? DEFAULT_APP_SETTINGS.privacy.errorReportsEnabled),
    betaFeaturesEnabled: Boolean(rawObj?.betaFeaturesEnabled ?? DEFAULT_APP_SETTINGS.privacy.betaFeaturesEnabled),
  };
}

function sanitizeLanguageSettings(raw: unknown): LanguageSettings {
  const rawObj = raw as Record<string, unknown> | null | undefined;
  return {
    interfaceLanguage: isInterfaceLanguage(rawObj?.interfaceLanguage) ? (rawObj.interfaceLanguage as InterfaceLanguage) : DEFAULT_APP_SETTINGS.language.interfaceLanguage,
    timezone: typeof rawObj?.timezone === 'string' && rawObj.timezone.length > 0 ? rawObj.timezone : resolveTimezone(),
    dateFormat: isDateFormat(rawObj?.dateFormat) ? (rawObj.dateFormat as DateFormat) : DEFAULT_APP_SETTINGS.language.dateFormat,
  };
}

function sanitizeDatabaseMetadata(raw: unknown): DatabaseMetadata {
  const rawObj = raw as Record<string, unknown> | null | undefined;
  const lastUpdatedAt = typeof rawObj?.lastUpdatedAt === 'string' || rawObj?.lastUpdatedAt === null
    ? (rawObj?.lastUpdatedAt as string | null)
    : DEFAULT_APP_SETTINGS.database.lastUpdatedAt;
  const storageUsage = typeof rawObj?.storageUsageBytes === 'number' || rawObj?.storageUsageBytes === null
    ? (rawObj?.storageUsageBytes as number | null)
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

