# Tasks: Standardize Styling Approach (CSS Modules)

**Input**: Design documents from `/specs/004-issue-11-on/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/css-modules.md, quickstart.md

## Execution Flow (main)
```
1. ✅ Load plan.md from feature directory
   → Tech stack: React 18.3, TypeScript 5.x, Vite 5.x
   → Styling: CSS Modules (component-scoped stylesheets)
   → Testing: Vitest (unit), Playwright (E2E + visual regression)
2. ✅ Load design documents:
   → data-model.md: Design tokens, component patterns
   → contracts/css-modules.md: Mandatory CSS Modules rules
   → research.md: CSS Modules chosen over Tailwind/CSS-in-JS
   → spec.md clarifications: Big bang migration, Playwright screenshots, fix-forward strategy
3. ✅ Generate tasks by category:
   → Setup: Design tokens, TypeScript config, dependencies
   → Pre-Migration Tests: Capture baseline Playwright screenshots
   → Core Migration: 14 components (inline styles → CSS Modules)
   → Post-Migration Tests: Visual regression verification
   → Tooling: ESLint rules, component templates
   → Documentation: Update CLAUDE.md
4. ✅ Apply task rules:
   → Different components = mark [P] for parallel
   → Same file = sequential (no [P])
   → Visual tests before AND after migration (TDD-style for visual regression)
5. ✅ Number tasks sequentially (T001-T024)
6. ✅ Generate dependency graph
7. ✅ Create parallel execution examples
8. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
Single project structure:
- Components: `src/modules/ui/components/`
- Styles: `src/modules/ui/styles/`
- Tests: `tests/unit/ui/`, `tests/e2e/`, `tests/visual/`

---

## Phase 3.1: Foundation Setup

### T001: Install CSS Modules dependencies
**File**: `package.json`
**Description**: Install `clsx` for conditional class names (CSS Modules already supported by Vite)
```bash
npm install clsx
npm install -D @types/node  # If not present (for CSS Module types)
```
**Acceptance**:
- `clsx` appears in `package.json` dependencies
- `npm install` completes without errors

---

### T002: [P] Create CSS design tokens
**File**: `src/modules/ui/styles/variables.css`
**Description**: Create CSS custom properties (design tokens) for colors, spacing, typography, borders, shadows, transitions, and z-index layers per `data-model.md` specification
**Acceptance**:
- File contains all design tokens from `data-model.md` (colors, spacing, typography, etc.)
- Uses CSS `:root` selector
- Follows naming convention: `--category-name` (e.g., `--color-primary`, `--spacing-md`)

---

### T003: [P] Create global CSS reset
**File**: `src/modules/ui/styles/global.css`
**Description**: Create minimal global CSS reset and base styles (box-sizing, font-family, etc.)
**Acceptance**:
- Sets `box-sizing: border-box` globally
- Sets base font family from `--font-family-base`
- Minimal resets (margin, padding) if needed
- No component-specific styles (those belong in CSS Modules)

---

### T004: [P] Create utilities CSS escape hatch
**File**: `src/modules/ui/styles/utilities.css`
**Description**: Create empty utilities.css file for future edge-case global utility classes (per FR-017)
**Acceptance**:
- File exists with header comment explaining purpose
- Empty or contains only `/* Reserved for edge-case utility classes per FR-017 */`

---

### T005: Add CSS Modules TypeScript declarations
**File**: `vite-env.d.ts` (or `src/vite-env.d.ts`)
**Description**: Add TypeScript module declaration for `*.module.css` imports to enable type-safe CSS Module usage
**Acceptance**:
- File contains:
  ```typescript
  declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
  }
  ```
- TypeScript compiler recognizes CSS Module imports without errors

---

### T006: Import global styles in app entry point
**File**: `src/main.tsx` (or main entry file)
**Description**: Import `variables.css`, `global.css`, and `utilities.css` at application entry point
**Acceptance**:
- Imports added in correct order:
  ```typescript
  import './modules/ui/styles/variables.css';
  import './modules/ui/styles/global.css';
  import './modules/ui/styles/utilities.css';
  ```
- App still runs without style regressions
- Design tokens available globally

---

