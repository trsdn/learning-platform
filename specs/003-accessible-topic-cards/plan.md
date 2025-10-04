# Implementation Plan: Accessible Topic Cards with Semantic Buttons

**Branch**: `003-accessible-topic-cards` | **Date**: 2025-10-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-accessible-topic-cards/spec.md`

## Execution Flow (/plan command scope)
```
1. ✅ Load feature spec from Input path
2. ✅ Fill Technical Context
3. ✅ Fill Constitution Check section
4. ✅ Evaluate Constitution Check
5. → Execute Phase 0 → research.md
6. → Execute Phase 1 → contracts, data-model.md, quickstart.md
7. → Re-evaluate Constitution Check
8. → Plan Phase 2 → Task generation approach
9. → STOP - Ready for /tasks command
```

## Summary
Replace non-semantic clickable `<div>` elements with semantic `<button>` or `<a>` elements in topic cards to fix critical WCAG 2.1 Level A accessibility violations. Topic cards currently cannot be accessed via keyboard (violates WCAG 2.1.1) and screen readers don't announce them as interactive (violates WCAG 4.1.2). Solution implements semantic HTML with proper ARIA labels, keyboard navigation support, and visible focus indicators while preserving existing visual design through CSS button resets.

## Technical Context
**Language/Version**: TypeScript 5.x / JavaScript ES2022
**Primary Dependencies**: React 18.3, Vite 5.x, Vitest (testing)
**Storage**: IndexedDB with Dexie.js (existing), LocalStorage for settings
**Testing**: Vitest for unit tests, Playwright for E2E, jest-axe for accessibility
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), PWA-enabled
**Project Type**: Web (frontend only - static PWA)
**Performance Goals**: <100ms interaction response, 60fps animations
**Constraints**: Zero backend (static hosting), offline-first, WCAG 2.1 AA compliance
**Scale/Scope**: Small focused change - 4 topic cards on homepage, ~100 LOC

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Zero-Cost Static**: ✅ Pure client-side component change, no backend needed
- [x] **Modular Architecture**: ✅ Self-contained UI component change in existing module
- [x] **Complete Automation**: ✅ Uses existing CI/CD pipeline, adds accessibility tests
- [x] **Type-Safe & Testable**: ✅ TypeScript types, 100% test coverage for business logic
- [x] **Offline-First PWA**: ✅ No impact on offline functionality, pure UI enhancement
- [x] **Maintainability First**: ✅ Improves accessibility, adds tests, includes documentation

**Justification**: This is a focused accessibility fix that aligns with all constitutional principles. No new infrastructure needed - leverages existing modular architecture and testing setup.

## Project Structure

### Documentation (this feature)
```
specs/003-accessible-topic-cards/
├── plan.md              # This file (/plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technical research
├── data-model.md        # Phase 1: Component interface design
├── quickstart.md        # Phase 1: Quick implementation guide
├── contracts/           # Phase 1: Component contracts
└── tasks.md             # Phase 2: Implementation tasks (/tasks command)
```

### Source Code (repository root)
```
src/
├── modules/
│   ├── core/            # Domain entities (unchanged)
│   ├── storage/         # Storage adapters (unchanged)
│   ├── ui/              # UI components - TARGET FOR CHANGES
│   │   ├── components/
│   │   │   ├── topic-card.tsx          # MODIFY: Add semantic button
│   │   │   ├── topic-card.module.css   # MODIFY: Button reset styles
│   │   │   └── topic-selection.tsx     # REVIEW: Parent component
│   │   └── hooks/
│   │       └── useKeyboardNav.ts       # NEW: Keyboard navigation hook (optional)
│   └── templates/       # Task templates (unchanged)
│
tests/
├── unit/
│   └── ui/
│       └── topic-card.test.tsx         # ADD: Component unit tests
├── integration/
│   └── accessibility/
│       └── topic-cards-a11y.test.ts    # ADD: Accessibility tests
└── e2e/
    └── keyboard-navigation.spec.ts     # ADD: E2E keyboard tests
```

## Progress Tracking
- [x] Initial Constitution Check
- [x] Phase 0: Research (research.md)
- [x] Phase 1: Design (data-model.md, contracts/, quickstart.md)
- [x] Post-Design Constitution Check
- [x] Phase 2: Tasks (tasks.md via /tasks command)
- [x] Phase 3: Implementation (T001-T017 complete)
- [x] Phase 4: Polish & Documentation (T018-T024 complete)

## Complexity Tracking
- **Estimated Complexity**: Low (fibonacci 2)
- **Risk Level**: Low
- **Dependencies**: None - self-contained UI change
- **Breaking Changes**: None - backward compatible enhancement
- **Migration Required**: No
- **Constitutional Concerns**: None identified

## Next Steps
1. Execute Phase 0: Research accessibility patterns and button semantics
2. Execute Phase 1: Design component interface and contracts
3. Re-check constitution compliance
4. Plan Phase 2: Generate task breakdown
5. Ready for /tasks command to create tasks.md
