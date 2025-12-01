import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentLibrary } from '@ui/components/admin/ComponentLibrary';

// Mock ComponentDemo to simplify testing
vi.mock('@ui/components/admin/ComponentDemo', () => ({
  ComponentDemo: ({ meta }: { meta: { id: string; name: string } }) => (
    <div data-testid={`component-demo-${meta.id}`}>
      {meta.name}
    </div>
  ),
}));

describe('ComponentLibrary', () => {
  describe('Rendering', () => {
    it('should render library header', () => {
      render(<ComponentLibrary />);

      expect(screen.getByText(/Component Library/)).toBeInTheDocument();
      expect(screen.getByText(/Interactive showcase of all 12 UI components with live previews and code examples/)).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<ComponentLibrary />);

      const searchInput = screen.getByPlaceholderText(/search components/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should render category filter buttons', () => {
      render(<ComponentLibrary />);

      expect(screen.getByRole('button', { name: /All \(12\)/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cards/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Common/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Feedback/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Forms/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Interactive/ })).toBeInTheDocument();
    });

    it('should render results count', () => {
      render(<ComponentLibrary />);

      expect(screen.getByText(/Showing 12 of 12 components/)).toBeInTheDocument();
    });

    it('should render all 12 component demos', () => {
      render(<ComponentLibrary />);

      expect(screen.getByTestId('component-demo-button')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-card')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-input')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-select')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-slider')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-checkbox')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-feedbackCard')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-iconButton')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-masteryBar')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-statCard')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-topicCard')).toBeInTheDocument();
      expect(screen.getByTestId('component-demo-audioButton')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter components when searching', () => {
      render(<ComponentLibrary />);

      const searchInput = screen.getByPlaceholderText(/search components/i);
      fireEvent.change(searchInput, { target: { value: 'button' } });

      // Should find Button, IconButton, and AudioButton
      expect(screen.getByText(/Showing 3 of 12 components/)).toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
      render(<ComponentLibrary />);

      const searchInput = screen.getByPlaceholderText(/search components/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText(/No components found matching "nonexistent"/)).toBeInTheDocument();
    });

    it('should show clear button when search has text', () => {
      render(<ComponentLibrary />);

      const searchInput = screen.getByPlaceholderText(/search components/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', () => {
      render(<ComponentLibrary />);

      const searchInput = screen.getByPlaceholderText(/search components/i);
      fireEvent.change(searchInput, { target: { value: 'button' } });

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
      expect(screen.getByText(/Showing 12 of 12 components/)).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should set All category as active by default', () => {
      render(<ComponentLibrary />);

      const allButton = screen.getByRole('button', { name: /All \(12\)/ });
      // Check that it has a class name containing "active" (CSS modules generate unique names)
      expect(allButton.className).toMatch(/active/i);
    });

    it('should filter by Cards category', () => {
      render(<ComponentLibrary />);

      const cardsButton = screen.getByRole('button', { name: /Cards/ });
      fireEvent.click(cardsButton);

      // Should show TopicCard, StatCard, FeedbackCard
      expect(screen.getByText(/Showing 3 of 12 components/)).toBeInTheDocument();
    });

    it('should filter by Common category', () => {
      render(<ComponentLibrary />);

      const commonButton = screen.getByRole('button', { name: /Common/ });
      fireEvent.click(commonButton);

      // Should show Button, Card
      expect(screen.getByText(/Showing 2 of 12 components/)).toBeInTheDocument();
    });

    it('should filter by Forms category', () => {
      render(<ComponentLibrary />);

      const formsButton = screen.getByRole('button', { name: /Forms/ });
      fireEvent.click(formsButton);

      // Should show Input, Select, Slider, Checkbox
      expect(screen.getByText(/Showing 4 of 12 components/)).toBeInTheDocument();
    });

    it('should filter by Feedback category', () => {
      render(<ComponentLibrary />);

      const feedbackButton = screen.getByRole('button', { name: /Feedback/ });
      fireEvent.click(feedbackButton);

      // Should show FeedbackCard, MasteryBar
      expect(screen.getByText(/Showing 2 of 12 components/)).toBeInTheDocument();
    });

    it('should filter by Interactive category', () => {
      render(<ComponentLibrary />);

      const interactiveButton = screen.getByRole('button', { name: /Interactive/ });
      fireEvent.click(interactiveButton);

      // Should show AudioButton
      expect(screen.getByText(/Showing 1 of 12 components/)).toBeInTheDocument();
    });

    it('should reset to all when clicking All button', () => {
      render(<ComponentLibrary />);

      const cardsButton = screen.getByRole('button', { name: /Cards/ });
      fireEvent.click(cardsButton);

      const allButton = screen.getByRole('button', { name: /All \(12\)/ });
      fireEvent.click(allButton);

      expect(screen.getByText(/Showing 12 of 12 components/)).toBeInTheDocument();
    });
  });

  describe('Combined Search and Filtering', () => {
    it('should apply both search and category filter', () => {
      render(<ComponentLibrary />);

      const searchInput = screen.getByPlaceholderText(/search components/i);
      fireEvent.change(searchInput, { target: { value: 'card' } });

      const cardsButton = screen.getByRole('button', { name: /Cards/ });
      fireEvent.click(cardsButton);

      // Should show TopicCard, StatCard, FeedbackCard
      expect(screen.getByText(/Showing 3 of 12 components/)).toBeInTheDocument();
    });

    it('should clear search but keep category filter', () => {
      render(<ComponentLibrary />);

      const searchInput = screen.getByPlaceholderText(/search components/i);
      fireEvent.change(searchInput, { target: { value: 'button' } });

      const formsButton = screen.getByRole('button', { name: /Forms/ });
      fireEvent.click(formsButton);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearButton);

      // Should still show forms filtered results
      expect(screen.getByText(/Showing 4 of 12 components/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible search input', () => {
      render(<ComponentLibrary />);

      const searchInput = screen.getByPlaceholderText(/search components/i);
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should have accessible clear button with aria-label', () => {
      render(<ComponentLibrary />);

      const searchInput = screen.getByPlaceholderText(/search components/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toHaveAttribute('aria-label');
    });

    it('should have heading with correct level', () => {
      render(<ComponentLibrary />);

      const heading = screen.getByRole('heading', { name: /Component Library/ });
      expect(heading).toBeInTheDocument();
    });
  });
});
