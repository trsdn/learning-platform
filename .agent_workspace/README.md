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

## Cleanup

Files older than 30 days can be archived or deleted. Reports should be kept for compliance.

## Gitignore

This directory is gitignored by default. Only commit specific files when needed.
