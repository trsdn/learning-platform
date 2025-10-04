---
description: Analyze and prioritize GitHub issues using business value, user impact, urgency, and effort scoring. No arguments required.
agent: product-owner
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Analyze all open GitHub issues, calculate priority scores, and provide ranked backlog with actionable recommendations.

**Primary Agent**: product-owner

Execution steps:

1. **Fetch all open issues**:
   ```bash
   gh issue list --state open --limit 100 --json number,title,labels,body,createdAt,assignees,comments
   ```

2. **Calculate priority score** for each issue using algorithm:

   ```typescript
   function calculatePriority(issue): number {
     let score = 0;

     // Business value (0-40 points)
     if (hasLabel(issue, 'critical')) score += 40;
     else if (hasLabel(issue, 'high-priority')) score += 30;
     else if (hasLabel(issue, 'enhancement')) score += 20;
     else if (hasLabel(issue, 'documentation')) score += 10;

     // User impact (0-30 points)
     if (hasLabel(issue, 'affects-all-users')) score += 30;
     else if (hasLabel(issue, 'affects-many-users')) score += 20;
     else if (hasLabel(issue, 'affects-some-users')) score += 10;

     // Urgency (0-20 points)
     if (hasLabel(issue, 'bug')) score += 20;
     else if (hasLabel(issue, 'security')) score += 20;
     else if (hasLabel(issue, 'performance')) score += 15;
     else if (hasLabel(issue, 'feature')) score += 10;

     // Effort inverse (0-10 points)
     // Lower effort = higher score
     if (hasLabel(issue, 'good-first-issue')) score += 10;
     else if (hasLabel(issue, 'small')) score += 8;
     else if (hasLabel(issue, 'medium')) score += 5;
     else if (hasLabel(issue, 'large')) score += 2;

     return score;
   }
   ```

3. **Categorize issues** by type:
   - 🐛 Bugs
   - 🚀 Features
   - 📚 Documentation
   - ⚡ Performance
   - 🔒 Security
   - ♿ Accessibility

4. **Analyze dependencies**:
   - Check issue body for "Depends on #X"
   - Check linked PRs
   - Identify blockers

5. **Generate priority report**:

   Use this template:
   ```markdown
   # 📊 Backlog Priority Analysis

   **Generated**: [timestamp]
   **Total Open Issues**: [count]
   **Analysis Date**: [date]

   ## Priority Rankings

   ### 🔴 Critical Priority (Score 80-100)
   1. **Issue #X** - [Title] (Score: 95)
      - Labels: critical, bug, affects-all-users
      - Impact: High - Blocks all users from [feature]
      - Effort: Small (2 days)
      - **Recommendation**: Start immediately
      - **Suggested Agent Flow**: business-analyst → issue-planner → issue-implementer

   ### 🟡 High Priority (Score 60-79)
   2. **Issue #Y** - [Title] (Score: 72)
      - Labels: enhancement, affects-many-users
      - Impact: Medium - Improves UX for [feature]
      - Effort: Medium (1 week)
      - **Recommendation**: Queue for next sprint

   ### 🔵 Medium Priority (Score 40-59)

   ### ⚪ Low Priority (Score 0-39)

   ## Category Breakdown
   - 🐛 Bugs: X issues (Y critical)
   - 🚀 Features: X issues
   - 📚 Documentation: X issues
   - ⚡ Performance: X issues
   - 🔒 Security: X issues

   ## Dependency Graph
   ```
   Issue #10 (Feature A)
   ├── Blocks: #15, #22
   └── Depends on: #8 (completed)

   Issue #15 (Feature B)
   └── Blocked by: #10
   ```

   ## Recommended Workflow

   **Next 3 Issues to Work On**:
   1. Issue #X - Critical bug (Score: 95)
      - Start: business-analyst enhancement
      - Then: issue-planner for implementation plan
      - Then: issue-implementer with TDD

   2. Issue #Y - High-priority feature (Score: 78)
      - Start: business-analyst for user stories
      - Needs design review

   3. Issue #Z - Security fix (Score: 70)
      - Start: issue-planner directly (well-defined)
      - Critical path

   ## Insights & Recommendations

   **Patterns Detected**:
   - High concentration of [category] issues
   - Several issues lack proper labeling
   - X issues missing acceptance criteria

   **Suggested Actions**:
   1. Launch business-analyst on issues: #A, #B, #C (missing user stories)
   2. Add priority labels to: #D, #E, #F
   3. Close stale issues: #G, #H (no activity >90 days)

   **Capacity Planning**:
   - Estimated effort for top 5 issues: X days
   - Recommended team allocation: [suggestion]
   ```

