# Implementation Plan: Standardize Styling Approach

**Branch**: `004-issue-11-on` | **Date**: 2025-10-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-issue-11-on/spec.md`

## Execution Flow (/plan command scope)
```
1. ✅ Load feature spec from Input path
2. ✅ Fill Technical Context
   → Project Type: Web (frontend only - static PWA)
   → Current: Inline styles throughout (no Tailwind despite issue claim)
3. ✅ Fill Constitution Check section
4. ✅ Evaluate Constitution Check
   → No violations - styling standardization improves maintainability
5. → Execute Phase 0 → research.md
6. → Execute Phase 1 → data-model.md, contracts/, quickstart.md, CLAUDE.md update
7. → Re-evaluate Constitution Check
8. → Plan Phase 2 → Task generation approach
9. → STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 9. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Standardize styling approach across all UI components to eliminate mixed styling methods (currently all inline styles). Choose between CSS Modules, utility-first CSS, or CSS-in-JS. Migrate all components in `src/modules/ui/components/` to use the chosen approach. Update documentation and tooling to enforce consistency.

## Technical Context
**Language/Version**: TypeScript 5.x / JavaScript ES2022
**Primary Dependencies**: React 18.3, Vite 5.x (bundler)
**Storage**: N/A (styling configuration only)
**Testing**: Vitest for unit tests, Playwright for E2E, visual regression tests
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), PWA-enabled
**Project Type**: Web (frontend only - static PWA)
**Performance Goals**: <200KB initial bundle, <100ms style computation, 60fps animations
**Constraints**: Zero backend, static hosting only, no runtime style generation overhead
**Scale/Scope**: ~15 components in `src/modules/ui/components/`, growing codebase

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Zero-Cost Static**: ✅ Styling approach won't require backend (CSS Modules, Tailwind, or scoped CSS)
- [x] **Modular Architecture**: ✅ Component-scoped styles maintain separation of concerns
- [x] **Complete Automation**: ✅ Build tools handle style processing automatically
- [x] **Type-Safe & Testable**: ✅ CSS Modules provide type safety, visual regression tests ensure correctness
- [x] **Offline-First PWA**: ✅ Styles bundled with assets, no external dependencies
- [x] **Maintainability First**: ✅ Standardization improves long-term maintainability (core goal of this feature)

**Justification**: This feature directly supports constitutional principle VI (Maintainability First) by eliminating technical debt from mixed styling approaches. No constitutional violations.

## Project Structure

### Documentation (this feature)
```
specs/004-issue-11-on/
├── plan.md              # This file (/plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0: Styling approach evaluation
├── data-model.md        # Phase 1: Style patterns and component structure
├── quickstart.md        # Phase 1: Quick reference for developers
├── contracts/           # Phase 1: Styling contracts per approach
└── tasks.md             # Phase 2: Implementation tasks (/tasks command)
```

### Source Code (repository root)
```
src/
├── modules/
│   ├── core/            # Domain entities (unchanged)
│   ├── storage/         # Storage adapters (unchanged)
│   ├── ui/              # UI components - TARGET FOR MIGRATION
│   │   ├── components/
│   │   │   ├── TopicCard.tsx           # Already uses CSS Module (reference)
│   │   │   ├── TopicCard.module.css    # Example of chosen approach
│   │   │   ├── audio-button.tsx        # MIGRATE: Currently inline styles
│   │   │   ├── dashboard.tsx           # MIGRATE: Currently inline styles
│   │   │   ├── practice-session.tsx    # MIGRATE: Currently inline styles
│   │   │   ├── session-results.tsx     # MIGRATE: Currently inline styles
│   │   │   ├── common/                 # MIGRATE: Button, Card, etc.
│   │   │   └── forms/                  # MIGRATE: Input, Select, etc.
│   │   ├── styles/                     # NEW: Shared styles/utilities
│   │   │   ├── global.css             # NEW: If needed
│   │   │   ├── variables.css          # NEW: CSS custom properties
│   │   │   └── utilities.css          # NEW: Utility classes (if chosen)
│   │   └── hooks/
│   └── templates/       # Task templates (unchanged)

tests/
├── unit/
│   └── ui/              # Component unit tests (update assertions)
├── integration/
│   └── visual/          # NEW: Visual regression tests
└── e2e/                 # E2E tests (may need style selector updates)

CLAUDE.md                # UPDATE: Add styling guidelines
.eslintrc.*              # UPDATE: Add styling linting rules (if applicable)
vite.config.ts           # UPDATE: Configure chosen approach build settings
```

## Progress Tracking
- [x] Initial Constitution Check
- [x] Phase 0: Research (research.md) - Evaluate styling approaches ✅ CSS Modules recommended
- [x] Phase 1: Design (data-model.md, contracts/, quickstart.md, CLAUDE.md) ✅ All artifacts created
- [x] Post-Design Constitution Check ✅ Passed (see below)
- [ ] Phase 2: Tasks (tasks.md via /tasks command) - Ready to execute
- [ ] Phase 3-4: Implementation & Verification (separate workflow)

