import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { ComponentLibrary } from './ComponentLibrary';
import { TaskTypesShowcase } from './TaskTypesShowcase';
import styles from './AdminPage.module.css';

export type AdminTab = 'components' | 'tasks';

export interface AdminPageProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onClose: () => void;
}

/**
 * Admin Test Pages - Development tool for testing UI components and task types
 *
 * Features:
 * - Component Library: Interactive showcase of all UI components
 * - Task Types Showcase: Interactive examples of all task types
 * - Keyboard navigation support
 * - Responsive design
 *
 * Access:
 * - Keyboard: Ctrl+Shift+A (Windows/Linux) or Cmd+Shift+A (Mac)
 * - Button: Admin button in header
 * - Hash: #admin, #admin/components, #admin/tasks
 */
export function AdminPage({ activeTab, onTabChange, onClose }: AdminPageProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus management - focus close button on mount
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // ESC key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className={styles.adminOverlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-title"
    >
      <div className={styles.adminPanel}>
        {/* Header */}
        <div className={styles.adminHeader}>
          <div className={styles.adminHeaderLeft}>
            <h1 id="admin-title" className={styles.adminTitle}>
              🔧 Admin Test Pages
            </h1>
            <p className={styles.adminSubtitle}>
              Development tool for testing and documentation
            </p>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close admin panel"
            title="Close (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Warning Banner */}
        <div className={styles.warningBanner}>
          <span className={styles.warningIcon}>⚠️</span>
          <span>Development Tool - For testing and documentation purposes</span>
        </div>

        {/* Tabs */}
        <div className={styles.adminTabs} role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'components'}
            aria-controls="components-panel"
            onClick={() => onTabChange('components')}
            className={clsx(styles.adminTab, activeTab === 'components' && styles.adminTabActive)}
          >
            📦 Components
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'tasks'}
            aria-controls="tasks-panel"
            onClick={() => onTabChange('tasks')}
            className={clsx(styles.adminTab, activeTab === 'tasks' && styles.adminTabActive)}
          >
            🎯 Task Types
          </button>
        </div>

        {/* Content */}
        <div className={styles.adminContent}>
          {activeTab === 'components' && (
            <div
              id="components-panel"
              role="tabpanel"
              aria-labelledby="components-tab"
              className={styles.adminTabPanel}
            >
              <ComponentLibrary />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div
              id="tasks-panel"
              role="tabpanel"
              aria-labelledby="tasks-tab"
              className={styles.adminTabPanel}
            >
              <TaskTypesShowcase />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