6. **Label recommendations**:

   For issues missing labels, suggest:
   ```bash
   gh issue edit <number> --add-label "priority:high,bug,affects-many-users"
   ```

7. **Stale issue detection**:

   Identify issues with:
   - No activity >90 days
   - No assignee
   - No labels

   Ask: "Found X stale issues. Close or relabel? (close/relabel/skip)"

8. **Save report** (optional):

   Ask: "Save priority report to file? (yes/no)"

   If yes:
   - Create: `BACKLOG-PRIORITY-[date].md`
   - Save in project root

9. **Auto-select next issue** (if requested):

   If user says "start next issue" or similar:
   - Select highest-priority issue
   - Launch appropriate agent workflow
   - Example: "Starting Issue #45 (Score: 95) with business-analyst..."

10. **Follow-up actions**:

    Ask user: "What would you like to do next?"
    ```
    1. Start work on highest-priority issue (#X)
    2. Add missing labels to issues
    3. Close stale issues
    4. Export report for stakeholders
    5. Refresh analysis (re-run prioritization)
    6. Nothing, I'm done
    ```

Behavior rules:
- CALCULATE priority scores objectively
- EXPLAIN scoring rationale for each issue
- IDENTIFY dependencies and blockers
- RECOMMEND specific agent workflows
- DETECT patterns and anti-patterns
- SUGGEST labeling improvements
- CONSIDER team capacity
- PRIORITIZE user impact over complexity

Priority score interpretation:
- **90-100**: Drop everything, critical
- **80-89**: Very high priority, start this week
- **70-79**: High priority, plan for next sprint
- **60-69**: Medium-high, backlog top 10
- **40-59**: Medium, backlog consideration
- **20-39**: Low, nice-to-have
- **0-19**: Very low, defer or close

Label guidelines:
**Required labels**:
- Priority: `critical`, `high-priority`, `medium-priority`, `low-priority`
- Type: `bug`, `feature`, `enhancement`, `documentation`, `security`
- Impact: `affects-all-users`, `affects-many-users`, `affects-some-users`
- Effort: `good-first-issue`, `small`, `medium`, `large`

**Optional labels**:
- `breaking-change`
- `needs-design`
- `needs-research`
- `help-wanted`
- `wontfix`

Smart detection rules:
- Keywords "crash", "error", "broken" → likely `bug`
- Keywords "slow", "performance", "optimize" → likely `performance`
- Keywords "security", "vulnerability", "XSS" → likely `security`, `critical`
- Keywords "all users", "everyone" → likely `affects-all-users`
- Issue age >90 days + no activity → likely stale

Dependency parsing:
Look for patterns in issue body:
- "Depends on #123"
- "Blocked by #456"
- "Related to #789"
- "Closes #321" (in PRs)

Auto-labeling suggestions:
If issue mentions:
- "learning path" or "task type" → suggest `learning-content`
- "UI", "interface", "design" → suggest `ui/ux`
- "database", "storage" → suggest `backend`
- "test", "coverage" → suggest `testing`

Output format:
- Markdown for readability
- Priority icons (🔴🟡🔵⚪)
- Numbered rankings
- Score justification
- Actionable recommendations
- Agent workflow suggestions

Context: $ARGUMENTS