## Phase 3.2: Pre-Migration Visual Baseline (TDD for Visual Regression)

⚠️ **CRITICAL**: Capture baseline screenshots BEFORE migration to enable visual regression testing

### T007: [P] Create Playwright visual test harness
**File**: `tests/visual/components.visual.spec.ts`
**Description**: Create Playwright E2E test that renders all 14 components to be migrated in isolated test page and captures baseline screenshots
**Components to test**:
- `audio-button`, `dashboard`, `practice-session`, `session-results`
- `common/Button`, `common/Card`, `common/FeedbackCard`, `common/IconButton`, `common/MasteryBar`, `common/StatCard`
- `forms/Checkbox`, `forms/Input`, `forms/Select`, `forms/Slider`

**Acceptance**:
- Test file uses `page.goto()` to load test page with all components
- Uses `expect(page.locator('[data-testid="component-name"]')).toHaveScreenshot()` for each component
- Baseline screenshots saved in `tests/visual/__screenshots__/` (Playwright default)
- All tests pass (baseline established)

---

### T008: [P] Create component test page for visual tests
**File**: `tests/visual/test-page.html` (or integrate into existing test setup)
**Description**: Create isolated HTML page that renders all 14 components with `data-testid` attributes for screenshot capture
**Acceptance**:
- Page renders all 14 components in various states (default, hover, disabled, etc.)
- Each component has unique `data-testid` matching test expectations
- Page accessible via Playwright test server

---

## Phase 3.3: Core Component Migration (Big Bang)

⚠️ **All T009-T022 must be completed in SINGLE PR per clarification (big bang migration)**

### Common Components (High Priority - Most Reused)

### T009: [P] Migrate Button component to CSS Modules
**Files**:
- `src/modules/ui/components/common/Button.tsx`
- `src/modules/ui/components/common/Button.module.css` (NEW)

**Description**: Extract inline styles from Button.tsx into Button.module.css following contract rules. Support variants (primary, secondary, outline), sizes (sm, md, lg), and disabled state.

**Migration checklist** (from `contracts/css-modules.md`):
- [ ] Create `Button.module.css` in same directory
- [ ] Import: `import styles from './Button.module.css';`
- [ ] Extract all inline styles to CSS classes
- [ ] Replace hardcoded values with design tokens (`var(--color-primary)`, etc.)
- [ ] Apply classes with `className={styles.button}`
- [ ] Use `clsx` for conditional classes (variants, sizes, states)
- [ ] Add `className?: string` prop to component interface
- [ ] Remove all `style={{}}` usage (except CSS custom properties if needed)
- [ ] Use BEM-inspired naming: `.button`, `.button--primary`, `.button--disabled`

**Acceptance**:
- No inline styles in Button.tsx (except CSS custom properties for dynamic values)
- All design values use CSS custom properties from `variables.css`
- Component accepts `className` prop for composability
- Existing Button tests pass (update assertions to check class names, not inline styles)
- Visual appearance unchanged (verify via screenshot test in T023)

---

### T010: [P] Migrate Card component to CSS Modules
**Files**:
- `src/modules/ui/components/common/Card.tsx`
- `src/modules/ui/components/common/Card.module.css` (NEW)

**Description**: Extract inline styles from Card.tsx into Card.module.css. Support variants (default, highlighted, gradient) and interactive state.

**Acceptance**: Same migration checklist as T009

---

### T011: [P] Migrate Input component to CSS Modules
**Files**:
- `src/modules/ui/components/forms/Input.tsx`
- `src/modules/ui/components/forms/Input.module.css` (NEW)

**Description**: Extract inline styles from Input.tsx into Input.module.css. Support error state, disabled state, and placeholder styling.

**Acceptance**: Same migration checklist as T009

---

### T012: [P] Migrate IconButton component to CSS Modules
**Files**:
- `src/modules/ui/components/common/IconButton.tsx`
- `src/modules/ui/components/common/IconButton.module.css` (NEW)

**Description**: Extract inline styles from IconButton.tsx into IconButton.module.css.

**Acceptance**: Same migration checklist as T009

---

### Form Components

