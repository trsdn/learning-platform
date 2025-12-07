# AI Agent Guide – Tests (`tests/`)

## Scope

- Describes how all automated tests are organized under `tests/`.
- Covers unit, integration, E2E, visual, performance, accessibility, and contract tests.
- Focuses on **how to work with tests and artifacts**, not on how to write application code (see `src/AGENTS.md`).

## Responsibilities

- Provide a clear structure for all test suites and categories.
- Define how and where to store test artifacts (screenshots, logs, reports).
- Describe preferred tools and patterns for each test type.
- Document common test commands and workflows for agents.

## Entry Points

- `unit/` – Vitest unit tests for core, storage, and UI.
- `e2e/` – Playwright end‑to‑end tests for main user flows.
- `visual/` – Visual regression tests and snapshots.
- `integration/` – Integration tests covering multiple modules.
- `contract/` – Contract tests for repositories and external boundaries.
- `artifacts/` – Screenshots, logs, and test reports (gitignored).

## Conventions

- Use **Vitest** for unit, integration, and most non‑visual tests.
- Use **Playwright** for E2E and visual regression tests.
- Mirror the `src/` structure inside `tests/unit/` where possible (e.g., `tests/unit/core`, `tests/unit/ui`).
- Keep test files close in naming to the source under test (`ComponentName.test.tsx`, `service-name.test.ts`).
- Store **temporary artifacts** only inside `tests/artifacts/` and never commit them.
- Use `jest-axe` for accessibility checks on React components.

## Agent & Command Usage

### Recommended agents

- `platform-test-orchestrator` – For end‑to‑end test planning and execution across unit, integration, and E2E suites.
- `unit-tester` – When adding or extending unit tests for services, hooks, or components.
- `e2e-tester` – When creating or updating Playwright tests under `tests/e2e/`.
- `ui-visual-validator` – For visual regression and screenshot‑based validation.

### Helpful commands

- `/validate-implementation <issue-number>` – Run the full validation workflow (tests, type‑check, lint, build) for a change.
- `/deploy-test` – After major test changes to verify flows against the test deployment.

## Do & Don’t

### Do

- Keep tests **fast and deterministic**; avoid reliance on real external services.
- Add tests when fixing bugs to prevent regressions.
- Use `data-testid` selectors in UI for robust Playwright tests.
- Capture screenshots for failing E2E tests in `tests/artifacts/screenshots/debug/`.
- Use snapshot tests only where changes are rare and intentional.

### Don’t

- Don’t store screenshots or logs in the project root or commit them to git.
- Don’t couple tests tightly to internal implementation details; prefer behavior‑driven assertions.
- Don’t skip tests locally that will run in CI.
- Don’t hardcode environment‑specific values; use configuration or fixtures.

## Testing

- Unit tests (Vitest): `tests/unit/**/*.test.ts` / `.test.tsx`.
- Integration tests: `tests/integration/**/*.test.ts`.
- E2E tests (Playwright): `tests/e2e/**/*.spec.ts`.
- Visual regression tests: `tests/visual/**/*.spec.ts` and corresponding snapshots.
- Accessibility tests: `tests/accessibility/**/*.test.tsx` (using `jest-axe`).

Recommended commands:

- `npm test` – Run unit and integration tests.
- `npm run test:e2e` – Run E2E tests with Playwright.
- `npm run test:visual` – Run visual regression tests.
- `npm run test:coverage` – Generate coverage report.
- `npm run cleanup:artifacts` – Clean temporary test artifacts.

## Related Guides

- [Root AI Agent Guide](../AGENTS.md)
- [Scripts Directory – AI Agent Guide](../scripts/AGENTS.md)
- [Source Code Agent Guide](../src/AGENTS.md)

---

---

## 📁 Directory Structure

```text
tests/
├── unit/              # Vitest unit tests (*.test.ts, *.test.tsx)
│   ├── core/         # Core domain logic tests
│   ├── storage/      # Repository & database tests
│   └── ui/           # Component tests
├── e2e/              # Playwright E2E tests (*.spec.ts)
├── visual/           # Visual regression tests
├── integration/      # Integration tests
├── performance/      # Performance benchmarks
├── accessibility/    # a11y tests (jest-axe)
├── contract/         # Contract tests for repositories
├── setup/            # Test configuration
└── artifacts/        # Test outputs (gitignored)
    ├── screenshots/  # Organized by category
    ├── logs/         # Execution logs
    └── reports/      # Test reports
```

---

## 🧪 Test Artifact Management

### Screenshot Storage Rules

**✅ DO**:

- Save to `tests/artifacts/screenshots/{category}/`
- Use naming: `{purpose}-{timestamp}.png`
- Categories: `debug/`, `reports/`, `validation/`

**❌ DON'T**:

- Save to project root
- Save to `.playwright-mcp/` (deprecated)
- Commit temporary screenshots to git

### Cleanup Commands

```bash
# Clean all temporary artifacts
npm run cleanup:artifacts

# Manual cleanup
rm -rf tests/artifacts/screenshots/debug/*
rm -rf tests/artifacts/screenshots/reports/*
rm -rf tests/artifacts/logs/*
```

### Example Usage

```typescript
// Playwright MCP - Take screenshot
await mcp__playwright__browser_take_screenshot({
  filename: "tests/artifacts/screenshots/debug/login-flow-2025-11-24.png"
})

// Vitest - Save test output
writeFileSync(
  "tests/artifacts/logs/test-run-2025-11-24.log",
  testResults
)
```

---

## 🔬 Unit Testing Guidelines

### File Naming

