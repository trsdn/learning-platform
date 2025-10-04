---
description: Run comprehensive validation tests on an implementation including unit tests, integration tests, E2E tests, and quality checks. Arguments: [issue-number] (optional)
agent: implementation-tester
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Perform thorough validation of an implementation against its plan and acceptance criteria, generating detailed test report.

**Primary Agent**: implementation-tester

Execution steps:

1. **Parse issue number** from `$ARGUMENTS`:
   - If issue number provided: Use it to find plan file
   - If empty: Ask user for issue number or plan file path

2. **Load implementation artifacts**:

   a. **Find plan file**:
      ```bash
      ls PLAN-ISSUE-*.md
      ```
      Look for: `PLAN-ISSUE-{number}.md`

   b. **Read plan** to understand:
      - Files that should be created/modified
      - Acceptance criteria
      - Test requirements
      - Implementation approach

   c. **Find test report** (if exists):
      ```bash
      ls TEST-REPORT-ISSUE-*.md
      ```
      Check if this is a re-test

3. **Phase 1: Unit Tests Validation** 🧪

   a. **Run unit tests**:
      ```bash
      npm test
      ```

   b. **Capture results**:
      - Total tests
      - Passed tests
      - Failed tests
      - Skipped tests
      - Execution time

   c. **Run coverage report**:
      ```bash
      npm run test:coverage
      ```

   d. **Analyze coverage**:
      - Line coverage %
      - Branch coverage %
      - Function coverage %
      - Statement coverage %
      - Files with <80% coverage

   e. **Test quality assessment**:
      Read test files to check:
      - [ ] Tests actually test behavior (not just mocks)
      - [ ] Edge cases covered
      - [ ] Error cases tested
      - [ ] Meaningful assertions
      - [ ] Proper test organization (describe/it blocks)
      - [ ] No skipped tests without reason

4. **Phase 2: Integration Tests Validation** 🔗

   a. **Run integration tests** (if exist):
      ```bash
      npm run test:integration
      ```

   b. **Check cross-module interactions**:
      - API endpoints working
      - Database operations correct
      - Service layer integration
      - Storage adapters functioning

   c. **Verify data flow**:
      - Input validation
      - Data transformation
      - Output formatting
      - Error handling

5. **Phase 3: E2E Tests Validation** 🎯

   a. **Run E2E tests** (if exist):
      ```bash
      npm run test:e2e
      ```

   b. **Check user workflows**:
      - Complete user journeys work
      - UI interactions functional
      - Navigation correct
      - Forms submit properly
      - Error messages display

   c. **Browser compatibility** (if applicable):
      - Chrome/Edge
      - Firefox
      - Safari

6. **Phase 4: Code Quality Checks** 💎

   a. **TypeScript validation**:
      ```bash
      npx tsc --noEmit
      ```
      - Zero TypeScript errors required

   b. **ESLint validation**:
      ```bash
      npx eslint src/
      ```
      - Zero linting errors
      - Document warnings (if any)

   c. **Build validation**:
      ```bash
      npm run build
      ```
      - Build must succeed
      - Check bundle size
      - Verify no build warnings

   d. **Code review** (automated):
      Use Grep/Read to check:
      - [ ] No console.log statements
      - [ ] No commented-out code
      - [ ] No TODO without issue reference
      - [ ] Proper error handling (try-catch)
      - [ ] No hard-coded values
      - [ ] Consistent naming conventions

7. **Phase 5: Plan Alignment Validation** ✅

   Compare implementation against plan:

   a. **Files created/modified**:
      ```bash
      git diff --name-only main
      ```
      - [ ] All planned files touched
      - [ ] No unplanned files modified (without reason)

   b. **Acceptance criteria**:
      For each criterion in plan:
      - [ ] Manually verify or identify test that proves it
      - [ ] Mark as ✅ Pass or ❌ Fail with reason

   c. **Implementation completeness**:
      - [ ] All features implemented
      - [ ] All edge cases handled
      - [ ] All error cases handled
      - [ ] Documentation updated (if required)

8. **Phase 6: Performance Validation** ⚡

   a. **Bundle size check**:
      ```bash
      npm run build
      ls -lh dist/
      ```
      - Check if bundle size increased significantly
      - Warn if >10% increase

   b. **Load time check** (if web app):
      - Initial load time
      - Time to interactive
      - First contentful paint

   c. **Memory usage** (if applicable):
      - Check for memory leaks
      - Monitor heap usage

9. **Phase 7: Security Validation** 🔒

   a. **Dependency check**:
      ```bash
      npm audit
      ```
      - Zero high/critical vulnerabilities

   b. **Security patterns**:
      Check for:
      - [ ] No eval() usage
      - [ ] No innerHTML with user input
      - [ ] Proper input sanitization
      - [ ] No secrets in code
      - [ ] HTTPS only (if network calls)

