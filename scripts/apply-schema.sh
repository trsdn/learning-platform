#!/bin/bash

# ==============================================
# Apply Supabase Schema Migration
# ==============================================
#
# This script helps apply the database schema to your Supabase project.
#
# Usage:
#   1. Option A (Manual - Recommended):
#      - Open Supabase Dashboard: https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh/sql
#      - Copy the contents of: supabase/migrations/20250123000001_initial_schema.sql
#      - Paste into the SQL Editor
#      - Click "Run"
#
#   2. Option B (CLI - requires Supabase access token):
#      - Get access token from: https://supabase.com/dashboard/account/tokens
#      - Run: SUPABASE_ACCESS_TOKEN=<token> ./scripts/apply-schema.sh
#

echo "🔧 Supabase Schema Migration Helper"
echo "===================================="
echo ""

# Check if we have an access token
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ No SUPABASE_ACCESS_TOKEN found"
    echo ""
    echo "📋 Manual Application Steps:"
    echo "  1. Open: https://supabase.com/dashboard/project/knzjdckrtewoigosaxoh/sql"
    echo "  2. Copy contents from: supabase/migrations/20250123000001_initial_schema.sql"
    echo "  3. Paste into SQL Editor"
    echo "  4. Click 'Run'"
    echo ""
    echo "🔑 Or set SUPABASE_ACCESS_TOKEN to use CLI:"
    echo "  Get token from: https://supabase.com/dashboard/account/tokens"
    echo "  Then run: SUPABASE_ACCESS_TOKEN=<token> ./scripts/apply-schema.sh"
    exit 1
fi

# CLI approach (if access token is provided)
echo "🔗 Linking to Supabase project..."
supabase link --project-ref knzjdckrtewoigosaxoh

if [ $? -eq 0 ]; then
    echo "✅ Successfully linked to project"
    echo ""
    echo "📊 Applying database migration..."
    supabase db push

    if [ $? -eq 0 ]; then
        echo "✅ Migration applied successfully!"
        echo ""
        echo "📝 Next steps:"
        echo "  1. Generate TypeScript types: npm run types:generate"
        echo "  2. Configure auth providers in Supabase Dashboard"
        echo "  3. Continue with implementation"
    else
        echo "❌ Migration failed. Check the error above."
        exit 1
    fi
else
    echo "❌ Failed to link to project"
    exit 1
fi
