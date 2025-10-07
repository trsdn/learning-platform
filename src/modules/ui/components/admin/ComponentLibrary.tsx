import { useState, useMemo } from 'react';
import { ComponentDemo } from './ComponentDemo';
import {
  componentRegistry,
  getAllCategories,
  getComponentsByCategory,
  searchComponents,
  type ComponentCategory,
} from './utils/component-registry';
import styles from './ComponentLibrary.module.css';

/**
 * Component Library - Interactive showcase of all UI components
 *
 * Features:
 * - Browse all components by category
 * - Search components by name
 * - View component variants with live previews
 * - Copy code snippets
 */
export function ComponentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');

  const categories = useMemo(() => getAllCategories(), []);

  // Filter components based on search and category
  const filteredComponents = useMemo(() => {
    let components = Object.values(componentRegistry);

    // Apply search filter
    if (searchQuery.trim()) {
      components = searchComponents(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      components = components.filter((comp) => comp.category === selectedCategory);
    }

    return components.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCategory]);

  const componentCount = Object.keys(componentRegistry).length;

  return (
    <div className={styles.library}>
      {/* Header */}
      <div className={styles.libraryHeader}>
        <div>
          <h2 className={styles.libraryTitle}>Component Library</h2>
          <p className={styles.libraryDescription}>
            Interactive showcase of all {componentCount} UI components with live previews and code examples
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className={styles.libraryControls}>
        {/* Search */}
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search components..."
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

        {/* Category Filter */}
        <div className={styles.categoryFilter}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={
              selectedCategory === 'all'
                ? styles.categoryButtonActive
                : styles.categoryButton
            }
          >
            All ({componentCount})
          </button>
          {categories.map((category) => {
            const count = getComponentsByCategory(category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? styles.categoryButtonActive
                    : styles.categoryButton
                }
              >
                {formatCategoryName(category)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        {filteredComponents.length === 0 ? (
          <p className={styles.noResults}>
            No components found matching &quot;{searchQuery}&quot;
          </p>
        ) : (
          <p className={styles.resultsCount}>
            Showing {filteredComponents.length} of {componentCount} components
          </p>
        )}
      </div>

      {/* Component Demos */}
      <div className={styles.componentList}>
        {filteredComponents.map((component) => (
          <ComponentDemo key={component.id} meta={component} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format category name for display
 */
function formatCategoryName(category: ComponentCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
