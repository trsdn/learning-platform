# Implementation Plan: Reusable Card Components (Issue #6)

## Overview
Create three reusable card components to eliminate duplicated card patterns throughout the application and establish consistent styling using design tokens.

## Current Problems Analyzed
1. **Inline styles scattered across files**: dashboard.tsx, session-results.tsx, practice-session.tsx
2. **Inconsistent spacing**: Different padding values (1rem, 1.5rem, 2rem)
3. **Inconsistent borders**: Some use #e5e7eb, others use different colors
4. **Inconsistent shadows**: Some cards have shadows, others don't
5. **Duplicate code**: Similar card structures repeated multiple times

## Components to Create

### 1. Base Card Component (`Card.tsx`)

**Purpose**: Foundation card component with consistent styling

**Props**:
- `padding?: 'small' | 'medium' | 'large'` - default: 'medium'
- `shadow?: boolean` - default: true
- `border?: boolean` - default: true
- `borderColor?: string` - default: from design tokens
- `children: React.ReactNode`
- `className?: string`
- `style?: React.CSSProperties`

**Features**:
- Uses design tokens for all styling
- Supports responsive design
- Clean, semantic HTML
- Accessible (proper ARIA if needed)

**Design Token Usage**:
- Padding: `components.card.padding.sm/md/lg`
- Border radius: `components.card.borderRadius`
- Shadow: `components.card.shadow`
- Border color: `semanticColors.border.light`
- Background: `semanticColors.background.primary`

### 2. StatCard Component (`StatCard.tsx`)

**Purpose**: Display statistical information on dashboard

**Props**:
- `title: string` - The stat label (e.g., "Gesamt Sitzungen")
- `value: string | number` - The main value to display
- `subtitle?: string` - Additional context below value
- `color?: string` - Accent color for visual distinction
- `icon?: React.ReactNode` - Optional icon
- `className?: string`
- `style?: React.CSSProperties`

**Features**:
- Inherits from Card component
- Color accent strip or icon tinting
- Responsive typography
- Optimized for grid layouts

**Layout Structure**:
```
┌─────────────────────┐
│ Title          Icon │
│ VALUE               │
│ subtitle            │
└─────────────────────┘
```

### 3. FeedbackCard Component (`FeedbackCard.tsx`)

**Purpose**: Display success/error/warning/info messages

**Props**:
- `variant: 'success' | 'error' | 'warning' | 'info'`
- `title?: string` - Optional heading
- `message?: string` - Main message
- `children?: React.ReactNode` - For custom content
- `dismissible?: boolean` - default: false
- `onDismiss?: () => void` - Callback when dismissed
- `className?: string`
- `style?: React.CSSProperties`

**Features**:
- Color-coded by variant using design tokens
- Icon based on variant (✓, ✗, ⚠️, ℹ️)
- Optional dismiss button
- Semantic HTML (role="alert" for errors)

**Design Token Usage**:
- Success: `semanticColors.feedback.success/successLight/successBorder`
- Error: `semanticColors.feedback.error/errorLight/errorBorder`
- Warning: `semanticColors.feedback.warning/warningLight/warningBorder`
- Info: `semanticColors.feedback.info/infoLight/infoBorder`

## Files to Modify

### New Files to Create:
1. `/src/modules/ui/components/common/Card.tsx`
2. `/src/modules/ui/components/common/StatCard.tsx`
3. `/src/modules/ui/components/common/FeedbackCard.tsx`

### Files to Refactor:
1. `/src/modules/ui/components/dashboard.tsx` (lines 236-260, 263-282)
2. `/src/modules/ui/components/session-results.tsx` (lines 67-122)
3. `/src/modules/ui/components/practice-session.tsx` (lines 1405-1423)

## Implementation Steps

### Phase 1: Create Base Components (30 min)
1. ✅ Create `Card.tsx` with design tokens
2. ✅ Add TypeScript interfaces
3. ✅ Implement responsive styling
4. ✅ Add JSDoc comments

### Phase 2: Create Specialized Components (30 min)
1. ✅ Create `StatCard.tsx` using Card as base
2. ✅ Create `FeedbackCard.tsx` using Card as base
3. ✅ Add variant logic and color mapping
4. ✅ Add icons and visual enhancements

### Phase 3: Refactor Existing Code (45 min)
1. ✅ Refactor dashboard.tsx stat cards
2. ✅ Refactor dashboard.tsx mastery section
3. ✅ Refactor session-results.tsx statistics
4. ✅ Refactor practice-session.tsx feedback boxes
5. ✅ Remove all inline card styles
6. ✅ Test each refactored component

### Phase 4: Testing & Validation (15 min)
1. ✅ Visual inspection of all pages
2. ✅ Verify responsive behavior
3. ✅ Check dark mode compatibility (if applicable)
4. ✅ Ensure no regressions

### Phase 5: Code Review & Deployment (30 min)
1. ✅ Run code-reviewer agent
2. ✅ Address feedback
3. ✅ Deploy to test environment
4. ✅ Validate in test environment

## Expected Outcomes

### Before:
- Inline styles scattered across 3+ files
- Inconsistent card appearance
- ~100 lines of duplicated style code

### After:
- 3 reusable components (~200 lines)
- Consistent card styling everywhere
- Easy to maintain and extend
- Reduced bundle size (shared styles)
- Better TypeScript support

## Design Token Compliance

All components will use:
- ✅ `components.card.*` for card-specific tokens
- ✅ `semanticColors.*` for colors
- ✅ `spacing.*` for margins/padding
- ✅ `borderRadius.*` for corners
- ✅ `shadows.*` for depth
- ✅ `typography.*` for text
- ✅ `transitions.*` for animations

## Breaking Changes
None - this is an internal refactor with no API changes.

## Rollback Plan
If issues arise, revert commit and restore inline styles temporarily.

## Success Criteria
- [ ] All card patterns use new components
- [ ] No inline card styles remain
- [ ] Visual appearance unchanged
- [ ] Responsive design maintained
- [ ] Code review passes
- [ ] Test deployment successful

## Time Estimate
Total: ~2.5 hours

## Dependencies
- Design tokens (already implemented)
- React 18+
- TypeScript 5+

## Notes
- Keep components simple and focused
- Avoid over-engineering
- Maintain backward compatibility
- Follow existing code style (Button.tsx pattern)
