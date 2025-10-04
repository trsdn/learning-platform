# Tasks: Accessible Topic Cards with Semantic Buttons

**Input**: Design documents from `/specs/003-accessible-topic-cards/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. ✅ Load plan.md from feature directory
   → Tech stack: React 18.3, TypeScript 5.x, Vite, Vitest, Playwright
   → Project structure: src/modules/ui/components/
2. ✅ Load design documents:
   → research.md: Use <button>, ARIA labels, CSS reset, :focus-visible
   → data-model.md: TopicCardProps interface, accessibility contract
   → contracts/: TopicCard.contract.md, accessibility.contract.md
3. ✅ Generate tasks by category:
   → Tests: Accessibility tests, keyboard tests, E2E tests
   → Core: Extract TopicCard component, add semantic button
   → Polish: Documentation, cross-browser verification
4. ✅ Apply task rules:
   → Tests before implementation (TDD)
   → Mark [P] for parallel tasks (different files)
5. ✅ Task validation complete
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
Repository uses single project structure:
- Components: `src/modules/ui/components/`
- Tests: `tests/unit/`, `tests/e2e/`
- CSS: Component co-location with `.module.css` or `.css`

## Phase 3.1: Setup

- [x] T001 [P] Install accessibility testing dependencies
  - Install: `@testing-library/jest-dom`, `@axe-core/react`, `jest-axe`
  - Update: `package.json`
  - Files: Different from other tasks

- [x] T002 [P] Create test configuration for accessibility
  - Create: `tests/setup/a11y-matchers.ts`
  - Configure jest-axe matchers
  - Import axe and toHaveNoViolations
  - Files: Different from other tasks

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [x] T003 [P] Unit test: TopicCard renders as button element
  - Create: `tests/unit/ui/components/TopicCard.test.tsx`
  - Test: Component renders as `<button>` element
  - Test: Has `type="button"` attribute
  - Test: Displays topic name and description
  - Test: Calls onSelect with topic.id on click
  - Files: New test file (parallel safe)

- [x] T004 [P] Unit test: TopicCard accessibility attributes
  - File: `tests/unit/ui/components/TopicCard.test.tsx`
  - Test: Has correct `aria-label` pattern
  - Test: Icon has `aria-hidden="true"`
  - Test: Has proper button role (implicit)
  - Files: Same as T003 (must run after T003)

- [x] T005 [P] Accessibility test: WCAG compliance
  - Create: `tests/unit/ui/components/TopicCard.a11y.test.tsx`
  - Test: Zero axe violations with jest-axe
  - Test: WCAG 2.1.1 keyboard compliance
  - Test: WCAG 4.1.2 name/role/value compliance
  - Files: New test file (parallel safe)

- [x] T006 [P] Unit test: Keyboard interaction
  - File: `tests/unit/ui/components/TopicCard.test.tsx`
  - Test: Enter key calls onSelect
  - Test: Space key calls onSelect
  - Test: Does not call onSelect when disabled
  - Files: Same as T003/T004 (must run after T004)

- [x] T007 [P] E2E test: Keyboard navigation flow
  - Create: `tests/e2e/keyboard-navigation.spec.ts`
  - Test: Tab navigates through all topic cards in sequence
  - Test: Enter key on focused card navigates to topic
  - Test: Space key on focused card navigates to topic
  - Test: Focus indicator visible when using keyboard
  - Files: New E2E file (parallel safe)

- [x] T008 [P] E2E test: Screen reader announcements
  - Create: `tests/e2e/screen-reader.spec.ts`
  - Test: Cards announced as "Button" role
  - Test: aria-label read correctly by screen reader
  - Test: Icon hidden from screen reader
  - Files: New E2E file (parallel safe)

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [x] T009 Extract TopicCard component from main.tsx
  - Create: `src/modules/ui/components/TopicCard.tsx`
  - Extract topic card markup from main.tsx lines 430-460
  - Create TypeScript interface TopicCardProps
  - Keep using `<div>` initially (refactor in next task)
  - Export component
  - Files: New component file + main.tsx modification (sequential)

- [x] T010 Replace div with semantic button element
  - File: `src/modules/ui/components/TopicCard.tsx`
  - Change root element from `<div>` to `<button type="button">`
  - Add aria-label: `Thema ${topic.name} öffnen - ${topic.description}`
  - Add aria-hidden="true" to icon element
  - Preserve all existing content structure
  - Files: Same component (must run after T009)

- [x] T011 Create CSS module with button reset
  - Create: `src/modules/ui/components/TopicCard.module.css`
  - Add button reset styles (background: none, border: none, etc.)
  - Preserve existing card styles from main.tsx inline styles
  - Ensure min-width/height: 44px (WCAG 2.5.5)
  - Files: New CSS file (parallel safe)

- [x] T012 Add focus-visible styles
  - File: `src/modules/ui/components/TopicCard.module.css`
  - Add :focus-visible with 2px solid outline
  - Add :focus:not(:focus-visible) with outline: none
  - Add high contrast mode support
  - Files: Same CSS file (must run after T011)

- [x] T013 Add hover and active states
  - File: `src/modules/ui/components/TopicCard.module.css`
  - Preserve hover: transform translateY(-4px) and box-shadow
  - Add :active state: transform translateY(0)
  - Add :disabled state: opacity 0.5, cursor not-allowed
  - Files: Same CSS file (must run after T012)

- [x] T014 Update main.tsx to use TopicCard component
  - File: `src/main.tsx`
  - Import TopicCard component
  - Replace inline topic card divs (lines 430-460) with <TopicCard>
  - Pass topic and onSelect props
  - Remove inline styles (now in CSS module)
  - Files: main.tsx (must run after T010)

## Phase 3.4: Integration

- [x] T015 Add TypeScript types for TopicCard
  - File: `src/modules/ui/components/TopicCard.tsx`
  - Define TopicCardProps interface
  - Define Topic interface (or import from core/types)
  - Add JSDoc comments with examples
  - Files: Same component (must run after T010)

- [x] T016 Add disabled state support
  - File: `src/modules/ui/components/TopicCard.tsx`
  - Add optional disabled prop (default: false)
  - Add disabled attribute to button
  - Update onClick to not fire when disabled
  - Files: Same component (must run after T015)

- [x] T017 [P] Add data-testid for E2E testing
  - File: `src/modules/ui/components/TopicCard.tsx`
  - Add optional data-testid prop
  - Apply to button element
  - Files: Same component (must run after T016)

## Phase 3.5: Polish

- [x] T018 [P] Add component documentation
  - Create: `src/modules/ui/components/TopicCard.md`
  - Document props, usage, accessibility features
  - Add code examples
  - Link to contracts and research
  - Files: New documentation file (parallel safe)

- [x] T019 [P] Verify all tests pass
  - Run: `npm test TopicCard`
  - Ensure all unit tests pass
  - Ensure accessibility tests pass (zero violations)
  - Files: No file changes (validation only)

- [x] T020 [P] Verify E2E tests pass
  - Run: `npm run test:e2e keyboard-navigation`
  - Run: `npm run test:e2e screen-reader`
  - Ensure all E2E scenarios pass
  - Files: No file changes (validation only)

- [x] T021 [P] Manual keyboard testing
  - Test: Tab through all cards
  - Test: Enter/Space activate cards
  - Test: Focus indicator visible
  - Verify: No visual regression
  - Files: No file changes (manual validation)

- [x] T022 [P] Cross-browser verification
  - Test in Chrome: Keyboard and visual
  - Test in Firefox: Keyboard and visual
  - Test in Safari: Keyboard and visual
  - Test in Edge: Keyboard and visual
  - Files: No file changes (manual validation)

- [x] T023 [P] Lighthouse accessibility audit
  - Run: Lighthouse in Chrome DevTools
  - Verify: Accessibility score = 100
  - Verify: Zero WCAG violations
  - Files: No file changes (audit only)

- [x] T024 Update implementation plan progress
  - File: `specs/003-accessible-topic-cards/plan.md`
  - Mark Phase 3-4 as complete
  - Add implementation notes
  - Files: Plan file (final task)

## Dependencies

**Critical TDD Flow**:
- T001-T002 (Setup) → MUST complete first
- T003-T008 (Tests) → MUST write and see fail before implementation
- T009-T017 (Implementation) → ONLY after tests are failing
- T018-T024 (Polish) → After implementation complete

**Sequential Dependencies**:
- T003 → T004 → T006 (same test file)
- T009 → T010 → T014 (component creation, modification, integration)
- T011 → T012 → T013 (CSS file sequential changes)
- T010 → T015 → T016 → T017 (TypeScript types and props)

**Parallel Groups**:
- T001, T002 (different files, setup phase)
- T003, T005, T007, T008 (different test files)
- T011 (CSS) parallel with T015 (types) - different files
- T018, T019, T020, T021, T022, T023 (polish phase, mostly validation)

## Parallel Execution Examples

### Setup Phase (can run together):
```bash
# Launch T001 and T002 in parallel
Task: "Install accessibility testing dependencies (@testing-library/jest-dom, @axe-core/react, jest-axe)"
Task: "Create test configuration for accessibility in tests/setup/a11y-matchers.ts"
```

### Test Phase (can run together after setup):
```bash
# Launch T003, T005, T007, T008 in parallel
Task: "Unit test TopicCard renders as button in tests/unit/ui/components/TopicCard.test.tsx"
Task: "Accessibility test WCAG compliance in tests/unit/ui/components/TopicCard.a11y.test.tsx"
Task: "E2E keyboard navigation test in tests/e2e/keyboard-navigation.spec.ts"
Task: "E2E screen reader test in tests/e2e/screen-reader.spec.ts"
```

### Polish Phase (can run together):
```bash
# Launch T018, T019, T020, T021, T022, T023 in parallel
Task: "Add component documentation in TopicCard.md"
Task: "Verify all unit tests pass"
Task: "Verify E2E tests pass"
Task: "Manual keyboard testing"
Task: "Cross-browser verification"
Task: "Lighthouse accessibility audit"
```

## File Summary

**New Files Created** (11 files):
1. `tests/unit/ui/components/TopicCard.test.tsx` - Unit tests
2. `tests/unit/ui/components/TopicCard.a11y.test.tsx` - Accessibility tests
3. `tests/e2e/keyboard-navigation.spec.ts` - E2E keyboard tests
4. `tests/e2e/screen-reader.spec.ts` - E2E screen reader tests
5. `tests/setup/a11y-matchers.ts` - Accessibility test setup
6. `src/modules/ui/components/TopicCard.tsx` - Component
7. `src/modules/ui/components/TopicCard.module.css` - Styles
8. `src/modules/ui/components/TopicCard.md` - Documentation

**Modified Files** (2 files):
1. `src/main.tsx` - Use TopicCard component
2. `package.json` - Add a11y dependencies
3. `specs/003-accessible-topic-cards/plan.md` - Update progress

## Notes

- **[P] tasks**: Different files, no dependencies, safe to parallelize
- **Sequential tasks**: Same file modifications, must run in order
- **TDD Critical**: Tests MUST fail before writing implementation
- **Accessibility First**: Zero WCAG violations is non-negotiable
- **Visual Preservation**: Design must look identical to current cards
- **Commit Strategy**: Commit after each logical task group

## Validation Checklist

### Pre-Implementation (Phase 3.2)
- [x] All test files created
- [x] All tests written
- [x] All tests failing (no implementation exists)

### Post-Implementation (Phase 3.3-3.4)
- [ ] All tests passing
- [ ] Component uses `<button>` element
- [ ] Proper ARIA labels
- [ ] CSS reset applied
- [ ] Focus indicators working
- [ ] Visual design preserved

### Final Verification (Phase 3.5)
- [ ] Zero WCAG violations
- [ ] 100% test coverage
- [ ] All E2E tests pass
- [ ] Cross-browser verified
- [ ] Lighthouse score: 100
- [ ] Documentation complete

## Success Criteria

✅ All topic cards use semantic `<button>` elements
✅ WCAG 2.1.1 (Keyboard) compliance verified
✅ WCAG 4.1.2 (Name, Role, Value) compliance verified
✅ Zero visual regression (pixel-perfect preservation)
✅ All automated tests passing
✅ Manual testing successful
✅ Cross-browser compatibility confirmed
✅ Lighthouse accessibility score: 100

## Task Generation Rules Applied

1. **From Contracts**:
   - TopicCard.contract.md → T003-T006 (component tests)
   - accessibility.contract.md → T005, T007, T008 (a11y tests)

2. **From Data Model**:
   - TopicCardProps → T009, T015 (interface and types)
   - AccessibilityContract → T010, T012 (semantic HTML, focus)

3. **From Research**:
   - Button decision → T010 (semantic button)
   - CSS reset pattern → T011 (button reset)
   - ARIA pattern → T010 (aria-label)
   - Focus pattern → T012 (focus-visible)

4. **From Quickstart**:
   - 5-minute implementation → T009-T014 (core tasks)
   - Testing checklist → T019-T023 (verification)

## Execution Strategy

**Recommended approach**:
1. **Phase 3.1** (5 min): Setup - Run T001, T002 in parallel
2. **Phase 3.2** (30 min): Tests - Run T003-T008, verify all fail
3. **Phase 3.3** (45 min): Implementation - Run T009-T014 sequentially
4. **Phase 3.4** (15 min): Integration - Run T015-T017 sequentially
5. **Phase 3.5** (30 min): Polish - Run T018-T024 in parallel/sequential

**Total estimated time**: ~2 hours

**Risk mitigation**:
- Tests first ensures we know what success looks like
- Sequential CSS changes prevent conflicts
- Component extraction before modification reduces risk
- Manual verification catches edge cases
