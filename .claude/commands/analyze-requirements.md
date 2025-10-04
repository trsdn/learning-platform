---
description: Analyze a GitHub issue and enhance it with user stories, acceptance criteria, and detailed requirements from a user perspective. Arguments: [issue-number]
agent: business-analyst
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Transform a technical GitHub issue into a comprehensive requirements document with user stories, acceptance criteria, and testable specifications.

**Primary Agent**: business-analyst

Execution steps:

1. **Parse issue number** from `$ARGUMENTS`:
   - If issue number provided: Use it
   - If empty: Ask user for issue number

2. **Fetch issue details**:
   ```bash
   gh issue view [number] --json number,title,body,labels,assignees,comments
   ```

3. **Analyze existing content**:

   a. **Extract current information**:
      - Issue title
      - Description/body
      - Existing labels
      - Current assignees
      - Comments (may contain clarifications)

   b. **Identify gaps**:
      - [ ] User perspective missing
      - [ ] No acceptance criteria
      - [ ] Unclear requirements
      - [ ] Missing edge cases
      - [ ] No success metrics
      - [ ] Vague technical details

4. **Generate user stories**:

   For each feature/requirement in the issue, create:

   ```markdown
   ## User Stories

   ### Story 1: [Descriptive Title]
   **As a** [type of user]
   **I want** [goal/desire]
   **So that** [benefit/value]

   **Priority**: High | Medium | Low
   **Story Points**: 1, 2, 3, 5, 8, 13 (Fibonacci)

   **User Value**: [Why this matters to users]
   **Business Value**: [Why this matters to business]
   ```

   Example for learning platform:
   ```markdown
   ### Story 1: Review Previously Learned Content
   **As a** language learner
   **I want** to see my past learning sessions and review tasks I got wrong
   **So that** I can reinforce weak areas and improve retention

   **Priority**: High
   **Story Points**: 5

   **User Value**: Helps users focus on knowledge gaps
   **Business Value**: Increases engagement and learning outcomes
   ```

5. **Define acceptance criteria**:

   For each user story, create testable criteria:

   ```markdown
   **Acceptance Criteria**:
   - [ ] **Given** [context/pre-condition]
         **When** [action/event]
         **Then** [expected outcome]

   - [ ] **Given** [edge case context]
         **When** [edge case action]
         **Then** [edge case outcome]

   - [ ] **Given** [error context]
         **When** [error trigger]
         **Then** [error handling behavior]
   ```

   Example:
   ```markdown
   **Acceptance Criteria**:
   - [ ] **Given** I am on the dashboard
         **When** I click "Review Mistakes"
         **Then** I see a list of all tasks I answered incorrectly in past 30 days

   - [ ] **Given** I have no incorrect answers in past 30 days
         **When** I click "Review Mistakes"
         **Then** I see a message "No mistakes to review! Great job! 🎉"

   - [ ] **Given** I am viewing my mistakes
         **When** I click on a specific task
         **Then** I see the task, my wrong answer, the correct answer, and an explanation

   - [ ] **Given** the database is empty
         **When** I try to load review page
         **Then** I see loading state, then "No data available" message
   ```

6. **Add functional requirements**:

   ```markdown
   ## Functional Requirements

   ### FR1: Data Display
   - System MUST display all tasks answered incorrectly in past 30 days
   - System MUST show: question, user's answer, correct answer, date attempted
   - System MUST sort by most recent first
   - System MUST paginate if >20 items

   ### FR2: Filtering
   - User SHOULD be able to filter by:
     - Topic (Mathematik, Spanisch, etc.)
     - Difficulty (easy, medium, hard)
     - Date range
   - Filters SHOULD persist across sessions

   ### FR3: Re-attempt
   - User MUST be able to re-attempt a task directly
   - System MUST track re-attempt separately from original
   - System SHOULD update spaced repetition schedule
   ```

7. **Add non-functional requirements**:

   ```markdown
   ## Non-Functional Requirements

   ### Performance
   - **NFR1**: Page MUST load in <2 seconds with 1000 tasks
   - **NFR2**: Filter operations MUST complete in <500ms
   - **NFR3**: Database queries MUST use indexes

   ### Accessibility
   - **NFR4**: Page MUST be keyboard navigable
   - **NFR5**: Screen reader compatible (ARIA labels)
   - **NFR6**: Color contrast ≥ 4.5:1 (WCAG AA)

   ### Security
   - **NFR7**: User can only see their own data
   - **NFR8**: No sensitive data in URL parameters
   - **NFR9**: Rate limiting on API calls

   ### Usability
   - **NFR10**: Clear empty state messages
   - **NFR11**: Loading states for all async operations
   - **NFR12**: Error messages are user-friendly

   ### Compatibility
   - **NFR13**: Works on Chrome, Firefox, Safari (latest 2 versions)
   - **NFR14**: Responsive design (mobile, tablet, desktop)
   - **NFR15**: Works offline (PWA)
   ```

