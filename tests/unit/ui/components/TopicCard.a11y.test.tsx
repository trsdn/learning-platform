import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import '../../../setup/a11y-matchers';
import { TopicCard } from '@/modules/ui/components/TopicCard';

describe('TopicCard Accessibility', () => {
  const mockTopic = {
    id: 'test-topic',
    name: 'Mathematik',
    description: 'Lernen Sie die Grundlagen der Mathematik',
    icon: '🔢',
  };

  const mockOnSelect = vi.fn();

  // T005: WCAG compliance tests
  it('has no WCAG violations', async () => {
    const { container } = render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('meets WCAG 2.1.1 (Keyboard)', () => {
    const { container } = render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const button = container.querySelector('button');
    expect(button).toBeTruthy();

    // Button should be focusable (tabindex not -1)
    expect(button?.getAttribute('tabindex')).not.toBe('-1');

    // Button element provides keyboard support automatically
    expect(button?.tagName).toBe('BUTTON');
  });

  it('meets WCAG 4.1.2 (Name, Role, Value)', () => {
    const { container } = render(<TopicCard topic={mockTopic} onSelect={mockOnSelect} />);

    const button = container.querySelector('button');
    expect(button).toBeTruthy();

    // Has accessible name via aria-label
    expect(button?.getAttribute('aria-label')).toBe(
      'Thema Mathematik öffnen - Lernen Sie die Grundlagen der Mathematik'
    );

    // Has button role (implicit from <button> element)
    expect(button?.tagName).toBe('BUTTON');
  });

  it('has no violations with multiple cards', async () => {
    const topics = [
      { id: '1', name: 'Mathematik', description: 'Math description', icon: '🔢' },
      { id: '2', name: 'Biologie', description: 'Bio description', icon: '🧬' },
      { id: '3', name: 'Geschichte', description: 'History description', icon: '📚' },
    ];

    const { container } = render(
      <div>
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onSelect={mockOnSelect} />
        ))}
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
