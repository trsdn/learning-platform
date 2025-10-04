# Implementation Plan: Refactor Dashboard Component (Issue #8)

## Overview
Refactor the Dashboard component to use the design system and reusable components instead of inline styles, reducing file size and improving maintainability.

## Current State Analysis

**File**: `src/modules/ui/components/dashboard.tsx`
**Current size**: 382 lines
**Target reduction**: At least 30% (target: ~267 lines or less)

### Issues Identified:
1. **Inline-styled buttons** (lines 187-199, 210-222)
   - Two "Zurück" buttons with identical inline styles
   - Should use `<Button variant="secondary">` from design system

2. **MasteryBar component** (lines 364-383)
   - Local component with inline styles
   - Could be extracted to a reusable component or built with existing Card component

3. **All design values hardcoded**:
   - Colors: `#e5e7eb`, `#6b7280`, `#3b82f6`, `#10b981`, `#f59e0b`, `#8b5cf6`
   - Spacing: `'2rem'`, `'1rem'`, `'0.5rem'`
   - Font sizes: `'0.875rem'`
   - Border radius: `'4px'`

4. **Topic progress and recent sessions use inline Card styles**

### Already Using Design System:
✅ `<StatCard>` for key metrics (lines 238-261)
✅ `<Card>` for sections (line 265, and others)

## Implementation Plan

### Step 1: Import Button Component
Add Button import from design system:
```typescript
import { Button } from './common/Button';
```

### Step 2: Replace "Zurück" Buttons
**Location 1**: Lines 187-199 (no stats state)
```tsx
// Before:
<button
  onClick={onClose}
  style={{
    padding: '0.5rem 1rem',
    background: '#e5e7eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '1rem',
  }}
>
  ← Zurück
</button>

// After:
<Button
  variant="secondary"
  onClick={onClose}
  style={{ marginBottom: spacing[4] }}
>
  ← Zurück
</Button>
```

**Location 2**: Lines 210-222 (main dashboard)
Same replacement.

### Step 3: Replace Hardcoded Design Values with Design Tokens

Import design tokens:
```typescript
import {
  semanticColors,
  spacing,
  typography,
  colors,
} from '@ui/design-tokens';
```

Replace hardcoded values:
- `#e5e7eb` → `semanticColors.background.tertiary`
- `#6b7280` → `semanticColors.text.secondary`
- `#3b82f6` → `colors.primary[500]`
- `#10b981` → `colors.success[500]`
- `#f59e0b` → `colors.warning[500]`
- `#8b5cf6` → `colors.accent[500]`
- `#f3f4f6` → `semanticColors.background.tertiary`
- `'2rem'` → `spacing[8]`
- `'1rem'` → `spacing[4]`
- `'0.5rem'` → `spacing[2]`
- `'0.875rem'` → `typography.fontSize.sm`
- `'4px'` → `borderRadius.md` (if needed)

### Step 4: Extract MasteryBar Component
Create new reusable component:

**File**: `src/modules/ui/components/common/MasteryBar.tsx`

```typescript
import React from 'react';
import { spacing, typography, semanticColors, borderRadius, transitions } from '@ui/design-tokens';

export interface MasteryBarProps {
  /**
   * Label displayed above the progress bar
   */
  label: string;

  /**
   * Count value displayed
   */
  count: number;

  /**
   * Color of the progress bar
   */
  color: string;

  /**
   * Maximum count for calculating percentage
   * If not provided, bar shows as full when count > 0
   */
  max?: number;
}

/**
 * Mastery Bar Component
 *
 * Displays a labeled progress indicator for mastery levels.
 * Used in the dashboard to show progress across different mastery categories.
 *
 * @example
 * ```tsx
 * <MasteryBar
 *   label="Gemeistert"
 *   count={12}
 *   max={50}
 *   color={colors.success[500]}
 * />
 * ```
 */
export function MasteryBar({ label, count, color, max }: MasteryBarProps) {
  const percentage = max && max > 0 ? (count / max) * 100 : count > 0 ? 100 : 0;

  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: spacing[2]
        }}
      >
        <span
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: typography.fontSize.sm,
            color: semanticColors.text.secondary
          }}
        >
          {count}
        </span>
      </div>
      <div
        style={{
          background: semanticColors.background.tertiary,
          height: '8px',
          borderRadius: borderRadius.md,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            background: color,
            height: '100%',
            width: `${percentage}%`,
            transition: transitions.presets.normal,
          }}
        />
      </div>
    </div>
  );
}

export default MasteryBar;
```

