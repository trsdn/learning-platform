# Agent Registry

**Last Updated**: 2025-11-24
**Total Agents**: 33 (2 Orchestrators + 31 Specialized Agents)

This is the complete registry of all agents available in the learning platform.

---

## Quick Reference

### Content Stream (Learning Paths)
**Invoke**: Use `content-orchestrator` for all learning content creation

### Platform Stream (Development)
**Invoke**: Use `platform-orchestrator` for all platform development tasks

---

## 1. Content Stream Agents

### Orchestrator

#### `content-orchestrator`
- **Location**: `.claude/agents/content/orchestrators/content-orchestrator.md`
- **Purpose**: Master orchestrator for learning content creation
- **Workflow**: Design → Plan → Create → Review → Test → Publish
- **When to Use**: Creating new learning paths, tasks, or educational content

---

### Specialized Agents

#### `content-designer`
- **Location**: `.claude/agents/content/agents/content-designer.md`
- **Purpose**: Learning science expert - pedagogical design
- **Tools**: All tools
- **Replaces**: `learning-design-expert`

#### `content-planner`
- **Location**: `.claude/agents/content/agents/content-planner.md`
- **Purpose**: Structure learning paths and task sequences
- **Output**: CONTENT-PLAN-*.md files

#### `content-creator`
- **Location**: `.claude/agents/content/agents/content-creator.md`
- **Purpose**: Creates actual tasks, questions, and content
- **Output**: Task JSON files, audio scripts

#### `content-reviewer`
- **Location**: `.claude/agents/content/agents/content-reviewer.md`
- **Purpose**: Reviews content for pedagogical quality
- **Output**: Review reports with scores

#### `content-tester`
- **Location**: `.claude/agents/content/agents/content-tester.md`
- **Purpose**: Tests content with sample learners
- **Tools**: Playwright for automated testing

#### `content-publisher`
- **Location**: `.claude/agents/content/agents/content-publisher.md`
- **Purpose**: Publishes content to Supabase production
- **Output**: Deployment confirmation, backup files

---

## 2. Platform Stream Agents

### Master Orchestrator

#### `platform-orchestrator`
- **Location**: `.claude/agents/platform/orchestrators/platform-orchestrator.md`
- **Purpose**: Master orchestrator for platform development
- **Routes to**: 6 sub-orchestrators based on task type
- **When to Use**: Any platform development, maintenance, or deployment task

---

## 2.1 Documentation Flow

### Orchestrator

#### `platform-docs-orchestrator`
- **Location**: `.claude/agents/platform/orchestrators/platform-docs-orchestrator.md`
- **Purpose**: Manages documentation workflows
- **Workflow**: Architect → Validate → Publish

### Agents

#### `docs-architect`
- **Location**: `.claude/agents/platform/agents/docs-architect.md`
- **Purpose**: Creates comprehensive technical documentation
- **Output**: Technical docs, API docs, architecture diagrams

#### `docs-validator`
- **Location**: `.claude/agents/platform/agents/docs-validator.md`
- **Purpose**: Validates documentation accuracy
- **Checks**: Code examples work, links valid, no outdated content

#### `docs-publisher`
- **Location**: `.claude/agents/platform/agents/docs-publisher.md`
- **Purpose**: Publishes documentation to wiki/docs site
- **Output**: Published docs, changelog, release notes

---

## 2.2 Planning & Requirements Flow

### Orchestrator

#### `platform-planning-orchestrator`
- **Location**: `.claude/agents/platform/orchestrators/platform-planning-orchestrator.md`
- **Purpose**: Manages requirements and planning
- **Workflow**: Business Analyst → Planner → Prioritizer → Product Owner

### Agents

#### `business-analyst`
- **Location**: `.claude/agents/platform/agents/business-analyst.md`
- **Purpose**: Analyzes requirements from user perspective
- **Output**: Enhanced issues with user stories, acceptance criteria

#### `issue-planner`
- **Location**: `.claude/agents/platform/agents/issue-planner.md`
- **Purpose**: Creates detailed implementation plans
- **Output**: PLAN-ISSUE-*.md files

#### `issue-prioritizer`
- **Location**: `.claude/agents/platform/agents/issue-prioritizer.md`
- **Purpose**: Prioritizes backlog using value/effort matrix
- **Output**: Prioritized issue list

#### `product-owner`
- **Location**: `.claude/agents/platform/agents/product-owner.md`
- **Purpose**: Final decision maker on priorities
- **Role**: Strategic decisions, approval authority

---

## 2.3 Development Flow

### Orchestrator

#### `platform-dev-orchestrator`
- **Location**: `.claude/agents/platform/orchestrators/platform-dev-orchestrator.md`
- **Purpose**: Manages code implementation
- **Workflow**: Implement (TDD) → Test → Iterate

### Agents

#### `issue-implementer`
- **Location**: `.claude/agents/platform/agents/issue-implementer.md`
- **Purpose**: Implements features following TDD
- **Output**: Code, tests, PR

