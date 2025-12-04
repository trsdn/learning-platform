# Agent Switching Guide: Claude ↔ GitHub Copilot

**Last Updated**: 2025-12-04
**Parent Guide**: [../../AGENTS.md](../../AGENTS.md)

> This guide explains how to switch between Claude and GitHub Copilot coding agents for development purposes.

---

## 🎯 Overview

This repository supports two AI coding agents:

| Agent | Primary Use | Configuration |
|-------|-------------|---------------|
| **Claude** | Complex tasks, multi-file changes, PR reviews | `.claude/`, `CLAUDE.md` |
| **GitHub Copilot** | Issue implementation, code completion | `.github/copilot-instructions.md` |

Both agents share the same codebase understanding through `AGENTS.md` and agent-specific instruction files.

---

## 📁 Configuration Files

### Claude Configuration

```
.claude/
├── AGENTS.md              # Claude-specific agent architecture
├── COMMANDS.md            # Available commands (/deploy, /new-task-type, etc.)
├── agents/                # Specialized agent definitions
│   ├── content/           # Content creation agents
│   └── platform/          # Platform development agents
└── commands/              # Command implementations

CLAUDE.md                  # Root-level Claude instructions
.github/workflows/claude.yml             # Claude GitHub Action
.github/workflows/claude-code-review.yml # Claude PR review workflow
```

### GitHub Copilot Configuration

```
.github/copilot-instructions.md  # Copilot coding agent instructions
```

---

## 🔄 Switching Agents

### When to Use Claude

✅ **Use Claude for**:
- Complex multi-file refactoring
- Creating new learning paths with `/new-learning-path`
- Release management with `/create-release`
- PR code reviews (automatic via workflow)
- Tasks requiring specialized agent orchestration
- Interactive debugging sessions

### When to Use GitHub Copilot

✅ **Use GitHub Copilot for**:
- Implementing GitHub issues
- Code completion and generation
- Quick fixes and bug patches
- Unit test generation
- Documentation updates
- Standard development workflows

---

## 🛠️ Activating Each Agent

### Activating Claude

**Option 1: GitHub Issue/PR Comment**
```
@claude Please review this PR for code quality and security concerns.
```

**Option 2: GitHub Issue Creation**
Include `@claude` in the issue title or body:
```
@claude: Add slider tolerance visualization
```

**Option 3: PR Review Comment**
Comment on a PR with `@claude` to trigger Claude's review.

### Activating GitHub Copilot

**Option 1: GitHub Copilot Coding Agent (via Copilot Workspace)**
- Open an issue in GitHub
- Click "Open in Workspace" to use Copilot Coding Agent
- Copilot will read `.github/copilot-instructions.md` for context

**Option 2: Assign Issue to Copilot**
- Use GitHub's "Assign to Copilot" feature for supported issues
- Copilot creates a PR implementing the issue

---

## ⚙️ Configuration Sync

Both agents share common knowledge through:

1. **`AGENTS.md`** - Root-level development guide
2. **`.github/copilot-instructions.md`** - Comprehensive instructions (used by system prompt)
3. **`README.md`** - Project overview
4. **`docs/`** - Technical documentation

### Keeping Configurations in Sync

When updating agent instructions, ensure consistency:

| Update Type | Files to Update |
|-------------|----------------|
| Architecture changes | `AGENTS.md`, `.github/copilot-instructions.md`, `.claude/AGENTS.md` |
| New commands | `.claude/COMMANDS.md`, `.claude/commands/*.md` |
| Style guidelines | `AGENTS.md`, `.github/copilot-instructions.md` |
| Task type changes | Both agent instruction files |

---

## 📊 Feature Comparison

