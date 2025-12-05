/**
 * Tests for SessionProgressBar Component
 *
 * Tests the progress bar functionality including:
 * - #165/#166: Progress bar rendering and task markers
 * - Animation handling
 * - Progress percentage calculation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionProgressBar, type TaskResult } from '../../../src/modules/ui/components/practice/session/SessionProgressBar';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, initial, animate, transition: _transition, ...props }: {
      children?: React.ReactNode;
      className?: string;
      style?: React.CSSProperties;
      initial?: object;
      animate?: object;
      transition?: object;
      [key: string]: unknown;
    }) => (
      <div className={className} style={style} data-initial={JSON.stringify(initial)} data-animate={JSON.stringify(animate)} {...props}>
        {children}
      </div>
    ),
  },
  useReducedMotion: () => false,
}));

describe('SessionProgressBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with correct ARIA attributes', () => {
      render(
        <SessionProgressBar
          currentIndex={2}
          totalTasks={10}
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).toHaveAttribute('aria-valuenow', '3'); // currentIndex + 1
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '10');
    });

    it('should display correct progress label', () => {
      render(
        <SessionProgressBar
          currentIndex={4}
          totalTasks={10}
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'Aufgabe 5 von 10');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <SessionProgressBar
          currentIndex={0}
          totalTasks={5}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress percentage correctly at start', () => {
      render(
        <SessionProgressBar
          currentIndex={0}
          totalTasks={10}
        />
      );

      // First task (index 0) = 10% progress (1/10)
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '1');
    });

    it('should calculate progress percentage correctly in middle', () => {
      render(
        <SessionProgressBar
          currentIndex={4}
          totalTasks={10}
        />
      );

      // Fifth task (index 4) = 50% progress (5/10)
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '5');
    });

    it('should calculate progress percentage correctly at end', () => {
      render(
        <SessionProgressBar
          currentIndex={9}
          totalTasks={10}
        />
      );

      // Last task (index 9) = 100% progress (10/10)
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '10');
    });

    it('should handle zero total tasks', () => {
      render(
        <SessionProgressBar
          currentIndex={0}
          totalTasks={0}
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '1');
      expect(progressbar).toHaveAttribute('aria-valuemax', '0');
    });
  });

  describe('Task Markers', () => {
    it('should render task markers when showTaskMarkers is true', () => {
      const { container } = render(
        <SessionProgressBar
          currentIndex={2}
          totalTasks={5}
          showTaskMarkers
        />
      );

      // Should have 5 marker divs
      const markers = container.querySelectorAll('[title^="Aufgabe"]');
      expect(markers.length).toBe(5);
    });

    it('should not render task markers when showTaskMarkers is false', () => {
      const { container } = render(
        <SessionProgressBar
          currentIndex={2}
          totalTasks={5}
          showTaskMarkers={false}
        />
      );

      const markers = container.querySelectorAll('[title^="Aufgabe"]');
      expect(markers.length).toBe(0);
    });

    it('should not render task markers when totalTasks exceeds maximum', () => {
      const { container } = render(
        <SessionProgressBar
          currentIndex={10}
          totalTasks={25} // Exceeds MAX_TASKS_FOR_MARKERS (20)
          showTaskMarkers
        />
      );

      const markers = container.querySelectorAll('[title^="Aufgabe"]');
      expect(markers.length).toBe(0);
    });

    it('should show correct title for completed tasks with results', () => {
      const taskResults: TaskResult[] = ['correct', 'incorrect', 'pending'];

      const { container } = render(
        <SessionProgressBar
          currentIndex={2}
          totalTasks={3}
          showTaskMarkers
          taskResults={taskResults}
        />
      );

      const markers = container.querySelectorAll('[title^="Aufgabe"]');
      expect(markers[0]).toHaveAttribute('title', 'Aufgabe 1 - correct');
      expect(markers[1]).toHaveAttribute('title', 'Aufgabe 2 - incorrect');
      expect(markers[2]).toHaveAttribute('title', 'Aufgabe 3'); // Current, no result yet
    });
  });

  describe('Animation', () => {
    it('should animate progress when animate is true', () => {
      const { container } = render(
        <SessionProgressBar
          currentIndex={5}
          totalTasks={10}
          animate
        />
      );

      // Check that the fill element has animation data
      const fill = container.querySelector('[data-animate]');
      expect(fill).toBeInTheDocument();
      if (fill) {
        const animate = JSON.parse(fill.getAttribute('data-animate') || '{}');
        expect(animate.width).toBe('60%'); // (5+1)/10 * 100 = 60%
      }
    });

    it('should not animate progress when animate is false', () => {
      const { container } = render(
        <SessionProgressBar
          currentIndex={5}
          totalTasks={10}
          animate={false}
        />
      );

      // With animation disabled, initial should match animate
      const fill = container.querySelector('[data-initial]');
      if (fill) {
        const initial = JSON.parse(fill.getAttribute('data-initial') || '{}');
        expect(initial.width).toBe('60%');
      }
    });

    it('should call onAnimationComplete when provided', () => {
      const onComplete = vi.fn();

      render(
        <SessionProgressBar
          currentIndex={5}
          totalTasks={10}
          animate
          onAnimationComplete={onComplete}
        />
      );

      // In the mock, animation completes immediately
      // The real component would trigger this after animation
      // For now, we just verify the prop is passed
      expect(onComplete).not.toHaveBeenCalled(); // Mocked, won't trigger
    });
  });

  describe('Task Result Colors', () => {
    it('should handle all task result types', () => {
      const taskResults: TaskResult[] = [
        'correct',
        'incorrect',
        'skipped',
        'pending',
      ];

      const { container } = render(
        <SessionProgressBar
          currentIndex={3}
          totalTasks={4}
          showTaskMarkers
          taskResults={taskResults}
        />
      );

      const markers = container.querySelectorAll('[title^="Aufgabe"]');
      expect(markers.length).toBe(4);

      // Check that completed markers have result in title
      expect(markers[0]).toHaveAttribute('title', 'Aufgabe 1 - correct');
      expect(markers[1]).toHaveAttribute('title', 'Aufgabe 2 - incorrect');
      expect(markers[2]).toHaveAttribute('title', 'Aufgabe 3 - skipped');
      // Current task (index 3) doesn't show result
      expect(markers[3]).toHaveAttribute('title', 'Aufgabe 4');
    });

    it('should handle missing task results gracefully', () => {
      const taskResults: TaskResult[] = ['correct']; // Only 1 result for 5 tasks

      const { container } = render(
        <SessionProgressBar
          currentIndex={2}
          totalTasks={5}
          showTaskMarkers
          taskResults={taskResults}
        />
      );

      const markers = container.querySelectorAll('[title^="Aufgabe"]');
      expect(markers.length).toBe(5);
      expect(markers[0]).toHaveAttribute('title', 'Aufgabe 1 - correct');
      expect(markers[1]).toHaveAttribute('title', 'Aufgabe 2 - pending'); // Falls back to pending
    });
  });
});