### T013: [P] Migrate Checkbox component to CSS Modules
**Files**:
- `src/modules/ui/components/forms/Checkbox.tsx`
- `src/modules/ui/components/forms/Checkbox.module.css` (NEW)

**Description**: Extract inline styles from Checkbox.tsx into Checkbox.module.css. Handle checked/unchecked states, disabled state, and custom focus styles.

**Acceptance**: Same migration checklist as T009

---

### T014: [P] Migrate Select component to CSS Modules
**Files**:
- `src/modules/ui/components/forms/Select.tsx`
- `src/modules/ui/components/forms/Select.module.css` (NEW)

**Description**: Extract inline styles from Select.tsx into Select.module.css.

**Acceptance**: Same migration checklist as T009

---

### T015: [P] Migrate Slider component to CSS Modules
**Files**:
- `src/modules/ui/components/forms/Slider.tsx`
- `src/modules/ui/components/forms/Slider.module.css` (NEW)

**Description**: Extract inline styles from Slider.tsx into Slider.module.css. Handle track, thumb, and value label styling.

**Acceptance**: Same migration checklist as T009

---

### Feature-Specific Components

### T016: [P] Migrate audio-button component to CSS Modules
**Files**:
- `src/modules/ui/components/audio-button.tsx`
- `src/modules/ui/components/audio-button.module.css` (NEW)

**Description**: Extract inline styles from audio-button.tsx into audio-button.module.css. Handle playing/paused states and icon sizing.

**Acceptance**: Same migration checklist as T009

---

### T017: [P] Migrate FeedbackCard component to CSS Modules
**Files**:
- `src/modules/ui/components/common/FeedbackCard.tsx`
- `src/modules/ui/components/common/FeedbackCard.module.css` (NEW)

**Description**: Extract inline styles from FeedbackCard.tsx into FeedbackCard.module.css. Handle correct/incorrect feedback states.

**Acceptance**: Same migration checklist as T009

---

### T018: [P] Migrate StatCard component to CSS Modules
**Files**:
- `src/modules/ui/components/common/StatCard.tsx`
- `src/modules/ui/components/common/StatCard.module.css` (NEW)

**Description**: Extract inline styles from StatCard.tsx into StatCard.module.css.

**Acceptance**: Same migration checklist as T009

---

### T019: [P] Migrate MasteryBar component to CSS Modules
**Files**:
- `src/modules/ui/components/common/MasteryBar.tsx`
- `src/modules/ui/components/common/MasteryBar.module.css` (NEW)

**Description**: Extract inline styles from MasteryBar.tsx into MasteryBar.module.css. Use CSS custom properties for dynamic progress percentage.

**Acceptance**: Same migration checklist as T009 + use `--progress-percentage` CSS variable for dynamic width

---

### Page-Level Components (Sequential - May Share State/Context)

### T020: Migrate dashboard component to CSS Modules
**Files**:
- `src/modules/ui/components/dashboard.tsx`
- `src/modules/ui/components/dashboard.module.css` (NEW)

**Description**: Extract inline styles from dashboard.tsx into dashboard.module.css. Handle layout grid, responsive breakpoints.

**Acceptance**: Same migration checklist as T009 (NO [P] - sequential due to potential state dependencies)

---

### T021: Migrate practice-session component to CSS Modules
**Files**:
- `src/modules/ui/components/practice-session.tsx`
- `src/modules/ui/components/practice-session.module.css` (NEW)

**Description**: Extract inline styles from practice-session.tsx into practice-session.module.css.

**Acceptance**: Same migration checklist as T009 (NO [P] - sequential)

---

### T022: Migrate session-results component to CSS Modules
**Files**:
- `src/modules/ui/components/session-results.tsx`
- `src/modules/ui/components/session-results.module.css` (NEW)

**Description**: Extract inline styles from session-results.tsx into session-results.module.css.

**Acceptance**: Same migration checklist as T009 (NO [P] - sequential)

---

## Phase 3.4: Post-Migration Visual Regression Verification

### T023: Run Playwright visual regression tests
**File**: `tests/visual/components.visual.spec.ts` (from T007)
**Description**: Re-run Playwright visual tests and compare against baseline screenshots captured in T007. ALL screenshots must match exactly (zero visual regression per FR-008).