## Complexity Tracking
- **Estimated Complexity**: Medium (fibonacci 5)
  - Simple concept (styling standardization)
  - Moderate implementation (touch many files)
  - Requires careful migration (zero visual regression)

- **Risk Level**: Medium
  - **Visual Regression**: High impact if not tested properly
  - **Developer Disruption**: All component work affected during migration
  - **Build Configuration**: Wrong setup could break production

- **Dependencies**:
  - Decision on styling approach (CSS Modules vs. Tailwind vs. CSS-in-JS)
  - Current codebase uses 100% inline styles (not mixed as issue suggested)
  - Existing TopicCard.tsx already uses CSS Module pattern (good reference)

- **Breaking Changes**: None for end users (only developer workflow changes)

- **Migration Required**: Yes - all ~15 components need migration

- **Constitutional Concerns**: None - this feature improves maintainability

## Current State Analysis

### Findings from Codebase Audit
1. **Issue #11 Claim vs. Reality**:
   - Issue claims: "Tailwind CSS classes in audio-button.tsx"
   - Actual state: **No Tailwind configured**, all components use inline styles
   - Issue claims: "mixed approaches"
   - Actual state: 100% inline styles (except TopicCard.tsx with CSS Module)

2. **Current Styling**:
   - `TopicCard.tsx` + `TopicCard.module.css`: CSS Modules (recently added for accessibility)
   - All other components: Inline styles with `style={{...}}`
   - No global CSS files
   - No utility classes
   - No Tailwind installation

3. **Components to Migrate** (~15 files):
   - `audio-button.tsx`
   - `dashboard.tsx`
   - `practice-session.tsx`
   - `session-results.tsx`
   - `common/Button.tsx`, `Card.tsx`, `IconButton.tsx`, `FeedbackCard.tsx`, `StatCard.tsx`, `MasteryBar.tsx`
   - `forms/Checkbox.tsx`, `Input.tsx`, `Select.tsx`, `Slider.tsx`

### Recommended Approach
Given TopicCard.tsx already successfully uses **CSS Modules**, recommend continuing with this approach:
- ✅ Already proven in codebase
- ✅ Type-safe with TypeScript
- ✅ Scoped styles (no conflicts)
- ✅ Traditional CSS syntax (low learning curve)
- ✅ Good build tool support (Vite)
- ✅ Zero runtime overhead

## Post-Design Constitution Check

Re-verification after Phase 1 design completion:

- [x] **Zero-Cost Static**: ✅ CSS Modules extracted at build time, zero runtime overhead
- [x] **Modular Architecture**: ✅ Component-scoped styles maintain clean separation
- [x] **Complete Automation**: ✅ Vite handles CSS Module processing automatically, no manual steps
- [x] **Type-Safe & Testable**: ✅ TypeScript declarations + proven test patterns (TopicCard examples)
- [x] **Offline-First PWA**: ✅ Static CSS bundled with assets, no external dependencies
- [x] **Maintainability First**: ✅ Design tokens, clear patterns, comprehensive documentation

**Verdict**: ✅ All constitutional principles satisfied. Ready for task generation.

## Phase 2: Task Generation Approach

The `/tasks` command will generate `tasks.md` with the following structure:

### Task Categories
1. **Foundation Setup** (1-3 tasks)
   - Create shared CSS files (`variables.css`, `utilities.css`, `global.css`)
   - Add TypeScript declarations for CSS Modules
   - Install `clsx` dependency

2. **Common Components Migration** (3-5 tasks)
   - Migrate `Button.tsx`, `Card.tsx`, `IconButton.tsx`
   - Migrate form components (`Input.tsx`, `Checkbox.tsx`, `Select.tsx`, `Slider.tsx`)
   - High priority (used across multiple features)

3. **Feature Components Migration** (4-6 tasks)
   - Migrate `dashboard.tsx`, `practice-session.tsx`, `session-results.tsx`
   - Migrate `audio-button.tsx`, `FeedbackCard.tsx`, `StatCard.tsx`, `MasteryBar.tsx`
   - Medium priority (feature-specific)

4. **Documentation & Tooling** (2-3 tasks)
   - Add ESLint rules for inline style warnings
   - Update component templates
   - Add visual regression test suite

5. **Quality Assurance** (1-2 tasks)
   - Cross-browser testing
   - Bundle size verification
   - Lighthouse performance audit

### Task Dependency Order
```
Foundation Setup
    ↓
Common Components (parallel execution possible)
    ↓
Feature Components (parallel execution possible)
    ↓
Documentation & Tooling (parallel with Feature Components)
    ↓
Quality Assurance
```

### Estimated Task Count: 15-20 tasks

## Next Steps
1. ✅ Execute Phase 0: Research styling approaches (CSS Modules validated)
2. ✅ Execute Phase 1: Design migration strategy and patterns (all artifacts created)
3. ✅ Re-check constitution compliance (passed)
4. ✅ Plan Phase 2: Generate task breakdown (approach defined above)
5. **Ready for `/tasks` command** to create tasks.md with actionable implementation tasks