#### `implementation-tester`
- **Location**: `.claude/agents/platform/agents/implementation-tester.md`
- **Purpose**: Validates implementation against plan
- **Checks**: Tests pass, acceptance criteria met, code quality

---

## 2.4 Testing Flow

### Orchestrator

#### `platform-test-orchestrator`
- **Location**: `.claude/agents/platform/orchestrators/platform-test-orchestrator.md`
- **Purpose**: Manages all testing activities
- **Workflow**: Unit → Integration → E2E → Performance → Security

### Agents

#### `unit-tester`
- **Location**: `.claude/agents/platform/agents/unit-tester.md`
- **Purpose**: Runs and analyzes unit tests
- **Tools**: Bash (npm test), coverage reports

#### `integration-tester`
- **Location**: `.claude/agents/platform/agents/integration-tester.md`
- **Purpose**: Tests module interactions
- **Focus**: Repository contracts, service integrations

#### `e2e-tester`
- **Location**: `.claude/agents/platform/agents/e2e-tester.md`
- **Purpose**: Runs Playwright E2E tests
- **Tools**: Playwright MCP

#### `performance-tester`
- **Location**: `.claude/agents/platform/agents/performance-tester.md`
- **Purpose**: Performance and load testing
- **Metrics**: Page load times, bundle sizes, API response times

#### `security-tester`
- **Location**: `.claude/agents/platform/agents/security-tester.md`
- **Purpose**: Security and vulnerability testing
- **Checks**: XSS, SQL injection, OWASP compliance

---

## 2.5 Review Flow

### Orchestrator

#### `platform-review-orchestrator`
- **Location**: `.claude/agents/platform/orchestrators/platform-review-orchestrator.md`
- **Purpose**: Manages code review and QA
- **Workflow**: Code Review → Security → UI → Generate Issues

### Agents

#### `code-reviewer`
- **Location**: `.claude/agents/platform/agents/code-reviewer.md`
- **Purpose**: Reviews code for quality and best practices
- **Output**: Review feedback, approval/rejection

#### `security-auditor`
- **Location**: `.claude/agents/platform/agents/security-auditor.md`
- **Purpose**: Security code review
- **Checks**: Vulnerabilities, threat modeling, auth/authz

#### `ui-visual-validator`
- **Location**: `.claude/agents/platform/agents/ui-visual-validator.md`
- **Purpose**: Visual regression and design system validation
- **Tools**: Screenshot comparison, accessibility checks

#### `issue-generator`
- **Location**: `.claude/agents/platform/agents/issue-generator.md`
- **Purpose**: Creates GitHub issues from review findings
- **Output**: Well-formed GitHub issues, prioritized

#### `mermaid-expert`
- **Location**: `.claude/agents/platform/agents/mermaid-expert.md`
- **Purpose**: Creates Mermaid diagrams for documentation
- **Output**: Flowcharts, sequence diagrams, ERDs, architecture diagrams

#### `ui-ux-designer`
- **Location**: `.claude/agents/platform/agents/ui-ux-designer.md`
- **Purpose**: Design systems, wireframes, accessibility, user research
- **Output**: Design specifications, component libraries, research plans

---

## 2.6 Deployment Flow

### Orchestrator

#### `platform-deploy-orchestrator`
- **Location**: `.claude/agents/platform/orchestrators/platform-deploy-orchestrator.md`
- **Purpose**: Manages deployment and releases
- **Workflow**: Build → Release → Deploy → Validate → Monitor

### Agents

#### `build-pipeline-engineer`
- **Location**: `.claude/agents/platform/agents/build-pipeline-engineer.md`
- **Purpose**: Optimizes build and CI/CD
- **Focus**: Vite config, bundle optimization, workflows

#### `release-engineer`
- **Location**: `.claude/agents/platform/agents/release-engineer.md`
- **Purpose**: Handles release management
- **Output**: Semantic versions, changelog, git tags

#### `deployment-validator`
- **Location**: `.claude/agents/platform/agents/deployment-validator.md`
- **Purpose**: Validates production deployments
- **Checks**: Smoke tests, error rates, performance

#### `rollback-manager`
- **Location**: `.claude/agents/platform/agents/rollback-manager.md`
- **Purpose**: Handles deployment rollbacks
- **When**: Deployment validation fails

---

## Agent Selection Guide

### For Users

| Task Type | Invoke Agent | Example |
|-----------|--------------|---------|
| Create learning content | `content-orchestrator` | "Create German irregular verbs learning path" |
| Add new feature | `platform-orchestrator` | "Implement issue #123" |
| Review code | `platform-review-orchestrator` | "Review PR #77" |
| Run tests | `platform-test-orchestrator` | "Run full test suite" |
| Deploy to production | `platform-deploy-orchestrator` | "Deploy version 2.0.0" |
| Update documentation | `platform-docs-orchestrator` | "Document new API endpoints" |
| Plan sprint | `platform-planning-orchestrator` | "Prioritize backlog for sprint 5" |