| Feature | Claude | GitHub Copilot |
|---------|--------|----------------|
| PR Code Review | ✅ Automatic via workflow | ❌ Not available |
| Issue Implementation | ✅ Via @claude mention | ✅ Via Copilot Workspace |
| Multi-agent Orchestration | ✅ 33+ specialized agents | ❌ Single agent |
| Custom Commands | ✅ /deploy, /new-task-type, etc. | ❌ Not supported |
| Interactive Prompting | ✅ Via comments | ✅ Via comments |
| Learning Path Creation | ✅ Specialized content agents | ⚠️ Basic support |
| Code Completion | ❌ Not primary use | ✅ Primary use |

---

## 🔧 Workflow Examples

### Example 1: New Feature with GitHub Copilot

1. Create GitHub issue with clear requirements
2. Click "Open in Workspace" or "Assign to Copilot"
3. Copilot reads `.github/copilot-instructions.md`
4. Copilot creates PR with implementation
5. Review and merge

### Example 2: New Feature with Claude

1. Create GitHub issue with `@claude` mention
2. Claude analyzes requirements
3. Claude routes to appropriate agents (planning → dev → test)
4. Claude creates PR with implementation
5. Review and merge

### Example 3: Hybrid Workflow

1. Create issue (no agent mention)
2. Use Copilot Workspace for initial implementation
3. After PR created, comment `@claude please review`
4. Claude reviews and suggests improvements
5. Address feedback and merge

---

## 🚨 Troubleshooting

### Claude Not Responding

**Check**:
1. `CLAUDE_CODE_OAUTH_TOKEN` secret is configured
2. Workflow file `.github/workflows/claude.yml` exists
3. Comment includes `@claude` trigger

**Verify workflow**:
```bash
gh workflow view claude.yml
```

### Copilot Not Working

**Check**:
1. GitHub Copilot is enabled for the repository
2. `.github/copilot-instructions.md` exists
3. Issue is assigned to Copilot or opened in Workspace

### Agent Conflicts

If both agents respond to the same issue:
- Be explicit about which agent you want: `@claude only` or use Copilot Workspace directly
- Remove `@claude` from issue body if using Copilot
- Use workflow dispatch for specific agent tasks

---

## 📝 Best Practices

### 1. Choose the Right Agent

| Task Type | Recommended Agent |
|-----------|-------------------|
| Quick bug fix | GitHub Copilot |
| Complex refactoring | Claude |
| New learning content | Claude (content agents) |
| Test generation | GitHub Copilot |
| PR review | Claude (automatic) |
| Release management | Claude (/create-release) |

### 2. Provide Clear Context

Both agents work better with:
- Clear issue descriptions
- Acceptance criteria
- Links to relevant files
- Examples of expected behavior

### 3. Review Agent Output

Always review agent-generated code for:
- [ ] TypeScript strict mode compliance
- [ ] CSS Modules usage (no inline styles)
- [ ] Test coverage
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] German language for UI

### 4. Iterate and Refine

If agent output isn't perfect:
- Provide feedback in comments
- Ask for specific improvements
- Use hybrid workflow for best results

---

## 🔐 Security Considerations

### Required Secrets

| Secret | Used By | Purpose |
|--------|---------|---------|
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude workflows | Authenticate Claude API |

### Permissions

Claude workflows require:
```yaml
permissions:
  contents: read
  pull-requests: write
  issues: read
  id-token: write
  actions: read
```

GitHub Copilot uses repository-level permissions configured in GitHub settings.

---

## 📚 Related Documentation

- [Main AGENTS.md](../../AGENTS.md) - Project-wide agent guide
- [Claude AGENTS.md](../../.claude/AGENTS.md) - Claude-specific architecture
- [Claude COMMANDS.md](../../.claude/COMMANDS.md) - Available commands
- [Copilot Instructions](../../.github/copilot-instructions.md) - Copilot configuration

---

## 🔄 Updates

When updating agent configurations:

1. **Test changes** with both agents
2. **Update this guide** if switching behavior changes
3. **Keep instruction files in sync** across agents
4. **Document new capabilities** as they're added

---

**Maintained By**: Platform team
**Questions?**: Open GitHub issue with `agent-config` label
