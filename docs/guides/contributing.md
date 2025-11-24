# Contributing to Learning Platform

Thank you for considering contributing to the Learning Platform! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Contributing Guidelines](#contributing-guidelines)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

### Our Standards

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Focus on** what is best for the community
- **Show empathy** towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or trolling
- Publishing others' private information
- Unprofessional or disruptive conduct
- Spam or self-promotion

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- **GitHub account**

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/learning-platform.git
   cd learning-platform
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/trsdn/learning-platform.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Verify setup**:
   ```bash
   npm run build
   npm run dev
   ```

6. **Open browser** to http://localhost:5173

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, tested code
- Follow coding standards (see below)
- Test your changes locally

### 3. Test Thoroughly

```bash
# Run type checking
npm run type-check

# Run build
npm run build

# Run unit tests
npm test

# Run E2E tests (optional)
npm run test:e2e

# Test in browser
npm run dev
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new task type for fill-in-table"
```

See [Commit Message Format](#commit-message-format) below.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub
- Click "New Pull Request"
- Select your branch
- Fill out PR template
- Submit

---

## Contributing Guidelines

### Reporting Bugs

#### Before Submitting

1. **Search existing issues** - Your bug may already be reported
2. **Test in latest version** - Ensure bug exists in current main branch
3. **Reproduce consistently** - Can you make it happen reliably?

#### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen?

**Actual Behavior**
What actually happened?

**Screenshots**
If applicable, add screenshots.

**Environment**
- Browser: [e.g., Chrome 120, Safari 17]
- OS: [e.g., macOS 14, Windows 11]
- Version: [e.g., commit hash or tag]

**Additional Context**
- Console errors?
- Network errors?
- Database state?
```

#### Where to Report

1. **GitHub Issues**: https://github.com/trsdn/learning-platform/issues
2. Label: `bug`
3. Provide all requested information

---

### Suggesting Features

#### Before Suggesting

1. **Check existing issues** - Feature may already be planned
2. **Read roadmap** - Feature may be out of scope
3. **Consider alternatives** - Could existing features solve your need?

#### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature.

**Problem it Solves**
What user problem does this address?

**Proposed Solution**
How should this work?

**Alternative Solutions**
Other approaches considered?

**Use Cases**
Who would use this and how?

**Additional Context**
Mockups, examples, references?
```

#### Feature Categories

- **Task Types**: New question/exercise formats
- **Learning Features**: Progress tracking, analytics, gamification
- **Content**: New topics, languages, subjects
- **UI/UX**: Interface improvements, accessibility
- **Performance**: Speed, caching, optimization
- **Infrastructure**: Build, deploy, testing

---

### Submitting Changes

#### Types of Contributions

1. **Bug Fixes**
   - Fix reported issues
   - Add regression tests
   - Update documentation if needed

2. **New Features**
   - Discuss in issue first
   - Follow implementation guides
   - Include tests and docs

3. **Documentation**
   - Fix typos, clarify instructions
   - Add examples, diagrams
   - Translate content

4. **Performance Improvements**
   - Profile before/after
   - Benchmark results
   - No functionality changes

5. **Refactoring**
   - Improve code quality
   - No behavior changes
   - Maintain test coverage

#### Contribution Checklist

Before submitting PR:

- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] Added/updated tests
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Tested in browser
- [ ] Tested on mobile (if UI changes)
- [ ] Updated CHANGELOG.md (if significant)

---

## Coding Standards

### TypeScript

- **Strict mode** enabled
- **Explicit types** for function parameters and returns
- **No `any`** types (use `unknown` if necessary)
- **Interfaces** for object shapes
- **Type guards** for runtime checks

**Good**:
```typescript
interface TaskContent {
  question: string;
  answer: string;
}

function validateTask(content: TaskContent): boolean {
  return content.question.length > 0 && content.answer.length > 0;
}
```

**Bad**:
```typescript
function validateTask(content: any) {
  return content.question.length > 0;
}
```

### Naming Conventions

- **Components**: PascalCase (`TaskCard`, `PracticeSession`)
- **Files**: kebab-case (`task-card.tsx`, `practice-session.tsx`)
- **Functions**: camelCase (`loadTask`, `validateAnswer`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Types/Interfaces**: PascalCase (`TaskType`, `UserProgress`)

### File Organization

```typescript
// 1. Imports (external, then internal)
import React, { useState } from 'react';
import { TaskType } from '@core/types/services';

// 2. Types/Interfaces
interface Props {
  taskId: string;
}

// 3. Constants
const MAX_ATTEMPTS = 3;

// 4. Component/Function
export function TaskCard({ taskId }: Props) {
  // ...
}
```

### Code Style

- **Indentation**: 2 spaces
- **Line length**: Max 100 characters
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing commas**: Yes (for multi-line)

Run formatter:
```bash
npm run format
```

---

## Testing Requirements

### Unit Tests

Required for:
- All business logic
- Service functions
- Utility functions
- Complex components

```typescript
// Example: src/modules/core/services/__tests__/task-service.test.ts
import { describe, it, expect } from 'vitest';
import { validateTask } from '../task-service';

describe('TaskService', () => {
  describe('validateTask', () => {
    it('should accept valid task', () => {
      const task = { question: 'Test?', answer: 'Yes' };
      expect(validateTask(task)).toBe(true);
    });

    it('should reject empty question', () => {
      const task = { question: '', answer: 'Yes' };
      expect(validateTask(task)).toBe(false);
    });
  });
});
```

### E2E Tests (Optional)

For critical user flows:
- Starting practice session
- Answering questions
- Viewing results
- Database updates

```typescript
// Example: tests/e2e/practice-session.spec.ts
import { test, expect } from '@playwright/test';

test('complete practice session', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Mathematik');
  await page.click('text=Algebra Grundlagen');
  // ... rest of test
});
```

### Test Coverage

Minimum requirements:
- **Business logic**: 80%+ coverage
- **Critical paths**: 100% coverage
- **New features**: Must include tests

Run tests:
```bash
npm test                    # Unit tests
npm run test:coverage       # With coverage report
npm run test:e2e           # E2E tests
```

---

## Commit Message Format

Follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Add/update tests
- `chore`: Build, dependencies, tooling
- `ci`: CI/CD changes

### Examples

**Feature**:
```
feat(task-types): add fill-in-table task type

- Add FillInTableContent interface
- Implement render function in practice-session
- Add template and test content
- Update documentation

Closes #42
```

**Bug Fix**:
```
fix(multiple-choice): prevent answer reshuffle on submit

The multiple-choice options were reshuffling when user
clicked "Check Answer" due to session state update
triggering useEffect.

Fixed by removing session dependency from loadCurrentTask effect.

Fixes #38
```

**Documentation**:
```
docs(contributing): add bug report template

Added clear template for bug reports with all required
information to help maintainers reproduce issues.
```

**Breaking Change**:
```
feat(database): migrate to separate test database

BREAKING CHANGE: Test environment now uses mindforge-academy-test
database instead of mindforge-academy. Users must clear old test
data manually.
```

### Commit Message Rules

- **Subject**:
  - Max 72 characters
  - Lowercase (except proper nouns)
  - No period at end
  - Imperative mood ("add" not "added")

- **Body** (optional):
  - Wrap at 72 characters
  - Explain what and why, not how
  - Reference issues/PRs

- **Footer** (optional):
  - `Fixes #123` - Closes issue
  - `Closes #456` - Closes PR
  - `BREAKING CHANGE:` - Breaking changes

---

## Pull Request Process

### 1. Before Creating PR

- [ ] Branch is up to date with main
- [ ] All tests pass
- [ ] Code is formatted
- [ ] No console errors/warnings
- [ ] Tested in browser
- [ ] Documentation updated

### 2. PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix/feature causing existing functionality to break)
- [ ] Documentation update

## Related Issues
Fixes #123
Related to #456

## How Has This Been Tested?
- [ ] Unit tests
- [ ] E2E tests
- [ ] Manual testing in browser
- [ ] Tested on mobile

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] Added tests
- [ ] All tests pass
- [ ] No TypeScript errors
```

### 3. Review Process

1. **Automated Checks**: GitHub Actions run tests
2. **Code Review**: Maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: Maintainer merges to main

### 4. After Merge

- Delete your branch (GitHub does this automatically)
- Update your fork:
  ```bash
  git checkout main
  git pull upstream main
  git push origin main
  ```

---

## Special Contribution Guides

### Adding a New Task Type

Use the interactive command:
```bash
# If using Claude Code
/new-task-type fill-in-table

# Or follow manual guide
See: docs/NEW_TASK_TYPE_GUIDE.md
```

Required steps:
1. Update type definitions
2. Update practice session component
3. Create template file
4. Add test content
5. Update documentation

### Adding a Learning Path

Use the interactive command:
```bash
# If using Claude Code
/new-learning-path spanisch familia-basics

# Or create manually
See: AGENTS.md section "Adding New Learning Paths"
```

File structure:
```json
{
  "learningPath": { /* metadata */ },
  "tasks": [ /* task array */ ]
}
```

### Adding Audio Files (Spanish)

For Spanish learning paths:

1. Add Spanish text to JSON files
2. Generate audio:
   ```bash
   npm run generate-audio
   ```
3. Verify manifest.json updated
4. Test audio buttons in browser

---

## Deployment

### Test Environment

Always test in test environment first:

```bash
# Deploy to test
/deploy-test

# Or manually
npm run deploy:test
```

Test URL: https://trsdn.github.io/learning-platform/test/

### Production Deployment

**⚠️ Requires approval from maintainers**

```bash
# Via command (with safety checks)
/deploy

# Or manually
npm run deploy
```

Production URL: https://trsdn.github.io/learning-platform/

---

## Getting Help

### Documentation

- **README.md**: Project overview
- **AGENTS.md**: Architecture and task types
- **docs/NEW_TASK_TYPE_GUIDE.md**: Adding task types
- **docs/TEST_DEPLOYMENT.md**: Test environment guide

### Communication

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, help
- **Pull Requests**: Code review, feedback

### Common Questions

**Q: How do I add a new topic?**
A: Create directory in `public/learning-paths/{topic}/` and add learning path JSONs.

**Q: How do I test my changes?**
A: Run `npm run dev`, open browser, click "🔄 DB Aktualisieren".

**Q: Can I use AI to help?**
A: Yes! See `.claude/commands/` for AI-assisted workflows.

**Q: How long until my PR is reviewed?**
A: Usually within 1-7 days. Be patient!

---

## Recognition

Contributors are recognized in:
- GitHub Contributors page
- CHANGELOG.md (for significant contributions)
- Annual contributor spotlight (planned)

Thank you for contributing! 🎉

---

**Last Updated**: 2025-10-03
**Maintainers**: @trsdn
**License**: See LICENSE file
