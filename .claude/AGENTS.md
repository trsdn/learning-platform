# .claude Directory - AI Agent Guide

**Last Updated**: 2025-12-01 | **Purpose**: Agent architecture, commands, and workflows

## 🎯 Overview

This directory contains the complete agent architecture for the MindForge Academy Learning Platform. It defines specialized AI agents for both **content creation** (learning paths) and **platform development** (features, testing, deployment).

**Total Agents**: 33+ specialized agents organized into two main streams:

- **Content Stream**: Learning path creation and educational content
- **Platform Stream**: Software development, testing, and deployment

**💡 Note**: For TypeScript, CSS Modules, and accessibility rules, see [../AGENTS.md](../AGENTS.md).

---

## 📂 Directory Structure

```
.claude/
├── AGENTS.md              # This file - agent guide
├── COMMANDS.md            # Command reference and usage
├── agents/
│   ├── AGENT_ARCHITECTURE.md  # Architecture documentation
│   ├── AGENT_REGISTRY.md      # Complete agent catalog
│   ├── content/               # Content creation agents
│   │   ├── agents/
│   │   │   ├── content-creator.md
│   │   │   ├── content-designer.md
│   │   │   ├── content-planner.md
│   │   │   ├── content-publisher.md
│   │   │   ├── content-reviewer.md
│   │   │   └── content-tester.md
│   │   └── orchestrators/
│   │       └── content-orchestrator.md
│   └── platform/              # Platform development agents
│       ├── agents/
│       │   ├── build-pipeline-engineer.md
│       │   ├── business-analyst.md
│       │   ├── code-reviewer.md
│       │   ├── component-library-architect.md
│       │   ├── deployment-validator.md
│       │   ├── docs-architect.md
│       │   ├── docs-publisher.md
│       │   ├── docs-validator.md
│       │   ├── e2e-tester.md
│       │   ├── implementation-tester.md
│       │   ├── integration-tester.md
│       │   ├── issue-generator.md
│       │   ├── issue-implementer.md
│       │   ├── issue-planner.md
│       │   ├── issue-prioritizer.md
│       │   ├── mermaid-expert.md
│       │   ├── performance-tester.md
│       │   ├── product-owner.md
│       │   ├── release-engineer.md
│       │   ├── rollback-manager.md
│       │   ├── security-auditor.md
│       │   ├── security-tester.md
│       │   ├── ui-ux-designer.md
│       │   ├── ui-visual-validator.md
│       │   └── unit-tester.md
│       └── orchestrators/
│           ├── platform-orchestrator.md           # Master orchestrator
│           ├── platform-deploy-orchestrator.md
│           ├── platform-dev-orchestrator.md
│           ├── platform-docs-orchestrator.md
│           ├── platform-planning-orchestrator.md
│           ├── platform-review-orchestrator.md
│           └── platform-test-orchestrator.md
└── commands/                  # Command definitions
    ├── create-release.md
    ├── deploy.md
    ├── new-learning-path.md
    ├── new-task-type.md
    ├── prioritize-backlog.md
    ├── review-learning-path.md
    └── validate-implementation.md
```

---

## 🎭 Agent Architecture Concepts

### Naming Convention

**Prefixes**:
- `content-*` - Content/learning path creation agents
- `platform-*` - Platform development agents
- `*-orchestrator` - Workflow orchestration agents

**Suffixes**:
- `*-planner` - Planning and design agents
- `*-creator` - Creation and implementation agents
- `*-reviewer` - Review and quality assurance agents
- `*-tester` - Testing agents
- `*-publisher` - Publishing and deployment agents

### Agent Types

1. **Orchestrators**: Coordinate multi-agent workflows
2. **Specialists**: Execute specific tasks (testing, review, implementation)
3. **Experts**: Domain knowledge (learning design, security, UX)

---

## 🎓 Content Stream (Learning Paths)

### Master Orchestrator

#### `content-orchestrator`
**Location**: `.claude/agents/content/orchestrators/content-orchestrator.md`

**Purpose**: Master orchestrator for all learning content creation

**Workflow**:
1. **Design** → `content-designer` - Learning science and pedagogy
2. **Plan** → `content-planner` - Structure and task sequences
3. **Create** → `content-creator` - Actual content generation
4. **Review** → `content-reviewer` - Quality assurance
5. **Test** → `content-tester` - Student testing
6. **Publish** → `content-publisher` - Deploy to Supabase

**When to Use**: Creating new learning paths, tasks, or educational content

**Example**:
```
User: "Create a Spanish learning path for greetings"
→ Invokes content-orchestrator
→ Routes through all 6 stages
→ Outputs published learning path
```

