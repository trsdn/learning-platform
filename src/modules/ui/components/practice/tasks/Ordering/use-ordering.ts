/**
 * Hook for managing Ordering task state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task, OrderingContent } from '@core/types/services';

interface OrderingState {
  orderedItems: string[];
}

interface OrderingActions {
  moveItemUp: (index: number) => void;
  moveItemDown: (index: number) => void;
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

export type UseOrderingReturn = OrderingState & OrderingActions;

/**
 * Custom hook for Ordering task logic
 */
export function useOrdering(
  task: Task | null,
  _showFeedback: boolean
): UseOrderingReturn {
  const [orderedItems, setOrderedItems] = useState<string[]>([]);

  // Initialize with shuffled items when task changes
  useEffect(() => {
    if (!task || task.type !== 'ordering') {
      setOrderedItems([]);
      return;
    }

    const content = task.content as OrderingContent;
    // Shuffle items for ordering task
    const shuffled = [...content.items].sort(() => Math.random() - 0.5);
    setOrderedItems(shuffled);
  }, [task]);

  /**
   * Move item up in the list
   */
  const moveItemUp = useCallback((index: number) => {
    if (index <= 0) return;

    setOrderedItems((prev) => {
      const newItems = [...prev];
      [newItems[index]!, newItems[index - 1]!] = [
        newItems[index - 1]!,
        newItems[index]!,
      ];
      return newItems;
    });
  }, []);

  /**
   * Move item down in the list
   */
  const moveItemDown = useCallback((index: number) => {
    setOrderedItems((prev) => {
      if (index >= prev.length - 1) return prev;

      const newItems = [...prev];
      [newItems[index]!, newItems[index + 1]!] = [
        newItems[index + 1]!,
        newItems[index]!,
      ];
      return newItems;
    });
  }, []);

  /**
   * Check if user can submit (items are shuffled)
   */
  const canSubmit = useCallback((): boolean => {
    return orderedItems.length > 0;
  }, [orderedItems]);

  /**
   * Check if items are in correct order
   */
  const checkAnswer = useCallback((): boolean => {
    if (!task || task.type !== 'ordering' || orderedItems.length === 0) {
      return false;
    }

    const content = task.content as OrderingContent;

    return orderedItems.every((item, i) => {
      const originalIndex = content.items.indexOf(item);
      return content.correctOrder[i] === originalIndex;
    });
  }, [orderedItems, task]);

  /**
   * Reset to initial state
   */
  const resetState = useCallback(() => {
    setOrderedItems([]);
  }, []);

  return {
    // State
    orderedItems,

    // Actions
    moveItemUp,
    moveItemDown,
    canSubmit,
    checkAnswer,
    resetState,
  };
}
