# Agent Architecture for Learning Platform

**Last Updated**: 2025-11-24
**Version**: 1.0.0

This document defines the complete agent architecture for both content creation (learning paths) and platform development workflows.

---

## Naming Convention

### Prefixes

- `content-*` - Content/learning path creation agents
- `platform-*` - Platform development agents
- `*-orchestrator` - Workflow orchestration agents

### Suffixes

- `*-planner` - Planning and design agents
- `*-creator` - Creation and implementation agents
- `*-reviewer` - Review and quality assurance agents
- `*-tester` - Testing agents
- `*-publisher` - Publishing and deployment agents

---

## 1. Content Orchestrator System

### `content-orchestrator`

**Role**: Master orchestrator for learning content creation
**Coordinates**: content-planner → content-creator → content-reviewer → content-tester → content-publisher

**Workflow**:

1. **Ideation**: Gather learning objectives and requirements
2. **Planning**: Structure learning path, define tasks
3. **Creation**: Generate tasks, questions, content
4. **Review**: Pedagogical review, quality assurance
5. **Testing**: Student testing, feedback gathering
6. **Publishing**: Deploy to Supabase, make live

---

### Content Stream Agents

#### `content-designer` (renamed from `learning-design-expert`)

**Purpose**: Expert in learning science and pedagogy
**Responsibilities**:

- Design learning paths based on cognitive psychology
- Define spaced repetition schedules
- Ensure pedagogical effectiveness
- Apply learning science best practices

**Tools**: All tools
**When to Use**: Beginning of content creation, during reviews

---

#### `content-planner` (new)

**Purpose**: Plans structure of learning paths and task sequences
**Responsibilities**:

- Break down learning objectives into tasks
- Define difficulty progression
- Plan task type distribution
- Create learning path metadata

**Tools**: Read, Write, Glob
**When to Use**: After requirements gathering, before content creation

**Output**:

- `.agent-workforce/reports/CONTENT-PLAN-{topic}-{path}.md`
- Learning path structure JSON
- Task type distribution plan

---

#### `content-creator` (new)

**Purpose**: Creates actual tasks, questions, and content
**Responsibilities**:

- Generate task content from plan
- Create questions, answers, hints
- Add audio/visual assets
- Format content for Supabase

**Tools**: Read, Write, WebSearch (for research)
**When to Use**: After planning phase

**Output**:

- Task JSON files
- Audio script files
- Content ready for review

---

#### `content-reviewer` (new)

**Purpose**: Reviews content for pedagogical quality
**Responsibilities**:

- Verify learning objectives met
- Check difficulty calibration
- Ensure clear instructions
- Validate answer correctness
- Generate improvement suggestions

**Tools**: Read, AskUserQuestion
**When to Use**: After content creation, before testing

**Output**:

- Review report with scores
- List of required changes
- GitHub issues for improvements

---

#### `content-tester` (new)

**Purpose**: Tests content with sample learners
**Responsibilities**:

- Simulate student interactions
- Test task clarity
- Verify spaced repetition works
- Check for edge cases
- Validate UX flow

**Tools**: All tools including Playwright
**When to Use**: After review, before publishing

**Output**:

- Test results report
- UX feedback
- Bug reports

---

#### `content-publisher` (new)

**Purpose**: Publishes content to production
**Responsibilities**:

- Seed content to Supabase
- Verify data integrity
- Update topic/path metadata
- Create backup of content
- Deploy to production

**Tools**: Bash, Read
**When to Use**: Final step after all approvals

**Output**:

- Deployment confirmation
- Content manifest
- Rollback instructions

---

## 2. Platform Orchestrator System

### `platform-orchestrator`

**Role**: Master orchestrator for platform development
**Coordinates**: All platform sub-orchestrators

**Sub-Orchestrators**:

1. `platform-docs-orchestrator`
2. `platform-planning-orchestrator`
3. `platform-dev-orchestrator`
4. `platform-test-orchestrator`
5. `platform-review-orchestrator`
6. `platform-deploy-orchestrator`

---

## 2.1 Documentation Flow

### `platform-docs-orchestrator`

**Role**: Manages all documentation workflows
**Coordinates**: docs-architect → docs-validator → docs-publisher

