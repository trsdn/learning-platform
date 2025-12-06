/**
 * Tests for ErrorDetectionTask Component
 *
 * Tests the error detection task functionality including:
 * - Component rendering with text containing errors
 * - Word/segment selection for marking errors
 * - Feedback state rendering (correct/missed/false positive)
 * - Disabled state during feedback
 * - Multiple error detection
 * - Error count display
 * - Score calculation and display
 * - Keyboard navigation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDetectionTask } from '../../../src/modules/ui/components/practice/tasks/ErrorDetection/ErrorDetectionTask';
import {
  createErrorDetectionTask,
  createErrorDetectionTaskNoErrors,
  createErrorDetectionTaskMultiWord,
} from '../../factories/task-factory';
import type { Task, ErrorDetectionContent } from '../../../src/modules/core/types/services';
import type { UseErrorDetectionReturn } from '../../../src/modules/ui/components/practice/tasks/ErrorDetection/use-error-detection';

// Mock the CSS modules
vi.mock('../../../src/modules/ui/components/practice-session.module.css', () => ({
  default: {
    'error-detection__container': 'error-detection__container',
    'error-detection__instruction': 'error-detection__instruction',
    'error-detection__hint': 'error-detection__hint',
    'error-detection__content': 'error-detection__content',
    'error-detection__segment': 'error-detection__segment',
    'error-detection__segment--selected': 'error-detection__segment--selected',
    'error-detection__segment--focused': 'error-detection__segment--focused',
    'error-detection__segment--correct-hit': 'error-detection__segment--correct-hit',
    'error-detection__segment--missed-error': 'error-detection__segment--missed-error',
    'error-detection__segment--false-positive': 'error-detection__segment--false-positive',
    'error-detection__counter': 'error-detection__counter',
    'error-detection__feedback': 'error-detection__feedback',
    'error-detection__score': 'error-detection__score',
    'error-detection__false-positives': 'error-detection__false-positives',
    'error-detection__corrections-title': 'error-detection__corrections-title',
    'error-detection__corrections': 'error-detection__corrections',
    'error-detection__correction': 'error-detection__correction',
    'error-detection__error-text': 'error-detection__error-text',
    'error-detection__arrow': 'error-detection__arrow',
    'error-detection__correct-text': 'error-detection__correct-text',
    'error-detection__explanation': 'error-detection__explanation',
  },
}));

// Mock the useErrorDetection hook
const mockUseErrorDetection = vi.fn<
  [Task | null, boolean],
  UseErrorDetectionReturn
>();

vi.mock(
  '../../../src/modules/ui/components/practice/tasks/ErrorDetection/use-error-detection',
  () => ({
    useErrorDetection: (task: Task | null, showFeedback: boolean) =>
      mockUseErrorDetection(task, showFeedback),
  })
);

/**
 * Helper to create a mock useErrorDetection return value
 */
function createMockHookReturn(
  overrides: Partial<UseErrorDetectionReturn> = {}
): UseErrorDetectionReturn {
  return {
    selectedIndices: new Set<number>(),
    segments: [],
    cursor: -1,
    toggleSelection: vi.fn(),
    moveCursor: vi.fn(),
    canSubmit: vi.fn(() => true),
    checkAnswer: vi.fn(() => false),
    getScore: vi.fn(() => ({
      hits: 0,
      falsePositives: 0,
      missedErrors: 0,
      totalErrors: 0,
      score: 0,
    })),
    getUserAnswer: vi.fn(() => []),
    resetState: vi.fn(),
    ...overrides,
  };
}