**Acceptance**:
- All Playwright screenshot comparisons pass (no pixel differences)
- If diffs found, fix styles in component CSS Modules until tests pass
- Document any intentional visual changes (should be zero)

---

### T024: Update component unit tests
**Files**: All `tests/unit/ui/components/*.test.tsx`
**Description**: Update existing component unit tests to verify CSS Module class names instead of inline styles. Use pattern from `TopicCard.test.tsx` as reference.

**Pattern**:
```tsx
import styles from '@/modules/ui/components/Button.module.css';

it('applies correct class names', () => {
  const { container } = render(<Button variant="primary" />);
  const button = container.querySelector('button');
  expect(button?.className).toContain(styles.button);
  expect(button?.className).toContain(styles['button--primary']);
});
```

**Acceptance**:
- All existing unit tests pass
- Tests verify `className` prop works (custom classes applied)
- Tests verify correct CSS Module classes applied for variants/states

---

## Phase 3.5: Tooling & Enforcement

### T025: [P] Add ESLint rule to warn on inline styles
**File**: `.eslintrc.js` (or `.eslintrc.json`)
**Description**: Add ESLint rule to warn when `style` prop is used (per FR-012), with exception message for CSS custom properties.

**Rule**:
```javascript
{
  rules: {
    'react/forbid-dom-props': ['warn', {
      forbid: [{
        propName: 'style',
        message: 'Use CSS Modules instead of inline styles. Exception: CSS custom properties (--var-name).'
      }]
    }]
  }
}
```

**Acceptance**:
- ESLint warns on `style={{}}` usage
- No warnings in migrated components (except legitimate CSS custom properties)

---

### T026: [P] Create component template with CSS Modules
**File**: `src/modules/ui/components/_template/Component.tsx` and `Component.module.css`
**Description**: Create template files demonstrating CSS Modules best practices for new components (per FR-014)

**Acceptance**:
- Template shows correct import pattern
- Demonstrates `clsx` usage for conditional classes
- Includes `className` prop
- CSS uses design tokens
- Includes inline comments explaining patterns

---

## Phase 3.6: Documentation

### T027: Update CLAUDE.md with CSS Modules guidelines
**File**: `CLAUDE.md`
**Description**: ALREADY COMPLETED (done during `/plan` execution). Verify guidelines are present and accurate.

**Verification**:
- [ ] CSS Modules described as the ONLY approved styling approach
- [ ] Design token usage documented
- [ ] BEM-inspired class naming convention explained
- [ ] Examples provided (import, usage, conditional classes)
- [ ] Links to `contracts/css-modules.md`, `quickstart.md`, `data-model.md`

**Acceptance**: CLAUDE.md contains comprehensive CSS Modules section (already present)

---

### T028: [P] Create migration summary report
**File**: `specs/004-issue-11-on/MIGRATION-REPORT.md`
**Description**: Document migration results: components migrated, visual regression test results, bundle size impact, any issues encountered

**Template**:
```markdown
# CSS Modules Migration Report

## Summary
- **Components Migrated**: 14/14
- **Visual Regressions**: 0 (all Playwright tests passed)
- **Bundle Size Impact**: [before] → [after] (from `npm run build`)
- **Migration Date**: YYYY-MM-DD

## Components
- ✅ Button, Card, IconButton, FeedbackCard, StatCard, MasteryBar (common/)
- ✅ Checkbox, Input, Select, Slider (forms/)
- ✅ audio-button, dashboard, practice-session, session-results

## Issues Encountered
[Document any issues and how they were resolved - should be empty if smooth migration]

## Performance
- Initial bundle size: [X KB]
- Post-migration bundle size: [Y KB]
- Lighthouse score: [before/after]
```

**Acceptance**: Report documents all migration outcomes

---

## Dependencies

```
Foundation Setup (T001-T006)
    ↓
Pre-Migration Tests (T007-T008) - Establish baseline
    ↓
Component Migration (T009-T022) - BIG BANG in single PR
    ↓
Visual Regression Verification (T023-T024)
    ↓
Tooling & Documentation (T025-T028)
```