**Workflow**:

1. **Analysis**: Analyze codebase for documentation needs
2. **Creation**: Generate documentation
3. **Validation**: Validate accuracy and completeness
4. **Publishing**: Deploy to docs site

---

#### `docs-architect` (existing)

**Purpose**: Creates comprehensive technical documentation
**Responsibilities**:

- Analyze architecture and code
- Write technical documentation
- Create API documentation
- Generate architecture diagrams

**Tools**: All tools
**When to Use**: After major features, periodically for updates

---

#### `docs-validator` (new)

**Purpose**: Validates documentation accuracy
**Responsibilities**:

- Verify code examples work
- Check documentation matches code
- Find outdated documentation
- Validate links and references

**Tools**: Read, Bash, Grep
**When to Use**: After docs creation, before publishing

---

#### `docs-publisher` (new)

**Purpose**: Publishes documentation
**Responsibilities**:

- Deploy to GitHub Wiki or docs site
- Update README files
- Generate changelog
- Create release notes

**Tools**: Write, Bash
**When to Use**: After validation

---

## 2.2 Planning & Issue Flow

### `platform-planning-orchestrator`

**Role**: Manages requirements, planning, and issue creation
**Coordinates**: business-analyst → issue-planner → issue-prioritizer → product-owner

**Workflow**:

1. **Requirements**: Gather and clarify requirements
2. **Planning**: Create detailed implementation plans
3. **Prioritization**: Prioritize backlog
4. **Decision**: Product owner approves

---

#### `business-analyst` (existing)

**Purpose**: Analyzes requirements from user perspective
**Responsibilities**:

- Enhance GitHub issues
- Add user stories
- Define acceptance criteria
- Clarify requirements

**When to Use**: When new issues created

---

#### `issue-planner` (existing)

**Purpose**: Creates detailed implementation plans
**Responsibilities**:

- Research solutions
- Create plan.md files
- Break down into tasks
- Estimate effort

**When to Use**: After BA analysis, before implementation

---

#### `issue-prioritizer` (new)

**Purpose**: Prioritizes backlog based on value/effort
**Responsibilities**:

- Score issues on value/effort matrix
- Recommend priority order
- Balance technical debt vs features
- Consider dependencies

**Tools**: Read (GitHub API via gh CLI)
**When to Use**: Sprint planning, backlog grooming

---

#### `product-owner` (existing)

**Purpose**: Final decision maker on priorities
**Responsibilities**:

- Approve plans
- Make priority calls
- Coordinate all workflows
- Strategic decisions

**When to Use**: Throughout all processes

---

## 2.3 Development Flow

### `platform-dev-orchestrator`

**Role**: Manages code implementation
**Coordinates**: issue-implementer → implementation-tester

**Workflow**:

1. **Implementation**: Write code following TDD
2. **Testing**: Validate implementation
3. **Iteration**: Fix issues until green

---

#### `issue-implementer` (existing)

**Purpose**: Implements features following plans
**Responsibilities**:

- Write tests first (TDD)
- Implement features
- Follow coding standards
- Create PRs

**When to Use**: After planning approved

---

#### `implementation-tester` (existing)

**Purpose**: Validates implementation against plan
**Responsibilities**:

- Run test suites
- Verify acceptance criteria
- Check code quality
- Provide feedback

**When to Use**: After implementation, before review

---

## 2.4 Testing Flow

### `platform-test-orchestrator`

**Role**: Manages all testing activities
**Coordinates**: unit-tester → integration-tester → e2e-tester → performance-tester → security-tester

**Workflow**:

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test module interactions
3. **E2E Tests**: Test full user flows
4. **Performance Tests**: Test speed and load
5. **Security Tests**: Test for vulnerabilities

---

#### `unit-tester` (new)

**Purpose**: Runs and analyzes unit tests
**Responsibilities**:

- Execute `npm test`
- Analyze coverage reports
- Identify missing tests
- Generate test improvement issues

**Tools**: Bash, Read
**When to Use**: During development, in CI/CD

---

#### `integration-tester` (new)

**Purpose**: Tests module interactions
**Responsibilities**:

