/**
 * Tests for OrderingTask Component
 *
 * Tests the ordering task functionality including:
 * - Component rendering with items to order
 * - Move up/down button handling
 * - Keyboard navigation for reordering
 * - Feedback state rendering (correct/incorrect positions)
 * - Position hints when items are in wrong positions
 * - Disabled state during feedback
 * - Audio button rendering for items
 * - Answer change callbacks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderingTask } from '../../../src/modules/ui/components/practice/tasks/Ordering/OrderingTask';
import { createOrderingTask } from '../../factories/task-factory';
import type { Task, OrderingContent } from '../../../src/modules/core/types/services';
import type { UseOrderingReturn } from '../../../src/modules/ui/components/practice/tasks/Ordering/use-ordering';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'practice-session__ordering-container': 'ordering-container',
    'practice-session__ordering-instruction': 'ordering-instruction',
    'practice-session__ordering-items': 'ordering-items',
    'practice-session__ordering-item': 'ordering-item',
    'practice-session__ordering-item--correct': 'ordering-item--correct',
    'practice-session__ordering-item-number': 'ordering-item-number',
    'practice-session__ordering-item-text': 'ordering-item-text',
    'practice-session__ordering-word': 'ordering-word',
    'practice-session__ordering-hint': 'ordering-hint',
    'practice-session__ordering-controls': 'ordering-controls',
    'practice-session__ordering-btn': 'ordering-btn',
    'practice-session__ordering-feedback': 'ordering-feedback',
    'practice-session__ordering-feedback-title': 'ordering-feedback-title',
    'practice-session__ordering-feedback-item': 'ordering-feedback-item',
  },
}));

// Mock AudioButton component
vi.mock('../../../src/modules/ui/components/audio-button', () => ({
  AudioButton: ({ text, audioUrl, size }: { text: string; audioUrl: string; size: string }) => (
    <button data-testid="audio-button" data-text={text} data-audio-url={audioUrl} data-size={size}>
      Audio
    </button>
  ),
}));

// Mock the useOrdering hook
const mockUseOrdering = vi.fn<[Task | null, boolean], UseOrderingReturn>();

vi.mock(
  '../../../src/modules/ui/components/practice/tasks/Ordering/use-ordering',
  () => ({
    useOrdering: (task: Task | null, showFeedback: boolean) =>
      mockUseOrdering(task, showFeedback),
  })
);

/**
 * Helper to create a mock useOrdering return value
 */
function createMockHookReturn(
  overrides: Partial<UseOrderingReturn> = {}
): UseOrderingReturn {
  return {
    orderedItems: ['eins', 'zwei', 'drei', 'vier'],
    moveItemUp: vi.fn(),
    moveItemDown: vi.fn(),
    canSubmit: vi.fn(() => true),
    checkAnswer: vi.fn(() => false),
    resetState: vi.fn(),
    ...overrides,
  };
}