8. **Define edge cases and error handling**:

   ```markdown
   ## Edge Cases & Error Handling

   ### Edge Cases
   1. **No data scenario**: User has never answered anything wrong
      - Show: Positive encouragement message
      - Action: Suggest trying new learning paths

   2. **Large dataset**: User has >1000 mistakes
      - Implement: Virtual scrolling or pagination
      - Performance: Must remain <2s load time

   3. **Concurrent attempts**: User attempts same task multiple times
      - Track: All attempts separately
      - Display: Most recent attempt first

   ### Error Scenarios
   1. **Database unavailable**:
      - Fallback: Show cached data (if available)
      - Message: "Unable to load latest data. Showing offline data."

   2. **Network timeout**:
      - Retry: 3 attempts with exponential backoff
      - Message: "Connection slow. Retrying..."

   3. **Corrupted data**:
      - Skip: Invalid entries
      - Log: Error to console
      - Message: "Some data could not be loaded"
   ```

9. **Add success metrics**:

   ```markdown
   ## Success Metrics

   ### User Engagement
   - 📊 **Metric**: % of users who use review feature weekly
   - 🎯 **Target**: ≥40% of active users
   - 📈 **Measurement**: Analytics event tracking

   ### Learning Outcomes
   - 📊 **Metric**: Improvement rate on re-attempted tasks
   - 🎯 **Target**: ≥70% correct on second attempt
   - 📈 **Measurement**: Database query (correct re-attempts / total re-attempts)

   ### Performance
   - 📊 **Metric**: Page load time (P95)
   - 🎯 **Target**: <2 seconds
   - 📈 **Measurement**: Browser Performance API

   ### User Satisfaction
   - 📊 **Metric**: User rating for feature
   - 🎯 **Target**: ≥4.0/5.0
   - 📈 **Measurement**: In-app feedback survey
   ```

10. **Define out-of-scope**:

    ```markdown
    ## Out of Scope (for this issue)

    The following are explicitly NOT included in this issue:
    - ❌ Exporting mistakes to PDF
    - ❌ Sharing mistakes with teacher/tutor
    - ❌ AI-powered mistake analysis
    - ❌ Gamification (badges for improvement)

    **Rationale**: Keep initial implementation focused. These can be separate issues.
    ```

11. **Create wireframes/mockups description**:

    ```markdown
    ## UI/UX Considerations

    ### Layout
    ```
    Dashboard
    ├── Navigation
    ├── "Review Mistakes" button (prominent)
    └── Stats card: "X tasks need review"

    Review Page
    ├── Header: "Your Mistakes Review"
    ├── Filters: [Topic] [Difficulty] [Date Range]
    ├── Stats: "X tasks | Y% improvement"
    ├── Task List (cards)
    │   ├── Task card
    │   │   ├── Question preview
    │   │   ├── Your answer (red)
    │   │   ├── Correct answer (green)
    │   │   ├── Date attempted
    │   │   └── "Try Again" button
    └── Pagination
    ```

    ### Visual Design Notes
    - Use red (#fca5a5) for incorrect answers
    - Use green (#86efac) for correct answers
    - Cards have subtle shadow for depth
    - "Try Again" button is primary color
    - Empty state has encouraging illustration
    ```

12. **Identify dependencies**:

    ```markdown
    ## Dependencies

    ### Upstream Dependencies (must exist first)
    - ✅ Task attempt tracking (already implemented)
    - ✅ User authentication (already implemented)
    - ⏳ Learning session history (#45) - IN PROGRESS

    ### Downstream Impact (will be affected)
    - Dashboard statistics (needs update to show mistake count)
    - Spaced repetition algorithm (re-attempts affect schedule)

    ### Technical Dependencies
    - IndexedDB query capabilities (filtering)
    - React Router (new route)
    - Component library (cards, filters)
    ```

13. **Estimate complexity**:

    ```markdown
    ## Complexity Estimation

    **Story Points**: 8 (Fibonacci scale)

    **Reasoning**:
    - Database queries: Medium (2 points)
    - UI components: Medium (3 points)
    - Filtering logic: Small (1 point)
    - Testing: Medium (2 points)

    **Estimated Time**: 3-5 days

    **Breakdown**:
    - Day 1: Database queries + API
    - Day 2: UI components
    - Day 3: Filtering + sorting
    - Day 4: Testing + edge cases
    - Day 5: Polish + documentation
    ```

