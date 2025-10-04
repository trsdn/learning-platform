# Implementation Plan: Reusable Form Components (Issue #7)

## Overview
Create standardized, accessible form components to replace inline-styled form elements across all task types, ensuring consistency and better maintainability.

## Current Problems Analyzed
1. **Inconsistent Styling**: Different border colors, padding values across task types
2. **Duplicated Validation Logic**: Green/red borders repeated in multiple places
3. **Poor Accessibility**: Missing ARIA attributes, inconsistent focus states
4. **Tight Coupling**: Form logic mixed with inline styles in practice-session.tsx
5. **No Reusability**: Each task type reimplements similar form elements

## Components to Create

### 1. Input Component (`Input.tsx`)

**Purpose**: Text input with validation states for cloze deletion, text input, word scramble

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}
```

**Features**:
- Validation states (error, success, neutral)
- Disabled state styling
- Helper text below input
- Design token colors
- Keyboard navigation
- ARIA attributes

**Design Token Usage**:
- Border: `semanticColors.border.*`
- Error: `semanticColors.feedback.error/errorBorder`
- Success: `semanticColors.feedback.success/successBorder`
- Focus: `colors.primary[300]`

### 2. Checkbox Component (`Checkbox.tsx`)

**Purpose**: Custom checkbox for multiple-select tasks

**Props**:
```typescript
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  error?: boolean;
  success?: boolean;
}
```

**Features**:
- Custom styled checkbox (not native)
- Label integration
- Validation states
- Keyboard accessible (Space to toggle)
- Focus ring

### 3. Select Component (`Select.tsx`)

**Purpose**: Dropdown for matching tasks

**Props**:
```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
  success?: boolean;
}
```

**Features**:
- Custom dropdown styling
- Keyboard navigation (Arrow keys, Enter)
- Search/filter options (optional)
- Validation states
- Empty state

### 4. Slider Component (`Slider.tsx`)

**Purpose**: Range slider for slider tasks

**Props**:
```typescript
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  unit?: string; // e.g., "°C", "%"
  showValue?: boolean;
}
```

**Features**:
- Custom track and thumb styling
- Value display
- Unit support
- Keyboard navigation (Arrow keys)
- Responsive design

## Files to Modify

### New Files to Create:
1. `/src/modules/ui/components/forms/Input.tsx`
2. `/src/modules/ui/components/forms/Checkbox.tsx`
3. `/src/modules/ui/components/forms/Select.tsx`
4. `/src/modules/ui/components/forms/Slider.tsx`
5. `/src/modules/ui/components/forms/index.ts` (barrel export)

### Files to Refactor:
1. `/src/modules/ui/components/practice-session.tsx`
   - Lines 434-465: Cloze deletion inputs
   - Lines 805-816: Multiple-select checkboxes
   - Lines 691-723: Matching select dropdowns
   - Lines 859-874: Slider tasks
   - Lines 1225-1259: Text input tasks

## Implementation Steps

### Phase 1: Create Base Components (90 min)

**Step 1.1: Input Component** (25 min)
- Create Input.tsx with design tokens
- Implement validation states
- Add ARIA attributes
- Add focus states
- JSDoc documentation

**Step 1.2: Checkbox Component** (25 min)
- Create Checkbox.tsx
- Custom checkbox design
- Label integration
- Keyboard navigation
- Validation states

**Step 1.3: Select Component** (20 min)
- Create Select.tsx
- Native select with custom styling
- Option rendering
- Validation states

**Step 1.4: Slider Component** (20 min)
- Create Slider.tsx
- Custom range input styling
- Value display
- Unit support

### Phase 2: Refactor Practice Session (60 min)

**Step 2.1: Cloze Deletion** (15 min)
- Replace inline inputs with Input component
- Extract validation logic
- Test with existing tasks

**Step 2.2: Multiple Select** (15 min)
- Replace checkbox inputs with Checkbox component
- Maintain validation feedback

**Step 2.3: Matching Tasks** (15 min)
- Replace select elements with Select component
- Preserve matching logic

**Step 2.4: Slider Tasks** (10 min)
- Replace range inputs with Slider component
- Keep unit display

**Step 2.5: Text Input Tasks** (5 min)
- Replace input with Input component

### Phase 3: Testing & Validation (30 min)
- Visual inspection of all task types
- Keyboard navigation testing
- Screen reader testing
- Validation state testing
- Build verification

### Phase 4: Code Review & Deployment (30 min)
- Run code-reviewer agent
- Address feedback
- Deploy to test environment
- Verify in test

## Expected Outcomes

### Before:
- ~200 lines of duplicated inline form styles
- Inconsistent validation states
- Poor accessibility
- Hard to maintain

### After:
- 4 reusable form components (~600 lines)
- Consistent validation everywhere
- Excellent accessibility
- Easy to maintain and extend

## Design Token Compliance

All components will use:
- ✅ `semanticColors.feedback.*` for validation
- ✅ `semanticColors.border.*` for borders
- ✅ `spacing.*` for padding/margins
- ✅ `borderRadius.*` for rounded corners
- ✅ `typography.*` for text
- ✅ `transitions.*` for animations

## Accessibility Requirements

### Input:
- `aria-invalid` when error
- `aria-describedby` for helper text
- Focus visible indicator
- Label association

### Checkbox:
- `aria-checked` state
- Keyboard navigation (Space)
- Focus ring
- Label click support

### Select:
- `aria-label` or associated label
- Keyboard navigation (Arrow keys, Enter)
- `aria-expanded` for custom dropdown
- Selected state indication

### Slider:
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Keyboard navigation (Arrow keys)
- `aria-label` for context
- Value text alternative

## Breaking Changes
None - this is an internal refactor with no API changes.

## Rollback Plan
If issues arise, revert commits and restore inline styles temporarily.

## Success Criteria
- [ ] All 4 form components created
- [ ] Practice session refactored to use new components
- [ ] Validation states work correctly
- [ ] Keyboard navigation functional
- [ ] Accessibility verified
- [ ] Build passes
- [ ] Code review approved
- [ ] Test deployment successful

## Time Estimate
Total: ~3.5 hours

## Dependencies
- Design tokens (already implemented)
- React 18+
- TypeScript 5+

## Notes
- Follow Button.tsx and Card.tsx patterns for consistency
- Prioritize accessibility (this is a learning platform)
- Keep components simple and focused
- Avoid over-engineering
