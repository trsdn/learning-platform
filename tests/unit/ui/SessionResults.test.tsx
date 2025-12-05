/**
 * Tests for SessionResults Component
 *
 * Tests the session results functionality including:
 * - #157: Accuracy and averageTime display from computed results
 * - Performance rating based on accuracy
 * - Confetti celebration for perfect sessions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionResults } from '../../../src/modules/ui/components/session-results';
import type { PracticeSession } from '../../../src/modules/core/types/services';

// Mock CSS modules
vi.mock('../../../src/modules/ui/components/session-results.module.css', () => ({
  default: {
    'session-results': 'session-results',
    'session-results__header': 'session-results__header',
    'session-results__emoji': 'session-results__emoji',
    'session-results__title': 'session-results__title',
    'session-results__rating': 'session-results__rating',
    'session-results__stats': 'session-results__stats',
    'session-results__time-card': 'session-results__time-card',
    'session-results__time-text': 'session-results__time-text',
    'session-results__toast': 'session-results__toast',
    'session-results__actions': 'session-results__actions',
  },
}));

// Mock components
vi.mock('../../../src/modules/ui/components/common/StatCard', () => ({
  StatCard: ({ title, value, color }: { title: string; value: string | number; color: string }) => (
    <div data-testid="stat-card" data-title={title} data-value={String(value)} data-color={color}>
      {title}: {value}
    </div>
  ),
}));

vi.mock('../../../src/modules/ui/components/common/Button', () => ({
  Button: ({ children, onClick, variant }: { children: React.ReactNode; onClick: () => void; variant: string }) => (
    <button data-testid="button" data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('../../../src/modules/ui/components/common/Card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

// Mock useConfetti hook
const mockFirePerfectSession = vi.fn();
vi.mock('../../../src/modules/ui/hooks/use-confetti', () => ({
  useConfetti: () => ({
    firePerfectSession: mockFirePerfectSession,
  }),
}));

// Helper to create a mock session
function createMockSession(overrides: Partial<PracticeSession> = {}): PracticeSession {
  return {
    id: 'session-1',
    configuration: {
      topicId: 'topic-1',
      learningPathIds: ['path-1'],
      targetCount: 10,
      includeReview: false,
    },
    execution: {
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'],
      completedCount: 5,
      correctCount: 4,
      status: 'completed',
      totalTimeSpent: 100,
      startedAt: new Date(Date.now() - 600000),
      completedAt: new Date(),
    },
    results: {
      accuracy: 80, // 4/5 = 80%
      averageTime: 20, // 100/5 = 20
      difficultyDistribution: {},
      improvementAreas: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('SessionResults', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnStartNew: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockOnStartNew = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Statistics Display (#157 - Session Stats)', () => {
    it('should display accuracy from results', () => {
      const session = createMockSession({
        results: {
          accuracy: 75,
          averageTime: 15,
          difficultyDistribution: {},
          improvementAreas: [],
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      // Find accuracy stat card
      const statCards = screen.getAllByTestId('stat-card');
      const accuracyCard = statCards.find(card => card.getAttribute('data-title') === 'Genauigkeit');

      expect(accuracyCard).toBeDefined();
      expect(accuracyCard?.getAttribute('data-value')).toBe('75%');
    });

    it('should display averageTime from results', () => {
      const session = createMockSession({
        execution: {
          taskIds: ['task-1', 'task-2', 'task-3'],
          completedCount: 3,
          correctCount: 2,
          status: 'completed',
          totalTimeSpent: 45,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        results: {
          accuracy: 66.67,
          averageTime: 15, // 45/3 = 15
          difficultyDistribution: {},
          improvementAreas: [],
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      const statCards = screen.getAllByTestId('stat-card');
      const timeCard = statCards.find(card => card.getAttribute('data-title') === 'Ø Zeit pro Aufgabe');

      expect(timeCard).toBeDefined();
      expect(timeCard?.getAttribute('data-value')).toBe('15 sek');
    });

    it('should format time over 60 seconds as minutes', () => {
      const session = createMockSession({
        execution: {
          taskIds: ['task-1'],
          completedCount: 1,
          correctCount: 1,
          status: 'completed',
          totalTimeSpent: 90,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        results: {
          accuracy: 100,
          averageTime: 90, // 90 seconds = 1:30 min
          difficultyDistribution: {},
          improvementAreas: [],
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      const statCards = screen.getAllByTestId('stat-card');
      const timeCard = statCards.find(card => card.getAttribute('data-title') === 'Ø Zeit pro Aufgabe');

      expect(timeCard?.getAttribute('data-value')).toBe('1:30 min');
    });

    it('should display completed count', () => {
      const session = createMockSession({
        execution: {
          taskIds: ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'],
          completedCount: 5,
          correctCount: 3,
          status: 'completed',
          totalTimeSpent: 100,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      const statCards = screen.getAllByTestId('stat-card');
      const completedCard = statCards.find(card => card.getAttribute('data-title') === 'Aufgaben bearbeitet');

      expect(completedCard?.getAttribute('data-value')).toBe('5');
    });

    it('should display correct count', () => {
      const session = createMockSession({
        execution: {
          taskIds: ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'],
          completedCount: 5,
          correctCount: 4,
          status: 'completed',
          totalTimeSpent: 100,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      const statCards = screen.getAllByTestId('stat-card');
      const correctCard = statCards.find(card => card.getAttribute('data-title') === 'Richtige Antworten');

      expect(correctCard?.getAttribute('data-value')).toBe('4');
    });

    it('should display total time spent', () => {
      const session = createMockSession({
        execution: {
          taskIds: ['task-1', 'task-2'],
          completedCount: 2,
          correctCount: 2,
          status: 'completed',
          totalTimeSpent: 150, // 2:30 min
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      expect(screen.getByText(/Gesamtzeit:/)).toBeInTheDocument();
      expect(screen.getByText(/2:30 min/)).toBeInTheDocument();
    });
  });

  describe('Performance Rating', () => {
    it('should show "Ausgezeichnet!" for accuracy >= 90%', () => {
      const session = createMockSession({
        results: {
          accuracy: 95,
          averageTime: 10,
          difficultyDistribution: {},
          improvementAreas: [],
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      expect(screen.getByText('Ausgezeichnet!')).toBeInTheDocument();
    });

    it('should show "Sehr gut!" for accuracy >= 75%', () => {
      const session = createMockSession({
        results: {
          accuracy: 80,
          averageTime: 10,
          difficultyDistribution: {},
          improvementAreas: [],
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      expect(screen.getByText('Sehr gut!')).toBeInTheDocument();
    });

    it('should show "Gut gemacht!" for accuracy >= 60%', () => {
      const session = createMockSession({
        results: {
          accuracy: 65,
          averageTime: 10,
          difficultyDistribution: {},
          improvementAreas: [],
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      expect(screen.getByText('Gut gemacht!')).toBeInTheDocument();
    });

    it('should show "Weiter üben!" for accuracy < 60%', () => {
      const session = createMockSession({
        results: {
          accuracy: 40,
          averageTime: 10,
          difficultyDistribution: {},
          improvementAreas: [],
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      expect(screen.getByText('Weiter üben!')).toBeInTheDocument();
    });
  });

  describe('Confetti Celebration', () => {
    it('should fire confetti for perfect session with 100% accuracy and >= 5 questions', () => {
      const session = createMockSession({
        execution: {
          taskIds: ['1', '2', '3', '4', '5'],
          completedCount: 5,
          correctCount: 5,
          status: 'completed',
          totalTimeSpent: 50,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        results: {
          accuracy: 100,
          averageTime: 10,
          difficultyDistribution: {},
          improvementAreas: [],
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      expect(mockFirePerfectSession).toHaveBeenCalledTimes(1);
    });

    it('should not fire confetti for perfect session with < 5 questions', () => {
      const session = createMockSession({
        execution: {
          taskIds: ['1', '2', '3'],
          completedCount: 3,
          correctCount: 3,
          status: 'completed',
          totalTimeSpent: 30,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        results: {
          accuracy: 100,
          averageTime: 10,
          difficultyDistribution: {},
          improvementAreas: [],
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      expect(mockFirePerfectSession).not.toHaveBeenCalled();
    });

    it('should not fire confetti for non-perfect session', () => {
      const session = createMockSession({
        execution: {
          taskIds: ['1', '2', '3', '4', '5'],
          completedCount: 5,
          correctCount: 4,
          status: 'completed',
          totalTimeSpent: 50,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        results: {
          accuracy: 80,
          averageTime: 10,
          difficultyDistribution: {},
          improvementAreas: [],
        },
      });

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      expect(mockFirePerfectSession).not.toHaveBeenCalled();
    });
  });

  describe('Action Buttons', () => {
    it('should call onStartNew when "Neue Sitzung starten" is clicked', () => {
      const session = createMockSession();

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      const buttons = screen.getAllByTestId('button');
      const startNewButton = buttons.find(btn => btn.textContent === 'Neue Sitzung starten');

      fireEvent.click(startNewButton!);

      expect(mockOnStartNew).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when "Zurück zur Übersicht" is clicked', () => {
      const session = createMockSession();

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      const buttons = screen.getAllByTestId('button');
      const closeButton = buttons.find(btn => btn.textContent === 'Zurück zur Übersicht');

      fireEvent.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Header Content', () => {
    it('should display celebration emoji', () => {
      const session = createMockSession();

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    it('should display completion title', () => {
      const session = createMockSession();

      render(
        <SessionResults
          session={session}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />
      );

      expect(screen.getByText('Sitzung abgeschlossen!')).toBeInTheDocument();
    });
  });
});