describe('ErrorDetectionTask', () => {
  let task: Task;
  let mockOnAnswerChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    task = createErrorDetectionTask();
    mockOnAnswerChange = vi.fn();

    // Default mock hook return
    mockUseErrorDetection.mockReturnValue(createMockHookReturn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render content text as clickable segments', () => {
      const segments = [
        { text: 'The', isError: false },
        { text: 'capital', isError: false },
        { text: 'of', isError: false },
        { text: 'Australia', isError: false },
        { text: 'is', isError: false },
        { text: 'Sydney.', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('The')).toBeInTheDocument();
      expect(screen.getByText('capital')).toBeInTheDocument();
      expect(screen.getByText('Sydney.')).toBeInTheDocument();
    });

    it('should not render for non-error-detection task types', () => {
      const wrongTypeTask = {
        ...task,
        type: 'multiple-choice' as const,
      };

      mockUseErrorDetection.mockReturnValue(createMockHookReturn());

      const { container } = render(
        <ErrorDetectionTask
          task={wrongTypeTask}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render segments with button role and tabindex', () => {
      const segments = [
        { text: 'Hello', isError: false },
        { text: 'world', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const helloSegment = screen.getByText('Hello');
      expect(helloSegment).toHaveAttribute('role', 'button');
      expect(helloSegment).toHaveAttribute('tabindex', '0');
    });

    it('should render content container with proper ARIA attributes', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      const { container } = render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const contentContainer = container.querySelector('[role="group"]');
      expect(contentContainer).toHaveAttribute('aria-label', 'Text content with clickable words');
    });
  });

  describe('Error Count Display', () => {
    it('should show error count instruction when showErrorCount is true', () => {
      const segments = [
        { text: 'Test', isError: false },
        { text: 'error', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as ErrorDetectionContent;
      expect(screen.getByText(`Find ${content.errors.length} errors in this text:`)).toBeInTheDocument();
    });

    it('should not show error count when showErrorCount is false', () => {
      const taskNoCount = createErrorDetectionTask({
        content: {
          content: 'Test error',
          errors: [{ errorText: 'error', correction: 'correct', errorType: 'factual' }],
          showErrorCount: false,
        } as ErrorDetectionContent,
      });

      const segments = [
        { text: 'Test', isError: false },
        { text: 'error', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={taskNoCount}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText(/Find \d+ error/)).not.toBeInTheDocument();
    });

    it('should use singular "error" when count is 1', () => {
      const taskOneError = createErrorDetectionTask({
        content: {
          content: 'Test error',
          errors: [{ errorText: 'error', correction: 'correct', errorType: 'factual' }],
          showErrorCount: true,
        } as ErrorDetectionContent,
      });

      const segments = [
        { text: 'Test', isError: false },
        { text: 'error', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={taskOneError}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Find 1 error in this text:')).toBeInTheDocument();
    });

    it('should hide error count instruction when showing feedback', () => {
      const segments = [
        { text: 'Test', isError: false },
        { text: 'error', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText(/Find \d+ error/)).not.toBeInTheDocument();
    });
  });

  describe('Hint Display', () => {
    it('should show hint when provided and not showing feedback', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as ErrorDetectionContent;
      expect(screen.getByText(content.hint!)).toBeInTheDocument();
    });

    it('should not show hint when showing feedback', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as ErrorDetectionContent;
      expect(screen.queryByText(content.hint!)).not.toBeInTheDocument();
    });

    it('should not show hint when not provided', () => {
      const taskNoHint = createErrorDetectionTask({
        content: {
          content: 'Test',
          errors: [],
          showErrorCount: false,
        } as ErrorDetectionContent,
      });

      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      const { container } = render(
        <ErrorDetectionTask
          task={taskNoHint}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.error-detection__hint')).not.toBeInTheDocument();
    });
  });

  describe('Segment Selection', () => {
    it('should call toggleSelection when segment is clicked', () => {
      const mockToggleSelection = vi.fn();
      const segments = [
        { text: 'The', isError: false },
        { text: 'capital', isError: false },
        { text: 'Sydney', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, toggleSelection: mockToggleSelection })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      fireEvent.click(screen.getByText('Sydney'));
      expect(mockToggleSelection).toHaveBeenCalledWith(2);
    });

    it('should not call toggleSelection when showing feedback', () => {
      const mockToggleSelection = vi.fn();
      const segments = [
        { text: 'Sydney', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, toggleSelection: mockToggleSelection })
      );

      const { container } = render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Find the segment button specifically (not the correction text)
      const segmentButton = container.querySelector('[role="button"]');
      if (segmentButton) {
        fireEvent.click(segmentButton);
      }
      expect(mockToggleSelection).not.toHaveBeenCalled();
    });

    it('should apply selected class to selected segments', () => {
      const selectedIndices = new Set([0, 2]);
      const segments = [
        { text: 'The', isError: false },
        { text: 'capital', isError: false },
        { text: 'Sydney', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const theSegment = screen.getByText('The');
      const sydneySegment = screen.getByText('Sydney');

      expect(theSegment).toHaveClass('error-detection__segment--selected');
      expect(sydneySegment).toHaveClass('error-detection__segment--selected');
    });

    it('should set aria-pressed attribute based on selection state', () => {
      const selectedIndices = new Set([1]);
      const segments = [
        { text: 'Hello', isError: false },
        { text: 'world', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const helloSegment = screen.getByText('Hello');
      const worldSegment = screen.getByText('world');

      expect(helloSegment).toHaveAttribute('aria-pressed', 'false');
      expect(worldSegment).toHaveAttribute('aria-pressed', 'true');
    });

    it('should handle keyboard selection with Space key', () => {
      const mockToggleSelection = vi.fn();
      const segments = [
        { text: 'Test', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, toggleSelection: mockToggleSelection })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const segment = screen.getByText('Test');
      fireEvent.keyDown(segment, { key: ' ' });

      expect(mockToggleSelection).toHaveBeenCalledWith(0);
    });

    it('should handle keyboard selection with Enter key', () => {
      const mockToggleSelection = vi.fn();
      const segments = [
        { text: 'Test', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, toggleSelection: mockToggleSelection })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const segment = screen.getByText('Test');
      fireEvent.keyDown(segment, { key: 'Enter' });

      expect(mockToggleSelection).toHaveBeenCalledWith(0);
    });

    it('should prevent default on Space and Enter keys', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const segment = screen.getByText('Test');

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(spaceEvent, 'preventDefault');
      segment.dispatchEvent(spaceEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      const preventDefaultSpy2 = vi.spyOn(enterEvent, 'preventDefault');
      segment.dispatchEvent(enterEvent);
      expect(preventDefaultSpy2).toHaveBeenCalled();
    });
  });

  describe('Selection Counter', () => {
    it('should display selection counter before feedback', () => {
      const selectedIndices = new Set([0, 2]);
      const segments = [
        { text: 'A', isError: false },
        { text: 'B', isError: false },
        { text: 'C', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(/Selected: 2/)).toBeInTheDocument();
    });

    it('should show error count in counter when showErrorCount is true', () => {
      const selectedIndices = new Set([0]);
      const segments = [
        { text: 'A', isError: false },
        { text: 'B', isError: true, errorIndex: 0 },
        { text: 'C', isError: true, errorIndex: 1 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as ErrorDetectionContent;
      expect(screen.getByText(`Selected: 1 / ${content.errors.length} errors`)).toBeInTheDocument();
    });

    it('should not show counter when showing feedback', () => {
      const selectedIndices = new Set([0]);
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText(/Selected:/)).not.toBeInTheDocument();
    });
  });

  describe('Feedback State - Correct Hits', () => {
    it('should apply correct-hit class to correctly selected errors', () => {
      const selectedIndices = new Set([1]); // Sydney is selected and is an error
      const segments = [
        { text: 'The', isError: false },
        { text: 'Sydney', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      const { container } = render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Query segments by role="button" to avoid matching correction text
      const segmentButtons = container.querySelectorAll('[role="button"]');
      const sydneySegment = Array.from(segmentButtons).find(
        (btn) => btn.textContent === 'Sydney'
      );
      expect(sydneySegment).toHaveClass('error-detection__segment--correct-hit');
    });

    it('should not apply feedback classes when not showing feedback', () => {
      const selectedIndices = new Set([0]);
      const segments = [
        { text: 'Sydney', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const segment = screen.getByText('Sydney');
      expect(segment).not.toHaveClass('error-detection__segment--correct-hit');
      expect(segment).not.toHaveClass('error-detection__segment--missed-error');
      expect(segment).not.toHaveClass('error-detection__segment--false-positive');
    });
  });

  describe('Feedback State - Missed Errors', () => {
    it('should apply missed-error class to unselected errors', () => {
      const selectedIndices = new Set<number>(); // Nothing selected
      const segments = [
        { text: 'Sydney', isError: true, errorIndex: 0 },
        { text: '1888', isError: true, errorIndex: 1 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      const { container } = render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Query segments by role="button" to avoid matching correction text
      const segmentButtons = container.querySelectorAll('[role="button"]');
      const sydneySegment = Array.from(segmentButtons).find(
        (btn) => btn.textContent === 'Sydney'
      );
      const dateSegment = Array.from(segmentButtons).find(
        (btn) => btn.textContent === '1888'
      );

      expect(sydneySegment).toHaveClass('error-detection__segment--missed-error');
      expect(dateSegment).toHaveClass('error-detection__segment--missed-error');
    });
  });

  describe('Feedback State - False Positives', () => {
    it('should apply false-positive class to selected non-errors', () => {
      const selectedIndices = new Set([0]); // Selected non-error
      const segments = [
        { text: 'capital', isError: false },
        { text: 'Sydney', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const capitalSegment = screen.getByText('capital');
      expect(capitalSegment).toHaveClass('error-detection__segment--false-positive');
    });

    it('should not apply any feedback class to unselected non-errors', () => {
      const selectedIndices = new Set<number>();
      const segments = [
        { text: 'capital', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const segment = screen.getByText('capital');
      expect(segment).not.toHaveClass('error-detection__segment--correct-hit');
      expect(segment).not.toHaveClass('error-detection__segment--missed-error');
      expect(segment).not.toHaveClass('error-detection__segment--false-positive');
    });
  });

  describe('Feedback State - Mixed Results', () => {
    it('should apply correct classes for mixed selection results', () => {
      const selectedIndices = new Set([0, 2, 3]); // Hit, false positive, and miss
      const segments = [
        { text: 'Sydney', isError: true, errorIndex: 0 }, // Hit
        { text: 'The', isError: false }, // Unselected non-error (OK)
        { text: 'capital', isError: false }, // False positive
        { text: 'is', isError: false }, // False positive
        { text: '1888', isError: true, errorIndex: 1 }, // Missed
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      const { container } = render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Query segments by role="button" to avoid matching correction text
      const segmentButtons = container.querySelectorAll('[role="button"]');
      const sydneySegment = Array.from(segmentButtons).find(
        (btn) => btn.textContent === 'Sydney'
      );
      const capitalSegment = Array.from(segmentButtons).find(
        (btn) => btn.textContent === 'capital'
      );
      const isSegment = Array.from(segmentButtons).find(
        (btn) => btn.textContent === 'is'
      );
      const dateSegment = Array.from(segmentButtons).find(
        (btn) => btn.textContent === '1888'
      );
      const theSegment = Array.from(segmentButtons).find(
        (btn) => btn.textContent === 'The'
      );

      expect(sydneySegment).toHaveClass('error-detection__segment--correct-hit');
      expect(capitalSegment).toHaveClass('error-detection__segment--false-positive');
      expect(isSegment).toHaveClass('error-detection__segment--false-positive');
      expect(dateSegment).toHaveClass('error-detection__segment--missed-error');
      expect(theSegment).not.toHaveClass('error-detection__segment--false-positive');
    });
  });

  describe('Cursor/Focus State', () => {
    it('should apply focused class to segment at cursor position', () => {
      const segments = [
        { text: 'A', isError: false },
        { text: 'B', isError: false },
        { text: 'C', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, cursor: 1 })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const bSegment = screen.getByText('B');
      expect(bSegment).toHaveClass('error-detection__segment--focused');
    });

    it('should not apply focused class when showing feedback', () => {
      const segments = [
        { text: 'A', isError: false },
        { text: 'B', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, cursor: 1 })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const bSegment = screen.getByText('B');
      expect(bSegment).not.toHaveClass('error-detection__segment--focused');
    });

    it('should not apply focused class when cursor is -1', () => {
      const segments = [
        { text: 'Test', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, cursor: -1 })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const segment = screen.getByText('Test');
      expect(segment).not.toHaveClass('error-detection__segment--focused');
    });
  });

  describe('Disabled State During Feedback', () => {
    it('should set tabindex to -1 on segments when showing feedback', () => {
      const segments = [
        { text: 'Test', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const segment = screen.getByText('Test');
      expect(segment).toHaveAttribute('tabindex', '-1');
    });

    it('should set tabindex to 0 on segments when not showing feedback', () => {
      const segments = [
        { text: 'Test', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const segment = screen.getByText('Test');
      expect(segment).toHaveAttribute('tabindex', '0');
    });

    it('should not respond to keyboard events when showing feedback', () => {
      const mockToggleSelection = vi.fn();
      const segments = [
        { text: 'Test', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, toggleSelection: mockToggleSelection })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const segment = screen.getByText('Test');
      fireEvent.keyDown(segment, { key: ' ' });
      fireEvent.keyDown(segment, { key: 'Enter' });

      expect(mockToggleSelection).not.toHaveBeenCalled();
    });
  });

  describe('Score Display', () => {
    it('should display score summary when showing feedback', () => {
      const segments = [
        { text: 'Sydney', isError: true, errorIndex: 0 },
        { text: '1888', isError: true, errorIndex: 1 },
      ];
      const selectedIndices = new Set([0]); // Found 1 of 2 errors

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({
          segments,
          selectedIndices,
          getScore: vi.fn(() => ({
            hits: 1,
            falsePositives: 0,
            missedErrors: 1,
            totalErrors: 2,
            score: 0.5,
          })),
        })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(/1\/2 errors found/)).toBeInTheDocument();
    });

    it('should display false positives count when present', () => {
      const segments = [
        { text: 'Sydney', isError: true, errorIndex: 0 },
        { text: 'capital', isError: false },
      ];
      const selectedIndices = new Set([0, 1]); // 1 correct, 1 false positive

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({
          segments,
          selectedIndices,
          getScore: vi.fn(() => ({
            hits: 1,
            falsePositives: 2,
            missedErrors: 1,
            totalErrors: 2,
            score: 0,
          })),
        })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(/2 false positives/)).toBeInTheDocument();
    });

    it('should use singular "false positive" when count is 1', () => {
      const segments = [
        { text: 'Sydney', isError: true, errorIndex: 0 },
        { text: 'capital', isError: false },
      ];
      const selectedIndices = new Set([0, 1]);

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({
          segments,
          selectedIndices,
          getScore: vi.fn(() => ({
            hits: 1,
            falsePositives: 1,
            missedErrors: 1,
            totalErrors: 2,
            score: 0,
          })),
        })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText(/, 1 false positive$/)).toBeInTheDocument();
    });

    it('should not show false positives when count is 0', () => {
      const segments = [
        { text: 'Sydney', isError: true, errorIndex: 0 },
      ];
      const selectedIndices = new Set([0]);

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({
          segments,
          selectedIndices,
          getScore: vi.fn(() => ({
            hits: 1,
            falsePositives: 0,
            missedErrors: 1,
            totalErrors: 2,
            score: 0.5,
          })),
        })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText(/false positive/)).not.toBeInTheDocument();
    });

    it('should not show score when not showing feedback', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      const { container } = render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.error-detection__score')).not.toBeInTheDocument();
    });

    it('should have aria-live attribute on score element', () => {
      const segments = [
        { text: 'Sydney', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({
          segments,
          getScore: vi.fn(() => ({
            hits: 1,
            falsePositives: 0,
            missedErrors: 1,
            totalErrors: 2,
            score: 0.5,
          })),
        })
      );

      const { container } = render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const scoreElement = container.querySelector('.error-detection__score');
      expect(scoreElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Corrections Display', () => {
    it('should display corrections when showing feedback', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as ErrorDetectionContent;

      expect(screen.getByText('Corrections:')).toBeInTheDocument();
      expect(screen.getByText(content.errors[0].errorText)).toBeInTheDocument();
      expect(screen.getByText(content.errors[0].correction)).toBeInTheDocument();
    });

    it('should display all corrections with arrows', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as ErrorDetectionContent;

      content.errors.forEach(error => {
        expect(screen.getByText(error.errorText)).toBeInTheDocument();
        expect(screen.getByText(error.correction)).toBeInTheDocument();
      });

      // Check for arrows
      const arrows = screen.getAllByText('→');
      expect(arrows.length).toBe(content.errors.length);
    });

    it('should not display corrections when not showing feedback', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Corrections:')).not.toBeInTheDocument();
    });

    it('should not show corrections section when no errors exist', () => {
      const taskNoErrors = createErrorDetectionTaskNoErrors();
      const segments = [
        { text: 'Berlin', isError: false },
        { text: 'is', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={taskNoErrors}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(screen.queryByText('Corrections:')).not.toBeInTheDocument();
    });
  });

  describe('Explanation Display', () => {
    it('should display explanation when showing feedback', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as ErrorDetectionContent;
      expect(screen.getByText(content.explanation!)).toBeInTheDocument();
    });

    it('should not display explanation when not showing feedback', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const content = task.content as ErrorDetectionContent;
      expect(screen.queryByText(content.explanation!)).not.toBeInTheDocument();
    });

    it('should not show explanation when not provided', () => {
      const taskNoExplanation = createErrorDetectionTask({
        content: {
          content: 'Test',
          errors: [],
          showErrorCount: false,
        } as ErrorDetectionContent,
      });

      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      const { container } = render(
        <ErrorDetectionTask
          task={taskNoExplanation}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(container.querySelector('.error-detection__explanation')).not.toBeInTheDocument();
    });
  });

  describe('Answer Change Callback', () => {
    it('should call onAnswerChange on mount', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalledWith(true);
    });

    it('should call onAnswerChange when selection changes', () => {
      const segments = [{ text: 'Test', isError: false }];

      const { rerender } = render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      mockOnAnswerChange.mockClear();

      // Simulate selection change by updating selectedIndices
      const selectedIndices = new Set([0]);
      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, selectedIndices })
      );

      rerender(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      expect(mockOnAnswerChange).toHaveBeenCalled();
    });

    it('should not crash if onAnswerChange is not provided', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      expect(() => {
        render(
          <ErrorDetectionTask
            task={task}
            showFeedback={false}
            isCorrect={false}
            audioConfig={null}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Multi-word Errors', () => {
    it('should handle multi-word error segments', () => {
      const taskMultiWord = createErrorDetectionTaskMultiWord();
      const segments = [
        { text: 'The', isError: false },
        { text: 'Statue', isError: false },
        { text: 'of', isError: false },
        { text: 'Liberty', isError: false },
        { text: 'is', isError: false },
        { text: 'located', isError: false },
        { text: 'in', isError: false },
        { text: 'Los Angeles', isError: true, errorIndex: 0 }, // Multi-word error
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={taskMultiWord}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    });

    it('should allow selection of multi-word error segments', () => {
      const taskMultiWord = createErrorDetectionTaskMultiWord();
      const mockToggleSelection = vi.fn();
      const segments = [
        { text: 'Los Angeles', isError: true, errorIndex: 0 },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments, toggleSelection: mockToggleSelection })
      );

      render(
        <ErrorDetectionTask
          task={taskMultiWord}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      fireEvent.click(screen.getByText('Los Angeles'));
      expect(mockToggleSelection).toHaveBeenCalledWith(0);
    });
  });

  describe('No Errors Edge Case', () => {
    it('should render correctly when content has no errors', () => {
      const taskNoErrors = createErrorDetectionTaskNoErrors();
      const segments = [
        { text: 'Berlin', isError: false },
        { text: 'is', isError: false },
        { text: 'the', isError: false },
        { text: 'capital', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={taskNoErrors}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(screen.getByText('Berlin')).toBeInTheDocument();
      expect(screen.getByText('capital')).toBeInTheDocument();
      // Should not show error count when no errors
      expect(screen.queryByText(/Find \d+ error/)).not.toBeInTheDocument();
    });

    it('should show perfect score when no errors and no selections', () => {
      const taskNoErrors = createErrorDetectionTaskNoErrors();
      const segments = [
        { text: 'Test', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({
          segments,
          selectedIndices: new Set(),
          getScore: vi.fn(() => ({
            hits: 0,
            falsePositives: 0,
            missedErrors: 0,
            totalErrors: 0,
            score: 1,
          })),
        })
      );

      render(
        <ErrorDetectionTask
          task={taskNoErrors}
          showFeedback={true}
          isCorrect={true}
          audioConfig={null}
        />
      );

      expect(screen.getByText(/0\/0 errors found/)).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should pass task and showFeedback to useErrorDetection', () => {
      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments: [] })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseErrorDetection).toHaveBeenCalledWith(task, true);
    });

    it('should call useErrorDetection with updated showFeedback', () => {
      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments: [] })
      );

      const { rerender } = render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseErrorDetection).toHaveBeenCalledWith(task, false);

      rerender(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      expect(mockUseErrorDetection).toHaveBeenCalledWith(task, true);
    });

    it('should use all hook return values correctly', () => {
      const mockReturn = createMockHookReturn({
        segments: [
          { text: 'A', isError: false },
          { text: 'B', isError: true, errorIndex: 0 },
        ],
        selectedIndices: new Set([1]),
        cursor: 0,
        toggleSelection: vi.fn(),
        getScore: vi.fn(() => ({
          hits: 1,
          falsePositives: 0,
          missedErrors: 1,
          totalErrors: 2,
          score: 0.5,
        })),
      });

      mockUseErrorDetection.mockReturnValue(mockReturn);

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
          onAnswerChange={mockOnAnswerChange}
        />
      );

      // Verify segments are rendered
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();

      // Verify selection state
      const bSegment = screen.getByText('B');
      expect(bSegment).toHaveAttribute('aria-pressed', 'true');

      // Verify cursor/focus
      const aSegment = screen.getByText('A');
      expect(aSegment).toHaveClass('error-detection__segment--focused');

      // Verify toggleSelection is called
      fireEvent.click(bSegment);
      expect(mockReturn.toggleSelection).toHaveBeenCalledWith(1);

      // Verify canSubmit is called
      expect(mockReturn.canSubmit).toHaveBeenCalled();
      expect(mockOnAnswerChange).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle global keyboard navigation events', () => {
      const mockMoveCursor = vi.fn();
      const mockToggleSelection = vi.fn();
      const segments = [
        { text: 'A', isError: false },
        { text: 'B', isError: false },
        { text: 'C', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({
          segments,
          cursor: 1,
          moveCursor: mockMoveCursor,
          toggleSelection: mockToggleSelection,
        })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      // Test arrow key navigation
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(mockMoveCursor).toHaveBeenCalledWith(1);

      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(mockMoveCursor).toHaveBeenCalledWith(-1);

      fireEvent.keyDown(window, { key: 'ArrowDown' });
      expect(mockMoveCursor).toHaveBeenCalledWith(1);

      fireEvent.keyDown(window, { key: 'ArrowUp' });
      expect(mockMoveCursor).toHaveBeenCalledWith(-1);

      // Test selection with Space
      fireEvent.keyDown(window, { key: ' ' });
      expect(mockToggleSelection).toHaveBeenCalledWith(1);

      // Test selection with Enter
      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockToggleSelection).toHaveBeenCalledWith(1);
    });

    it('should not handle keyboard navigation when showing feedback', () => {
      const mockMoveCursor = vi.fn();
      const mockToggleSelection = vi.fn();
      const segments = [
        { text: 'A', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({
          segments,
          cursor: 0,
          moveCursor: mockMoveCursor,
          toggleSelection: mockToggleSelection,
        })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={true}
          isCorrect={false}
          audioConfig={null}
        />
      );

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      fireEvent.keyDown(window, { key: ' ' });

      expect(mockMoveCursor).not.toHaveBeenCalled();
      expect(mockToggleSelection).not.toHaveBeenCalled();
    });

    it('should prevent default on arrow keys', () => {
      const segments = [
        { text: 'Test', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(arrowRightEvent, 'preventDefault');
      window.dispatchEvent(arrowRightEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not toggle selection when cursor is out of bounds', () => {
      const mockToggleSelection = vi.fn();
      const segments = [
        { text: 'A', isError: false },
        { text: 'B', isError: false },
      ];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({
          segments,
          cursor: -1, // Out of bounds
          toggleSelection: mockToggleSelection,
        })
      );

      render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      fireEvent.keyDown(window, { key: ' ' });
      expect(mockToggleSelection).not.toHaveBeenCalled();
    });

    it('should cleanup keyboard event listeners on unmount', () => {
      const segments = [{ text: 'Test', isError: false }];

      mockUseErrorDetection.mockReturnValue(
        createMockHookReturn({ segments })
      );

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <ErrorDetectionTask
          task={task}
          showFeedback={false}
          isCorrect={false}
          audioConfig={null}
        />
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