### Decision Tree

```
User Request
    │
    ├─ Learning Content? → content-orchestrator
    │
    └─ Platform Development?
           │
           ├─ Documentation? → platform-docs-orchestrator
           ├─ Planning/Issues? → platform-planning-orchestrator
           ├─ Coding? → platform-dev-orchestrator
           ├─ Testing? → platform-test-orchestrator
           ├─ Review? → platform-review-orchestrator
           └─ Deployment? → platform-deploy-orchestrator
```

---

## Agent Statistics

### Content Stream
- **1 Orchestrator**: content-orchestrator
- **6 Specialized Agents**: designer, planner, creator, reviewer, tester, publisher
- **Total Lines**: ~5,500 lines of detailed instructions

### Platform Stream
- **1 Master Orchestrator**: platform-orchestrator
- **6 Sub-Orchestrators**: docs, planning, dev, test, review, deploy
- **25 Specialized Agents**: Covering all aspects of SDLC (including mermaid-expert, ui-ux-designer)
- **Total Lines**: ~15,000+ lines of detailed instructions

### Grand Total
- **2 Master Orchestrators**
- **6 Sub-Orchestrators**
- **31 Specialized Agents**
- **39 Agent Definitions**

---

## Deprecated Agents

### Renamed
- `learning-design-expert` → `content-designer` (moved to content stream)

### Consolidated
- Testing agents consolidated under `platform-test-orchestrator`

---

## Agent Capabilities Matrix

| Agent | Read | Write | Bash | Grep | Glob | Web | Playwright | GitHub |
|-------|------|-------|------|------|------|-----|------------|--------|
| content-orchestrator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| content-designer | ✓ | ✓ | - | - | - | ✓ | - | - |
| content-planner | ✓ | ✓ | - | ✓ | ✓ | - | - | - |
| content-creator | ✓ | ✓ | - | - | - | ✓ | - | - |
| content-reviewer | ✓ | ✓ | - | - | - | - | - | - |
| content-tester | ✓ | ✓ | ✓ | - | - | - | ✓ | - |
| content-publisher | ✓ | ✓ | ✓ | - | - | - | - | - |
| platform-orchestrator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| All platform agents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Integration with Slash Commands

### Content Commands
- `/new-learning-path` → Invokes `content-orchestrator`
- `/review-learning-path` → Invokes `content-reviewer`

### Platform Commands
- `/analyze-requirements` → Invokes `business-analyst`
- `/plan` → Invokes `issue-planner`
- `/implement` → Invokes `issue-implementer`
- `/validate-implementation` → Invokes `implementation-tester`
- `/create-release` → Invokes `release-engineer`
- `/deploy` → Invokes `platform-deploy-orchestrator`
- `/deploy-test` → Invokes `platform-deploy-orchestrator` (test env)
- `/prioritize-backlog` → Invokes `issue-prioritizer`

---

## Future Enhancements

1. **Agent Learning**: Track performance metrics
2. **Parallel Execution**: Run independent agents concurrently
3. **Cost Optimization**: Use cheaper models for simple tasks
4. **Agent Versioning**: Track agent evolution
5. **Custom Agents**: User-defined specialized agents
6. **Agent Marketplace**: Share agents across projects

---

## Documentation

- **Architecture**: See `AGENT_ARCHITECTURE.md` for design details
- **Individual Agents**: See agent-specific `.md` files
- **Commands**: See `.claude/commands/` for slash command integration
- **Testing & Artifacts**: See `AGENTS.md` section "🧪 Testing & Artifacts" for screenshot storage rules

### Domain-Specific Guides

For agents working in specific domains, consult these specialized guides:

| Domain | Guide | Relevant Agents |
|--------|-------|-----------------|
| **Testing** | [../../tests/AGENTS.md](../../tests/AGENTS.md) | unit-tester, integration-tester, e2e-tester, performance-tester, implementation-tester |
| **Templates** | [../../templates/AGENTS.md](../../templates/AGENTS.md) | component-library-architect, issue-implementer |
| **Database** | [../../supabase/AGENTS.md](../../supabase/AGENTS.md) | business-analyst, issue-implementer, issue-planner |
| **Documentation** | [../../docs/AGENTS.md](../../docs/AGENTS.md) | docs-architect, docs-validator, docs-publisher |
| **Content** | [../../public/AGENTS.md](../../public/AGENTS.md) | content-designer, content-creator, content-reviewer, content-publisher |

---

## Contributing

To add a new agent:
1. Create agent definition following the template
2. Add to appropriate stream (content/platform)
3. Update this registry
4. Update parent orchestrator if needed
5. Add integration tests

---

## Support

For agent-related questions:
- Review `AGENT_ARCHITECTURE.md`
- Check individual agent documentation
- Open GitHub issue with `agent` label