- **Component tests**: `ComponentName.test.tsx`
- **Service tests**: `ServiceName.test.ts`
- **Utility tests**: `utilityName.test.ts`
- **Accessibility tests**: `ComponentName.a11y.test.tsx`

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  })

  describe('when rendered', () => {
    it('should display title', () => {
      render(<ComponentName title="Test" />)
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  describe('when user interacts', () => {
    it('should handle click', async () => {
      // Test implementation
    })
  })
})
```

### Accessibility Testing

```typescript
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('ComponentName Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<ComponentName />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Coverage Requirements

- **Line coverage**: ≥80%
- **Branch coverage**: ≥75%
- **Function coverage**: ≥80%

---

## 🎭 E2E Testing Guidelines

### File Naming (E2E & Visual)

- **E2E tests**: `featureName.spec.ts`
- **Visual tests**: `componentName.visual.spec.ts`

### Test Structure (E2E)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('should complete user flow', async ({ page }) => {
    // Navigate
    await page.click('button[data-testid="start"]')

    // Interact
    await page.fill('input[type="text"]', 'answer')

    // Assert
    await expect(page.locator('.result')).toHaveText('Correct!')

    // Screenshot for validation
    await page.screenshot({
      path: 'tests/artifacts/screenshots/validation/user-flow-complete.png'
    })
  })
})
```

### Best Practices

1. **Use data-testid**: Prefer `data-testid` over CSS selectors
2. **Wait for navigation**: Use `waitForLoadState('networkidle')`
3. **Clear state**: Reset between tests
4. **Screenshot failures**: Automatically capture on failure
5. **Test in isolation**: Each test should be independent

---

## 📸 Visual Regression Testing

### Snapshot Storage

- **Location**: `tests/visual/snapshots/`
- **Naming**: `{test-name}-{browser}-{os}.png`
- **Committed**: Yes (for comparison)

### Taking Snapshots

```typescript
test('should match visual snapshot', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // Take snapshot
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixels: 100 // Allow minor differences
  })
})
```

---

## 🔗 Integration Testing Guidelines

### Test Database Operations

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '@/modules/storage/database'

describe('SessionRepository', () => {
  beforeEach(async () => {
    await db.sessions.clear()
  })

  afterEach(async () => {
    await db.sessions.clear()
  })

  it('should save session', async () => {
    const session = { id: '1', userId: 'user1', startedAt: new Date() }
    await db.sessions.add(session)

    const saved = await db.sessions.get('1')
    expect(saved).toMatchObject(session)
  })
})
```

---

## ⚡ Performance Testing Guidelines

### Benchmark Tests

```typescript
import { describe, it, expect } from 'vitest'
import { performance } from 'perf_hooks'

describe('Performance Benchmarks', () => {
  it('should load 1000 tasks in <100ms', async () => {
    const start = performance.now()

    // Operation to benchmark
    await loadTasks(1000)

    const duration = performance.now() - start
    expect(duration).toBeLessThan(100)

    // Log results
    console.log(`Load time: ${duration.toFixed(2)}ms`)
  })
})
```

### Performance Metrics to Track

- Initial page load: <2s
- Time to interactive: <3s
- Task rendering: <50ms
- Database queries: <100ms

---

## 🚨 Common Issues & Solutions

### Issue: Screenshots accumulating in root

**Solution**: Use `tests/artifacts/screenshots/` instead

### Issue: Test artifacts committed to git

**Solution**: Ensure `.gitignore` includes `tests/artifacts/`

### Issue: Tests failing in CI but passing locally

**Solution**: Check viewport size, wait for network idle

### Issue: Flaky E2E tests

**Solution**: Add explicit waits, avoid `setTimeout()`

---

## 📊 Test Reporting

### Generate Reports

```bash
# Unit test coverage
npm run test:coverage

# E2E test report
npm run test:e2e
# View: playwright-report/index.html

# Visual test report
npm run test:visual
```

### Report Storage

- **Coverage**: `coverage/` (gitignored)
- **Playwright**: `playwright-report/` (gitignored)
- **Test results**: `test-results/` (gitignored)

---

## 🔧 Agent-Specific Commands

### For Testing Agents

```bash
# Run specific test suite
npm test -- tests/unit/ui/

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:ui

# Check coverage
npm run test:coverage

# Clean artifacts
npm run cleanup:artifacts
```

### For Validation Agents

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build (validates TypeScript)
npm run build
```

---

## 📚 Related Documentation

- **Parent Guide**: [../AGENTS.md](../AGENTS.md)
- **Artifact Management**: [artifacts/README.md](./artifacts/README.md)
- **Test Setup**: [setup/README.md](./setup/README.md)
- **Component Testing**: `../docs/css-modules.md` (styling tests)

---

## ✅ Pre-Test Checklist

Before running tests:

- [ ] Database is clean (IndexedDB cleared)
- [ ] Dev server is running (`npm run dev`)
- [ ] No uncommitted test artifacts
- [ ] Test data is seeded if needed

---

## 🎯 Test Quality Standards

**Required for all tests**:

- ✅ Descriptive test names
- ✅ Arrange-Act-Assert pattern
- ✅ No flaky tests (deterministic)
- ✅ Fast execution (<5s per test)
- ✅ Isolated (no shared state)
- ✅ Clear failure messages

**Code Review Checklist**:

- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests cover edge cases
- [ ] No commented-out tests
- [ ] No `.only()` or `.skip()`
- [ ] Proper cleanup (afterEach)

---

**Maintained By**: platform-test-orchestrator
**Questions?**: See [../AGENTS.md](../AGENTS.md) or open GitHub issue with `testing` label