- Test repository contracts
- Test service integrations
- Validate API calls
- Test database operations

**Tools**: Bash, Read
**When to Use**: After unit tests pass

---

#### `e2e-tester` (new)

**Purpose**: Runs Playwright E2E tests
**Responsibilities**:

- Execute full user flows
- Test across browsers
- Validate UI interactions
- Generate test reports

**Tools**: Bash, Playwright MCP
**When to Use**: Before deployment, after major UI changes

---

#### `performance-tester` (new)

**Purpose**: Tests performance and load
**Responsibilities**:

- Measure page load times
- Test API response times
- Check bundle sizes
- Identify performance bottlenecks

**Tools**: Bash, Playwright, WebFetch
**When to Use**: Before releases, after performance changes

---

#### `security-tester` (renamed from `security-auditor`)

**Purpose**: Security and vulnerability testing
**Responsibilities**:

- Scan for vulnerabilities
- Test authentication/authorization
- Check for XSS, SQL injection
- Validate OWASP compliance

**Tools**: All tools
**When to Use**: Before releases, periodically

---

## 2.5 Review Flow

### `platform-review-orchestrator`

**Role**: Manages code review and quality assurance
**Coordinates**: code-reviewer → security-auditor → ui-visual-validator → issue-generator

**Workflow**:

1. **Code Review**: Review code quality
2. **Security Review**: Check for security issues
3. **UI Review**: Validate visual design
4. **Issue Creation**: Generate improvement issues

---

#### `code-reviewer` (existing)

**Purpose**: Reviews code for quality and best practices
**Responsibilities**:

- Static code analysis
- Check coding standards
- Review architecture decisions
- Identify improvements

**When to Use**: After implementation, before merge

---

#### `security-auditor` (existing)

**Purpose**: Security code review
**Responsibilities**:

- Vulnerability assessment
- Threat modeling
- Check authentication/auth
- OWASP compliance

**When to Use**: Before releases, for security-sensitive changes

---

#### `ui-visual-validator` (existing)

**Purpose**: Visual regression and design system validation
**Responsibilities**:

- Screenshot comparison
- Design system compliance
- Accessibility checks
- Visual regression testing

**When to Use**: After UI changes, before release

---

#### `issue-generator` (new)

**Purpose**: Creates GitHub issues from review findings
**Responsibilities**:

- Parse review feedback
- Create well-formed issues
- Prioritize findings
- Link to related issues

**Tools**: Bash (gh CLI)
**When to Use**: After all reviews complete

**Output**: GitHub issues for each improvement

---

## 2.6 Deployment Flow

### `platform-deploy-orchestrator`

**Role**: Manages deployment and release process
**Coordinates**: build-pipeline-engineer → release-engineer → deployment-validator → rollback-manager

**Workflow**:

1. **Build**: Optimize and build
2. **Release**: Create release, tag, changelog
3. **Deploy**: Deploy to production
4. **Validate**: Verify deployment
5. **Monitor**: Watch for issues, rollback if needed

---

#### `build-pipeline-engineer` (existing)

**Purpose**: Optimizes build and CI/CD
**Responsibilities**:

- Configure Vite build
- Optimize bundle size
- Set up pre-commit hooks
- Automate workflows

**When to Use**: Build optimization, CI/CD improvements

---

#### `release-engineer` (existing)

**Purpose**: Handles release management
**Responsibilities**:

- Semantic versioning
- Generate changelog
- Create git tags
- Publish releases

**When to Use**: When ready to release

---

#### `deployment-validator` (new)

**Purpose**: Validates production deployment
**Responsibilities**:

- Smoke tests in production
- Verify critical paths work
- Check error rates
- Monitor performance

**Tools**: Playwright, WebFetch, Bash
**When to Use**: After deployment

---

#### `rollback-manager` (new)

**Purpose**: Handles deployment rollbacks
**Responsibilities**:

- Detect deployment issues
- Execute rollback procedures
- Restore previous version
- Document incident

**Tools**: Bash
**When to Use**: When deployment validation fails

---

## Agent Selection Guide

### For Learning Content

```markdown
New learning path → content-orchestrator
Quality review → content-reviewer
Publishing → content-publisher
```

### For Platform Development

