#!/usr/bin/env bash
# Encrypt environment files with SOPS
# Usage: npm run secrets:encrypt

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

if ! command -v sops >/dev/null 2>&1; then
  echo "❌ Error: sops not installed"
  echo "   Install with: brew install sops"
  exit 1
fi

count=0
for file in .env.local .env.production .env.staging; do
  if [ -f "$file" ]; then
    echo "🔐 Encrypting $file..."
    sops -e "$file" > "$file.enc"
    ((count++))
  fi
done

if [ $count -eq 0 ]; then
  echo "⚠️  No environment files found to encrypt"
  echo "   Expected: .env.local, .env.production, or .env.staging"
  exit 1
fi

echo "✅ Encrypted $count file(s). Commit the .enc files to git."
