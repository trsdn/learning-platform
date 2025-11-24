#!/bin/bash

# Pre-deployment Checklist Script
# Run this before deploying to catch common issues

set -euo pipefail

echo "🚀 Running pre-deployment checks..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Exit codes
EXIT_SUCCESS=0
EXIT_ENV_ERROR=2
EXIT_BUILD_ERROR=3
EXIT_CONFIG_ERROR=4

# Check 1: Environment variables
echo "1️⃣  Checking environment variables..."
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.local not found${NC}"
    echo "   Create it from .env.example for local testing"
else
    if grep -q "VITE_SUPABASE_URL" .env.local && grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✅ Environment variables configured${NC}"
    else
        echo -e "${RED}❌ Missing required environment variables${NC}"
        echo "   Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
        exit $EXIT_ENV_ERROR
    fi
fi
echo ""

# Check 2: Dependencies
echo "2️⃣  Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found, installing...${NC}"
    npm ci
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check 3: TypeScript compilation
echo "3️⃣  Checking TypeScript compilation..."
if npm run type-check 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ TypeScript errors found${NC}"
    npm run type-check
    exit $EXIT_BUILD_ERROR
else
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
fi
echo ""

# Check 4: Linting
echo "4️⃣  Running linter..."
if npm run lint 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ Linting errors found${NC}"
    npm run lint
    exit $EXIT_BUILD_ERROR
else
    echo -e "${GREEN}✅ Linting passed${NC}"
fi
echo ""

# Check 5: Build
echo "5️⃣  Testing production build..."
if npm run build; then
    echo -e "${GREEN}✅ Production build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit $EXIT_BUILD_ERROR
fi
echo ""

# Check 6: Vercel configuration
echo "6️⃣  Validating Vercel configuration..."
if [ -f "vercel.json" ]; then
    if command -v jq &> /dev/null; then
        if jq empty vercel.json 2>/dev/null; then
            echo -e "${GREEN}✅ vercel.json is valid JSON${NC}"
        else
            echo -e "${RED}❌ vercel.json has invalid JSON${NC}"
            exit $EXIT_CONFIG_ERROR
        fi
    else
        echo -e "${YELLOW}⚠️  jq not installed, skipping JSON validation${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  vercel.json not found${NC}"
fi
echo ""

echo -e "${GREEN}🎉 All pre-deployment checks passed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Commit your changes: git add . && git commit -m 'your message'"
echo "  2. Push to trigger deployment: git push"
echo "  3. Or deploy directly: vercel --prod"
echo ""

exit $EXIT_SUCCESS
