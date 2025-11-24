# Test Artifacts Directory

This directory contains temporary test artifacts, screenshots, and reports generated during testing.

## Structure

```
tests/artifacts/
├── screenshots/
│   ├── debug/          # Temporary debug screenshots (gitignored)
│   ├── reports/        # Test report screenshots (gitignored)
│   └── validation/     # Validation screenshots (gitignored)
├── logs/               # Test execution logs (gitignored)
└── reports/            # Test reports (gitignored)
```

## Usage

### For Agents & MCP Tools

When taking screenshots during testing, save to:
- **Debug screenshots**: `tests/artifacts/screenshots/debug/`
- **Test reports**: `tests/artifacts/screenshots/reports/`
- **Validation screenshots**: `tests/artifacts/screenshots/validation/`

**Naming Convention**:
```
{purpose}-{timestamp}.png
Examples:
- debug-homepage-2025-11-24T16-04-20.png
- validation-login-flow-2025-11-24T16-04-20.png
- report-e2e-tests-2025-11-24T16-04-20.png
```

### For Manual Testing

When manually testing and needing to preserve screenshots:
1. Take screenshot in browser
2. Save to appropriate subdirectory
3. Include descriptive filename
4. Reference in test documentation

## Cleanup

**Automatic**: These directories are gitignored, so artifacts don't accumulate in version control.

**Manual Cleanup**:
```bash
# Remove all temporary test artifacts
rm -rf tests/artifacts/screenshots/debug/*
rm -rf tests/artifacts/screenshots/reports/*
rm -rf tests/artifacts/logs/*

# Keep validation screenshots
```

## Notes

- ✅ **DO**: Save all test screenshots here
- ✅ **DO**: Use descriptive filenames
- ✅ **DO**: Clean up old artifacts periodically
- ❌ **DON'T**: Commit these to git (they're ignored)
- ❌ **DON'T**: Save screenshots to project root
- ❌ **DON'T**: Save screenshots to `.playwright-mcp/`

## Migration

If you have screenshots in wrong locations:

```bash
# Move root-level screenshots to artifacts
mv page-*.png tests/artifacts/screenshots/debug/ 2>/dev/null
mv test-*.png tests/artifacts/screenshots/debug/ 2>/dev/null
mv screenshot-*.png tests/artifacts/screenshots/debug/ 2>/dev/null

# Move .playwright-mcp screenshots
mv .playwright-mcp/*.png tests/artifacts/screenshots/debug/ 2>/dev/null
```

## For Important Screenshots

If a screenshot needs to be preserved in git:
1. Evaluate if it's documentation or a test snapshot
2. **Documentation**: Save to `docs/` with descriptive name
3. **Test snapshot**: Save to `tests/{test-type}/snapshots/`
4. Add to git explicitly: `git add -f path/to/screenshot.png`