10. **Phase 8: Accessibility Validation** ♿

    Check for:
    - [ ] Semantic HTML
    - [ ] ARIA labels where needed
    - [ ] Keyboard navigation
    - [ ] Focus management
    - [ ] Color contrast (if UI changes)

11. **Generate validation report**:

    Use this template:
    ```markdown
    # 🧪 Implementation Test Report: Issue #X

    **Validator**: implementation-tester
    **Date**: [timestamp]
    **Issue**: #[number]
    **Plan File**: PLAN-ISSUE-[number].md

    ## Overall Status
    **Validation**: ✅ PASS | ❌ FAIL | ⚠️ CONDITIONAL PASS
    **Recommendation**: MERGE | REQUEST CHANGES | REJECT

    ---

    ## Test Results Summary

    ### Unit Tests 🧪
    - **Status**: ✅ PASS
    - **Tests Run**: 145
    - **Passed**: 145
    - **Failed**: 0
    - **Coverage**: 87.3%
      - Lines: 88.1%
      - Branches: 85.2%
      - Functions: 89.4%
    - **Execution Time**: 12.3s

    **Issues**:
    - ⚠️ File `src/utils/helpers.ts` has 72% coverage (below 80% threshold)

    ### Integration Tests 🔗
    - **Status**: ✅ PASS
    - **Tests Run**: 23
    - **All Passed**: Yes

    ### E2E Tests 🎯
    - **Status**: ✅ PASS
    - **Tests Run**: 8
    - **All Passed**: Yes

    ### Code Quality 💎
    - **TypeScript**: ✅ Zero errors
    - **ESLint**: ✅ Zero errors (2 warnings)
    - **Build**: ✅ Success
    - **Bundle Size**: 245 KB (+8 KB from previous)

    ---

    ## Plan Alignment ✅

    ### Files Created/Modified
    ✅ All planned files touched:
    - `src/modules/core/services/new-feature.ts` (created)
    - `src/modules/ui/components/new-component.tsx` (created)
    - `tests/unit/new-feature.test.ts` (created)
    - `tests/e2e/new-workflow.spec.ts` (created)

    ⚠️ Additional files modified:
    - `src/modules/storage/db.ts` (minor refactor - justified)

    ### Acceptance Criteria
    ✅ **AC1**: User can perform [action]
       - Verified by: `tests/e2e/new-workflow.spec.ts:15`

    ✅ **AC2**: System validates [input]
       - Verified by: `tests/unit/new-feature.test.ts:45`

    ✅ **AC3**: Error handling for [scenario]
       - Verified by: `tests/unit/new-feature.test.ts:78`

    ---

    ## Detailed Findings

    ### ✅ Strengths
    1. **Comprehensive test coverage**: All critical paths tested
    2. **Excellent error handling**: Graceful degradation implemented
    3. **Clear code structure**: Well-organized and readable
    4. **Good TypeScript usage**: Strong typing throughout

    ### 🔴 Critical Issues
    *None found* ✅

    ### 🟡 High Priority Issues
    1. **Insufficient coverage in helpers.ts**
       - **Location**: `src/utils/helpers.ts`
       - **Current Coverage**: 72%
       - **Required**: 80%
       - **Fix**: Add tests for edge cases in `parseInput()` and `formatOutput()`
       - **Impact**: May hide bugs in utility functions

    ### 🔵 Medium Priority Issues
    1. **ESLint warnings**
       - **Location**: `src/modules/ui/components/new-component.tsx:42`
       - **Warning**: `useEffect` dependency array incomplete
       - **Fix**: Add missing dependency or explain exemption

    ### ⚪ Low Priority / Enhancements
    1. **Bundle size increase**
       - Increased by 8 KB (3.4%)
       - Acceptable but monitor trend

    ---

    ## Performance Analysis ⚡

    **Bundle Size**:
    - Before: 237 KB
    - After: 245 KB
    - Change: +8 KB (+3.4%)
    - **Status**: ✅ Acceptable

    **Load Time** (tested locally):
    - Initial: ~1.2s
    - Interactive: ~1.8s
    - **Status**: ✅ Within targets

    ---

    ## Security Analysis 🔒

    **Dependency Audit**:
    - High vulnerabilities: 0
    - Moderate vulnerabilities: 0
    - **Status**: ✅ PASS

    **Code Security**:
    - ✅ No eval() usage
    - ✅ No innerHTML with user input
    - ✅ Input properly sanitized
    - ✅ No secrets in code

    ---

    ## Accessibility Analysis ♿

    **WCAG 2.1 Compliance**:
    - ✅ Semantic HTML used
    - ✅ ARIA labels present
    - ✅ Keyboard navigation works
    - ⚠️ Focus management could be improved

    ---

    ## Recommendations

    ### For Merge ✅
    **Conditional approval**: Fix high-priority issues first

    **Required before merge**:
    1. Increase test coverage in `helpers.ts` to ≥80%
    2. Fix ESLint warning in `new-component.tsx`

    **Optional improvements** (can be separate issue):
    1. Enhance focus management
    2. Add performance benchmarks

    ### For Implementer
    If you are the **issue-implementer**, here's what to do:

    1. **Add tests** to `tests/unit/helpers.test.ts`:
       ```typescript
       describe('parseInput edge cases', () => {
         it('should handle null input', () => { ... });
         it('should handle malformed data', () => { ... });
       });
       ```

    2. **Fix useEffect** in `new-component.tsx:42`:
       ```typescript
       // Add missing dependency
       useEffect(() => {
         // ...
       }, [dependency1, dependency2]); // ← Add dependency2
       ```

    3. **Re-run validation**:
       ```bash
       npm test
       npm run test:coverage
       ```

    ---

    ## Next Steps

    **If PASS**:
    1. Launch code-reviewer for final review
    2. Create PR for merge
    3. Close issue after merge

    **If CONDITIONAL PASS** (current status):
    1. Fix high-priority issues listed above
    2. Re-run `/validate-implementation [issue-number]`
    3. Once validated, proceed to code review

    **If FAIL**:
    1. Review critical issues
    2. Major rework needed
    3. Consider re-planning

    ---

    **Generated by**: implementation-tester agent
    **Report saved to**: TEST-REPORT-ISSUE-[number].md
    ```

