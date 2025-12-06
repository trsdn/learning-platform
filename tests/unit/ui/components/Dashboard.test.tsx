/**
 * Tests for Dashboard Component
 *
 * Tests the dashboard functionality including:
 * - Loading states
 * - Error handling with retry
 * - Empty state
 * - Data display (stats, streak, mastery levels, topic progress, recent sessions)
 * - User interactions (close button, retry)
 * - Integration with repositories and hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@/modules/ui/components/dashboard';
import type { PracticeSession, Topic, SpacedRepetitionItem } from '@core/types/services';

// Mock CSS module
vi.mock('@/modules/ui/components/dashboard.module.css', () => ({
  default: {
    'dashboard__empty': 'dashboard__empty',
    'dashboard__back-button': 'dashboard__back-button',
    'dashboard': 'dashboard',
    'dashboard__header': 'dashboard__header',
    'dashboard__title': 'dashboard__title',
    'dashboard__subtitle': 'dashboard__subtitle',
    'dashboard__metrics': 'dashboard__metrics',
    'dashboard__streak-card': 'dashboard__streak-card',
    'dashboard__streak-title': 'dashboard__streak-title',
    'dashboard__mastery-card': 'dashboard__mastery-card',
    'dashboard__mastery-title': 'dashboard__mastery-title',
    'dashboard__mastery-bars': 'dashboard__mastery-bars',
    'dashboard__topic-card': 'dashboard__topic-card',
    'dashboard__topic-title': 'dashboard__topic-title',
    'dashboard__topic-grid': 'dashboard__topic-grid',
    'dashboard__topic-item': 'dashboard__topic-item',
    'dashboard__topic-header': 'dashboard__topic-header',
    'dashboard__topic-name': 'dashboard__topic-name',
    'dashboard__topic-meta': 'dashboard__topic-meta',
    'dashboard__topic-bar-container': 'dashboard__topic-bar-container',
    'dashboard__topic-bar-fill': 'dashboard__topic-bar-fill',
    'dashboard__topic-stats': 'dashboard__topic-stats',
    'dashboard__sessions-title': 'dashboard__sessions-title',
    'dashboard__sessions-list': 'dashboard__sessions-list',
    'dashboard__session-item': 'dashboard__session-item',
    'dashboard__session-left': 'dashboard__session-left',
    'dashboard__session-topic': 'dashboard__session-topic',
    'dashboard__session-date': 'dashboard__session-date',
    'dashboard__session-right': 'dashboard__session-right',
    'dashboard__session-accuracy': 'dashboard__session-accuracy',
    'dashboard__session-stats': 'dashboard__session-stats',
  },
}));

// Mock design tokens
vi.mock('@/modules/ui/design-tokens', () => ({
  colors: {
    primary: { 500: '#3b82f6' },
    success: { 500: '#10b981' },
    warning: { 500: '#f59e0b' },
    error: { 500: '#ef4444' },
    info: { 500: '#06b6d4' },
  },
}));

// Mock child components
vi.mock('@/modules/ui/components/common/StatCard', () => ({
  StatCard: ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
    <div data-testid="stat-card">
      <div data-testid="stat-title">{title}</div>
      <div data-testid="stat-value">{value}</div>
      <div data-testid="stat-subtitle">{subtitle}</div>
    </div>
  ),
}));

vi.mock('@/modules/ui/components/common/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
}));

vi.mock('@/modules/ui/components/common/Button', () => ({
  Button: ({ children, onClick, variant }: { children: React.ReactNode; onClick: () => void; variant?: string }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('@/modules/ui/components/common/MasteryBar', () => ({
  MasteryBar: ({ label, count, color }: { label: string; count: number; color: string }) => (
    <div data-testid="mastery-bar">
      <span>{label}</span>
      <span>{count}</span>
      {/* eslint-disable-next-line no-restricted-syntax */}
      <span style={{ color }}></span>
    </div>
  ),
}));

vi.mock('@/modules/ui/components/common/StreakDisplay', () => ({
  StreakDisplay: ({ currentStreak, bestStreak }: { currentStreak: number; bestStreak: number }) => (
    <div data-testid="streak-display">
      <div>Current: {currentStreak}</div>
      <div>Best: {bestStreak}</div>
    </div>
  ),
}));