---

### Specialized Content Agents

#### `content-designer`
**Expert in**: Learning science, pedagogy, cognitive psychology
- Designs effective learning paths
- Defines spaced repetition schedules
- Ensures pedagogical effectiveness

#### `content-planner`
**Expert in**: Curriculum structure, task sequencing
- Breaks down learning objectives
- Plans difficulty progression
- Defines task type distribution

#### `content-creator`
**Expert in**: Content generation, question writing
- Creates tasks, questions, answers
- Generates hints and feedback
- Adds audio/visual assets

#### `content-reviewer`
**Expert in**: Quality assurance, pedagogical review
- Reviews content accuracy
- Checks difficulty appropriateness
- Validates learning effectiveness

#### `content-tester`
**Expert in**: Student testing, usability
- Tests with sample learners
- Gathers feedback
- Validates user experience

#### `content-publisher`
**Expert in**: Deployment, database operations
- Publishes to Supabase
- Creates backups
- Validates production data

---

## 🛠️ Platform Stream (Development)

### Master Orchestrator

#### `platform-orchestrator`
**Location**: `.claude/agents/platform/orchestrators/platform-orchestrator.md`

**Purpose**: Master orchestrator for all platform development

**Routes to 6 Sub-Orchestrators**:
1. **Documentation** → `platform-docs-orchestrator`
2. **Planning** → `platform-planning-orchestrator`
3. **Development** → `platform-dev-orchestrator`
4. **Testing** → `platform-test-orchestrator`
5. **Review** → `platform-review-orchestrator`
6. **Deployment** → `platform-deploy-orchestrator`

**When to Use**: Any platform development, maintenance, or deployment task

**Example**:
```
User: "Add a new task type for audio comprehension"
→ Invokes platform-orchestrator
→ Routes to planning → dev → test → review → deploy
→ Outputs complete feature implementation
```

---

### Sub-Orchestrators

#### `platform-docs-orchestrator`
**Workflow**: Architect → Validate → Publish
- Manages technical documentation
- Coordinates screenshot creation
- Ensures documentation accuracy

**Agents**:
- `docs-architect` - Structure documentation
- `docs-validator` - Verify completeness
- `docs-publisher` - Deploy to production

#### `platform-planning-orchestrator`
**Workflow**: Business Analysis → Issue Planning → Prioritization
- Gathers requirements
- Creates implementation plans
- Prioritizes backlog

**Agents**:
- `business-analyst` - Analyze requirements
- `issue-planner` - Create detailed plans
- `issue-prioritizer` - Rank by business value
- `product-owner` - Business decisions

#### `platform-dev-orchestrator`
**Workflow**: Design → Implementation → Build
- Coordinates development work
- Manages feature implementation
- Ensures code quality

**Agents**:
- `ui-ux-designer` - Design interfaces
- `component-library-architect` - Reusable components
- `issue-implementer` - Write code
- `build-pipeline-engineer` - Build optimization

#### `platform-test-orchestrator`
**Workflow**: Unit → Integration → E2E → Visual
- Comprehensive testing coverage
- Performance validation
- Security testing

**Agents**:
- `unit-tester` - Unit test coverage
- `integration-tester` - Integration tests
- `e2e-tester` - End-to-end flows
- `performance-tester` - Performance metrics
- `security-tester` - Security vulnerabilities
- `ui-visual-validator` - Visual regression

#### `platform-review-orchestrator`
**Workflow**: Code Review → Security Audit → Implementation Validation
- Quality gates
- Security compliance
- Standards enforcement

**Agents**:
- `code-reviewer` - Code quality review
- `security-auditor` - Security compliance
- `implementation-tester` - Validate against plan

#### `platform-deploy-orchestrator`
**Workflow**: Validation → Release → Deployment → Rollback (if needed)
- Production deployments
- Release management
- Rollback procedures

**Agents**:
- `deployment-validator` - Pre-deployment checks
- `release-engineer` - Version management
- `rollback-manager` - Emergency rollbacks

---

## 💻 Available Commands

Commands are executable workflows that can be invoked directly. See `COMMANDS.md` for full reference.

### Quick Command Reference

| Command | Purpose | Arguments |
|---------|---------|-----------|
| `/prioritize-backlog` | Analyze and rank GitHub issues | None |
| `/validate-implementation` | Comprehensive testing and validation | `[issue-number]` |
| `/review-learning-path` | Pedagogical review of content | `[filepath]` or `[topic/path]` |
| `/create-release` | Create production release | `[major\|minor\|patch]` |
| `/new-learning-path` | Interactive learning path creation | `[topic-id] [path-id]` |
| `/new-task-type` | Implement new task type | `[task-type-name]` |
| `/deploy` | Deploy to production | `--force`, `--skip-test` |
| `/deploy-test` | Deploy to test environment | None |