**Critical Paths**:
1. T001-T006 MUST complete before T009-T022 (components need design tokens)
2. T007-T008 MUST complete before T009-T022 (need baseline screenshots)
3. T023 MUST pass before merging migration PR (zero visual regression required)
4. T009-T022 happen together in SINGLE PR (big bang migration per clarification)

**Blocking Dependencies**:
- T007 blocks T009-T022 (need baseline before migration)
- T009-T022 block T023 (need migration complete to verify)
- T023 blocks PR merge (must pass visual regression tests)

---

## Parallel Execution Examples

### Foundation Setup (can run simultaneously)
```bash
# T002, T003, T004 can run in parallel (different files)
Task: "Create CSS design tokens in src/modules/ui/styles/variables.css"
Task: "Create global CSS reset in src/modules/ui/styles/global.css"
Task: "Create utilities CSS in src/modules/ui/styles/utilities.css"
```

### Component Migration (all in single PR, but can be worked on in parallel)
```bash
# T009-T019 can be developed in parallel (different component files)
Task: "Migrate Button to CSS Modules in src/modules/ui/components/common/Button.tsx"
Task: "Migrate Card to CSS Modules in src/modules/ui/components/common/Card.tsx"
Task: "Migrate Input to CSS Modules in src/modules/ui/components/forms/Input.tsx"
Task: "Migrate Checkbox to CSS Modules in src/modules/ui/components/forms/Checkbox.tsx"
Task: "Migrate Select to CSS Modules in src/modules/ui/components/forms/Select.tsx"
Task: "Migrate Slider to CSS Modules in src/modules/ui/components/forms/Slider.tsx"
Task: "Migrate IconButton to CSS Modules in src/modules/ui/components/common/IconButton.tsx"
Task: "Migrate audio-button to CSS Modules in src/modules/ui/components/audio-button.tsx"
Task: "Migrate FeedbackCard to CSS Modules in src/modules/ui/components/common/FeedbackCard.tsx"
Task: "Migrate StatCard to CSS Modules in src/modules/ui/components/common/StatCard.tsx"
Task: "Migrate MasteryBar to CSS Modules in src/modules/ui/components/common/MasteryBar.tsx"
```

### Tooling (can run simultaneously)
```bash
# T025, T026 can run in parallel (different files)
Task: "Add ESLint rule in .eslintrc.js"
Task: "Create component template in src/modules/ui/components/_template/"
```

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **Big Bang Migration**: T009-T022 completed in SINGLE PR (per clarification)
- **Visual Regression Gate**: T023 MUST pass before merging (zero visual regressions)
- **Fix Forward**: No rollback allowed if issues found (per clarification FR-018)
- **Reference Implementation**: `TopicCard.tsx` + `TopicCard.module.css` already uses CSS Modules
- **Avoid**: Hardcoded colors/spacing, inline styles, mixing styling approaches

---

## Validation Checklist

- [x] All 14 components have migration tasks (T009-T022)
- [x] Visual regression tests before (T007) and after (T023) migration
- [x] Foundation setup (design tokens) before component migration
- [x] Big bang migration strategy followed (all components in single PR)
- [x] Each task specifies exact file paths
- [x] Parallel tasks truly independent (different files)
- [x] Contract rules (`contracts/css-modules.md`) enforced in migration checklist
- [x] ESLint enforcement (T025) and developer templates (T026) included
- [x] Documentation updated (T027-T028)

---

## Acceptance Criteria for Complete Feature

✅ **All tasks completed when**:
1. All 14 components use CSS Modules (no inline styles)
2. Design tokens used consistently (`var(--color-primary)`, etc.)
3. All Playwright visual regression tests pass (T023)
4. All existing unit tests pass with updated assertions (T024)
5. ESLint warns on new inline style usage (T025)
6. CLAUDE.md contains CSS Modules guidelines (T027)
7. Bundle size impact documented (T028)
8. Zero visual regressions verified
9. Migration PR merged to main branch

**Success Metrics** (from spec.md):
- ✅ 100% of components use CSS Modules
- ✅ Zero visual regression in UI
- ✅ Build output contains no unused styles
- ✅ CLAUDE.md contains comprehensive styling guidelines
- ✅ All developers can find and follow the standard