12. **Save test report**:

    Create file: `TEST-REPORT-ISSUE-{number}.md`
    - Save in project root
    - Automatically done (don't ask)

13. **Determine overall status**:

    Logic:
    ```typescript
    function determineStatus(results): string {
      if (results.criticalIssues > 0) return 'FAIL';
      if (results.unitTestsFailed > 0) return 'FAIL';
      if (results.buildFailed) return 'FAIL';
      if (results.typescriptErrors > 0) return 'FAIL';
      if (results.highPriorityIssues > 0) return 'CONDITIONAL PASS';
      return 'PASS';
    }
    ```

14. **Post report to GitHub** (optional):

    Ask: "Post test report to GitHub issue? (yes/no)"

    If yes:
    ```bash
    gh issue comment [number] -F TEST-REPORT-ISSUE-[number].md
    ```

15. **Notify next agent**:

    Based on status:
    - **PASS**: "Ready for code-reviewer"
    - **CONDITIONAL PASS**: "Needs issue-implementer to fix X issues"
    - **FAIL**: "Needs issue-implementer for major rework"

Behavior rules:
- NEVER pass implementation with failing tests
- ALWAYS run full test suite (not just changed files)
- DOCUMENT all issues with severity levels
- PROVIDE specific line numbers and files
- SUGGEST exact fixes for issues
- VERIFY acceptance criteria explicitly
- REPORT bundle size changes
- CHECK for security vulnerabilities
- BE OBJECTIVE (no personal preferences)
- PROVIDE actionable feedback only

Severity classification:
**🔴 Critical** (must fix before merge):
- Failing tests
- TypeScript errors
- Build failures
- Security vulnerabilities
- Missing acceptance criteria
- Incorrect behavior

**🟡 High Priority** (should fix before merge):
- Coverage below threshold
- ESLint errors
- Significant bundle size increase
- Missing error handling
- Accessibility issues
- Performance degradation

**🔵 Medium Priority** (can fix in follow-up):
- ESLint warnings
- Minor bundle size increase
- Code style inconsistencies
- Missing edge case tests
- Documentation gaps

**⚪ Low Priority** (nice to have):
- Code organization suggestions
- Performance micro-optimizations
- Additional test cases
- Code comments

Test quality criteria:
**Good tests**:
- Test behavior, not implementation
- Have meaningful assertions
- Cover edge cases
- Test error conditions
- Are independent (no order dependency)
- Have clear descriptions

**Bad tests**:
- Only mock everything (no real testing)
- Have no assertions
- Test internal implementation details
- Depend on other test execution order
- Have vague descriptions like "it works"

Coverage thresholds:
- Line coverage: ≥80%
- Branch coverage: ≥75%
- Function coverage: ≥80%
- Statement coverage: ≥80%

If below threshold:
- Identify uncovered lines
- Suggest specific tests to add
- Explain why coverage matters

Bundle size thresholds:
- +0-5%: ✅ Acceptable
- +5-10%: ⚠️ Monitor
- +10-20%: 🟡 High priority to optimize
- +20%+: 🔴 Critical - must optimize

Security checks:
- `npm audit`: Zero high/critical
- No `eval()` or `Function()` constructor
- No `dangerouslySetInnerHTML` without sanitization
- No secrets in code (API keys, passwords)
- Input validation on all user inputs
- Proper error messages (no stack traces to user)

Output format:
- Markdown with clear sections
- Status icons (✅❌⚠️)
- Severity levels (🔴🟡🔵⚪)
- Code examples for fixes
- Specific file/line references
- Actionable recommendations

Context: $ARGUMENTS
