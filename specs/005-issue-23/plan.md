
# Implementation Plan: Auto-Play Audio for Language Learning Tasks

**Branch**: `005-issue-23` | **Date**: 2025-10-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-issue-23/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Implement automatic audio playback for language learning tasks to enhance pronunciation practice and create an immersive learning experience. Audio will play automatically after a 500ms delay for non-German content (foreign language questions and answers like Spanish, French, etc.), while German content remains silent. Students can manually replay audio anytime using a replay button or keyboard shortcuts. The system will intelligently handle browser auto-play policies, preload the next question's audio for smooth transitions, and continue playback even when the browser tab loses focus for uninterrupted learning.

## Technical Context
**Language/Version**: TypeScript 5.x / JavaScript ES2022
**Primary Dependencies**: React (UI framework), Vite (build tool), HTML5 Audio API
**Storage**: LocalStorage for audio settings (user preferences), IndexedDB with Dexie.js for audio metadata caching
**Testing**: Vitest for unit tests, Playwright for E2E tests, visual regression for audio button states
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) with PWA support
**Project Type**: Single-page web application (client-side only, GitHub Pages hosted)
**Performance Goals**: <100ms audio playback response, <1s audio preload time, <3s initial page load
**Constraints**: Browser auto-play policies (user interaction required), offline-capable audio caching, 500ms auto-play delay, background playback enabled
**Scale/Scope**: Single-user PWA, ~10 audio-enabled task types, 100s of audio files per language, 5-10 concurrent audio requests during session

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Zero-Cost Static**: ✅ Pure client-side using HTML5 Audio API, no backend audio processing, audio files served as static assets from GitHub Pages
- [x] **Modular Architecture**: ✅ Audio playback module independent from UI components, clear interfaces (AudioService, AudioSettings), follows existing module pattern (src/modules/core/services/)
- [x] **Complete Automation**: ✅ Existing GitHub Actions will handle build/deploy, tests can run in CI (unit + E2E audio playback tests)
- [x] **Type-Safe & Testable**: ✅ TypeScript interfaces for AudioSettings and AudioPlayback entities, mock Audio API for unit tests, Playwright for E2E audio behavior
- [x] **Offline-First PWA**: ✅ Service worker will cache audio files (Workbox caching strategy), audio available offline after first play, IndexedDB stores playback state
- [x] **Maintainability First**: ✅ Documented audio service API, keyboard shortcuts in help docs, settings persisted in LocalStorage with migration strategy

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── modules/
│   ├── core/
│   │   ├── entities/          # Domain entities
│   │   │   ├── audio-settings.ts       # NEW: AudioSettings entity
│   │   │   └── audio-playback.ts       # NEW: AudioPlayback state entity
│   │   └── services/          # Business logic
│   │       └── audio-service.ts        # NEW: Audio playback service
│   ├── storage/
│   │   └── adapters/
│   │       ├── audio-settings-storage.ts  # NEW: LocalStorage adapter for settings
│   │       └── audio-cache-storage.ts     # NEW: IndexedDB adapter for audio metadata
│   └── ui/
│       ├── components/
│       │   ├── audio-button.tsx          # MODIFIED: Add auto-play support
│       │   └── practice-session.tsx      # MODIFIED: Integrate auto-play
│       ├── hooks/
│       │   ├── use-audio-playback.ts     # NEW: Audio playback hook
│       │   └── use-audio-settings.ts     # NEW: Audio settings hook
│       └── styles/
│           └── audio-button.module.css   # MODIFIED: Loading/playing states
public/
└── audio/                    # Static audio files
    ├── spanish/
    ├── french/
    └── ...

tests/
├── unit/
│   ├── core/
│   │   ├── audio-service.test.ts        # NEW: Service tests
│   │   └── audio-settings.test.ts       # NEW: Settings tests
│   └── ui/
│       └── audio-button.test.tsx        # MODIFIED: Auto-play tests
└── e2e/
    └── audio-playback.spec.ts           # NEW: E2E auto-play scenarios
