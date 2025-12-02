#!/usr/bin/env bash
# Decrypt environment files with SOPS
# Usage: npm run secrets:decrypt

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

if ! command -v sops >/dev/null 2>&1; then
  echo "❌ Error: sops not installed"
  echo "   Install with: brew install sops"
  exit 1
fi

# Check for age key
if [ -z "$SOPS_AGE_KEY" ] && [ ! -f "${HOME}/.config/sops/age/keys.txt" ]; then
  echo "❌ Error: No age key found"
  echo "   Either set SOPS_AGE_KEY environment variable"
  echo "   or save key to ~/.config/sops/age/keys.txt"
  exit 1
fi

count=0
for file in .env.local.enc .env.development.enc .env.production.enc .env.staging.enc; do
  if [ -f "$file" ]; then
    output="${file%.enc}"
    echo "🔓 Decrypting $file → $output..."
    sops -d "$file" > "$output"
    ((count++))
  fi
done

if [ $count -eq 0 ]; then
  echo "⚠️  No encrypted files found"
  echo "   Expected: .env.local.enc, .env.development.enc, .env.production.enc, or .env.staging.enc"
  exit 1
fi

echo "✅ Decrypted $count file(s). Ready to use."
