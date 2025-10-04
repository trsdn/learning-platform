---
description: Review a learning path for pedagogical effectiveness and provide detailed feedback. Arguments: [filepath] or [topic-id/learning-path-id]
agent: learning-design-expert
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Conduct comprehensive pedagogical review of a learning path and provide evidence-based feedback for improvement.

**Primary Agent**: learning-design-expert (but can be invoked by other agents)

Execution steps:

1. **Parse input** from `$ARGUMENTS`:
   - If filepath provided: Use directly (e.g., `public/learning-paths/mathematik/algebra-basics.json`)
   - If topic-id/learning-path-id: Construct path
   - If empty: Ask user which learning path to review

2. **Load and analyze learning path**:
   a. Read JSON file
   b. Parse structure:
      - Learning path metadata
      - All tasks
      - Task types distribution
      - Difficulty levels
      - Estimated times

3. **Educational effectiveness analysis**:

   a. **Task Type Distribution**:
      - Count each task type
      - Calculate percentages
      - Compare to optimal distribution:
        * 40% Recognition/Recall
        * 30% Application/Analysis
        * 20% Quick checks
        * 10% Advanced/Varied
      - Identify imbalances

   b. **Difficulty Progression**:
      - Analyze difficulty sequence
      - Check for smooth progression
      - Identify jumps or flat sections
      - Validate against position:
        * Tasks 1-5: Mostly easy
        * Tasks 6-10: Easy to medium
        * Tasks 11+: Medium to hard

   c. **Cognitive Load Assessment**:
      - Intrinsic load (concept complexity)
      - Extraneous load (UI/question clarity)
      - Germane load (learning depth)
      - Flag high-load tasks for beginners

   d. **Spaced Repetition Compatibility**:
      - Atomic tasks (one concept each)
      - Clear correct answers
      - Suitable for isolated practice
      - Tag suggestions for grouping

   e. **Content Quality**:
      - Question clarity
      - Explanation value
      - Hint effectiveness
      - Distractor quality (for multiple choice)
      - Alternative answers (for text input)

4. **Bloom's Taxonomy Alignment**:

   Map each task to Bloom's level:
   - Remember: Flashcards, simple multiple choice
   - Understand: Cloze, matching basics
   - Apply: Text input, complex matching
   - Analyze: Ordering, multiple select
   - Evaluate: Complex scenarios
   - Create: (not yet supported)

   Verify progression through taxonomy levels

5. **Learning Science Compliance**:

   Check against principles:
   - ✅ Testing Effect: Active recall present
   - ✅ Spacing Effect: Suitable for spaced practice
   - ✅ Interleaving: Mix of concepts (if applicable)
   - ✅ Elaboration: Explanations deepen understanding
   - ✅ Dual Coding: Text + visuals (note if missing)
   - ✅ Retrieval Practice: Production tasks included

6. **Generate feedback report**:

   Use this template structure:
   ```markdown
   # 📊 Learning Design Review: [Learning Path Title]

   **Reviewer**: learning-design-expert
   **Date**: [timestamp]
   **Learning Path**: [topic]/[id]
   **Total Tasks**: [count]

   ## Overall Assessment
   **Educational Effectiveness**: ⭐⭐⭐⭐☆ (X/5)
   **Pedagogical Soundness**: [Excellent/Good/Needs Work]
   **Recommended for**: [Beginner/Intermediate/Advanced]

   ## Task Type Analysis
   **Current Distribution**:
   - [task-type]: X% (Y tasks)

   **Recommendation**: [Analysis vs. optimal]
   **Reasoning**: [Learning science rationale]

   ## Difficulty Progression
   **Assessment**: [Graph/description]
   **Issues**: [Any problems]
   **Recommendation**: [Specific fixes]

   ## Strengths 💪
   1. [Specific strength + why it's good]

   ## Critical Issues 🔴
   [Must-fix problems]

   ## High Priority 🟡
   [Should-fix problems]

   ## Enhancements 🔵
   [Nice-to-have improvements]

   ## Specific Task Feedback
   **Task X**:
   - Issue: [description]
   - Fix: [specific recommendation]

   ## Research Citations
   [Relevant research supporting recommendations]
   ```

7. **Severity classification**:

   **Critical (Must Fix)**:
   - Incorrect answers marked correct
   - Ambiguous questions
   - Misleading distractors
   - Cognitive overload for target audience
   - Missing essential scaffolding

   **High Priority (Should Fix)**:
   - Poor task type distribution
   - Difficulty progression issues
   - Missing explanations
   - Weak hints
   - Alternative answers not included

   **Enhancement (Nice to Have)**:
   - Additional task types
   - Better elaboration
   - Visual aids suggestions
   - Interleaving recommendations

8. **Actionable recommendations**:

   For each issue, provide:
   - Specific location (Task #X)
   - Clear description
   - Concrete fix
   - Why it matters (learning science)
   - Expected impact

9. **Save report** (optional):

   Ask: "Save review report to file? (yes/no)"

   If yes:
   - Create: `REVIEW-LEARNING-PATH-[id]-[date].md`
   - Save in project root or specified location

10. **Post to GitHub** (optional):

    If this review was requested for a GitHub issue:
    - Ask: "Post summary to GitHub issue? (yes/no/which issue)"
    - Format as comment
    - Include severity summary
    - Link to full report if saved

11. **Follow-up actions**:

    Ask user: "What would you like to do next?"
    ```
    1. Implement recommended changes
    2. Review another learning path
    3. Request clarification on specific feedback
    4. Export feedback for stakeholders
    5. Nothing, I'm done
    ```

Behavior rules:
- ALWAYS provide specific, actionable feedback
- CITE research when making recommendations
- BALANCE criticism with praise
- PRIORITIZE learner outcomes over perfection
- EXPLAIN the "why" behind recommendations
- PROVIDE examples for fixes
- CONSIDER target audience (beginner/intermediate/advanced)
- RESPECT designer's intent while suggesting improvements

Analysis depth options:
- **Quick review**: Task types, difficulty, major issues only (5 min)
- **Standard review**: Full analysis with recommendations (15 min)
- **Deep review**: Comprehensive + research citations + examples (30 min)

Ask user which depth level they want.

Research references to cite:
- Karpicke & Roediger (2008): Testing effect
- Rohrer & Taylor (2007): Interleaved practice
- Bjork (1994): Desirable difficulties
- Sweller (2011): Cognitive load theory
- Bloom (1956): Taxonomy of educational objectives
- Ebbinghaus (1885): Forgetting curve
- Cepeda et al. (2006): Spacing effects

Quality standards:
- Tasks must test understanding, not just memorization
- Questions must be unambiguous
- Explanations must add value (not just repeat question)
- Difficulty must match target audience
- Task types must align with learning objectives

Red flags to catch:
- All multiple choice (recognition only, no production)
- No explanations (missed learning opportunity)
- Flat difficulty (no progression)
- Too many tasks (>30 = overwhelming)
- Too few tasks (<5 = insufficient practice)
- Inconsistent difficulty labeling
- Missing hints for complex tasks
- Trivial questions (not worth learner time)

Output format:
- Markdown for readability
- Severity icons (🔴🟡🔵)
- Specific task references (#1, #5, etc.)
- Before/after examples for fixes
- Research citations in footnotes or inline

Context: $ARGUMENTS