### Command Examples

**Creating Content**:
```bash
/new-learning-path mathematik algebra-basics
# Interactive prompts guide through creation
```

**Development Workflow**:
```bash
/validate-implementation 42
# Runs all tests, generates report
```

**Deployment**:
```bash
/deploy
# Full safety checks + confirmation required
```

**Backlog Management**:
```bash
/prioritize-backlog
# Analyzes all open issues, generates priority report
```

---

## 🔄 Common Workflows

### 1. Create New Learning Path

**Trigger**: `/new-learning-path [topic] [path-id]`

**Flow**:
1. User provides topic and basic info
2. `content-orchestrator` coordinates:
   - `content-designer` validates learning objectives
   - `content-planner` structures tasks
   - `content-creator` generates content
   - `content-reviewer` quality check
   - `content-tester` validates with test users
   - `content-publisher` deploys to Supabase
3. Output: Published learning path in production

**Duration**: ~30-60 minutes (depending on complexity)

---

### 2. Implement New Feature

**Trigger**: User describes feature or GitHub issue

**Flow**:
1. `platform-orchestrator` analyzes request
2. Routes to `platform-planning-orchestrator`:
   - `business-analyst` gathers requirements
   - `issue-planner` creates implementation plan
3. Routes to `platform-dev-orchestrator`:
   - `ui-ux-designer` designs interface
   - `issue-implementer` writes code
4. Routes to `platform-test-orchestrator`:
   - Runs unit, integration, E2E tests
5. Routes to `platform-review-orchestrator`:
   - `code-reviewer` reviews code
   - `security-auditor` checks security
6. Routes to `platform-deploy-orchestrator`:
   - `deployment-validator` pre-checks
   - Deploys to production

**Duration**: 1-4 hours (depending on complexity)

---

### 3. Fix Production Bug

**Trigger**: Bug report or `/validate-implementation`

**Flow**:
1. `platform-orchestrator` analyzes issue
2. `platform-dev-orchestrator` implements fix
3. `platform-test-orchestrator` validates fix
4. `platform-deploy-orchestrator` hot-deploys
5. If deployment fails:
   - `rollback-manager` reverts changes

**Duration**: 15-60 minutes (critical bugs prioritized)

---

### 4. Create Release

**Trigger**: `/create-release [major|minor|patch]`

**Flow**:
1. `release-engineer` analyzes changes since last release
2. Runs comprehensive validation:
   - All tests pass
   - TypeScript compiles
   - No security issues
3. Updates version numbers
4. Creates git tag
5. Generates changelog
6. Deploys to production
7. Creates GitHub release

**Duration**: 10-20 minutes

---

## 🎯 When to Use Which Agent

### Use `content-orchestrator` when:
- ✅ Creating new learning paths
- ✅ Updating educational content
- ✅ Reviewing pedagogical quality
- ✅ Publishing content to production

### Use `platform-orchestrator` when:
- ✅ Adding new features
- ✅ Fixing bugs
- ✅ Updating documentation
- ✅ Running tests
- ✅ Deploying to production
- ✅ Managing releases

### Invoke Specific Agents when:
- ✅ Need domain expertise (e.g., `security-auditor` for security review)
- ✅ Single-purpose task (e.g., `unit-tester` for unit tests only)
- ✅ Quick validation (e.g., `docs-validator` to check docs)

---

## 📝 Agent Definition Format

Each agent is defined in a markdown file with frontmatter:

```markdown
---
name: agent-name
description: What this agent does
model: sonnet | opus | haiku
tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

You are [role description]...

## Expert Purpose
[What makes this agent an expert]

## Core Responsibilities
[Specific tasks this agent handles]

## Tools Available
[Which tools the agent can use]

## Success Criteria
[How to measure success]

## Constraints
[What the agent should NOT do]
```

---

## 🛡️ Agent Best Practices

### For All Agents

**DO**:
- ✅ Follow TypeScript strict mode
- ✅ Use CSS Modules (never inline styles)
- ✅ Test changes before completion
- ✅ Document decisions and changes
- ✅ Validate against acceptance criteria
- ✅ Use design tokens from `variables.css`
- ✅ Run `npm run build` to verify TypeScript