```markdown
New feature → platform-planning-orchestrator → platform-dev-orchestrator
Bug fix → platform-dev-orchestrator
Documentation → platform-docs-orchestrator
Testing → platform-test-orchestrator
Code review → platform-review-orchestrator
Deployment → platform-deploy-orchestrator
```

---

## Orchestrator Usage Examples

### Example 1: Create New Learning Path

```bash
# Invoke content orchestrator
/agent content-orchestrator "Create German irregular verbs learning path"

# Orchestrator will coordinate:
# 1. content-designer - Design learning approach
# 2. content-planner - Plan task structure
# 3. content-creator - Create tasks
# 4. content-reviewer - Review quality
# 5. content-tester - Test with simulations
# 6. content-publisher - Publish to Supabase
```

### Example 2: Implement Feature

```bash
# Invoke platform orchestrator for full cycle
/agent platform-orchestrator "Implement issue #123"

# Or invoke specific sub-orchestrator
/agent platform-dev-orchestrator "Implement issue #123"

# Orchestrator will coordinate:
# 1. business-analyst - Clarify requirements
# 2. issue-planner - Create implementation plan
# 3. issue-implementer - Write code
# 4. implementation-tester - Validate
# 5. platform-review-orchestrator - Review
# 6. platform-deploy-orchestrator - Deploy
```

### Example 3: Review and Improve

```bash
# Invoke review orchestrator
/agent platform-review-orchestrator "Review PR #77"

# Orchestrator will coordinate:
# 1. code-reviewer - Code quality review
# 2. security-auditor - Security review
# 3. ui-visual-validator - Visual review (if UI changes)
# 4. issue-generator - Create issues for improvements
```

---

## Implementation Plan

### Phase 1: Core Orchestrators (Priority 1)

- [ ] Create `content-orchestrator`
- [ ] Create `platform-orchestrator`
- [ ] Define orchestrator protocols

### Phase 2: Content Stream (Priority 2)

- [ ] Create `content-planner`
- [ ] Create `content-creator`
- [ ] Create `content-reviewer`
- [ ] Create `content-tester`
- [ ] Create `content-publisher`
- [ ] Rename `learning-design-expert` → `content-designer`

### Phase 3: Platform Testing (Priority 3)

- [ ] Create `platform-test-orchestrator`
- [ ] Create `unit-tester`
- [ ] Create `integration-tester`
- [ ] Create `e2e-tester`
- [ ] Create `performance-tester`
- [ ] Rename `security-auditor` → `security-tester`

### Phase 4: Platform Review (Priority 4)

- [ ] Create `platform-review-orchestrator`
- [ ] Create `issue-generator`

### Phase 5: Platform Deployment (Priority 5)

- [ ] Create `platform-deploy-orchestrator`
- [ ] Create `deployment-validator`
- [ ] Create `rollback-manager`

### Phase 6: Platform Docs & Planning (Priority 6)

- [ ] Create `platform-docs-orchestrator`
- [ ] Create `docs-validator`
- [ ] Create `docs-publisher`
- [ ] Create `platform-planning-orchestrator`
- [ ] Create `issue-prioritizer`

---

## Agent Communication Protocol

### Orchestrator → Agent

```json
{
  "workflow_id": "uuid",
  "task": "description",
  "context": {
    "previous_agent": "agent-name",
    "artifacts": ["file1.md", "file2.json"]
  },
  "requirements": ["requirement1", "requirement2"]
}
```

### Agent → Orchestrator

```json
{
  "status": "completed|failed|blocked",
  "artifacts": ["output1.md", "output2.json"],
  "next_agent": "suggested-next-agent",
  "issues": ["issue1", "issue2"],
  "feedback": "message to orchestrator"
}
```

---

## Future Enhancements

1. **AI Learning**: Orchestrators learn from past workflows
2. **Parallel Execution**: Run independent agents in parallel
3. **Rollback**: Undo agent actions if issues found
4. **Monitoring**: Track agent performance metrics
5. **Cost Optimization**: Use cheaper models for simple tasks
6. **Agent Marketplace**: Share custom agents

---

## References

- Original AGENTS.md
- Claude Code agent documentation
- Task tool capabilities