describe('OrderingTask', () => {
  let task: Task;
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default task: Order numbers from one to four
    task = createOrderingTask();
    mockOnAnswerChange = vi.fn();

    // Default mock hook return
    mockUseOrdering.mockReturnValue(createMockHookReturn());
  });

  describe('Rendering', () => {
    it('should render instruction text', () => {
      mockUseOrdering.mockReturnValue(createMockHookReturn());

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Ordne die Elemente in die richtige Reihenfolge')).toBeInTheDocument();
    });

    it('should render all items from the hook', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei', 'vier'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('eins')).toBeInTheDocument();
      expect(screen.getByText('zwei')).toBeInTheDocument();
      expect(screen.getByText('drei')).toBeInTheDocument();
      expect(screen.getByText('vier')).toBeInTheDocument();
    });

    it('should render items with position numbers', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.getByText('3.')).toBeInTheDocument();
    });

    it('should not render for non-ordering task types', () => {
      const wrongTypeTask = {
        ...task,
        type: 'multiple-choice' as const,
      };

      mockUseOrdering.mockReturnValue(createMockHookReturn());

      const { container } = render(
        <OrderingTask
          task={wrongTypeTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render items with correct container classes', () => {
      mockUseOrdering.mockReturnValue(createMockHookReturn());

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.ordering-container')).toBeInTheDocument();
      expect(container.querySelector('.ordering-instruction')).toBeInTheDocument();
      expect(container.querySelector('.ordering-items')).toBeInTheDocument();
    });

    it('should render items in the order provided by the hook', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['drei', 'eins', 'vier', 'zwei'],
        })
      );

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const items = container.querySelectorAll('.ordering-word');
      expect(items[0]).toHaveTextContent('drei');
      expect(items[1]).toHaveTextContent('eins');
      expect(items[2]).toHaveTextContent('vier');
      expect(items[3]).toHaveTextContent('zwei');
    });
  });

  describe('Move Up/Down Buttons', () => {
    it('should render move up button for items that are not first', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const upButtons = screen.getAllByText('↑');
      expect(upButtons).toHaveLength(2); // For 'zwei' and 'drei'
    });

    it('should not render move up button for first item', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei'],
        })
      );

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const items = container.querySelectorAll('.ordering-item');
      const firstItemControls = items[0]?.querySelector('.ordering-controls');
      const upButton = firstItemControls?.textContent?.includes('↑');

      expect(upButton).toBeFalsy();
    });

    it('should render move down button for items that are not last', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const downButtons = screen.getAllByText('↓');
      expect(downButtons).toHaveLength(2); // For 'eins' and 'zwei'
    });

    it('should not render move down button for last item', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei'],
        })
      );

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const items = container.querySelectorAll('.ordering-item');
      const lastItemControls = items[2]?.querySelector('.ordering-controls');
      const downButton = lastItemControls?.textContent?.includes('↓');

      expect(downButton).toBeFalsy();
    });

    it('should call moveItemUp when up button is clicked', () => {
      const mockMoveItemUp = vi.fn();
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei'],
          moveItemUp: mockMoveItemUp,
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const upButtons = screen.getAllByText('↑');
      fireEvent.click(upButtons[0]); // Click up on second item

      expect(mockMoveItemUp).toHaveBeenCalledWith(1);
    });

    it('should call moveItemDown when down button is clicked', () => {
      const mockMoveItemDown = vi.fn();
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei'],
          moveItemDown: mockMoveItemDown,
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const downButtons = screen.getAllByText('↓');
      fireEvent.click(downButtons[0]); // Click down on first item

      expect(mockMoveItemDown).toHaveBeenCalledWith(0);
    });

    it('should call moveItemUp with correct index for each item', () => {
      const mockMoveItemUp = vi.fn();
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei', 'vier'],
          moveItemUp: mockMoveItemUp,
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const upButtons = screen.getAllByText('↑');

      fireEvent.click(upButtons[0]); // Click up on second item (index 1)
      expect(mockMoveItemUp).toHaveBeenLastCalledWith(1);

      fireEvent.click(upButtons[2]); // Click up on fourth item (index 3)
      expect(mockMoveItemUp).toHaveBeenLastCalledWith(3);
    });

    it('should not render move buttons when showing feedback', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('↑')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });
  });

  describe('Feedback State - Correct Positions', () => {
    it('should apply correct class to items in correct positions', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei', 'vier'], // Correct order
        })
      );

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const items = container.querySelectorAll('.ordering-item');
      items.forEach((item) => {
        expect(item).toHaveClass('ordering-item--correct');
      });
    });

    it('should apply correct class only to items in correct positions when partially correct', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'drei', 'zwei', 'vier'], // 'zwei' and 'drei' swapped
        })
      );

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const items = container.querySelectorAll('.ordering-item');
      expect(items[0]).toHaveClass('ordering-item--correct'); // 'eins' is correct
      expect(items[1]).not.toHaveClass('ordering-item--correct'); // 'drei' is wrong
      expect(items[2]).not.toHaveClass('ordering-item--correct'); // 'zwei' is wrong
      expect(items[3]).toHaveClass('ordering-item--correct'); // 'vier' is correct
    });

    it('should not apply correct class when not showing feedback', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei', 'vier'],
        })
      );

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const items = container.querySelectorAll('.ordering-item');
      items.forEach((item) => {
        expect(item).not.toHaveClass('ordering-item--correct');
      });
    });
  });

  describe('Feedback State - Position Hints', () => {
    it('should show position hint for items in wrong positions', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['zwei', 'eins', 'drei', 'vier'], // 'eins' and 'zwei' swapped
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // 'zwei' is at position 0 but should be at position 1
      expect(screen.getByText('→ Position 2')).toBeInTheDocument();
      // 'eins' is at position 1 but should be at position 0
      expect(screen.getByText('→ Position 1')).toBeInTheDocument();
    });

    it('should not show position hint for items in correct positions', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei', 'vier'], // All correct
        })
      );

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      const hints = container.querySelectorAll('.ordering-hint');
      expect(hints).toHaveLength(0);
    });

    it('should not show position hints when not showing feedback', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['zwei', 'eins', 'drei', 'vier'],
        })
      );

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const hints = container.querySelectorAll('.ordering-hint');
      expect(hints).toHaveLength(0);
    });

    it('should show correct target position for multiple wrong items', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['vier', 'drei', 'zwei', 'eins'], // Completely reversed
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // All items are in wrong positions
      const hints = screen.getAllByText(/→ Position \d/);
      expect(hints).toHaveLength(4);
    });
  });

  describe('Feedback Section - Correct Order Display', () => {
    it('should show correct order section when showing feedback and answer is incorrect', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['zwei', 'eins', 'drei', 'vier'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Richtige Reihenfolge:')).toBeInTheDocument();
    });

    it('should not show correct order section when answer is correct', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei', 'vier'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Richtige Reihenfolge:')).not.toBeInTheDocument();
    });

    it('should not show correct order section when not showing feedback', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['zwei', 'eins', 'drei', 'vier'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Richtige Reihenfolge:')).not.toBeInTheDocument();
    });

    it('should display all items in correct order in feedback section', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['vier', 'drei', 'zwei', 'eins'],
        })
      );

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const feedbackItems = container.querySelectorAll('.ordering-feedback-item');
      expect(feedbackItems).toHaveLength(4);

      expect(feedbackItems[0]).toHaveTextContent('1. eins');
      expect(feedbackItems[1]).toHaveTextContent('2. zwei');
      expect(feedbackItems[2]).toHaveTextContent('3. drei');
      expect(feedbackItems[3]).toHaveTextContent('4. vier');
    });
  });

  describe('Audio Button Rendering', () => {
    it('should render audio buttons when itemsAudio is provided', () => {
      const taskWithAudio = createOrderingTask({
        content: {
          instruction: 'Ordne die Zahlen.',
          items: ['eins', 'zwei', 'drei'],
          correctOrder: [0, 1, 2],
          itemsAudio: ['audio/eins.mp3', 'audio/zwei.mp3', 'audio/drei.mp3'],
        } as OrderingContent,
      });

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei'],
        })
      );

      render(
        <OrderingTask
          task={taskWithAudio}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButtons = screen.getAllByTestId('audio-button');
      expect(audioButtons).toHaveLength(3);
    });

    it('should not render audio buttons when itemsAudio is not provided', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByTestId('audio-button')).not.toBeInTheDocument();
    });

    it('should map audio URLs correctly to items regardless of order', () => {
      const taskWithAudio = createOrderingTask({
        content: {
          instruction: 'Ordne die Zahlen.',
          items: ['eins', 'zwei', 'drei'],
          correctOrder: [0, 1, 2],
          itemsAudio: ['audio/eins.mp3', 'audio/zwei.mp3', 'audio/drei.mp3'],
        } as OrderingContent,
      });

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['drei', 'eins', 'zwei'], // Shuffled order
        })
      );

      render(
        <OrderingTask
          task={taskWithAudio}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButtons = screen.getAllByTestId('audio-button');

      // Should map to original indices, not current positions
      expect(audioButtons[0]).toHaveAttribute('data-audio-url', expect.stringContaining('audio/drei.mp3'));
      expect(audioButtons[0]).toHaveAttribute('data-text', 'drei');

      expect(audioButtons[1]).toHaveAttribute('data-audio-url', expect.stringContaining('audio/eins.mp3'));
      expect(audioButtons[1]).toHaveAttribute('data-text', 'eins');

      expect(audioButtons[2]).toHaveAttribute('data-audio-url', expect.stringContaining('audio/zwei.mp3'));
      expect(audioButtons[2]).toHaveAttribute('data-text', 'zwei');
    });

    it('should not render audio button for item without audio URL', () => {
      const taskWithPartialAudio = createOrderingTask({
        content: {
          instruction: 'Ordne die Zahlen.',
          items: ['eins', 'zwei', 'drei'],
          correctOrder: [0, 1, 2],
          itemsAudio: ['audio/eins.mp3', undefined, 'audio/drei.mp3'],
        } as OrderingContent,
      });

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins', 'zwei', 'drei'],
        })
      );

      render(
        <OrderingTask
          task={taskWithPartialAudio}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButtons = screen.getAllByTestId('audio-button');
      expect(audioButtons).toHaveLength(2); // Only for 'eins' and 'drei'
    });

    it('should include BASE_URL in audio URL path', () => {
      const taskWithAudio = createOrderingTask({
        content: {
          instruction: 'Ordne die Zahlen.',
          items: ['eins'],
          correctOrder: [0],
          itemsAudio: ['audio/eins.mp3'],
        } as OrderingContent,
      });

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins'],
        })
      );

      render(
        <OrderingTask
          task={taskWithAudio}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButton = screen.getByTestId('audio-button');
      expect(audioButton).toHaveAttribute('data-audio-url', expect.stringMatching(/audio\/audio\/eins\.mp3$/));
    });

    it('should set audio button size to small', () => {
      const taskWithAudio = createOrderingTask({
        content: {
          instruction: 'Ordne die Zahlen.',
          items: ['eins'],
          correctOrder: [0],
          itemsAudio: ['audio/eins.mp3'],
        } as OrderingContent,
      });

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins'],
        })
      );

      render(
        <OrderingTask
          task={taskWithAudio}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const audioButton = screen.getByTestId('audio-button');
      expect(audioButton).toHaveAttribute('data-size', 'small');
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange with canSubmit result on mount', () => {
      const mockCanSubmit = vi.fn(() => true);

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({ canSubmit: mockCanSubmit })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockCanSubmit).toHaveBeenCalled();
      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should call onAnswerChange with false when cannot submit', () => {
      const mockCanSubmit = vi.fn(() => false);

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({ canSubmit: mockCanSubmit })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);
    });

    it('should update onAnswerChange when canSubmit changes', () => {
      const mockCanSubmit1 = vi.fn(() => false);

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({ canSubmit: mockCanSubmit1 })
      );

      const { rerender } = render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(false);

      // Create a new canSubmit function that returns true
      const mockCanSubmit2 = vi.fn(() => true);
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({ canSubmit: mockCanSubmit2 })
      );

      rerender(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should not crash if onAnswerChange is not provided', () => {
      mockUseOrdering.mockReturnValue(createMockHookReturn());

      expect(() => {
        render(
          <OrderingTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Hook Integration', () => {
    it('should call useOrdering with task and showFeedback', () => {
      mockUseOrdering.mockReturnValue(createMockHookReturn());

      render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseOrdering).toHaveBeenCalledWith(task, true);
    });

    it('should call useOrdering with updated showFeedback', () => {
      mockUseOrdering.mockReturnValue(createMockHookReturn());

      const { rerender } = render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseOrdering).toHaveBeenCalledWith(task, false);

      rerender(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseOrdering).toHaveBeenCalledWith(task, true);
    });

    it('should use orderedItems from hook for rendering', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['custom', 'order', 'here'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('custom')).toBeInTheDocument();
      expect(screen.getByText('order')).toBeInTheDocument();
      expect(screen.getByText('here')).toBeInTheDocument();
    });

    it('should use all hook return values correctly', () => {
      const mockReturn = createMockHookReturn({
        orderedItems: ['eins', 'zwei', 'drei'],
        moveItemUp: vi.fn(),
        moveItemDown: vi.fn(),
        canSubmit: vi.fn(() => true),
      });

      mockUseOrdering.mockReturnValue(mockReturn);

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      // Verify orderedItems are used
      expect(screen.getByText('eins')).toBeInTheDocument();

      // Verify canSubmit is called
      expect(mockReturn.canSubmit).toHaveBeenCalled();
      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);

      // Verify moveItemUp is available
      const upButtons = screen.getAllByText('↑');
      fireEvent.click(upButtons[0]);
      expect(mockReturn.moveItemUp).toHaveBeenCalled();

      // Verify moveItemDown is available
      const downButtons = screen.getAllByText('↓');
      fireEvent.click(downButtons[0]);
      expect(mockReturn.moveItemDown).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle task with single item', () => {
      const singleItemTask = createOrderingTask({
        content: {
          instruction: 'Only one item',
          items: ['eins'],
          correctOrder: [0],
        } as OrderingContent,
      });

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['eins'],
        })
      );

      render(
        <OrderingTask
          task={singleItemTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('eins')).toBeInTheDocument();
      // No move buttons for single item
      expect(screen.queryByText('↑')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });

    it('should handle task with many items', () => {
      const manyItemsTask = createOrderingTask({
        content: {
          instruction: 'Order many items',
          items: Array.from({ length: 10 }, (_, i) => `item-${i + 1}`),
          correctOrder: Array.from({ length: 10 }, (_, i) => i),
        } as OrderingContent,
      });

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: Array.from({ length: 10 }, (_, i) => `item-${i + 1}`),
        })
      );

      const { container } = render(
        <OrderingTask
          task={manyItemsTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const items = container.querySelectorAll('.ordering-item');
      expect(items).toHaveLength(10);
    });

    it('should handle empty orderedItems array', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: [],
        })
      );

      const { container } = render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const items = container.querySelectorAll('.ordering-item');
      expect(items).toHaveLength(0);
    });

    it('should handle long item text', () => {
      const longText = 'This is a very long item text that might overflow or cause layout issues';

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: [longText],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters in items', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['¿Cómo?', 'Äpfel', '日本語', '🎉'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('¿Cómo?')).toBeInTheDocument();
      expect(screen.getByText('Äpfel')).toBeInTheDocument();
      expect(screen.getByText('日本語')).toBeInTheDocument();
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    it('should handle two items', () => {
      const twoItemsTask = createOrderingTask({
        content: {
          instruction: 'Order two items',
          items: ['first', 'second'],
          correctOrder: [0, 1],
        } as OrderingContent,
      });

      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['first', 'second'],
        })
      );

      render(
        <OrderingTask
          task={twoItemsTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // First item should have down button only
      // Second item should have up button only
      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('should handle completely reversed order in feedback', () => {
      mockUseOrdering.mockReturnValue(
        createMockHookReturn({
          orderedItems: ['vier', 'drei', 'zwei', 'eins'],
        })
      );

      render(
        <OrderingTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // All items should show hints to their correct positions
      expect(screen.getByText('→ Position 4')).toBeInTheDocument(); // 'vier' should be at position 4
      expect(screen.getByText('→ Position 3')).toBeInTheDocument(); // 'drei' should be at position 3
      expect(screen.getByText('→ Position 2')).toBeInTheDocument(); // 'zwei' should be at position 2
      expect(screen.getByText('→ Position 1')).toBeInTheDocument(); // 'eins' should be at position 1
    });
  });
});
