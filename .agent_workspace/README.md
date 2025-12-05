# Agent Workspace

This directory is used by AI agents for intermediate files, audit trails, and inter-agent communication.

## Directory Structure

```
.agent_workspace/
├── requirements/     # From requirements-interviewer
│   └── feature-name-YYYY-MM-DD.md
├── plans/           # From issue-planner, content-planner
│   └── PLAN-ISSUE-*.md
├── drafts/          # Intermediate content/code
├── validations/     # From reviewers/testers
│   └── validation-report-*.md
├── revisions/       # Revision history from revision-coordinator
│   ├── content/
│   └── code/
├── reports/         # Workflow completion reports
│   └── workflow-report-*.md
├── curriculum/      # Curriculum data from curriculum-fetcher/researcher
│   ├── cache/       # Cached curriculum documents
│   └── analysis/    # Extracted learning objectives
└── config/          # Agent configuration
    └── quality-thresholds.yaml
```

## Purpose

- **Audit Trail**: All agent decisions and outputs are logged
- **Resumability**: Workflows can resume from intermediate state
- **Debugging**: Human can inspect any stage
- **Inter-Agent Communication**: Agents pass data through files

## Access Control

### Directory Ownership

Each subdirectory has designated owner agents with write permissions:

| Directory | Owner Agent(s) | Write Access | Read Access |
|-----------|---------------|--------------|-------------|
| `requirements/` | `requirements-interviewer` | Owner only | All agents |
| `plans/` | `issue-planner`, `content-planner` | Owners only | All agents |
| `drafts/` | `content-creator`, `frontend-engineer`, `backend-engineer` | Owners only | All agents |
| `validations/` | `*-validator`, `*-auditor`, `*-tester` | Owners only | All agents |
| `revisions/` | `revision-coordinator` | Owner only | All agents |
| `reports/` | Orchestrators only | Owners only | All agents |
| `curriculum/` | `curriculum-fetcher`, `curriculum-researcher` | Owners only | All agents |
| `config/` | Human administrators only | Admin only | All agents |

### Access Rules

```yaml
access_control:
  # Agents can only write to directories they own
  write_policy: owner_only

  # All agents can read from any directory
  read_policy: all_agents

  # Config directory is read-only for all agents
  config_policy: admin_write_only

  # Prevent cross-agent file modification
  prevent_overwrite: true

  # Require ownership declaration in file header
  ownership_header: required
```

### File Ownership Header

All files should include an ownership header:

```markdown
---
created_by: curriculum-fetcher
created_at: 2025-12-05T22:00:00Z
owned_by: curriculum-fetcher
---
```

### Conflict Resolution

1. **Same directory, different agents**: First writer wins; second agent must append or create new file
2. **Disputed ownership**: Escalate to orchestrator
3. **Config changes**: Require human approval via PR

### Security Boundaries

- Agents MUST NOT modify files outside their ownership scope
- Agents MUST NOT delete files created by other agents
- Orchestrators may read all files but write only to `reports/`
- Human review required for any access policy changes

## Cleanup

Files older than 30 days can be archived or deleted. Reports should be kept for compliance.

## Gitignore

This directory is gitignored by default. Only commit specific files when needed.