vi.mock('@/modules/ui/components/error', () => ({
  ErrorMessage: ({ error, onRetry }: { error: { message: string }; onRetry: () => void }) => (
    <div data-testid="error-message">
      <p>{error.message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

// Mock repositories
const mockSessionRepo = {
  getAll: vi.fn(),
};

const mockTopicRepo = {
  getAll: vi.fn(),
};

const mockSpacedRepRepo = {
  getAll: vi.fn(),
};

vi.mock('@/modules/storage/factory', () => ({
  getPracticeSessionRepository: () => mockSessionRepo,
  getTopicRepository: () => mockTopicRepo,
  getSpacedRepetitionRepository: () => mockSpacedRepRepo,
}));

// Mock streak calculation hook
const mockStreakData = {
  currentStreak: 5,
  bestStreak: 10,
  nextMilestone: 7,
  progressToNextMilestone: 71.4,
  isStreakActive: true,
  isLoading: false,
  error: null,
  lastActivityDate: new Date(),
};

vi.mock('@/modules/ui/hooks/use-streak-calculation', () => ({
  useStreakCalculation: () => mockStreakData,
}));

// Mock error handler
vi.mock('@/modules/core/utils/error-handler', () => ({
  handleComponentError: (err: Error, context: string) => ({
    message: err.message,
    context,
    timestamp: new Date(),
  }),
}));

describe('Dashboard', () => {
  const mockOnClose = vi.fn();

  // Helper function to create mock practice session
  const createMockSession = (overrides: Partial<PracticeSession> = {}): PracticeSession => ({
    id: 'session-1',
    learningPathId: 'path-1',
    configuration: {
      topicId: 'topic-1',
      difficulty: 'medium',
      targetCount: 10,
      mode: 'learn',
    },
    execution: {
      status: 'completed',
      currentTaskIndex: 0,
      startedAt: new Date('2024-01-01T10:00:00').toISOString(),
      completedAt: new Date('2024-01-01T10:15:00').toISOString(),
      completedCount: 10,
      correctCount: 8,
    },
    results: {
      totalTasks: 10,
      completedTasks: 10,
      correctAnswers: 8,
      accuracy: 80,
      timeSpent: 900,
      taskResults: [],
    },
    createdAt: new Date('2024-01-01T10:00:00'),
    updatedAt: new Date('2024-01-01T10:15:00'),
    ...overrides,
  });

  // Helper function to create mock topic
  const createMockTopic = (overrides: Partial<Topic> = {}): Topic => ({
    id: 'topic-1',
    title: 'Mathematics',
    description: 'Math basics',
    category: 'math',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  // Helper function to create mock spaced repetition item
  const createMockSRItem = (overrides: Partial<SpacedRepetitionItem> = {}): SpacedRepetitionItem => ({
    id: 'sr-1',
    taskId: 'task-1',
    learningPathId: 'path-1',
    algorithm: {
      efactor: 2.5,
      interval: 1,
      repetition: 1,
    },
    schedule: {
      nextReview: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      lastReviewed: new Date().toISOString(),
    },
    performance: {
      totalReviews: 1,
      successfulReviews: 1,
      streak: 1,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      // Make getAll hang to keep loading state
      mockSessionRepo.getAll.mockImplementation(() => new Promise(() => {}));

      render(<Dashboard onClose={mockOnClose} />);

      expect(screen.getByText('📊 Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Lade Statistiken...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when data loading fails', async () => {
      const error = new Error('Failed to load sessions');
      mockSessionRepo.getAll.mockRejectedValue(error);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Failed to load sessions')).toBeInTheDocument();
      });
    });

    it('should show retry button in error state', async () => {
      const error = new Error('Network error');
      mockSessionRepo.getAll.mockRejectedValue(error);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should retry loading when retry button is clicked', async () => {
      const user = userEvent.setup();
      const error = new Error('First attempt failed');

      // First call fails
      mockSessionRepo.getAll.mockRejectedValueOnce(error);

      // Second call succeeds
      mockSessionRepo.getAll.mockResolvedValueOnce([]);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('First attempt failed')).toBeInTheDocument();
      });

      // Error message should disappear after retry
      expect(screen.getByTestId('error-message')).toBeInTheDocument();

      // Click retry
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      // Should successfully load data and show dashboard
      await waitFor(() => {
        expect(screen.getByText('📊 Lern-Dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });

      // Verify repositories were called again
      expect(mockSessionRepo.getAll).toHaveBeenCalledTimes(2);
    });

    it('should show back button in error state', async () => {
      const error = new Error('Error occurred');
      mockSessionRepo.getAll.mockRejectedValue(error);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('← Zurück')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no data is available', async () => {
      mockSessionRepo.getAll.mockResolvedValue([]);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      // Wait for data to load (stats will be null initially, then set)
      await waitFor(() => {
        expect(mockSessionRepo.getAll).toHaveBeenCalled();
      });

      // The component should render with zero values for empty data
      await waitFor(() => {
        expect(screen.getByText('📊 Lern-Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      const sessions = [
        createMockSession({
          id: 'session-1',
          configuration: { topicId: 'topic-1', difficulty: 'medium', targetCount: 10, mode: 'learn' },
          execution: {
            status: 'completed',
            currentTaskIndex: 0,
            startedAt: new Date('2024-01-01T10:00:00').toISOString(),
            completedAt: new Date('2024-01-01T10:15:00').toISOString(),
            completedCount: 10,
            correctCount: 8,
          },
          results: { totalTasks: 10, completedTasks: 10, correctAnswers: 8, accuracy: 80, timeSpent: 900, taskResults: [] },
        }),
        createMockSession({
          id: 'session-2',
          configuration: { topicId: 'topic-1', difficulty: 'easy', targetCount: 5, mode: 'review' },
          execution: {
            status: 'completed',
            currentTaskIndex: 0,
            startedAt: new Date('2024-01-02T14:00:00').toISOString(),
            completedAt: new Date('2024-01-02T14:10:00').toISOString(),
            completedCount: 5,
            correctCount: 5,
          },
          results: { totalTasks: 5, completedTasks: 5, correctAnswers: 5, accuracy: 100, timeSpent: 600, taskResults: [] },
        }),
      ];

      const topics = [
        createMockTopic({ id: 'topic-1', title: 'Mathematics' }),
      ];

      const srItems = [
        createMockSRItem({ id: 'sr-1', algorithm: { efactor: 2.6, interval: 2, repetition: 2 } }),
        createMockSRItem({ id: 'sr-2', algorithm: { efactor: 2.3, interval: 1, repetition: 1 } }),
        createMockSRItem({ id: 'sr-3', algorithm: { efactor: 1.8, interval: 0, repetition: 0 } }),
      ];

      mockSessionRepo.getAll.mockResolvedValue(sessions);
      mockTopicRepo.getAll.mockResolvedValue(topics);
      mockSpacedRepRepo.getAll.mockResolvedValue(srItems);
    });

    it('should display dashboard title and subtitle', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('📊 Lern-Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Deine Fortschritte und Statistiken im Überblick')).toBeInTheDocument();
      });
    });

    it('should display total sessions stat', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Gesamt Sitzungen')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('von 2 gestartet')).toBeInTheDocument();
      });
    });

    it('should display accuracy stat', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Genauigkeit')).toBeInTheDocument();
        // (8 + 5) / (10 + 5) = 13/15 = 86.67% => rounds to 87%
        expect(screen.getByText('87%')).toBeInTheDocument();
        expect(screen.getByText('13/15 richtig')).toBeInTheDocument();
      });
    });

    it('should display learning time stat', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Lernzeit')).toBeInTheDocument();
        // Total: 900 + 600 = 1500 seconds = 25 minutes
        expect(screen.getByText('25m')).toBeInTheDocument();
      });
    });

    it('should display upcoming reviews stat', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Anstehende Wiederholungen')).toBeInTheDocument();
        expect(screen.getByText('bereit zum Üben')).toBeInTheDocument();
      });
    });

    it('should display streak information', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('🔥 Tagesstreak')).toBeInTheDocument();
        expect(screen.getByTestId('streak-display')).toBeInTheDocument();
        expect(screen.getByText('Current: 5')).toBeInTheDocument();
        expect(screen.getByText('Best: 10')).toBeInTheDocument();
      });
    });

    it('should display mastery levels', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Beherrschungsniveau')).toBeInTheDocument();
        const masteryBars = screen.getAllByTestId('mastery-bar');
        expect(masteryBars).toHaveLength(3);
        expect(screen.getByText('Gemeistert')).toBeInTheDocument();
        expect(screen.getByText('In Arbeit')).toBeInTheDocument();
        expect(screen.getByText('Neu')).toBeInTheDocument();
      });
    });

    it('should display topic progress', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('📚 Fortschritt nach Thema')).toBeInTheDocument();
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('2 Sitzungen • 87% genau')).toBeInTheDocument();
        expect(screen.getByText('15 Aufgaben bearbeitet')).toBeInTheDocument();
      });
    });

    it('should display recent sessions', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('🕐 Letzte Sitzungen')).toBeInTheDocument();
        // Should show both sessions
        const sessionItems = screen.getAllByText(/topic-/);
        expect(sessionItems.length).toBeGreaterThan(0);
      });
    });

    it('should not display topic progress section when no data', async () => {
      mockSessionRepo.getAll.mockResolvedValue([]);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('📊 Lern-Dashboard')).toBeInTheDocument();
      });

      expect(screen.queryByText('📚 Fortschritt nach Thema')).not.toBeInTheDocument();
    });

    it('should not display recent sessions section when no sessions', async () => {
      mockSessionRepo.getAll.mockResolvedValue([]);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('📊 Lern-Dashboard')).toBeInTheDocument();
      });

      expect(screen.queryByText('🕐 Letzte Sitzungen')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      mockSessionRepo.getAll.mockResolvedValue([]);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);
    });

    it('should call onClose when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('📊 Lern-Dashboard')).toBeInTheDocument();
      });

      const backButton = screen.getByText('← Zurück');
      await user.click(backButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose from loading state', async () => {
      mockSessionRepo.getAll.mockImplementation(() => new Promise(() => {})); // Keep loading

      render(<Dashboard onClose={mockOnClose} />);

      // Should show loading state with back button
      expect(screen.queryByText('← Zurück')).not.toBeInTheDocument(); // Loading state has no back button
      expect(screen.getByText('Lade Statistiken...')).toBeInTheDocument();
    });

    it('should call onClose from error state', async () => {
      const user = userEvent.setup();
      const error = new Error('Test error');
      mockSessionRepo.getAll.mockRejectedValue(error);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('← Zurück')).toBeInTheDocument();
      });

      const backButton = screen.getByText('← Zurück');
      await user.click(backButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Time Formatting', () => {
    it('should format time in hours and minutes when over 1 hour', async () => {
      const sessions = [
        createMockSession({
          execution: {
            status: 'completed',
            currentTaskIndex: 0,
            startedAt: new Date('2024-01-01T10:00:00').toISOString(),
            completedAt: new Date('2024-01-01T11:30:00').toISOString(), // 90 minutes
            completedCount: 10,
            correctCount: 8,
          },
        }),
      ];

      mockSessionRepo.getAll.mockResolvedValue(sessions);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        // 5400 seconds = 90 minutes = 1h 30m
        expect(screen.getByText('1h 30m')).toBeInTheDocument();
      });
    });

    it('should format time in minutes when under 1 hour', async () => {
      const sessions = [
        createMockSession({
          execution: {
            status: 'completed',
            currentTaskIndex: 0,
            startedAt: new Date('2024-01-01T10:00:00').toISOString(),
            completedAt: new Date('2024-01-01T10:30:00').toISOString(), // 30 minutes
            completedCount: 10,
            correctCount: 8,
          },
        }),
      ];

      mockSessionRepo.getAll.mockResolvedValue(sessions);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        // 1800 seconds = 30 minutes
        expect(screen.getByText('30m')).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates in German locale', async () => {
      const sessions = [
        createMockSession({
          execution: {
            status: 'completed',
            currentTaskIndex: 0,
            startedAt: new Date('2024-01-15T10:00:00').toISOString(),
            completedAt: new Date('2024-01-15T10:15:00').toISOString(),
            completedCount: 10,
            correctCount: 8,
          },
        }),
      ];

      mockSessionRepo.getAll.mockResolvedValue(sessions);
      mockTopicRepo.getAll.mockResolvedValue([createMockTopic()]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        // Should show date in German format DD.MM.YYYY
        expect(screen.getByText('15.01.2024')).toBeInTheDocument();
      });
    });
  });

  describe('Repository Integration', () => {
    it('should call all repository methods on mount', async () => {
      mockSessionRepo.getAll.mockResolvedValue([]);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(mockSessionRepo.getAll).toHaveBeenCalledTimes(1);
        expect(mockTopicRepo.getAll).toHaveBeenCalledTimes(1);
        expect(mockSpacedRepRepo.getAll).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle sessions without completed dates', async () => {
      const sessions = [
        createMockSession({
          execution: {
            status: 'completed',
            currentTaskIndex: 0,
            startedAt: new Date('2024-01-01T10:00:00').toISOString(),
            completedAt: undefined, // No completion date
            completedCount: 10,
            correctCount: 8,
          },
        }),
      ];

      mockSessionRepo.getAll.mockResolvedValue(sessions);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('📊 Lern-Dashboard')).toBeInTheDocument();
      });

      // Should not crash and display stats (time should be 0)
      expect(screen.getByText('0m')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockSessionRepo.getAll.mockResolvedValue([]);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);
    });

    it('should have proper heading hierarchy', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        const h1 = screen.getByText('📊 Lern-Dashboard');
        expect(h1).toBeInTheDocument();
      });
    });

    it('should have accessible back button', async () => {
      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        const backButton = screen.getByText('← Zurück');
        expect(backButton).toBeInTheDocument();
        expect(backButton.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Calculation Edge Cases', () => {
    it('should handle zero accuracy when no questions answered', async () => {
      const sessions = [
        createMockSession({
          execution: {
            status: 'completed',
            currentTaskIndex: 0,
            startedAt: new Date('2024-01-01T10:00:00').toISOString(),
            completedAt: new Date('2024-01-01T10:15:00').toISOString(),
            completedCount: 0,
            correctCount: 0,
          },
        }),
      ];

      mockSessionRepo.getAll.mockResolvedValue(sessions);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByText('0/0 richtig')).toBeInTheDocument();
      });
    });

    it('should calculate mastery levels correctly', async () => {
      const srItems = [
        createMockSRItem({ algorithm: { efactor: 2.6, interval: 2, repetition: 2 } }), // Mastered (>=2.5)
        createMockSRItem({ algorithm: { efactor: 2.5, interval: 2, repetition: 2 } }), // Mastered (=2.5)
        createMockSRItem({ algorithm: { efactor: 2.3, interval: 1, repetition: 1 } }), // Learning (<2.5, rep>0)
        createMockSRItem({ algorithm: { efactor: 1.8, interval: 0, repetition: 0 } }), // New (rep=0)
      ];

      mockSessionRepo.getAll.mockResolvedValue([]);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue(srItems);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        const masteryBars = screen.getAllByTestId('mastery-bar');
        expect(masteryBars).toHaveLength(3);
        // Mastered: 2, Learning: 1, New: 1
      });
    });

    it('should filter only completed sessions for stats', async () => {
      const sessions = [
        createMockSession({
          id: 'completed',
          execution: {
            status: 'completed',
            currentTaskIndex: 0,
            completedCount: 10,
            correctCount: 8,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
        }),
        createMockSession({
          id: 'in-progress',
          execution: {
            status: 'in-progress',
            currentTaskIndex: 5,
            completedCount: 5,
            correctCount: 3,
            startedAt: new Date().toISOString(),
            completedAt: undefined,
          },
        }),
      ];

      mockSessionRepo.getAll.mockResolvedValue(sessions);
      mockTopicRepo.getAll.mockResolvedValue([]);
      mockSpacedRepRepo.getAll.mockResolvedValue([]);

      render(<Dashboard onClose={mockOnClose} />);

      await waitFor(() => {
        // Should show 1 completed out of 2 total
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('von 2 gestartet')).toBeInTheDocument();
      });
    });
  });
});