**DON'T**:
- ❌ Use `any` type in TypeScript
- ❌ Modify protected areas (see `AGENTS.md`)
- ❌ Skip testing
- ❌ Deploy without validation
- ❌ Commit sensitive data
- ❌ Use inline styles

### For Content Agents

**DO**:
- ✅ Follow learning science principles
- ✅ Validate difficulty levels
- ✅ Test with sample learners
- ✅ Use German UI language
- ✅ Include audio for language tasks

**DON'T**:
- ❌ Create overly complex tasks
- ❌ Skip pedagogical review
- ❌ Publish untested content

### For Platform Agents

**DO**:
- ✅ Write comprehensive tests
- ✅ Follow accessibility guidelines (WCAG 2.1 AA)
- ✅ Use semantic HTML
- ✅ Optimize performance
- ✅ Document breaking changes

**DON'T**:
- ❌ Break existing functionality
- ❌ Skip security checks
- ❌ Ignore TypeScript errors
- ❌ Deploy to production without testing

---

## 🔍 Debugging Agent Issues

### Agent Not Working as Expected

1. **Check agent definition**: Verify frontmatter is correct
2. **Review tools**: Ensure agent has necessary tools
3. **Check dependencies**: Verify required agents are available
4. **Validate input**: Ensure user input is properly formatted

### Workflow Coordination Issues

1. **Check orchestrator**: Verify correct orchestrator is invoked
2. **Review routing**: Ensure sub-agents are properly coordinated
3. **Check handoffs**: Verify data passed between agents
4. **Validate outputs**: Ensure each stage produces expected results

### Command Not Executing

1. **Check command definition**: Verify in `commands/` directory
2. **Review arguments**: Ensure proper argument format
3. **Check permissions**: Verify agent has necessary tools
4. **Validate syntax**: Ensure command syntax is correct

---

## 📚 Related Documentation

- **`COMMANDS.md`**: Complete command reference and usage
- **`agents/AGENT_ARCHITECTURE.md`**: Detailed architecture documentation
- **`agents/AGENT_REGISTRY.md`**: Complete agent catalog
- **Main `AGENTS.md`**: Project-level agent guide
- **Domain-specific guides**: `tests/AGENTS.md`, `docs/AGENTS.md`, etc.

---

## 🚀 Quick Start for New Agents

### Creating a New Agent

1. **Choose location**: `content/agents/` or `platform/agents/`
2. **Create file**: `agent-name.md` (kebab-case)
3. **Add frontmatter**: Define name, description, model, tools
4. **Define role**: Expert purpose and responsibilities
5. **Register**: Add to `AGENT_REGISTRY.md`
6. **Test**: Invoke agent with sample task

### Creating a New Command

1. **Create file**: `.claude/commands/command-name.md`
2. **Add frontmatter**: Description and arguments
3. **Define workflow**: Step-by-step execution
4. **Document**: Add to `COMMANDS.md`
5. **Test**: Run command with sample input

### Creating a New Orchestrator

1. **Create file**: `orchestrators/orchestrator-name.md`
2. **Define workflow**: List stages and agents
3. **Add routing logic**: Determine which agents to invoke
4. **Document handoffs**: Define data passed between agents
5. **Register**: Add to `AGENT_REGISTRY.md`
6. **Test**: Run end-to-end workflow

---

## 💡 Tips for Working with Agents

### Efficiency

- Use orchestrators for multi-stage workflows
- Invoke specific agents for single-purpose tasks
- Parallelize independent operations
- Cache results to avoid redundant work

### Quality

- Always validate outputs
- Run tests before declaring success
- Document decisions and rationale
- Follow domain-specific guidelines

### Communication

- Provide clear status updates
- Report progress at each stage
- Escalate blockers promptly
- Document workflow outcomes

### Debugging

- Check agent logs for errors
- Verify tool availability
- Validate input formats
- Review agent definitions

---

## 🎓 Learning Resources

### For Content Agents
- **Learning Science**: Cognitive psychology, spaced repetition
- **Pedagogical Design**: Bloom's taxonomy, scaffolding
- **Content Creation**: Question writing, feedback design
- **Testing**: Learner validation, usability testing

### For Platform Agents
- **TypeScript**: Strict mode, type safety
- **React**: Hooks, component patterns
- **Testing**: Vitest, Playwright, jest-axe
- **Accessibility**: WCAG 2.1 AA, semantic HTML
- **CSS Modules**: Design tokens, BEM naming

---

**Last Updated**: 2025-12-01  
**Total Agents**: 33+  
**Maintained by**: @trsdn  
**Questions?**: See `COMMANDS.md` or `agents/AGENT_REGISTRY.md`
