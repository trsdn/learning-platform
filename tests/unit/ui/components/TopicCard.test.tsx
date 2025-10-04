import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopicCard } from '@/modules/ui/components/TopicCard';

describe('TopicCard', () => {
  const mockTopic = {
    id: 'test-topic',
    name: 'Mathematik',
    description: 'Lernen Sie die Grundlagen der Mathematik',
    icon: '🔢',
  };

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  // T003: Rendering tests
  it('renders as button element', () => {
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('has type="button" attribute', () => {
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('displays topic name', () => {
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    expect(screen.getByText('Mathematik')).toBeInTheDocument();
  });

  it('displays topic description', () => {
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    expect(screen.getByText('Lernen Sie die Grundlagen der Mathematik')).toBeInTheDocument();
  });

  it('displays icon when provided', () => {
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    expect(screen.getByText('🔢')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });

  it('calls onSelect with topic.id on click', async () => {
    const user = userEvent.setup();
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnSelect).toHaveBeenCalledWith('test-topic');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  // T004: Accessibility attributes
  it('has correct aria-label', () => {
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute(
      'aria-label',
      'Thema Mathematik öffnen - Lernen Sie die Grundlagen der Mathematik'
    );
  });

  it('icon has aria-hidden="true"', () => {
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const icon = screen.getByText('🔢');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('has proper button role (implicit)', () => {
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const button = screen.getByRole('button');
    // Button role should be implicit from <button> element, not explicit
    expect(button).not.toHaveAttribute('role');
  });

  // T006: Keyboard interaction tests
  it('calls onSelect on Enter key press', async () => {
    const user = userEvent.setup();
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');

    expect(mockOnSelect).toHaveBeenCalledWith('test-topic');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onSelect on Space key press', async () => {
    const user = userEvent.setup();
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard(' ');

    expect(mockOnSelect).toHaveBeenCalledWith('test-topic');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('does not call onSelect when disabled', async () => {
    const user = userEvent.setup();
    render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} disabled={true} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });
});