**Export from common components**:
Update `src/modules/ui/components/common/index.ts` (or create if doesn't exist):
```typescript
export { MasteryBar, type MasteryBarProps } from './MasteryBar';
```

### Step 5: Update Dashboard Imports
```typescript
import { MasteryBar } from './common/MasteryBar';
```

Remove local MasteryBar component and interface (lines 358-383).

### Step 6: Update All Inline Styles to Use Design Tokens

Update main container (line 207):
```tsx
// Before:
<div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>

// After:
<div style={{
  padding: spacing[8],
  fontFamily: typography.fontFamily.sans,
  maxWidth: '1200px',
  margin: '0 auto'
}}>
```

Update header section (lines 209-227):
```tsx
<div style={{ marginBottom: spacing[8] }}>
  {/* Button already replaced */}
  <h1 style={{ margin: 0 }}>📊 Lern-Dashboard</h1>
  <p style={{
    color: semanticColors.text.secondary,
    marginTop: spacing[2]
  }}>
    Deine Fortschritte und Statistiken im Überblick
  </p>
</div>
```

Update grid (lines 230-236):
```tsx
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: spacing[4],
    marginBottom: spacing[8],
  }}
>
```

Update StatCard colors (lines 238-261):
```tsx
<StatCard
  title="Gesamt Sitzungen"
  value={stats.completedSessions.toString()}
  subtitle={`von ${stats.totalSessions} gestartet`}
  color={colors.primary[500]}
/>
<StatCard
  title="Genauigkeit"
  value={`${Math.round(stats.accuracyRate)}%`}
  subtitle={`${stats.correctAnswers}/${stats.totalQuestions} richtig`}
  color={colors.success[500]}
/>
<StatCard
  title="Lernzeit"
  value={formatTime(stats.totalStudyTime)}
  subtitle={`Ø ${formatTime(stats.averageSessionTime)} pro Sitzung`}
  color={colors.warning[500]}
/>
<StatCard
  title="Anstehende Wiederholungen"
  value={stats.upcomingReviews.toString()}
  subtitle="bereit zum Üben"
  color={colors.accent[500]}
/>
```

Update mastery section (lines 265-282):
```tsx
<Card padding="medium" style={{ marginBottom: spacing[8] }}>
  <h2 style={{ marginTop: 0 }}>🎯 Beherrschungsniveau</h2>
  <div style={{ display: 'flex', gap: spacing[4], marginTop: spacing[4] }}>
    <MasteryBar
      label="Gemeistert"
      count={stats.masteryLevels.mastered}
      color={colors.success[500]}
    />
    <MasteryBar
      label="In Arbeit"
      count={stats.masteryLevels.learning}
      color={colors.warning[500]}
    />
    <MasteryBar
      label="Neu"
      count={stats.masteryLevels.new}
      color={colors.primary[500]}
    />
  </div>
</Card>
```

Continue replacing all remaining inline styles throughout the file with design tokens.

## Acceptance Criteria

- ✅ All "Zurück" buttons use `<Button variant="secondary">`
- ✅ MasteryBar extracted to reusable component in `src/modules/ui/components/common/`
- ✅ All hardcoded colors replaced with design tokens
- ✅ All spacing values use `spacing[]` tokens
- ✅ All font sizes use `typography.fontSize` tokens
- ✅ File size reduced by at least 30% (from 382 to ~267 lines or less)
- ✅ Visual appearance unchanged (verified with side-by-side comparison)
- ✅ Functionality fully maintained
- ✅ Build passes without errors
- ✅ Code review completed and feedback addressed

## Expected Results

**Before**: 382 lines with inline styles
**After**: ~250-270 lines using design system

**Removed**:
- 25 lines (MasteryBar component moved to separate file)
- 40+ lines (button inline styles replaced)
- 20+ lines (hardcoded values replaced with tokens)

**Benefits**:
1. Easier to maintain and update styles
2. Consistent design throughout application
3. Smaller component file
4. Reusable MasteryBar component
5. Better alignment with design system patterns

## Implementation Order

1. Create MasteryBar.tsx component
2. Update imports in dashboard.tsx
3. Replace "Zurück" buttons with Button component
4. Replace hardcoded design values with design tokens
5. Remove local MasteryBar component
6. Test build
7. Visual verification
8. Code review
9. Deploy to test
10. Merge to main
