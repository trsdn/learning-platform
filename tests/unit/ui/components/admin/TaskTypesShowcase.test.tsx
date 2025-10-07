import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskTypesShowcase } from '@ui/components/admin/TaskTypesShowcase';

// Mock TaskDemo to simplify testing
vi.mock('@ui/components/admin/TaskDemo', () => ({
  TaskDemo: ({ meta }: any) => (
    <div data-testid={`task-demo-${meta.id}`}>
      {meta.name}
    </div>
  ),
}));

describe('TaskTypesShowcase', () => {
  describe('Rendering', () => {
    it('should render showcase header', () => {
      render(<TaskTypesShowcase />);

      expect(screen.getByText(/Task Types Showcase/)).toBeInTheDocument();
      expect(screen.getByText(/Interactive examples of all 9 task types with 19 sample tasks/)).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<TaskTypesShowcase />);

      const searchInput = screen.getByPlaceholderText(/search task types/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should render difficulty filter buttons', () => {
      render(<TaskTypesShowcase />);

      expect(screen.getByRole('button', { name: /All \(9\)/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Easy/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Medium/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Hard/ })).toBeInTheDocument();
    });

    it('should render results count', () => {
      render(<TaskTypesShowcase />);

      expect(screen.getByText(/Showing 9 of 9 task types/)).toBeInTheDocument();
    });

    it('should render all 9 task type demos', () => {
      render(<TaskTypesShowcase />);

      expect(screen.getByTestId('task-demo-flashcard')).toBeInTheDocument();
      expect(screen.getByTestId('task-demo-multiple-choice')).toBeInTheDocument();
      expect(screen.getByTestId('task-demo-multiple-select')).toBeInTheDocument();
      expect(screen.getByTestId('task-demo-true-false')).toBeInTheDocument();
      expect(screen.getByTestId('task-demo-cloze-deletion')).toBeInTheDocument();
      expect(screen.getByTestId('task-demo-matching')).toBeInTheDocument();
      expect(screen.getByTestId('task-demo-ordering')).toBeInTheDocument();
      expect(screen.getByTestId('task-demo-slider')).toBeInTheDocument();
      expect(screen.getByTestId('task-demo-word-scramble')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter task types when searching', () => {
      render(<TaskTypesShowcase />);

      const searchInput = screen.getByPlaceholderText(/search task types/i);
      fireEvent.change(searchInput, { target: { value: 'flashcard' } });

      expect(screen.getByText(/Showing 1 of 9 task types/)).toBeInTheDocument();
      expect(screen.getByTestId('task-demo-flashcard')).toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
      render(<TaskTypesShowcase />);

      const searchInput = screen.getByPlaceholderText(/search task types/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText(/No task types found matching "nonexistent"/)).toBeInTheDocument();
    });

    it('should show clear button when search has text', () => {
      render(<TaskTypesShowcase />);

      const searchInput = screen.getByPlaceholderText(/search task types/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', () => {
      render(<TaskTypesShowcase />);

      const searchInput = screen.getByPlaceholderText(/search task types/i);
      fireEvent.change(searchInput, { target: { value: 'flashcard' } });

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
      expect(screen.getByText(/Showing 9 of 9 task types/)).toBeInTheDocument();
    });
  });

  describe('Difficulty Filtering', () => {
    it('should set All filter as active by default', () => {
      render(<TaskTypesShowcase />);

      const allButton = screen.getByRole('button', { name: /All \(9\)/ });
      // Check that it has a class name containing "active" (CSS modules generate unique names)
      expect(allButton.className).toMatch(/active/i);
    });

    it('should filter by easy difficulty', () => {
      render(<TaskTypesShowcase />);

      const easyButton = screen.getByRole('button', { name: /Easy/ });
      fireEvent.click(easyButton);

      expect(screen.getByText(/Showing 6 of 9 task types/)).toBeInTheDocument();
    });

    it('should filter by medium difficulty', () => {
      render(<TaskTypesShowcase />);

      const mediumButton = screen.getByRole('button', { name: /Medium/ });
      fireEvent.click(mediumButton);

      expect(screen.getByText(/Showing 9 of 9 task types/)).toBeInTheDocument();
    });

    it('should filter by hard difficulty', () => {
      render(<TaskTypesShowcase />);

      const hardButton = screen.getByRole('button', { name: /Hard/ });
      fireEvent.click(hardButton);

      expect(screen.getByText(/Showing 5 of 9 task types/)).toBeInTheDocument();
    });

    it('should reset to all when clicking All button', () => {
      render(<TaskTypesShowcase />);

      const easyButton = screen.getByRole('button', { name: /Easy/ });
      fireEvent.click(easyButton);

      const allButton = screen.getByRole('button', { name: /All \(9\)/ });
      fireEvent.click(allButton);

      expect(screen.getByText(/Showing 9 of 9 task types/)).toBeInTheDocument();
    });
  });

  describe('Combined Search and Filtering', () => {
    it('should apply both search and difficulty filter', () => {
      render(<TaskTypesShowcase />);

      const searchInput = screen.getByPlaceholderText(/search task types/i);
      fireEvent.change(searchInput, { target: { value: 'multiple' } });

      const mediumButton = screen.getByRole('button', { name: /Medium/ });
      fireEvent.click(mediumButton);

      // Both multiple-choice and multiple-select have medium difficulty
      expect(screen.getByText(/Showing 2 of 9 task types/)).toBeInTheDocument();
    });

    it('should clear search but keep difficulty filter', () => {
      render(<TaskTypesShowcase />);

      const searchInput = screen.getByPlaceholderText(/search task types/i);
      fireEvent.change(searchInput, { target: { value: 'flashcard' } });

      const mediumButton = screen.getByRole('button', { name: /Medium/ });
      fireEvent.click(mediumButton);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearButton);

      // Should still show medium filtered results
      expect(screen.getByText(/Showing 9 of 9 task types/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible search input', () => {
      render(<TaskTypesShowcase />);

      const searchInput = screen.getByPlaceholderText(/search task types/i);
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should have accessible clear button with aria-label', () => {
      render(<TaskTypesShowcase />);

      const searchInput = screen.getByPlaceholderText(/search task types/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toHaveAttribute('aria-label');
    });

    it('should have heading with correct level', () => {
      render(<TaskTypesShowcase />);

      const heading = screen.getByRole('heading', { name: /Task Types Showcase/ });
      expect(heading).toBeInTheDocument();
    });
  });
});
