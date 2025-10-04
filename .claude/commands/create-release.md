---
description: Create a production release with semantic versioning, changelog generation, and GitHub release publishing. Arguments: [version-type] (optional: major, minor, patch)
agent: release-engineer
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Create a production-ready release with proper versioning, changelog, git tagging, and GitHub release.

**Primary Agent**: release-engineer

Execution steps:

1. **Parse version type** from `$ARGUMENTS`:
   - If "major", "minor", or "patch" provided: Use it
   - If empty: Ask user which type
   - Validate: Must be one of three types

2. **Pre-release validation**:

   a. **Check git status**:
      ```bash
      git status
      ```
      - Ensure working directory is clean
      - If uncommitted changes: Ask user to commit or stash

   b. **Check current branch**:
      ```bash
      git branch --show-current
      ```
      - Must be on `main` or `master`
      - If not: Ask user to switch or abort

   c. **Pull latest changes**:
      ```bash
      git pull origin main
      ```
      - Ensure up-to-date with remote

   d. **Run tests**:
      ```bash
      npm test
      ```
      - All tests must pass
      - If failures: List failures and abort

   e. **Run build**:
      ```bash
      npm run build
      ```
      - Build must succeed
      - If errors: Show errors and abort

3. **Determine current version**:

   Read `package.json` to get current version:
   ```bash
   grep '"version"' package.json
   ```
   Current: `1.2.3`

4. **Calculate new version** based on type:

   ```typescript
   function calculateVersion(current: string, type: string): string {
     const [major, minor, patch] = current.split('.').map(Number);

     if (type === 'major') {
       return `${major + 1}.0.0`; // 1.2.3 → 2.0.0
     } else if (type === 'minor') {
       return `${major}.${minor + 1}.0`; // 1.2.3 → 1.3.0
     } else if (type === 'patch') {
       return `${major}.${minor}.${patch + 1}`; // 1.2.3 → 1.2.4
     }
   }
   ```

   Show user:
   ```
   Current version: 1.2.3
   New version: 1.3.0 (minor)
   ```

   Ask: "Confirm version bump? (yes/no/custom)"
   - yes: Continue
   - no: Abort
   - custom: Ask for specific version

5. **Generate changelog**:

   a. **Fetch merged PRs** since last release:
      ```bash
      gh pr list --state merged --limit 50 --json number,title,labels,mergedAt,author
      ```

   b. **Fetch closed issues** since last release:
      ```bash
      gh issue list --state closed --limit 50 --json number,title,labels,closedAt
      ```

   c. **Categorize changes**:

      ```typescript
      function categorizeChange(labels: string[]): string {
        if (labels.includes('breaking-change')) return 'breaking';
        if (labels.includes('feature')) return 'features';
        if (labels.includes('bug')) return 'fixes';
        if (labels.includes('performance')) return 'performance';
        if (labels.includes('security')) return 'security';
        if (labels.includes('documentation')) return 'docs';
        return 'other';
      }
      ```

   d. **Generate changelog content**:

      ```markdown
      ## [1.3.0] - 2025-10-04

      ### 💥 Breaking Changes
      - Database schema update requires migration (#123) @contributor
        - **Action Required**: Run `npm run migrate:latest`

      ### 🚀 Features
      - Add dark mode theme support (#42) @contributor
      - Implement offline sync for learning paths (#55) @contributor
      - New task type: fill-in-table (#67) @contributor

      ### 🐛 Bug Fixes
      - Fix memory leak in session storage (#50) @contributor
      - Correct spaced repetition interval calculation (#58) @contributor
      - Resolve PWA install prompt issue on iOS (#72) @contributor

      ### ⚡ Performance
      - Reduce initial bundle size by 15% (#60) @contributor
      - Optimize IndexedDB queries (#65) @contributor

      ### 🔒 Security
      - Fix XSS vulnerability in task renderer (#70) @contributor
      - Update dependencies with security patches (#75) @contributor

      ### 📚 Documentation
      - Add learning path creation guide (#80) @contributor
      - Update agent documentation (#85) @contributor

      ### 🔧 Other Changes
      - Refactor service worker configuration (#90) @contributor
      - Update CI/CD pipeline (#95) @contributor

      **Full Changelog**: https://github.com/user/repo/compare/v1.2.3...v1.3.0
      ```

   e. Show changelog to user

   f. Ask: "Approve changelog? (yes/no/edit)"
      - yes: Continue
      - no: Abort
      - edit: Let user modify specific sections

6. **Update CHANGELOG.md**:

   a. Read existing `CHANGELOG.md`

   b. Insert new version section at top (after header)

   c. Show diff to user

   d. Ask: "Update CHANGELOG.md? (yes/no)"

7. **Update package.json version**:

   ```bash
   npm version <new-version> --no-git-tag-version
   ```

   This updates:
   - `package.json`
   - `package-lock.json`

8. **Commit version bump**:

   ```bash
   git add package.json package-lock.json CHANGELOG.md
   git commit -m "chore: release v1.3.0"
   ```

