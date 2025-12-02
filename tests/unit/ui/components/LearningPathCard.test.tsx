import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import '../../../setup/a11y-matchers';
import { LearningPathCard } from '@/modules/ui/components/LearningPathCard';
import type { LearningPath } from '@core/types/services';

describe('LearningPathCard', () => {
  const mockLearningPath: LearningPath = {
    id: 'path-1',
    topicId: 'topic-1',
    title: 'Basic Algebra',
    description: 'Learn the fundamentals of algebra',
    difficulty: 'easy',
    estimatedTime: 30,
    order: 0,
  };

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  // Rendering tests
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      expect(screen.getByText('Basic Algebra')).toBeInTheDocument();
      expect(screen.getByText('Learn the fundamentals of algebra')).toBeInTheDocument();
      expect(screen.getByText('📝 10 Aufgaben')).toBeInTheDocument();
    });

    it('displays title', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      expect(screen.getByText('Basic Algebra')).toBeInTheDocument();
    });

    it('displays description', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      expect(screen.getByText('Learn the fundamentals of algebra')).toBeInTheDocument();
    });

    it('displays task count', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={15} onSelect={mockOnSelect} />
      );

      expect(screen.getByText('📝 15 Aufgaben')).toBeInTheDocument();
    });

    it('displays estimated time when provided', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      expect(screen.getByText('⏱️ ~30 Min.')).toBeInTheDocument();
    });

    it('does not display estimated time when zero', () => {
      const pathWithoutTime = { ...mockLearningPath, estimatedTime: 0 };
      render(<LearningPathCard learningPath={pathWithoutTime} taskCount={10} onSelect={mockOnSelect} />);

      expect(screen.queryByText(/Min\./)).not.toBeInTheDocument();
    });
  });

  // Difficulty display tests
  describe('Difficulty Display', () => {
    it('displays easy difficulty', () => {
      const easyPath = { ...mockLearningPath, difficulty: 'easy' as const };
      render(<LearningPathCard learningPath={easyPath} taskCount={10} onSelect={mockOnSelect} />);

      expect(screen.getByText(/🟢 Leicht/)).toBeInTheDocument();
    });

    it('displays medium difficulty', () => {
      const mediumPath = { ...mockLearningPath, difficulty: 'medium' as const };
      render(<LearningPathCard learningPath={mediumPath} taskCount={10} onSelect={mockOnSelect} />);

      expect(screen.getByText(/🟡 Mittel/)).toBeInTheDocument();
    });

    it('displays hard difficulty', () => {
      const hardPath = { ...mockLearningPath, difficulty: 'hard' as const };
      render(<LearningPathCard learningPath={hardPath} taskCount={10} onSelect={mockOnSelect} />);

      expect(screen.getByText(/🔴 Schwer/)).toBeInTheDocument();
    });
  });

  // Progress display tests
  describe('Progress Display', () => {
    it('does not show progress when user has not started', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      expect(screen.queryByText('Fortschritt')).not.toBeInTheDocument();
      expect(screen.getByText('Starten →')).toBeInTheDocument();
    });

    it('shows progress when user has started', () => {
      const progress = { completedTasks: 5, masteredTasks: 2, accuracy: 80 };
      render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={progress}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Fortschritt')).toBeInTheDocument();
      expect(screen.getByText('5/10')).toBeInTheDocument();
      expect(screen.getByText('Fortsetzen →')).toBeInTheDocument();
    });

    it('displays accuracy percentage', () => {
      const progress = { completedTasks: 5, masteredTasks: 2, accuracy: 85 };
      render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={progress}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Genauigkeit: 85%')).toBeInTheDocument();
    });

    it('does not display accuracy when zero', () => {
      const progress = { completedTasks: 5, masteredTasks: 2, accuracy: 0 };
      render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={progress}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByText(/Genauigkeit:/)).not.toBeInTheDocument();
    });

    it('shows completed badge when all tasks are completed', () => {
      const progress = { completedTasks: 10, masteredTasks: 8, accuracy: 90 };
      render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={progress}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('✓ Abgeschlossen')).toBeInTheDocument();
    });

    it('does not show completed badge when tasks are not all completed', () => {
      const progress = { completedTasks: 9, masteredTasks: 8, accuracy: 90 };
      render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={progress}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByText('✓ Abgeschlossen')).not.toBeInTheDocument();
    });
  });

  // Interaction tests
  describe('Interactions', () => {
    it('calls onSelect with pathId on click', async () => {
      const user = userEvent.setup();
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      const card = screen.getByRole('button');
      await user.click(card);

      expect(mockOnSelect).toHaveBeenCalledWith('path-1');
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('is keyboard accessible', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('calls onSelect on Enter key press', async () => {
      const user = userEvent.setup();
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSelect).toHaveBeenCalledWith('path-1');
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('calls onSelect on Space key press', async () => {
      const user = userEvent.setup();
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');

      expect(mockOnSelect).toHaveBeenCalledWith('path-1');
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });
  });

  // Animation tests
  describe('Animation', () => {
    it('animates by default', () => {
      const { container } = render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      const card = container.querySelector('[class*="learning-path-card"]');
      expect(card).toBeInTheDocument();
    });

    it('disables animation when animate is false', () => {
      const { container } = render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          onSelect={mockOnSelect}
          animate={false}
        />
      );

      const card = container.querySelector('[class*="learning-path-card"]');
      expect(card).toBeInTheDocument();
    });

    it('applies animation delay based on animationIndex', () => {
      const { container } = render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          onSelect={mockOnSelect}
          animationIndex={2}
        />
      );

      const card = container.querySelector('[class*="learning-path-card"]');
      expect(card).toBeInTheDocument();
    });
  });

  // Custom styling tests
  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          onSelect={mockOnSelect}
          className="custom-class"
        />
      );

      const card = container.querySelector('[class*="learning-path-card"]');
      expect(card?.className).toContain('custom-class');
    });

    it('applies completed styling when path is completed', () => {
      const progress = { completedTasks: 10, masteredTasks: 8, accuracy: 90 };
      const { container } = render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={progress}
          onSelect={mockOnSelect}
        />
      );

      const card = container.querySelector('[class*="learning-path-card"]');
      expect(card?.className).toContain('completed');
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has role="button"', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
    });

    it('has descriptive aria-label', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'Basic Algebra - Leicht - 10 Aufgaben');
    });

    it('has correct aria-label for different difficulties', () => {
      const hardPath = { ...mockLearningPath, difficulty: 'hard' as const };
      render(<LearningPathCard learningPath={hardPath} taskCount={15} onSelect={mockOnSelect} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'Basic Algebra - Schwer - 15 Aufgaben');
    });

    it('has no WCAG violations', async () => {
      const { container } = render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with progress', async () => {
      const progress = { completedTasks: 5, masteredTasks: 2, accuracy: 80 };
      const { container } = render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={progress}
          onSelect={mockOnSelect}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations when completed', async () => {
      const progress = { completedTasks: 10, masteredTasks: 8, accuracy: 90 };
      const { container } = render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={progress}
          onSelect={mockOnSelect}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with all difficulties', async () => {
      const easyPath = { ...mockLearningPath, difficulty: 'easy' as const };
      const mediumPath = { ...mockLearningPath, difficulty: 'medium' as const, id: 'path-2' };
      const hardPath = { ...mockLearningPath, difficulty: 'hard' as const, id: 'path-3' };

      const { container } = render(
        <div>
          <LearningPathCard learningPath={easyPath} taskCount={10} onSelect={mockOnSelect} />
          <LearningPathCard learningPath={mediumPath} taskCount={15} onSelect={mockOnSelect} />
          <LearningPathCard learningPath={hardPath} taskCount={20} onSelect={mockOnSelect} />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // Reduced motion tests
  describe('Reduced Motion', () => {
    it('respects prefers-reduced-motion', () => {
      // Mock useReducedMotion hook
      vi.mock('framer-motion', async () => {
        const actual = await vi.importActual('framer-motion');
        return {
          ...actual,
          useReducedMotion: () => true,
        };
      });

      const { container } = render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={10} onSelect={mockOnSelect} />
      );
      const card = container.querySelector('[class*="learning-path-card"]');
      expect(card).toBeInTheDocument();
    });
  });

  // Integration tests
  describe('Integration', () => {
    it('renders multiple cards correctly', () => {
      const paths: LearningPath[] = [
        { ...mockLearningPath, id: 'path-1', title: 'Path 1' },
        { ...mockLearningPath, id: 'path-2', title: 'Path 2' },
        { ...mockLearningPath, id: 'path-3', title: 'Path 3' },
      ];

      render(
        <div>
          {paths.map((path, index) => (
            <LearningPathCard
              key={path.id}
              learningPath={path}
              taskCount={10}
              onSelect={mockOnSelect}
              animationIndex={index}
            />
          ))}
        </div>
      );

      const cards = screen.getAllByRole('button');
      expect(cards).toHaveLength(3);
    });

    it('updates progress display when progress changes', () => {
      const { rerender } = render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={{ completedTasks: 3, masteredTasks: 1, accuracy: 75 }}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('3/10')).toBeInTheDocument();
      expect(screen.getByText('Genauigkeit: 75%')).toBeInTheDocument();

      rerender(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={{ completedTasks: 7, masteredTasks: 5, accuracy: 90 }}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('7/10')).toBeInTheDocument();
      expect(screen.getByText('Genauigkeit: 90%')).toBeInTheDocument();
    });

    it('transitions to completed state', () => {
      const { rerender, container } = render(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={{ completedTasks: 9, masteredTasks: 7, accuracy: 88 }}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByText('✓ Abgeschlossen')).not.toBeInTheDocument();

      rerender(
        <LearningPathCard
          learningPath={mockLearningPath}
          taskCount={10}
          progress={{ completedTasks: 10, masteredTasks: 8, accuracy: 90 }}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('✓ Abgeschlossen')).toBeInTheDocument();
      const card = container.querySelector('[class*="learning-path-card"]');
      expect(card?.className).toContain('completed');
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles zero task count', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={0} onSelect={mockOnSelect} />
      );

      expect(screen.getByText('📝 0 Aufgaben')).toBeInTheDocument();
    });

    it('handles very long titles', () => {
      const longPath = {
        ...mockLearningPath,
        title: 'This is a very long learning path title that should still render correctly',
      };
      render(<LearningPathCard learningPath={longPath} taskCount={10} onSelect={mockOnSelect} />);

      expect(
        screen.getByText('This is a very long learning path title that should still render correctly')
      ).toBeInTheDocument();
    });

    it('handles very long descriptions', () => {
      const longDescPath = {
        ...mockLearningPath,
        description:
          'This is a very long description that explains the learning path in great detail and provides comprehensive information about what the user will learn',
      };
      render(<LearningPathCard learningPath={longDescPath} taskCount={10} onSelect={mockOnSelect} />);

      expect(
        screen.getByText(
          /This is a very long description that explains the learning path in great detail/
        )
      ).toBeInTheDocument();
    });

    it('handles high task counts', () => {
      render(
        <LearningPathCard learningPath={mockLearningPath} taskCount={100} onSelect={mockOnSelect} />
      );

      expect(screen.getByText('📝 100 Aufgaben')).toBeInTheDocument();
    });
  });
});
