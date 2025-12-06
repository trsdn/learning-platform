/**
 * Tests for SettingsPage Component
 *
 * Comprehensive BDD-style tests covering:
 * - Component rendering with all settings sections
 * - Theme settings (mode, font scale, animations)
 * - Audio settings (auto-play toggle)
 * - Haptic/vibration settings
 * - Confetti settings (style, intensity, sound)
 * - Section collapsible behavior
 * - Search/filter functionality
 * - Reset to defaults
 * - Close button functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SettingsPage } from '../../../../../src/modules/ui/components/settings/SettingsPage';
import type { AppSettings } from '../../../../../src/modules/core/entities/app-settings';
import type { AudioSettings } from '../../../../../src/modules/core/entities/audio-settings';
import { DEFAULT_APP_SETTINGS } from '../../../../../src/modules/core/entities/app-settings';
import * as useAppSettingsModule from '../../../../../src/modules/ui/hooks/use-app-settings';
import * as useAudioSettingsModule from '../../../../../src/modules/ui/hooks/use-audio-settings';

// Mock CSS modules
vi.mock('../../../../../src/modules/ui/components/settings/settings-page.module.css', () => ({
  default: {
    settingsPage: 'settingsPage',
    settingsHeader: 'settingsHeader',
    settingsTitle: 'settingsTitle',
    saveIndicator: 'saveIndicator',
    'saveIndicator--saved': 'saveIndicator--saved',
    closeButton: 'closeButton',
    searchBar: 'searchBar',
    searchIcon: 'searchIcon',
    searchInput: 'searchInput',
    sections: 'sections',
    section: 'section',
    sectionHeader: 'sectionHeader',
    sectionHeaderIcon: 'sectionHeaderIcon',
    sectionCaret: 'sectionCaret',
    'sectionCaret--collapsed': 'sectionCaret--collapsed',
    sectionContent: 'sectionContent',
    settingGroup: 'settingGroup',
    settingItem: 'settingItem',
    settingLabel: 'settingLabel',
    radioGroup: 'radioGroup',
    radioOption: 'radioOption',
    'radioOption--active': 'radioOption--active',
    toggleGroup: 'toggleGroup',
    checkboxOption: 'checkboxOption',
    settingDescription: 'settingDescription',
    infoCard: 'infoCard',
    infoList: 'infoList',
    buttonRow: 'buttonRow',
    linkButton: 'linkButton',
    footerActions: 'footerActions',
    resetButton: 'resetButton',
  },
}));

describe('SettingsPage', () => {
  let mockUpdateSettings: ReturnType<typeof vi.fn>;
  let mockResetSettings: ReturnType<typeof vi.fn>;
  let mockUpdateAudioSettings: ReturnType<typeof vi.fn>;
  let mockOnClose: ReturnType<typeof vi.fn>;

  const createMockSettings = (overrides?: Partial<AppSettings>): AppSettings => ({
    ...DEFAULT_APP_SETTINGS,
    ...overrides,
  });

  const createMockAudioSettings = (overrides?: Partial<AudioSettings>): AudioSettings => ({
    version: 1,
    autoPlayEnabled: true,
    languageFilter: 'non-German only',
    perTopicOverrides: {},
    accessibilityMode: false,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdateSettings = vi.fn();
    mockResetSettings = vi.fn();
    mockUpdateAudioSettings = vi.fn();
    mockOnClose = vi.fn();

    // Setup default mock implementations
    vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
      settings: createMockSettings(),
      loading: false,
      saveState: 'idle' as const,
      updateSettings: mockUpdateSettings,
      resetSettings: mockResetSettings,
      exportSettings: vi.fn(() => '{}'),
      importSettingsFromText: vi.fn(),
      storageEstimate: null,
      refreshStorageEstimate: vi.fn(),
    });

    vi.spyOn(useAudioSettingsModule, 'useAudioSettings').mockReturnValue({
      settings: createMockAudioSettings(),
      updateSettings: mockUpdateAudioSettings,
      resetSettings: vi.fn(),
      isLoaded: true,
    });

    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render settings page with header', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByText(/Einstellungen/i)).toBeInTheDocument();
    });

    it('should show loading state when settings are loading', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: null,
        loading: true,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByText('Lade Einstellungen...')).toBeInTheDocument();
    });

    it('should render all settings sections', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByText('Darstellung & Theme')).toBeInTheDocument();
      expect(screen.getByText('Audio')).toBeInTheDocument();
      expect(screen.getByText('Haptisches Feedback')).toBeInTheDocument();
      expect(screen.getByText('Konfetti & Animationen')).toBeInTheDocument();
      expect(screen.getByText('Info & Support')).toBeInTheDocument();
    });

    it('should render search bar', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByPlaceholderText('Einstellungen durchsuchen...')).toBeInTheDocument();
    });

    it('should render footer actions with reset and close buttons', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const buttons = screen.getAllByRole('button');
      const resetButton = buttons.find(btn => btn.textContent === 'Auf Standardwerte zurücksetzen');
      const closeButtons = buttons.filter(btn => btn.textContent === 'Schließen' || btn.textContent === 'Fertig');

      expect(resetButton).toBeInTheDocument();
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Settings', () => {
    describe('Theme Mode', () => {
      it('should display current theme mode selection', () => {
        vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
          settings: createMockSettings({ theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' } }),
          loading: false,
          saveState: 'idle' as const,
          updateSettings: mockUpdateSettings,
          resetSettings: mockResetSettings,
          exportSettings: vi.fn(() => '{}'),
          importSettingsFromText: vi.fn(),
          storageEstimate: null,
          refreshStorageEstimate: vi.fn(),
        });

        render(<SettingsPage onClose={mockOnClose} />);

        const darkModeRadio = screen.getByLabelText('Dunkel');
        expect(darkModeRadio).toBeChecked();
      });

      it('should update theme mode when light is selected', () => {
        render(<SettingsPage onClose={mockOnClose} />);

        const lightModeRadio = screen.getByLabelText('Hell');
        fireEvent.click(lightModeRadio);

        expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));

        // Verify the update function
        const updateFn = mockUpdateSettings.mock.calls[0][0];
        const result = updateFn(createMockSettings());
        expect(result.theme.mode).toBe('light');
      });

      it('should update theme mode when dark is selected', () => {
        render(<SettingsPage onClose={mockOnClose} />);

        const darkModeRadio = screen.getByLabelText('Dunkel');
        fireEvent.click(darkModeRadio);

        expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));

        const updateFn = mockUpdateSettings.mock.calls[0][0];
        const result = updateFn(createMockSettings());
        expect(result.theme.mode).toBe('dark');
      });

      it('should update theme mode when system is selected', () => {
        // Start with dark mode, then switch to system
        vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
          settings: createMockSettings({ theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' } }),
          loading: false,
          saveState: 'idle' as const,
          updateSettings: mockUpdateSettings,
          resetSettings: mockResetSettings,
          exportSettings: vi.fn(() => '{}'),
          importSettingsFromText: vi.fn(),
          storageEstimate: null,
          refreshStorageEstimate: vi.fn(),
        });

        render(<SettingsPage onClose={mockOnClose} />);

        const systemModeRadio = screen.getByLabelText('System');
        fireEvent.click(systemModeRadio);

        expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));

        const updateFn = mockUpdateSettings.mock.calls[0][0];
        const result = updateFn(createMockSettings({ theme: { ...DEFAULT_APP_SETTINGS.theme, mode: 'dark' } }));
        expect(result.theme.mode).toBe('system');
      });
    });

    describe('Font Scale', () => {
      it('should display current font scale selection', () => {
        vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
          settings: createMockSettings({ theme: { ...DEFAULT_APP_SETTINGS.theme, fontScale: 'large' } }),
          loading: false,
          saveState: 'idle' as const,
          updateSettings: mockUpdateSettings,
          resetSettings: mockResetSettings,
          exportSettings: vi.fn(() => '{}'),
          importSettingsFromText: vi.fn(),
          storageEstimate: null,
          refreshStorageEstimate: vi.fn(),
        });

        render(<SettingsPage onClose={mockOnClose} />);

        const largeScaleRadio = screen.getByLabelText('Groß');
        expect(largeScaleRadio).toBeChecked();
      });

      it('should update font scale to small', () => {
        render(<SettingsPage onClose={mockOnClose} />);

        const smallScaleRadio = screen.getByLabelText('Klein');
        fireEvent.click(smallScaleRadio);

        expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));

        const updateFn = mockUpdateSettings.mock.calls[0][0];
        const result = updateFn(createMockSettings());
        expect(result.theme.fontScale).toBe('small');
      });

      it('should update font scale to medium', () => {
        // Start with small, then switch to medium
        vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
          settings: createMockSettings({ theme: { ...DEFAULT_APP_SETTINGS.theme, fontScale: 'small' } }),
          loading: false,
          saveState: 'idle' as const,
          updateSettings: mockUpdateSettings,
          resetSettings: mockResetSettings,
          exportSettings: vi.fn(() => '{}'),
          importSettingsFromText: vi.fn(),
          storageEstimate: null,
          refreshStorageEstimate: vi.fn(),
        });

        render(<SettingsPage onClose={mockOnClose} />);

        // Use getAllByLabelText and find the one in the font scale radio group
        const fontScaleRadioGroup = screen.getByRole('radiogroup', { name: /Schriftgröße auswählen/i });
        const mediumScaleRadio = within(fontScaleRadioGroup).getByLabelText('Mittel');
        fireEvent.click(mediumScaleRadio);

        expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));

        const updateFn = mockUpdateSettings.mock.calls[0][0];
        const result = updateFn(createMockSettings({ theme: { ...DEFAULT_APP_SETTINGS.theme, fontScale: 'small' } }));
        expect(result.theme.fontScale).toBe('medium');
      });

      it('should update font scale to large', () => {
        render(<SettingsPage onClose={mockOnClose} />);

        const largeScaleRadio = screen.getByLabelText('Groß');
        fireEvent.click(largeScaleRadio);

        expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));

        const updateFn = mockUpdateSettings.mock.calls[0][0];
        const result = updateFn(createMockSettings());
        expect(result.theme.fontScale).toBe('large');
      });

      it('should update font scale to x-large', () => {
        render(<SettingsPage onClose={mockOnClose} />);

        const xLargeScaleRadio = screen.getByLabelText('Sehr groß');
        fireEvent.click(xLargeScaleRadio);

        expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));

        const updateFn = mockUpdateSettings.mock.calls[0][0];
        const result = updateFn(createMockSettings());
        expect(result.theme.fontScale).toBe('x-large');
      });
    });

    describe('Animation Settings', () => {
      it('should display animations enabled state', () => {
        vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
          settings: createMockSettings({ theme: { ...DEFAULT_APP_SETTINGS.theme, animationsEnabled: true } }),
          loading: false,
          saveState: 'idle' as const,
          updateSettings: mockUpdateSettings,
          resetSettings: mockResetSettings,
          exportSettings: vi.fn(() => '{}'),
          importSettingsFromText: vi.fn(),
          storageEstimate: null,
          refreshStorageEstimate: vi.fn(),
        });

        render(<SettingsPage onClose={mockOnClose} />);

        const animationsCheckbox = screen.getByLabelText('Animationen aktivieren');
        expect(animationsCheckbox).toBeChecked();
      });

      it('should toggle animations enabled', () => {
        render(<SettingsPage onClose={mockOnClose} />);

        const animationsCheckbox = screen.getByLabelText('Animationen aktivieren');

        // Initially checked
        expect(animationsCheckbox).toBeChecked();

        fireEvent.click(animationsCheckbox);

        expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));
      });

      it('should toggle reduced motion', () => {
        render(<SettingsPage onClose={mockOnClose} />);

        const reducedMotionCheckbox = screen.getByLabelText('Reduzierte Bewegungen');

        // Initially unchecked (default is false)
        expect(reducedMotionCheckbox).not.toBeChecked();

        fireEvent.click(reducedMotionCheckbox);

        expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));
      });
    });
  });

  describe('Audio Settings', () => {
    it('should display auto-play enabled state', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({ audio: { ...DEFAULT_APP_SETTINGS.audio, autoPlayEnabled: true } }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      const autoPlayCheckbox = screen.getByLabelText('Audio automatisch abspielen');
      expect(autoPlayCheckbox).toBeChecked();
    });

    it('should toggle auto-play enabled', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const autoPlayCheckbox = screen.getByLabelText('Audio automatisch abspielen');
      fireEvent.click(autoPlayCheckbox);

      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));
      expect(mockUpdateAudioSettings).toHaveBeenCalled();
    });

    it('should mirror auto-play setting to audio settings hook', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const autoPlayCheckbox = screen.getByLabelText('Audio automatisch abspielen');
      fireEvent.click(autoPlayCheckbox);

      expect(mockUpdateAudioSettings).toHaveBeenCalledWith({ autoPlayEnabled: false });
    });

    it('should show audio description text', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByText('Steuert, ob Vokabelkarten automatisch die Aussprache wiedergeben.')).toBeInTheDocument();
    });
  });

  describe('Haptic/Vibration Settings', () => {
    it('should display vibrations enabled state', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: { ...DEFAULT_APP_SETTINGS.interaction, vibrationsEnabled: true }
        }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      const vibrationsCheckbox = screen.getByLabelText('Vibrationen aktivieren');
      expect(vibrationsCheckbox).toBeChecked();
    });

    it('should toggle vibrations enabled', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const vibrationsCheckbox = screen.getByLabelText('Vibrationen aktivieren');
      fireEvent.click(vibrationsCheckbox);

      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should disable vibration when not supported', () => {
      // Temporarily remove vibrate support for this test only
      const originalVibrate = navigator.vibrate;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (navigator as any).vibrate;

      render(<SettingsPage onClose={mockOnClose} />);

      const vibrationsCheckbox = screen.getByLabelText('Vibrationen aktivieren');
      expect(vibrationsCheckbox).toBeDisabled();

      // Restore vibrate
      Object.defineProperty(navigator, 'vibrate', {
        value: originalVibrate,
        writable: true,
        configurable: true,
      });
    });

    it('should show unsupported notice when vibration is not available', () => {
      // Temporarily remove vibrate support for this test only
      const originalVibrate = navigator.vibrate;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (navigator as any).vibrate;

      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByText('Vibration wird auf diesem Gerät nicht unterstützt (nur Android-Browser).')).toBeInTheDocument();

      // Restore vibrate
      Object.defineProperty(navigator, 'vibrate', {
        value: originalVibrate,
        writable: true,
        configurable: true,
      });
    });

    it('should toggle vibration on correct answers', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const vibrationOnCorrectCheckbox = screen.getByLabelText('Bei richtigen Antworten');
      fireEvent.click(vibrationOnCorrectCheckbox);

      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should toggle vibration on incorrect answers', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const vibrationOnIncorrectCheckbox = screen.getByLabelText('Bei falschen Antworten');
      fireEvent.click(vibrationOnIncorrectCheckbox);

      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should toggle vibration on session complete', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const vibrationOnSessionCompleteCheckbox = screen.getByLabelText('Bei Session-Abschluss');
      fireEvent.click(vibrationOnSessionCompleteCheckbox);

      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should disable specific vibration options when vibrations are disabled', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: { ...DEFAULT_APP_SETTINGS.interaction, vibrationsEnabled: false }
        }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByLabelText('Bei richtigen Antworten')).toBeDisabled();
      expect(screen.getByLabelText('Bei falschen Antworten')).toBeDisabled();
      expect(screen.getByLabelText('Bei Session-Abschluss')).toBeDisabled();
    });
  });

  describe('Confetti Settings', () => {
    it('should display confetti enabled state', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: { ...DEFAULT_APP_SETTINGS.interaction, confettiEnabled: true }
        }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      const confettiCheckbox = screen.getByLabelText('Konfetti aktivieren');
      expect(confettiCheckbox).toBeChecked();
    });

    it('should toggle confetti enabled', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const confettiCheckbox = screen.getByLabelText('Konfetti aktivieren');

      // Checkbox starts checked (default is true)
      expect(confettiCheckbox).toBeChecked();

      fireEvent.click(confettiCheckbox);

      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should show confetti style options when enabled', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: { ...DEFAULT_APP_SETTINGS.interaction, confettiEnabled: true }
        }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByLabelText('Standard')).toBeInTheDocument();
      expect(screen.getByLabelText('Feuerwerk')).toBeInTheDocument();
      expect(screen.getByLabelText('Kanone')).toBeInTheDocument();
      expect(screen.getByLabelText('Emoji')).toBeInTheDocument();
    });

    it('should hide confetti style options when disabled', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: { ...DEFAULT_APP_SETTINGS.interaction, confettiEnabled: false }
        }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.queryByLabelText('Standard')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Feuerwerk')).not.toBeInTheDocument();
    });

    it('should update confetti style to firework', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: { ...DEFAULT_APP_SETTINGS.interaction, confettiEnabled: true }
        }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      const fireworkRadio = screen.getByLabelText('Feuerwerk');
      fireEvent.click(fireworkRadio);

      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));

      const updateFn = mockUpdateSettings.mock.calls[0][0];
      const result = updateFn(createMockSettings());
      expect(result.interaction.confettiStyle).toBe('firework');
    });

    it('should update confetti intensity to light', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: { ...DEFAULT_APP_SETTINGS.interaction, confettiEnabled: true }
        }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      const lightRadio = screen.getByLabelText('Leicht');
      fireEvent.click(lightRadio);

      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));

      const updateFn = mockUpdateSettings.mock.calls[0][0];
      const result = updateFn(createMockSettings());
      expect(result.interaction.confettiIntensity).toBe('light');
    });

    it('should toggle confetti sound', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: { ...DEFAULT_APP_SETTINGS.interaction, confettiEnabled: true }
        }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      const confettiSoundCheckbox = screen.getByLabelText('Sound bei Konfetti abspielen');
      fireEvent.click(confettiSoundCheckbox);

      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should show confetti trigger information', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({
          interaction: { ...DEFAULT_APP_SETTINGS.interaction, confettiEnabled: true }
        }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByText('Wann wird Konfetti ausgelöst?')).toBeInTheDocument();
      expect(screen.getByText(/Perfekte Sitzung/)).toBeInTheDocument();
      expect(screen.getByText(/Streak-Meilensteine/)).toBeInTheDocument();
      expect(screen.getByText(/Lernpfad abgeschlossen/)).toBeInTheDocument();
    });
  });

  describe('Section Collapsible Behavior', () => {
    it('should render sections expanded by default', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      // Find the theme section header and verify its content is visible
      const themeSection = screen.getByRole('button', { name: /Darstellung & Theme/ });
      expect(themeSection).toHaveAttribute('aria-expanded', 'true');
    });

    it('should collapse section when header is clicked', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const themeSectionButton = screen.getByRole('button', { name: /Darstellung & Theme/ });

      // Click to collapse
      fireEvent.click(themeSectionButton);

      expect(themeSectionButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should expand section when collapsed header is clicked', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const themeSectionButton = screen.getByRole('button', { name: /Darstellung & Theme/ });

      // Click to collapse
      fireEvent.click(themeSectionButton);
      expect(themeSectionButton).toHaveAttribute('aria-expanded', 'false');

      // Click to expand
      fireEvent.click(themeSectionButton);
      expect(themeSectionButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should hide section content when collapsed', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const themeSectionButton = screen.getByRole('button', { name: /Darstellung & Theme/ });

      // Verify content is visible initially
      expect(screen.getByLabelText('Hell')).toBeInTheDocument();

      // Collapse section
      fireEvent.click(themeSectionButton);

      // Content should be hidden
      expect(screen.queryByLabelText('Hell')).not.toBeInTheDocument();
    });

    it('should show section content when expanded', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const themeSectionButton = screen.getByRole('button', { name: /Darstellung & Theme/ });

      // Collapse
      fireEvent.click(themeSectionButton);
      expect(screen.queryByLabelText('Hell')).not.toBeInTheDocument();

      // Expand
      fireEvent.click(themeSectionButton);
      expect(screen.getByLabelText('Hell')).toBeInTheDocument();
    });
  });

  describe('Search/Filter Functionality', () => {
    it('should filter sections based on search query', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const searchInput = screen.getByPlaceholderText('Einstellungen durchsuchen...');

      // Search for theme
      fireEvent.change(searchInput, { target: { value: 'theme' } });

      // Theme section should be visible
      expect(screen.getByText('Darstellung & Theme')).toBeInTheDocument();

      // Other sections might not match
      // Audio section shouldn't match 'theme' in German
      expect(screen.queryByText('Haptisches Feedback')).not.toBeInTheDocument();
    });

    it('should filter by section title', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const searchInput = screen.getByPlaceholderText('Einstellungen durchsuchen...');

      fireEvent.change(searchInput, { target: { value: 'audio' } });

      expect(screen.getByText('Audio')).toBeInTheDocument();
    });

    it('should filter by section keywords', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const searchInput = screen.getByPlaceholderText('Einstellungen durchsuchen...');

      fireEvent.change(searchInput, { target: { value: 'konfetti' } });

      expect(screen.getByText('Konfetti & Animationen')).toBeInTheDocument();
      expect(screen.queryByText('Audio')).not.toBeInTheDocument();
    });

    it('should show all sections when search is cleared', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const searchInput = screen.getByPlaceholderText('Einstellungen durchsuchen...');

      // Filter
      fireEvent.change(searchInput, { target: { value: 'audio' } });
      expect(screen.queryByText('Darstellung & Theme')).not.toBeInTheDocument();

      // Clear filter
      fireEvent.change(searchInput, { target: { value: '' } });

      // All sections should be visible
      expect(screen.getByText('Darstellung & Theme')).toBeInTheDocument();
      expect(screen.getByText('Audio')).toBeInTheDocument();
      expect(screen.getByText('Haptisches Feedback')).toBeInTheDocument();
    });

    it('should perform case-insensitive search', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const searchInput = screen.getByPlaceholderText('Einstellungen durchsuchen...');

      fireEvent.change(searchInput, { target: { value: 'AUDIO' } });

      expect(screen.getByText('Audio')).toBeInTheDocument();
    });
  });

  describe('Reset to Defaults', () => {
    it('should call resetSettings when reset button is clicked', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const resetButton = screen.getByText('Auf Standardwerte zurücksetzen');
      fireEvent.click(resetButton);

      expect(mockResetSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('Close Button Functionality', () => {
    it('should call onClose when header close button is clicked', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const closeButtons = screen.getAllByText('Schließen');
      fireEvent.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when footer close button is clicked', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const doneButton = screen.getByText('Fertig');
      fireEvent.click(doneButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Save State Indicator', () => {
    it('should show saving state', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings(),
        loading: false,
        saveState: 'saving' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByText('Speichere...')).toBeInTheDocument();
    });

    it('should show saved state', () => {
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings(),
        loading: false,
        saveState: 'saved' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByText(/Gespeichert/)).toBeInTheDocument();
    });

    it('should show last saved timestamp when idle', () => {
      const lastSaved = '2024-01-15T10:30:00.000Z';
      vi.spyOn(useAppSettingsModule, 'useAppSettings').mockReturnValue({
        settings: createMockSettings({ lastSavedAt: lastSaved }),
        loading: false,
        saveState: 'idle' as const,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        exportSettings: vi.fn(() => '{}'),
        importSettingsFromText: vi.fn(),
        storageEstimate: null,
        refreshStorageEstimate: vi.fn(),
      });

      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByText(/Zuletzt gespeichert:/)).toBeInTheDocument();
    });
  });

  describe('Info & Support Section', () => {
    it('should render version information', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByText(/Version: 1.0.0/)).toBeInTheDocument();
    });

    it('should render documentation link', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const docLink = screen.getByRole('link', { name: /Dokumentation/ });
      expect(docLink).toHaveAttribute('href', 'https://github.com/trsdn/learning-platform#readme');
      expect(docLink).toHaveAttribute('target', '_blank');
    });

    it('should render bug report link', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const bugLink = screen.getByRole('link', { name: /Bug melden/ });
      expect(bugLink).toHaveAttribute('href', 'https://github.com/trsdn/learning-platform/issues/new');
      expect(bugLink).toHaveAttribute('target', '_blank');
    });

    it('should render feature request link', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const featureLink = screen.getByRole('link', { name: /Feature vorschlagen/ });
      expect(featureLink).toHaveAttribute('href', 'https://github.com/trsdn/learning-platform/issues/new');
      expect(featureLink).toHaveAttribute('target', '_blank');
    });

    it('should render help link', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const helpLink = screen.getByRole('link', { name: /Hilfe & FAQ/ });
      expect(helpLink).toHaveAttribute('href', 'https://github.com/trsdn/learning-platform/discussions');
      expect(helpLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for radiogroups', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      expect(screen.getByRole('radiogroup', { name: 'Theme auswählen' })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: 'Schriftgröße auswählen' })).toBeInTheDocument();
    });

    it('should have proper ARIA labels for search input', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const searchInput = screen.getByLabelText('Einstellungen durchsuchen');
      expect(searchInput).toBeInTheDocument();
    });

    it('should have aria-expanded on collapsible sections', () => {
      render(<SettingsPage onClose={mockOnClose} />);

      const themeSectionButton = screen.getByRole('button', { name: /Darstellung & Theme/ });
      expect(themeSectionButton).toHaveAttribute('aria-expanded');
    });

    it('should link unsupported vibration notice with checkbox', () => {
      // Temporarily remove vibrate support for this test only
      const originalVibrate = navigator.vibrate;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (navigator as any).vibrate;

      render(<SettingsPage onClose={mockOnClose} />);

      // Verify the unsupported notice exists
      expect(screen.getByText('Vibration wird auf diesem Gerät nicht unterstützt (nur Android-Browser).')).toBeInTheDocument();

      const vibrationsCheckbox = screen.getByLabelText('Vibrationen aktivieren');
      expect(vibrationsCheckbox).toBeDisabled();

      // Check that the notice has the correct ID for accessibility
      const noticeElement = document.getElementById('vibration-unsupported-notice');
      expect(noticeElement).toBeInTheDocument();
      expect(noticeElement).toHaveTextContent('Vibration wird auf diesem Gerät nicht unterstützt (nur Android-Browser).');

      // Restore vibrate
      Object.defineProperty(navigator, 'vibrate', {
        value: originalVibrate,
        writable: true,
        configurable: true,
      });
    });
  });
});
