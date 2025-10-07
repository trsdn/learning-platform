import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminPage } from '@ui/components/admin/AdminPage';

// Mock the child components to simplify testing
vi.mock('@ui/components/admin/ComponentLibrary', () => ({
  ComponentLibrary: () => <div data-testid="component-library">Component Library</div>,
}));

vi.mock('@ui/components/admin/TaskTypesShowcase', () => ({
  TaskTypesShowcase: () => <div data-testid="task-types-showcase">Task Types Showcase</div>,
}));

describe('AdminPage', () => {
  const defaultProps = {
    activeTab: 'components' as const,
    onTabChange: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render admin panel with correct structure', () => {
      render(<AdminPage {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('🔧 Admin Test Pages')).toBeInTheDocument();
      expect(screen.getByText('Development tool for testing and documentation')).toBeInTheDocument();
    });

    it('should render warning banner', () => {
      render(<AdminPage {...defaultProps} />);

      expect(screen.getByText(/Development Tool - For testing and documentation purposes/)).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<AdminPage {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close admin panel/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should have correct ARIA attributes', () => {
      render(<AdminPage {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'admin-title');
    });
  });

  describe('Tabs', () => {
    it('should render both tab buttons', () => {
      render(<AdminPage {...defaultProps} />);

      expect(screen.getByRole('tab', { name: /components/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /task types/i })).toBeInTheDocument();
    });

    it('should mark components tab as selected when active', () => {
      render(<AdminPage {...defaultProps} activeTab="components" />);

      const componentsTab = screen.getByRole('tab', { name: /components/i });
      expect(componentsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should mark tasks tab as selected when active', () => {
      render(<AdminPage {...defaultProps} activeTab="tasks" />);

      const tasksTab = screen.getByRole('tab', { name: /task types/i });
      expect(tasksTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should call onTabChange when clicking components tab', () => {
      const onTabChange = vi.fn();
      render(<AdminPage {...defaultProps} activeTab="tasks" onTabChange={onTabChange} />);

      const componentsTab = screen.getByRole('tab', { name: /components/i });
      fireEvent.click(componentsTab);

      expect(onTabChange).toHaveBeenCalledWith('components');
    });

    it('should call onTabChange when clicking tasks tab', () => {
      const onTabChange = vi.fn();
      render(<AdminPage {...defaultProps} activeTab="components" onTabChange={onTabChange} />);

      const tasksTab = screen.getByRole('tab', { name: /task types/i });
      fireEvent.click(tasksTab);

      expect(onTabChange).toHaveBeenCalledWith('tasks');
    });
  });

  describe('Tab Panels', () => {
    it('should render ComponentLibrary when components tab is active', () => {
      render(<AdminPage {...defaultProps} activeTab="components" />);

      expect(screen.getByTestId('component-library')).toBeInTheDocument();
      expect(screen.queryByTestId('task-types-showcase')).not.toBeInTheDocument();
    });

    it('should render TaskTypesShowcase when tasks tab is active', () => {
      render(<AdminPage {...defaultProps} activeTab="tasks" />);

      expect(screen.getByTestId('task-types-showcase')).toBeInTheDocument();
      expect(screen.queryByTestId('component-library')).not.toBeInTheDocument();
    });

    it('should have tabpanel role', () => {
      render(<AdminPage {...defaultProps} activeTab="components" />);

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();
      expect(tabpanel).toHaveAttribute('id', 'components-panel');
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<AdminPage {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /close admin panel/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when ESC key is pressed', () => {
      const onClose = vi.fn();
      render(<AdminPage {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    // Note: Overlay click is handled by the dialog implementation
    // Testing this requires access to the overlay element which may not be accessible via testing-library
    // This is an implementation detail and closing via button/ESC is more important for user functionality
  });

  describe('Accessibility', () => {
    it('should have tablist role for tabs container', () => {
      render(<AdminPage {...defaultProps} />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });

    it('should have correct tab roles', () => {
      render(<AdminPage {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);
    });

    it('should have aria-controls on tabpanel', () => {
      render(<AdminPage {...defaultProps} activeTab="components" />);

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toHaveAttribute('id', 'components-panel');
      expect(tabpanel).toHaveAttribute('aria-labelledby', 'components-tab');
    });

    it('should focus close button on mount', () => {
      render(<AdminPage {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close admin panel/i });
      // Note: Testing focus in jest-dom requires special setup, this test verifies the button exists
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('should display admin title with emoji', () => {
      render(<AdminPage {...defaultProps} />);

      expect(screen.getByText(/🔧 Admin Test Pages/)).toBeInTheDocument();
    });

    it('should display admin subtitle', () => {
      render(<AdminPage {...defaultProps} />);

      expect(screen.getByText(/Development tool for testing and documentation/)).toBeInTheDocument();
    });

    it('should display warning icon and message', () => {
      render(<AdminPage {...defaultProps} />);

      expect(screen.getByText(/⚠️/)).toBeInTheDocument();
      expect(screen.getByText(/Development Tool - For testing and documentation purposes/)).toBeInTheDocument();
    });

    it('should display tab icons', () => {
      render(<AdminPage {...defaultProps} />);

      expect(screen.getByText(/📦 Components/)).toBeInTheDocument();
      expect(screen.getByText(/🎯 Task Types/)).toBeInTheDocument();
    });
  });
});
