# Claude Code Commands Reference

Comprehensive guide to all available commands, their purposes, and which agents can use them.

## Table of Contents
- [Command Overview](#command-overview)
- [Agent-Specific Commands](#agent-specific-commands)
- [Shared Commands](#shared-commands)
- [Command Workflows](#command-workflows)
- [Command Syntax](#command-syntax)

---

## Command Overview

| Command | Primary Agent | Purpose | Arguments |
|---------|--------------|---------|-----------|
| `/analyze-requirements` | business-analyst | Enhance GitHub issues with user stories and acceptance criteria | `[issue-number]` |
| `/prioritize-backlog` | product-owner | Analyze and rank GitHub issues by priority | None |
| `/plan` | issue-planner | Create implementation plan from GitHub issue | `[issue-number]` |
| `/implement` | issue-implementer | Execute implementation plan using TDD | `[plan-file]` |
| `/validate-implementation` | implementation-tester | Run comprehensive tests and validation | `[issue-number]` |
| `/review-learning-path` | learning-design-expert | Pedagogical review of learning paths | `[filepath]` or `[topic-id/learning-path-id]` |
| `/create-release` | release-engineer | Create production release with versioning | `[major\|minor\|patch]` |
| `/new-learning-path` | General | Interactive creation of new learning path | `[topic-id] [learning-path-id]` |
| `/new-task-type` | General | Interactive implementation of new task type | `[task-type-name]` |
| `/deploy` | General | Deploy to production (GitHub Pages) | `--force`, `--skip-test` |
| `/deploy-test` | General | Deploy to test environment | None |
| `/specify` | General | Create/update feature specification | None |
| `/tasks` | General | Generate actionable tasks.md | None |
| `/clarify` | General | Ask clarification questions for spec | None |
| `/analyze` | General | Cross-artifact consistency analysis | None |
| `/constitution` | General | Create/update project constitution | None |

---

## Agent-Specific Commands

### Business Analyst Agent

#### `/analyze-requirements [issue-number]`

**Purpose**: Transform technical GitHub issues into comprehensive requirements with user stories.

**Usage**:
```bash
/analyze-requirements 42
```

**What it does**:
1. Fetches GitHub issue
2. Creates user stories ("As a [user], I want...")
3. Defines acceptance criteria (Given-When-Then)
4. Adds functional & non-functional requirements
5. Defines edge cases and error handling
6. Estimates complexity (story points)
7. Updates GitHub issue

**Output**:
- Enhanced GitHub issue
- Story point estimation
- Acceptance criteria checklist
- Dependencies identified

**When to use**:
- New feature request needs clarification
- Issue lacks user perspective
- Before implementation planning
- When requirements are vague

---

### Product Owner Agent

#### `/prioritize-backlog`

**Purpose**: Analyze all open GitHub issues and prioritize using scoring algorithm.

**Usage**:
```bash
/prioritize-backlog
```

**What it does**:
1. Fetches all open issues
2. Calculates priority scores (0-100)
3. Categorizes by type (bug, feature, etc.)
4. Identifies dependencies and blockers
5. Recommends next issues to work on
6. Suggests label additions

**Scoring Algorithm**:
- Business value: 0-40 points
- User impact: 0-30 points
- Urgency: 0-20 points
- Effort inverse: 0-10 points

**Output**:
- `BACKLOG-PRIORITY-[date].md` report
- Ranked issue list with scores
- Recommended workflows
- Stale issue detection

**When to use**:
- Starting new sprint
- Deciding what to work on next
- After multiple new issues created
- Monthly backlog grooming

---

### Issue Planner Agent

#### `/plan [issue-number]`

**Purpose**: Create detailed implementation plan from GitHub issue.

**Usage**:
```bash
/plan 42
```

**What it does**:
1. Analyzes issue and acceptance criteria
2. Researches codebase architecture
3. Creates implementation strategy
4. Lists files to create/modify
5. Provides code examples
6. Defines testing approach
7. Creates rollback plan

**Output**:
- `PLAN-ISSUE-[number].md` file
- Architecture overview
- Step-by-step implementation phases
- Technical approach details
- Security considerations

**When to use**:
- After requirements analysis complete
- Before starting implementation
- For complex features (5+ story points)
- When architecture impact unclear

---

### Issue Implementer Agent

#### `/implement [plan-file]`

**Purpose**: Execute implementation plan using Test-Driven Development.

**Usage**:
```bash
/implement PLAN-ISSUE-42.md
```

**What it does**:
1. Reads implementation plan
2. Follows TDD: RED → GREEN → REFACTOR
3. Writes tests first (failing)
4. Implements minimal code (passing)
5. Refactors for quality
6. Ensures >80% test coverage

**TDD Workflow**:
```
1. RED: Write failing test
2. GREEN: Minimal code to pass
3. REFACTOR: Improve code quality
4. Repeat for each feature
```

**Output**:
- Implemented feature code
- Comprehensive test suite
- Updated documentation
- Git commits (granular)

**When to use**:
- Implementation plan exists
- Ready to write code
- Tests need to be created

---

### Implementation Tester Agent

#### `/validate-implementation [issue-number]`

**Purpose**: Comprehensive validation of implementation against plan and acceptance criteria.

**Usage**:
```bash
/validate-implementation 42
```

**What it does**:
1. Runs unit tests + coverage
2. Runs integration tests
3. Runs E2E tests
4. Validates TypeScript/ESLint
5. Checks build success
6. Verifies acceptance criteria
7. Analyzes performance
8. Security audit
9. Accessibility check

**Output**:
- `TEST-REPORT-ISSUE-[number].md`
- Overall status: PASS | CONDITIONAL PASS | FAIL
- Severity-categorized issues (🔴🟡🔵⚪)
- Specific fixes needed
- Coverage metrics

**When to use**:
- After implementation complete
- Before code review
- After fixing issues (re-validation)
- Before merge to main

---

### Code Reviewer Agent

**Note**: Code reviewer uses standard `gh pr review` commands, not a custom slash command.

**Usage**:
```bash
# In your conversation with code-reviewer agent:
"Review PR #42"
```

**What it does**:
1. Analyzes code changes
2. Checks for security issues
3. Reviews test quality
4. Verifies best practices
5. Posts review comments via `gh pr review`

**Output**:
- GitHub PR review comments
- Severity-categorized feedback
- Approve / Request Changes / Comment

---

### Learning Design Expert Agent

#### `/review-learning-path [filepath or topic-id/learning-path-id]`

**Purpose**: Comprehensive pedagogical review of learning paths.

**Usage**:
```bash
# By filepath
/review-learning-path public/learning-paths/mathematik/algebra-basics.json

# By IDs
/review-learning-path mathematik/algebra-basics
```

**What it does**:
1. Analyzes task type distribution
2. Checks difficulty progression
3. Assesses cognitive load
4. Validates spaced repetition compatibility
5. Maps to Bloom's taxonomy
6. Checks learning science compliance
7. Provides research-backed recommendations

**Output**:
- Educational effectiveness rating (1-5 stars)
- Task distribution analysis
- Critical/High/Medium priority issues
- Specific task feedback with fixes
- Research citations

**When to use**:
- After creating new learning path
- Before publishing content
- When learning outcomes poor
- Quarterly content audits

---

### Release Engineer Agent

#### `/create-release [major|minor|patch]`

**Purpose**: Create production release with semantic versioning.

**Usage**:
```bash
# Auto-detect version bump
/create-release minor

# Will prompt for version type if not specified
/create-release
```

**What it does**:
1. Validates tests pass
2. Validates build succeeds
3. Determines version bump
4. Generates changelog from PRs
5. Updates `package.json`
6. Creates git tag
7. Pushes to GitHub
8. Creates GitHub release
9. Optionally deploys to production

**Semantic Versioning**:
- **Major** (2.0.0): Breaking changes
- **Minor** (1.3.0): New features (backward compatible)
- **Patch** (1.2.4): Bug fixes only

**Output**:
- Updated `CHANGELOG.md`
- Git tag (e.g., `v1.3.0`)
- GitHub release
- Optional production deployment

**When to use**:
- Feature complete and tested
- Ready for production release
- On a release schedule (e.g., bi-weekly)
- Critical bug fix needs deployment

---

## Shared Commands

These commands are available to all agents and general use.

### `/new-learning-path [topic-id] [learning-path-id]`

**Purpose**: Interactively create new learning path with tasks.

**Usage**:
```bash
# With arguments
/new-learning-path mathematik algebra-basics

# Interactive mode
/new-learning-path
```

**What it does**:
1. Validates topic exists
2. Gathers learning path metadata (title, description, difficulty)
3. Interactive task creation loop
4. Generates JSON structure
5. Creates file: `public/learning-paths/{topic}/{id}.json`
6. Updates `json-loader.ts`
7. **Optional**: Consults learning-design-expert for review

**When to use**:
- Creating new educational content
- Adding content to existing topic
- Teacher/content creator workflow

---

### `/new-task-type [task-type-name]`

**Purpose**: Interactively implement new task type.

**Usage**:
```bash
# With task type name
/new-task-type fill-in-table

# Interactive mode
/new-task-type
```

**What it does**:
1. **Optional**: Consults learning-design-expert on pedagogical value
2. Gathers requirements (fields, interaction, validation)
3. Updates type definitions (`services.ts`)
4. Updates practice session component
5. Creates template file
6. Adds test content
7. Updates documentation

**When to use**:
- Need new interaction type
- Expanding platform capabilities
- User request for specific task format

---

### `/deploy [--force] [--skip-test]`

**Purpose**: Deploy learning platform to production (GitHub Pages).

**Usage**:
```bash
# Standard deployment
/deploy

# Force deployment (skip checks)
/deploy --force

# Skip test environment verification
/deploy --skip-test
```

**What it does**:
1. Runs tests (unless `--force`)
2. Runs build
3. Deploys to GitHub Pages
4. Verifies deployment
5. Creates deployment tag

**When to use**:
- After release created
- Feature complete and tested
- Scheduled production deployment

---

### `/deploy-test`

**Purpose**: Deploy to isolated test environment.

**Usage**:
```bash
/deploy-test
```

**What it does**:
1. Deploys to test environment
2. Uses isolated test database
3. Runs via GitHub Actions
4. Provides test URL

**When to use**:
- Before production deployment
- UAT (User Acceptance Testing)
- Testing with real data
- Stakeholder demos

---

### Other Shared Commands

#### `/specify`
Create or update feature specification from natural language description.

#### `/tasks`
Generate actionable tasks.md from design artifacts.

#### `/clarify`
Ask up to 5 clarification questions for underspecified areas.

#### `/analyze`
Perform cross-artifact consistency analysis (spec.md, plan.md, tasks.md).

#### `/constitution`
Create or update project constitution with principles.

---

## Command Workflows

### New Feature Development (Full Pipeline)

```bash
# 1. Analyze requirements
/analyze-requirements 42

# 2. Create implementation plan
/plan 42

# 3. Implement with TDD
/implement PLAN-ISSUE-42.md

# 4. Validate implementation
/validate-implementation 42

# 5. Create PR and review
# (code-reviewer agent reviews PR)

# 6. Merge to main
git merge feature-branch

# 7. Create release
/create-release minor

# 8. Deploy to production
/deploy
```

---

### Learning Content Creation Workflow

```bash
# 1. Create new learning path
/new-learning-path spanisch colors-basics

# 2. Review for educational effectiveness
/review-learning-path spanisch/colors-basics

# 3. Make recommended improvements
# (edit JSON based on feedback)

# 4. Deploy to test environment
/deploy-test

# 5. UAT with real users
# (test in browser)

# 6. Deploy to production
/deploy
```

---

### Backlog Management Workflow

```bash
# 1. Prioritize backlog
/prioritize-backlog

# 2. Select highest-priority issue
# (review report)

# 3. Analyze requirements
/analyze-requirements 45

# 4. Start implementation
/plan 45
```

---

### New Task Type Development Workflow

```bash
# 1. Consult educational expert
/new-task-type drag-and-drop
# (chooses "yes" to consult learning-design-expert)

# 2. Implement based on guidance
# (interactive Q&A)

# 3. Test in browser
npm run dev

# 4. Deploy to test
/deploy-test

# 5. Create learning path using new type
/new-learning-path test new-task-demo

# 6. Educational review
/review-learning-path test/new-task-demo
```

---

### Release Workflow

```bash
# 1. Ensure all features merged
git checkout main
git pull

# 2. Create release
/create-release minor

# 3. Deploy to test first
/deploy-test

# 4. Verify test environment
# (manual check)

# 5. Deploy to production
/deploy

# 6. Monitor production
# (check analytics, error logs)
```

---

## Command Syntax

### General Format
```bash
/command-name [required-arg] [optional-arg]
```

### Argument Types

**Issue Numbers**:
```bash
/analyze-requirements 42
/plan 123
/validate-implementation 67
```

**File Paths**:
```bash
/review-learning-path public/learning-paths/mathematik/algebra-basics.json
/implement PLAN-ISSUE-42.md
```

**Topic/Path IDs**:
```bash
/new-learning-path mathematik algebra-basics
/review-learning-path mathematik/algebra-basics
```

**Version Types**:
```bash
/create-release major
/create-release minor
/create-release patch
```

**Flags**:
```bash
/deploy --force
/deploy --skip-test
/deploy --force --skip-test
```

**No Arguments** (Interactive Mode):
```bash
/prioritize-backlog
/new-learning-path
/new-task-type
```

---

## Agent-to-Command Matrix

| Agent | Can Use | Primary Command |
|-------|---------|-----------------|
| **business-analyst** | `/analyze-requirements` | ✅ Primary |
| | `/prioritize-backlog` | ❌ |
| | `/plan` | ❌ |
| **product-owner** | `/analyze-requirements` | ✅ Can use |
| | `/prioritize-backlog` | ✅ Primary |
| | `/plan` | ✅ Can use |
| | `/implement` | ❌ |
| | `/validate-implementation` | ❌ |
| | `/create-release` | ✅ Can use |
| **issue-planner** | `/analyze-requirements` | ❌ |
| | `/plan` | ✅ Primary |
| | `/implement` | ❌ |
| **issue-implementer** | `/plan` | ❌ |
| | `/implement` | ✅ Primary |
| | `/validate-implementation` | ✅ Can use (self-check) |
| **implementation-tester** | `/validate-implementation` | ✅ Primary |
| | `/implement` | ❌ |
| **code-reviewer** | N/A | Uses `gh pr review` |
| **learning-design-expert** | `/review-learning-path` | ✅ Primary |
| | `/new-learning-path` | ✅ Can consult |
| | `/new-task-type` | ✅ Can consult |
| **release-engineer** | `/create-release` | ✅ Primary |
| | `/deploy` | ✅ Can use |
| | `/deploy-test` | ✅ Can use |
| **All agents** | `/new-learning-path` | ✅ Shared |
| | `/new-task-type` | ✅ Shared |
| | `/deploy` | ✅ Shared |
| | `/deploy-test` | ✅ Shared |
| | `/specify` | ✅ Shared |
| | `/tasks` | ✅ Shared |
| | `/clarify` | ✅ Shared |
| | `/analyze` | ✅ Shared |
| | `/constitution` | ✅ Shared |

---

## Command Best Practices

### When to use each command

**Use `/analyze-requirements`**:
- ✅ Issue is vague or lacks user perspective
- ✅ Before planning implementation
- ✅ New feature requests
- ❌ Issue already has detailed acceptance criteria
- ❌ Trivial bug fixes

**Use `/prioritize-backlog`**:
- ✅ Multiple issues open, unsure what's next
- ✅ Starting new sprint
- ✅ Quarterly planning
- ❌ Only 1-2 issues open
- ❌ Priority already obvious

**Use `/plan`**:
- ✅ Complex features (5+ story points)
- ✅ Architecture impact unclear
- ✅ Before writing code
- ❌ Trivial changes (1-2 story points)
- ❌ Well-understood implementations

**Use `/implement`**:
- ✅ Plan exists and approved
- ✅ Ready to write code
- ✅ Tests need creation
- ❌ No plan exists
- ❌ Requirements unclear

**Use `/validate-implementation`**:
- ✅ Implementation complete
- ✅ Before code review
- ✅ After fixing test failures
- ❌ Still actively coding
- ❌ Tests not written

**Use `/review-learning-path`**:
- ✅ New content created
- ✅ Before publishing
- ✅ Low learning outcomes
- ❌ Content already reviewed recently
- ❌ Minor content tweaks

**Use `/create-release`**:
- ✅ Features complete and tested
- ✅ Ready for production
- ✅ On release schedule
- ❌ Tests failing
- ❌ Work still in progress

**Use `/deploy`**:
- ✅ Release created
- ✅ Test environment validated
- ✅ Stakeholder approval
- ❌ No release tag
- ❌ Failing tests

---

## Troubleshooting Commands

### Command not found
**Solution**: Check command name spelling. Use tab completion.

### Permission denied
**Solution**: Ensure GitHub CLI (`gh`) is authenticated:
```bash
gh auth status
gh auth login
```

### Validation failed
**Solution**: Fix failing tests/build before proceeding:
```bash
npm test
npm run build
```

### Issue not found
**Solution**: Verify issue number:
```bash
gh issue list
gh issue view [number]
```

### File not found
**Solution**: Check file path is correct:
```bash
ls public/learning-paths/
ls PLAN-ISSUE-*.md
```

---

## Creating New Commands

To create a new command:

1. **Create command file**: `.claude/commands/my-command.md`

2. **Use frontmatter**:
   ```yaml
   ---
   description: Short description with arguments
   agent: primary-agent-name (optional)
   ---
   ```

3. **Include $ARGUMENTS placeholder**:
   ```markdown
   User input:

   $ARGUMENTS
   ```

4. **Follow command template structure**:
   - Goal
   - Execution steps
   - Behavior rules
   - Output format

5. **Update this COMMANDS.md** with new command

6. **Test command**:
   ```bash
   /my-command test-arg
   ```

---

## Related Documentation

- [AGENTS.md](./AGENTS.md) - Agent system overview and capabilities
- [CONTRIBUTION.md](../CONTRIBUTION.md) - Contributing to the project
- [.claude/agents/](./agents/) - Individual agent definitions
- [.claude/commands/](./commands/) - Individual command definitions

---

**Last Updated**: 2025-10-04
**Maintained By**: Product Owner Agent
