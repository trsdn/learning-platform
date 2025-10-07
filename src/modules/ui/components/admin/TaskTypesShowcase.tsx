import { useState, useMemo } from 'react';
import { TaskDemo } from './TaskDemo';
import {
  getAllTaskTypes,
  searchTaskTypes,
  getTaskTypesByDifficulty,
} from './utils/task-registry';
import styles from './TaskTypesShowcase.module.css';

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

/**
 * Task Types Showcase - Interactive examples of all task types
 *
 * Features:
 * - Browse all 9 task types
 * - Search tasks by name or description
 * - Filter by difficulty level
 * - View task examples with data structure
 */
export function TaskTypesShowcase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('all');

  const allTaskTypes = useMemo(() => getAllTaskTypes(), []);

  // Filter task types based on search and difficulty
  const filteredTaskTypes = useMemo(() => {
    let tasks = allTaskTypes;

    // Apply search filter
    if (searchQuery.trim()) {
      tasks = searchTaskTypes(searchQuery);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      tasks = tasks.filter((task) => task.difficulty.includes(selectedDifficulty));
    }

    return tasks.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedDifficulty, allTaskTypes]);

  const totalTaskTypes = allTaskTypes.length;
  const totalExamples = allTaskTypes.reduce((sum, task) => sum + task.exampleCount, 0);

  return (
    <div className={styles.showcase}>
      {/* Header */}
      <div className={styles.showcaseHeader}>
        <div>
          <h2 className={styles.showcaseTitle}>Task Types Showcase</h2>
          <p className={styles.showcaseDescription}>
            Interactive examples of all {totalTaskTypes} task types with {totalExamples} sample tasks
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className={styles.showcaseControls}>
        {/* Search */}
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search task types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.searchClear}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Difficulty Filter */}
        <div className={styles.difficultyFilter}>
          <button
            onClick={() => setSelectedDifficulty('all')}
            className={
              selectedDifficulty === 'all'
                ? styles.difficultyButtonActive
                : styles.difficultyButton
            }
          >
            All ({totalTaskTypes})
          </button>
          {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
            const count = getTaskTypesByDifficulty(difficulty).length;
            return (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={
                  selectedDifficulty === difficulty
                    ? styles.difficultyButtonActive
                    : styles.difficultyButton
                }
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        {filteredTaskTypes.length === 0 ? (
          <p className={styles.noResults}>
            No task types found matching &quot;{searchQuery}&quot;
          </p>
        ) : (
          <p className={styles.resultsCount}>
            Showing {filteredTaskTypes.length} of {totalTaskTypes} task types
          </p>
        )}
      </div>

      {/* Task Type Demos */}
      <div className={styles.taskList}>
        {filteredTaskTypes.map((taskType) => (
          <TaskDemo key={taskType.id} meta={taskType} />
        ))}
      </div>
    </div>
  );
}