14. **Generate enhanced issue content**:

    Compile all sections into comprehensive issue update:

    ```markdown
    # [Original Title]

    [Original description preserved]

    ---
    **Enhanced by**: business-analyst | **Date**: 2025-10-04

    [User Stories section]
    [Acceptance Criteria section]
    [Functional Requirements section]
    [Non-Functional Requirements section]
    [Edge Cases section]
    [Success Metrics section]
    [Out of Scope section]
    [UI/UX Considerations section]
    [Dependencies section]
    [Complexity Estimation section]

    ---

    ## Implementation Checklist

    - [ ] Review requirements with stakeholders
    - [ ] Create implementation plan (/plan command)
    - [ ] Implement with TDD (issue-implementer)
    - [ ] Validate implementation (implementation-tester)
    - [ ] Code review (code-reviewer)
    - [ ] Deploy to test environment (/deploy-test)
    - [ ] User acceptance testing
    - [ ] Deploy to production (/deploy)
    ```

15. **Update GitHub issue**:

    Ask: "Update GitHub issue with enhanced requirements? (yes/no/preview)"

    If yes:
    ```bash
    gh issue edit [number] --body "$(cat <<'EOF'
    [Enhanced content here]
    EOF
    )"
    ```

    If preview:
    - Show user the full enhanced content
    - Ask again: "Proceed with update? (yes/no)"

16. **Add appropriate labels**:

    Suggest labels based on analysis:
    ```bash
    gh issue edit [number] --add-label "user-story,ready-for-planning,story-points:8"
    ```

    Common label suggestions:
    - `user-story`: Issue has user stories
    - `ready-for-planning`: Ready for implementation planning
    - `story-points:X`: Complexity estimate
    - `needs-design`: If UI/UX work needed
    - `needs-research`: If unknowns exist
    - `breaking-change`: If non-backward compatible

17. **Notify stakeholders**:

    Ask: "Tag stakeholders for review? (yes/no/who)"

    If yes:
    ```bash
    gh issue comment [number] -b "@product-owner @designer Requirements analysis complete. Ready for review."
    ```

18. **Generate summary**:

    ```markdown
    ✅ Requirements Analysis Complete!

    **Issue**: #[number]
    **Title**: [title]

    **Added**:
    - ✅ [X] user stories
    - ✅ [Y] acceptance criteria
    - ✅ [Z] functional requirements
    - ✅ [W] non-functional requirements
    - ✅ Edge cases and error handling
    - ✅ Success metrics
    - ✅ Complexity estimation

    **Estimates**:
    - Story Points: 8
    - Estimated Time: 3-5 days
    - Priority: High

    **Next Steps**:
    1. Stakeholder review
    2. Run `/plan` to create implementation plan
    3. Assign to developer
    ```

Behavior rules:
- ALWAYS write from user perspective (not developer)
- USE "As a user..." format for stories
- MAKE acceptance criteria testable
- INCLUDE edge cases and error scenarios
- DEFINE success metrics
- ESTIMATE complexity (story points)
- PRESERVE original issue content
- ASK clarifying questions if issue vague
- SUGGEST appropriate labels
- THINK about non-functional requirements
- CONSIDER accessibility always
- DOCUMENT out-of-scope explicitly

Story point scale (Fibonacci):
- **1 point**: Trivial (few hours)
- **2 points**: Small (1 day)
- **3 points**: Medium (2-3 days)
- **5 points**: Large (1 week)
- **8 points**: Very large (2 weeks)
- **13 points**: Huge (should be split)
- **21+ points**: Epic (must be split)

User story quality checklist:
- [ ] Follows "As a [user], I want [goal], so that [benefit]" format
- [ ] Describes user value, not technical implementation
- [ ] Is independent (can be developed standalone)
- [ ] Is negotiable (details can be discussed)
- [ ] Is valuable (provides user/business value)
- [ ] Is estimable (team can estimate effort)
- [ ] Is small (fits in one iteration)
- [ ] Is testable (acceptance criteria exist)

Acceptance criteria best practices:
- Use Given-When-Then format
- Make them testable (not subjective)
- Cover happy path + edge cases + errors
- Be specific (no "should work well")
- Include expected error messages
- Define data validation rules
- Specify UI states (loading, error, empty)

Non-functional requirements categories:
- **Performance**: Speed, scalability, resource usage
- **Security**: Authentication, authorization, data protection
- **Usability**: User experience, accessibility, learnability
- **Reliability**: Uptime, error rate, data integrity
- **Compatibility**: Browsers, devices, screen sizes
- **Maintainability**: Code quality, documentation, testability

Red flags to catch:
- Issue is just "Add feature X" (no why or who)
- No acceptance criteria
- Vague requirements ("make it better")
- No edge cases considered
- No error handling defined
- No success metrics
- Implementation details instead of requirements
- No user value articulated

Output format:
- Markdown with clear sections
- Checklists for testability
- Story points and estimates
- Priority levels
- Labels suggestions
- Stakeholder mentions

Context: $ARGUMENTS