```

**Structure Decision**: Single-page web application following existing modular architecture. Audio functionality splits across three layers: (1) Core domain layer with AudioService for business logic, (2) Storage layer with LocalStorage for settings and IndexedDB for audio metadata caching, (3) UI layer with React hooks and enhanced audio-button component. This maintains separation of concerns while allowing independent testing of each layer.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
The /tasks command will generate tasks in this order:

1. **Contract Test Tasks** (TDD - Write tests first):
   - Task: Write AudioService contract tests → `tests/unit/core/audio-service.test.ts` [P]
   - Task: Write AudioSettingsStorage contract tests → `tests/unit/storage/audio-settings-storage.test.ts` [P]

2. **Entity Tasks** (Foundation):
   - Task: Create AudioSettings entity → `src/modules/core/entities/audio-settings.ts` [P]
   - Task: Create AudioPlayback entity → `src/modules/core/entities/audio-playback.ts` [P]
   - Task: Extend Task entity with audio fields → `src/modules/core/entities/task.ts`

3. **Storage Tasks**:
   - Task: Implement AudioSettingsStorage → `src/modules/storage/adapters/audio-settings-storage.ts`
   - Task: Add audio metadata to IndexedDB schema → `src/modules/storage/db-schema.ts`

4. **Service Tasks**:
   - Task: Implement AudioService → `src/modules/core/services/audio-service.ts`
   - Task: Add browser auto-play policy detection → (within AudioService)
   - Task: Add audio preloading logic → (within AudioService)

5. **UI Hook Tasks**:
   - Task: Create useAudioPlayback hook → `src/modules/ui/hooks/use-audio-playback.ts`
   - Task: Create useAudioSettings hook → `src/modules/ui/hooks/use-audio-settings.ts`

6. **Component Tasks**:
   - Task: Enhance AudioButton component with auto-play → `src/modules/ui/components/audio-button.tsx`
   - Task: Add CSS for loading/playing states → `src/modules/ui/styles/audio-button.module.css`
   - Task: Integrate auto-play in PracticeSession → `src/modules/ui/components/practice-session.tsx`
   - Task: Add keyboard shortcuts to PracticeSession → (within practice-session.tsx)
   - Task: Add audio settings UI in Settings page → `src/modules/ui/components/settings.tsx`

7. **Service Worker Tasks**:
   - Task: Add audio caching strategy to service worker → `src/service-worker.js`
   - Task: Configure Workbox for audio files → (within service-worker.js)

8. **E2E Test Tasks** (From quickstart.md scenarios):
   - Task: E2E test for Scenario 1 (basic auto-play) → `tests/e2e/audio-playback.spec.ts`
   - Task: E2E test for Scenario 1a (no German auto-play) → (within audio-playback.spec.ts)
   - Task: E2E test for Scenario 1b (answer audio) → (within audio-playback.spec.ts)
   - Task: E2E test for Scenario 2-8 (remaining user stories) → (within audio-playback.spec.ts)
   - Task: E2E test for edge cases → (within audio-playback.spec.ts)
   - Task: E2E test for accessibility (IPA) → `tests/e2e/audio-accessibility.spec.ts`

9. **Visual Regression Tasks**:
   - Task: Add visual tests for audio button states → `tests/visual/audio-button.visual.spec.ts`

10. **Documentation Tasks**:
    - Task: Document keyboard shortcuts in help modal → `src/modules/ui/components/help-modal.tsx`
    - Task: Update README with audio feature → `README.md`

**Ordering Strategy**:
- TDD order: Contract tests → Entities → Implementation → E2E tests
- Dependency order: Entities → Storage → Services → Hooks → UI Components
- Mark [P] for parallel execution (independent files/modules)
- Service worker task after core implementation (not blocking)

**Estimated Output**: 35 numbered, ordered tasks in tasks.md

**Task Dependencies**:
```
Contract Tests [P]
    ↓
Entities [P]
    ↓
Storage Adapters
    ↓
AudioService
    ↓
UI Hooks
    ↓
UI Components
    ↓
E2E Tests
    ↓
Visual Tests + Docs [P]
```

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [x] Phase 3: Tasks generated (/tasks command) ✅ - 35 tasks ready
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented (none - no deviations) ✅

---
*Based on Constitution v2.2.0 - See `.specify/memory/constitution.md`*
