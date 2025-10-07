import React, { useState } from 'react';
import clsx from 'clsx';
import type { ComponentMeta, ComponentVariant } from './utils/component-registry';
import styles from './ComponentDemo.module.css';

export interface ComponentDemoProps {
  /** Component metadata from registry */
  meta: ComponentMeta;
}

/**
 * ComponentDemo - Displays a component with its variants and documentation
 *
 * Shows:
 * - Component name and description
 * - Multiple visual variants
 * - Code snippets for each variant
 * - Props table
 */
export function ComponentDemo({ meta }: ComponentDemoProps) {
  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(
    new Set(meta.variants.map((_, i) => i).filter((i) => meta.variants[i]?.defaultVisible))
  );

  const toggleVariant = (index: number) => {
    setExpandedVariants((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedVariants(new Set(meta.variants.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedVariants(new Set());
  };

  return (
    <div className={styles.componentDemo}>
      {/* Header */}
      <div className={styles.demoHeader}>
        <div>
          <h3 className={styles.demoTitle}>{meta.name}</h3>
          <p className={styles.demoDescription}>{meta.description}</p>
          <code className={styles.demoImport}>
            import {'{'} {meta.name} {'}'} from '{meta.importPath}';
          </code>
        </div>
        <div className={styles.demoActions}>
          <button onClick={expandAll} className={styles.demoActionButton}>
            Expand All
          </button>
          <button onClick={collapseAll} className={styles.demoActionButton}>
            Collapse All
          </button>
        </div>
      </div>

      {/* Variants */}
      <div className={styles.demoVariants}>
        {meta.variants.map((variant, index) => {
          const isExpanded = expandedVariants.has(index);
          return (
            <VariantDemo
              key={index}
              variant={variant}
              component={meta.component}
              isExpanded={isExpanded}
              onToggle={() => toggleVariant(index)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// VARIANT DEMO
// ============================================================================

interface VariantDemoProps {
  variant: ComponentVariant;
  component: React.ComponentType<any>;
  isExpanded: boolean;
  onToggle: () => void;
}

function VariantDemo({ variant, component: Component, isExpanded, onToggle }: VariantDemoProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className={styles.variantDemo}>
      {/* Variant Header */}
      <div className={styles.variantHeader}>
        <button onClick={onToggle} className={styles.variantToggle}>
          <span className={clsx(styles.variantToggleIcon, isExpanded && styles.variantToggleIconExpanded)}>
            ▶
          </span>
          <span className={styles.variantName}>{variant.name}</span>
          <span className={styles.variantDescription}>{variant.description}</span>
        </button>
      </div>

      {/* Variant Content (collapsible) */}
      {isExpanded && (
        <div className={styles.variantContent}>
          {/* Visual Preview */}
          <div className={styles.variantPreview}>
            <div className={styles.variantPreviewLabel}>Preview</div>
            <div className={styles.variantPreviewBox}>
              <Component {...variant.props} />
            </div>
          </div>

          {/* Code Example (collapsible) */}
          <div className={styles.variantCode}>
            <button
              onClick={() => setShowCode(!showCode)}
              className={styles.variantCodeToggle}
            >
              {showCode ? '▼' : '▶'} {showCode ? 'Hide' : 'Show'} Code
            </button>
            {showCode && (
              <pre className={styles.variantCodeBlock}>
                <code>{generateCodeSnippet(variant)}</code>
              </pre>
            )}
          </div>

          {/* Props Table */}
          {Object.keys(variant.props).length > 0 && (
            <div className={styles.variantProps}>
              <div className={styles.variantPropsLabel}>Props</div>
              <table className={styles.variantPropsTable}>
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Value</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(variant.props).map(([key, value]) => (
                    <tr key={key}>
                      <td>
                        <code>{key}</code>
                      </td>
                      <td>
                        <code>{formatPropValue(value)}</code>
                      </td>
                      <td>
                        <code className={styles.propType}>{typeof value}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate JSX code snippet for a variant
 */
function generateCodeSnippet(variant: ComponentVariant): string {
  const propsEntries = Object.entries(variant.props);

  if (propsEntries.length === 0) {
    return '<Component />';
  }

  const propsString = propsEntries
    .map(([key, value]) => {
      if (key === 'children') {
        return null; // Handle children separately
      }
      return `  ${key}={${formatPropValueForCode(value)}}`;
    })
    .filter(Boolean)
    .join('\n');

  const children = variant.props.children;
  const hasChildren = children !== undefined && children !== null;

  if (!hasChildren) {
    return `<Component\n${propsString}\n/>`;
  }

  const childrenStr = formatChildrenForCode(children);
  return `<Component\n${propsString}\n>\n  ${childrenStr}\n</Component>`;
}

/**
 * Format prop value for display in table
 */
function formatPropValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'function') return '() => {}';
  if (React.isValidElement(value)) return '<ReactElement>';
  if (Array.isArray(value)) return JSON.stringify(value, null, 2);
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

/**
 * Format prop value for code snippet
 */
function formatPropValueForCode(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return `{${value}}`;
  if (typeof value === 'number') return `{${value}}`;
  if (typeof value === 'function') return '{() => {}}';
  if (React.isValidElement(value)) return '{<ReactElement />}';
  if (Array.isArray(value)) return `{${JSON.stringify(value)}}`;
  if (typeof value === 'object') return `{${JSON.stringify(value)}}`;
  return `{${String(value)}}`;
}

/**
 * Format children for code snippet
 */
function formatChildrenForCode(children: unknown): string {
  if (typeof children === 'string') return children;
  if (React.isValidElement(children)) return '<ReactElement />';
  return String(children);
}
