# Claude Code Commands Reference

<!-- markdownlint-disable MD022 MD031 MD032 -->

Comprehensive guide to all available commands, their purposes, and which agents can use them.

## Table of Contents
- [Command Overview](#command-overview)


## Command Overview

| Command | Primary Agent | Purpose | Arguments |
|---------|--------------|---------|-----------|
| `/prioritize-backlog` | product-owner | Analyze and rank GitHub issues by priority | None |
| `/validate-implementation` | implementation-tester | Run comprehensive tests and validation | `[issue-number]` |
| `/review-learning-path` | content-designer | Pedagogical review of learning paths | `[filepath]` or `[topic-id/learning-path-id]` |
| `/create-release` | release-engineer | Create production release with versioning | `[major\|minor\|patch]` |
| `/new-learning-path` | General | Interactive creation of new learning path | `[topic-id] [learning-path-id]` |
| `/new-task-type` | General | Interactive implementation of new task type | `[task-type-name]` |
| `/deploy` | General | Deploy to production (Vercel/GitHub Pages) | `--force`, `--skip-test` |
| `/deploy-test` | General | Deploy to test environment | None |


## Agent-Specific Commands

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

**Output**:

**When to use**:


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

**When to use**:


### Content Designer Agent

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

**When to use**:


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

**Output**:

**When to use**:


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
7. **Optional**: Consults content-designer for pedagogical review

**When to use**:


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
1. **Optional**: Consults content-designer on pedagogical value
2. Gathers requirements (fields, interaction, validation)
3. Updates type definitions (`services.ts`)
4. Updates practice session component
5. Creates template file
6. Adds test content
7. Updates documentation

**When to use**:


### `/deploy [--force] [--skip-test]`

**Purpose**: Deploy learning platform to production (Vercel) via `deploy-production` GitHub Actions workflow (release-triggered).

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
3. Triggers `deploy-production` workflow → Vercel production deploy (uses Vercel CLI)
4. Performs health check
5. Uses release tag/version from context

**When to use**:


### `/deploy-test`

**Purpose**: Deploy to isolated test/preview environment (Vercel preview).

**Usage**:
```bash
/deploy-test
```

**What it does**:

1. Deploys to preview/test environment on Vercel
2. Uses dev Supabase
3. Runs via GitHub Actions
4. Provides preview URL

**When to use**:


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


## Command Workflows

### New Feature Development (Simplified Pipeline)

```bash
# 1. Prioritize backlog to select next issue
/prioritize-backlog

# 2. Develop feature
# (Code implementation via agents or manual)

# 3. Validate implementation
/validate-implementation 42

# 4. Create PR and review
# (code-reviewer agent reviews PR via platform-orchestrator)

# 5. Merge to main
git merge feature-branch

# 6. Create release
/create-release minor

# 7. Deploy to production
/deploy
```


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


### Backlog Management Workflow

```bash
# 1. Prioritize backlog
/prioritize-backlog

# 2. Select highest-priority issue from report
# (review priority report)

# 3. Start development
# (Use platform-orchestrator for complex features)
```


### New Task Type Development Workflow

```bash
# 1. Consult educational expert
/new-task-type drag-and-drop
# (chooses "yes" to consult content-designer)

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


## Agent-to-Command Matrix

| Agent | Can Use | Primary Command |
|-------|---------|-----------------|
| **product-owner** | `/prioritize-backlog` | ✅ Primary |
| | `/create-release` | ✅ Can use |
| **implementation-tester** | `/validate-implementation` | ✅ Primary |
| **content-designer** | `/review-learning-path` | ✅ Primary |
| | `/new-learning-path` | ✅ Can consult |
| | `/new-task-type` | ✅ Can consult |
| **release-engineer** | `/create-release` | ✅ Primary |
| | `/deploy` | ✅ Can use |
| | `/deploy-test` | ✅ Can use |
| **All agents** | `/new-learning-path` | ✅ Shared |
| | `/new-task-type` | ✅ Shared |
| | `/deploy` | ✅ Shared |
| | `/deploy-test` | ✅ Shared |


## Command Best Practices

### When to use each command

**Use `/prioritize-backlog`**:

**Use `/validate-implementation`**:

**Use `/review-learning-path`**:

**Use `/create-release`**:

**Use `/deploy`**:


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


## Related Documentation



**Last Updated**: 2025-11-24
**Maintained By**: Product Owner Agent

## Changelog

**2025-11-24**:
<!-- markdownlint-disable MD022 MD031 MD032 -->
