#!/bin/bash

# ==============================================
# Apply Supabase Schema Migrations
# ==============================================
#
# Applies the authoritative migration history from
# infrastructure/supabase/migrations via the Supabase CLI.
#
# The Supabase CLI resolves its config at <workdir>/supabase/config.toml,
# so every CLI call below passes `--workdir infrastructure`.
#
# Usage:
#   1. Option A (CLI - recommended):
#      - Get access token from: https://supabase.com/dashboard/account/tokens
#      - Run: SUPABASE_ACCESS_TOKEN=<token> ./scripts/apply-schema.sh
#      - Target a different project with:
#        SUPABASE_PROJECT_REF=<ref> SUPABASE_ACCESS_TOKEN=<token> ./scripts/apply-schema.sh
#
#   2. Option B (Manual):
#      - Open the SQL editor for your project
#      - Run each file in infrastructure/supabase/migrations in filename order
#

set -euo pipefail

# Resolve repository root so the script works from any directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

MIGRATIONS_DIR="infrastructure/supabase/migrations"
SUPABASE_WORKDIR="infrastructure"
PROJECT_REF="${SUPABASE_PROJECT_REF:-knzjdckrtewoigosaxoh}"

echo "🔧 Supabase Schema Migration Helper"
echo "===================================="
echo ""

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

echo "📂 Migrations directory: $MIGRATIONS_DIR"
echo "🎯 Target project ref:   $PROJECT_REF"
echo ""
echo "📋 Migration history:"
for migration in "$MIGRATIONS_DIR"/*.sql; do
    echo "   - $(basename "$migration")"
done
echo ""

# Check if we have an access token
if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
    echo "❌ No SUPABASE_ACCESS_TOKEN found"
    echo ""
    echo "📋 Manual Application Steps:"
    echo "  1. Open: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
    echo "  2. Run each migration above from $MIGRATIONS_DIR in filename order"
    echo ""
    echo "🔑 Or set SUPABASE_ACCESS_TOKEN to use the CLI:"
    echo "  Get token from: https://supabase.com/dashboard/account/tokens"
    echo "  Then run: SUPABASE_ACCESS_TOKEN=<token> ./scripts/apply-schema.sh"
    exit 1
fi

# CLI approach (if access token is provided)
echo "🔗 Linking to Supabase project..."
if ! supabase --workdir "$SUPABASE_WORKDIR" link --project-ref "$PROJECT_REF"; then
    echo "❌ Failed to link to project"
    exit 1
fi

echo "✅ Successfully linked to project"
echo ""
echo "📊 Applying database migrations..."
if ! supabase --workdir "$SUPABASE_WORKDIR" db push; then
    echo "❌ Migration failed. Check the error above."
    exit 1
fi

echo "✅ Migrations applied successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Generate TypeScript types: npm run supabase:types"
echo "  2. Configure auth providers in Supabase Dashboard"
echo "  3. Continue with implementation"
