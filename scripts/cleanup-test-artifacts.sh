#!/bin/bash
# Cleanup test artifacts and misplaced screenshots

set -e

echo "🧹 Cleaning test artifacts..."

# Clean temporary test artifacts
echo "  → Cleaning debug screenshots..."
rm -rf tests/artifacts/screenshots/debug/*

echo "  → Cleaning report screenshots..."
rm -rf tests/artifacts/screenshots/reports/*

echo "  → Cleaning test logs..."
rm -rf tests/artifacts/logs/*

# Clean root-level misplaced screenshots
echo "  → Cleaning root-level screenshots..."
rm -f page-*.png 2>/dev/null || true
rm -f test-*.png 2>/dev/null || true
rm -f screenshot-*.png 2>/dev/null || true
rm -f debug-*.png 2>/dev/null || true
rm -f *-test.png 2>/dev/null || true
rm -f *-error.png 2>/dev/null || true

# Clean playwright MCP artifacts
echo "  → Cleaning .playwright-mcp artifacts..."
rm -rf .playwright-mcp/*.png 2>/dev/null || true

# Clean test results
echo "  → Cleaning test-results..."
rm -rf test-results/* 2>/dev/null || true

# Clean playwright reports
echo "  → Cleaning playwright-report..."
rm -rf playwright-report/* 2>/dev/null || true

echo "✅ Cleanup complete!"
echo ""
echo "📊 Remaining artifacts:"
echo "  • Validation screenshots: $(find tests/artifacts/screenshots/validation -name '*.png' 2>/dev/null | wc -l | tr -d ' ')"
echo "  • Documentation screenshots: $(find docs -name '*.png' 2>/dev/null | wc -l | tr -d ' ')"
echo "  • Test snapshots: $(find tests -path '*/snapshots/*.png' 2>/dev/null | wc -l | tr -d ' ')"
