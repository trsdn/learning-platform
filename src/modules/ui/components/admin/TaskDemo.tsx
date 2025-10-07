import React, { useState } from 'react';
import clsx from 'clsx';
import type { TaskTypeMeta, TaskExample } from './utils/task-registry';
import styles from './TaskDemo.module.css';

export interface TaskDemoProps {
  meta: TaskTypeMeta;
}

/**
 * TaskDemo - Displays a task type with its examples
 */
export function TaskDemo({ meta }: TaskDemoProps) {
  const [expandedExamples, setExpandedExamples] = useState<Set<number>>(new Set([0]));

  const toggleExample = (index: number) => {
    setExpandedExamples((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={styles.taskDemo}>
      {/* Header */}
      <div className={styles.demoHeader}>
        <div className={styles.demoIcon}>{meta.icon}</div>
        <div className={styles.demoHeaderContent}>
          <h3 className={styles.demoTitle}>{meta.name}</h3>
          <p className={styles.demoDescription}>{meta.description}</p>
          <div className={styles.demoMeta}>
            <span className={styles.demoMetaItem}>
              📁 Template: <code>{meta.templateFile}</code>
            </span>
            <span className={styles.demoMetaItem}>
              🎯 Difficulty: {meta.difficulty.join(', ')}
            </span>
            <span className={styles.demoMetaItem}>
              📊 {meta.exampleCount} examples
            </span>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className={styles.demoExamples}>
        {meta.examples.map((example, index) => (
          <ExampleDemo
            key={index}
            example={example}
            index={index}
            isExpanded={expandedExamples.has(index)}
            onToggle={() => toggleExample(index)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE DEMO
// ============================================================================

interface ExampleDemoProps {
  example: TaskExample;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function ExampleDemo({ example, index, isExpanded, onToggle }: ExampleDemoProps) {
  const [showData, setShowData] = useState(false);

  return (
    <div className={styles.exampleDemo}>
      {/* Header */}
      <button onClick={onToggle} className={styles.exampleToggle}>
        <span className={clsx(styles.exampleToggleIcon, isExpanded && styles.exampleToggleIconExpanded)}>
          ▶
        </span>
        <span className={styles.exampleNumber}>Example {index + 1}</span>
        <span className={styles.exampleTitle}>{example.title}</span>
        <span className={styles.exampleDescription}>{example.description}</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className={styles.exampleContent}>
          {/* Task Data Preview */}
          <div className={styles.examplePreview}>
            <div className={styles.previewLabel}>Task Data Structure</div>
            <div className={styles.previewBox}>
              {renderTaskPreview(example.data)}
            </div>
          </div>

          {/* Raw Data (collapsible) */}
          <div className={styles.exampleDataSection}>
            <button
              onClick={() => setShowData(!showData)}
              className={styles.exampleDataToggle}
            >
              {showData ? '▼' : '▶'} {showData ? 'Hide' : 'Show'} Raw JSON Data
            </button>
            {showData && (
              <pre className={styles.exampleDataBlock}>
                <code>{JSON.stringify(example.data, null, 2)}</code>
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER: RENDER TASK PREVIEW
// ============================================================================

/**
 * Render a visual preview of task data
 */
function renderTaskPreview(data: Record<string, unknown>): React.ReactNode {
  return (
    <div className={styles.dataPreview}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className={styles.dataRow}>
          <span className={styles.dataKey}>{key}:</span>
          <span className={styles.dataValue}>{formatValue(value)}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.length <= 3) return `[${value.map((v) => formatValue(v)).join(', ')}]`;
    return `[${value.length} items]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length === 0) return '{}';
    if (keys.length <= 2) return `{${keys.join(', ')}}`;
    return `{${keys.length} properties}`;
  }
  return String(value);
}
