# /constitution Command Template

## Purpose
Update the project constitution with new principles, amendments, or governance changes while maintaining consistency across all project artifacts.

## Usage
```
/constitution [amendment description or new principles]
```

## Execution Flow
1. Load existing constitution at `.specify/memory/constitution.md`
2. Identify all placeholders and existing values
3. Collect/derive values from user input and context
4. Increment version according to semantic versioning:
   - MAJOR: Breaking governance changes
   - MINOR: New principles or sections
   - PATCH: Clarifications and fixes
5. Draft updated constitution content
6. Propagate changes to dependent templates:
   - plan-template.md (Constitution Check section)
   - spec-template.md (alignment verification)
   - tasks-template.md (task categorization)
   - Command templates (references)
7. Generate Sync Impact Report
8. Write updated constitution
9. Output summary with version change and commit message

## Constitution Gates for This Project
Based on Learning Platform Constitution v2.1.0:

### Required Checks
- Zero-Cost Static: Pure client-side, GitHub Pages hosting
- Modular Architecture: Independent modules, clear boundaries
- Complete Automation: GitHub Actions CI/CD pipeline
- Type-Safe & Testable: TypeScript/JSDoc with test coverage
- Offline-First PWA: Service workers and offline functionality
- Maintainability First: Documentation, stable APIs, safe refactoring

## Version Bumping Rules
- MAJOR (X.0.0): Removing principles, changing GitHub Pages compatibility
- MINOR (1.X.0): Adding principles, new development standards
- PATCH (1.0.X): Wording improvements, typo fixes

## Output Format
The updated constitution includes:
- HTML comment with Sync Impact Report at top
- Complete principle definitions with rationale
- No remaining placeholder tokens
- ISO date format (YYYY-MM-DD)
- Semantic version number

## Example
```
/constitution Add principle for environmental sustainability in hosting choices
```

Result: Constitution v1.1.0 with new principle VIII added