9. **Create git tag**:

   ```bash
   git tag -a v1.3.0 -m "Release v1.3.0"
   ```

10. **Push to remote**:

    Ask: "Push release to GitHub? (yes/no)"

    If yes:
    ```bash
    git push origin main
    git push origin v1.3.0
    ```

11. **Create GitHub release**:

    ```bash
    gh release create v1.3.0 \
      --title "v1.3.0" \
      --notes "$(cat <<'EOF'
    [Paste generated changelog here]
    EOF
    )"
    ```

    Options to add:
    - `--draft`: Create as draft (user can publish later)
    - `--prerelease`: Mark as pre-release (beta, rc, etc.)

12. **Deploy to production** (optional):

    Ask: "Deploy to production now? (yes/no/later)"

    If yes:
    - Run: `/deploy` command
    - Monitor deployment status
    - Verify production health

    If later:
    - Remind: "Run `/deploy` when ready"

13. **Post-release verification**:

    a. **Verify tag exists**:
       ```bash
       git tag -l v1.3.0
       ```

    b. **Verify GitHub release**:
       ```bash
       gh release view v1.3.0
       ```

    c. **Check npm scripts** (if applicable):
       ```bash
       npm run version-check
       ```

14. **Notify stakeholders** (optional):

    Ask: "Post release announcement? (yes/no/where)"

    Options:
    - GitHub Discussions
    - Slack/Discord webhook
    - Email notification
    - Social media

    Example announcement:
    ```markdown
    🎉 **v1.3.0 Released!**

    We're excited to announce version 1.3.0 of Learning Platform!

    **Highlights**:
    - 🌙 Dark mode theme support
    - 📱 Offline sync for learning paths
    - 📊 New task type: fill-in-table
    - ⚡ 15% smaller bundle size

    [Full changelog](https://github.com/user/repo/releases/tag/v1.3.0)

    Upgrade: `npm install`
    ```

15. **Post-release summary**:

    ```markdown
    ✅ Release v1.3.0 Complete!

    **Actions Taken**:
    - [x] Version bumped: 1.2.3 → 1.3.0
    - [x] CHANGELOG.md updated
    - [x] Git tag created: v1.3.0
    - [x] Pushed to GitHub
    - [x] GitHub release published
    - [x] Production deployed (if selected)

    **Release Details**:
    - Type: minor
    - Date: 2025-10-04
    - PRs included: 15
    - Issues closed: 8
    - Breaking changes: 1

    **Next Steps**:
    - Monitor production for issues
    - Watch GitHub release for feedback
    - Plan next release cycle
    ```

16. **Create next milestone** (optional):

    Ask: "Create milestone for next version? (yes/no)"

    If yes:
    ```bash
    gh milestone create "v1.4.0" --description "Next minor release"
    ```

Behavior rules:
- NEVER release with failing tests
- NEVER release with uncommitted changes
- ALWAYS run full validation suite
- ALWAYS generate complete changelog
- ASK before pushing to remote
- VERIFY tag creation
- ENSURE semantic versioning rules
- DOCUMENT breaking changes prominently
- NOTIFY stakeholders appropriately

Version type decision guide:
**MAJOR** (X.0.0):
- Breaking API changes
- Database schema changes requiring migration
- Removed features or endpoints
- Incompatible with previous versions
- Example: "Breaking: Remove deprecated task types"

**MINOR** (x.X.0):
- New features (backward compatible)
- New task types
- Enhanced functionality
- New API endpoints
- Example: "Add dark mode support"

**PATCH** (x.x.X):
- Bug fixes only
- Security patches
- Performance improvements (no API changes)
- Documentation updates
- Example: "Fix memory leak in session storage"

Pre-release versions:
- Alpha: `1.3.0-alpha.1` (internal testing)
- Beta: `1.3.0-beta.1` (public testing)
- RC: `1.3.0-rc.1` (release candidate)

Changelog best practices:
- Start with breaking changes (most important)
- Group by category (features, fixes, etc.)
- Include PR/issue numbers
- Credit contributors with @mentions
- Provide migration guides for breaking changes
- Link to full diff on GitHub
- Use emoji for visual scanning
- Keep entries concise (1-2 lines)

Git tag format:
- Always prefix with `v`: `v1.3.0`
- Never use just numbers: `1.3.0` ❌
- Annotated tags only (with message)
- Message format: "Release v1.3.0"

Rollback procedure:
If release has critical issues:
1. Delete tag: `git tag -d v1.3.0 && git push origin :refs/tags/v1.3.0`
2. Delete GitHub release: `gh release delete v1.3.0`
3. Revert commit: `git revert HEAD`
4. Fix issue
5. Create new patch release: v1.3.1

Safety checks:
- ❌ NEVER force push to main
- ❌ NEVER delete tags without backup
- ❌ NEVER skip changelog
- ❌ NEVER release without testing
- ✅ ALWAYS verify production after deployment
- ✅ ALWAYS have rollback plan ready
- ✅ ALWAYS communicate breaking changes

Context: $ARGUMENTS
