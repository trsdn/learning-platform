# Scripts Directory - AI Agent Guide

**Last Updated**: 2025-12-01 | **Purpose**: Automation, seeding, testing, content generation
**Parent Guide**: [../AGENTS.md](../AGENTS.md)

**Related Guides**: [infrastructure/supabase/AGENTS.md](../infrastructure/supabase/AGENTS.md) for database operations, [tests/AGENTS.md](../tests/AGENTS.md) for test cleanup

## 🎯 Overview

This directory contains utility scripts for development, deployment, content generation, and database management. Scripts are written in TypeScript, Python, and Bash.

---

## 📋 Script Categories

### 🗄️ Database & Seeding

#### `seed-supabase.ts`
**Purpose**: Seeds Supabase database with learning content from JSON files  
**Language**: TypeScript  
**Usage**: `npm run seed:supabase`

**Prerequisites**:
- Supabase project created
- Schema applied (`supabase/migrations/`)
- Environment variables in `.env.local`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

**What it does**:
1. Loads learning path JSON files from `public/learning-paths/`
2. Seeds topics, learning paths, and tasks
3. Handles relationships between entities
4. Validates data integrity

**Important**:
- ⚠️ Deletes existing data before seeding
- ✅ Use for initial setup or resetting database
- ✅ Run after schema migrations

#### `apply-schema.js` / `apply-schema.sh`
**Purpose**: Apply database schema to Supabase  
**Usage**: 
```bash
./scripts/apply-schema.sh
# or
node scripts/apply-schema.js
```

**What it does**:
- Applies schema from `infrastructure/supabase/schema.sql`
- Sets up tables, RLS policies, indexes

---

### 🎨 Asset Generation

#### `generate-pwa-icons.js` / `generate-pwa-icons.mjs`
**Purpose**: Generate PWA icons in multiple sizes  
**Language**: JavaScript/ES Modules  
**Dependencies**: Image processing library (Sharp or similar)

**Output**: Icons for manifest.json (192x192, 512x512, etc.)

#### `generate-favicon.js`
**Purpose**: Generate favicon.ico from source image  
**Language**: JavaScript

---

### 🔊 Audio Content Generation

#### `add-audio-to-flashcards.py`
**Purpose**: Add audio paths to Spanish flashcard JSONs  
**Language**: Python 3  
**Usage**: `python3 scripts/add-audio-to-flashcards.py`

**What it does**:
1. Scans `public/learning-paths/spanisch/` JSON files
2. Converts text to audio filenames (e.g., "Buenos días" → "buenos-dias.mp3")
3. Adds `frontAudio`/`backAudio` fields to flashcard tasks
4. Handles Spanish characters (ñ, á, é, etc.)

**Example transformation**:
```json
// Before
{
  "type": "flashcard",
  "content": {
    "front": "Buenos días",
    "back": "Good morning"
  }
}

// After
{
  "type": "flashcard",
  "content": {
    "front": "Buenos días",
    "back": "Good morning",
    "frontAudio": "audio/spanish/buenos-dias.mp3",
    "backAudio": "audio/english/good-morning.mp3"
  }
}
```

#### `generate-spanish-audio.py`
**Purpose**: Generate Spanish TTS audio files  
**Language**: Python 3  
**Dependencies**: See `requirements.txt`

**Usage**: `python3 scripts/generate-spanish-audio.py`

**Requirements** (`requirements.txt`):
- `gTTS` or similar TTS library
- Python 3.8+

#### `generation/generate-audio.py`
**Purpose**: General audio generation for multiple languages  
**Language**: Python 3

#### `generation/improve-irregular-verbs.py`
**Purpose**: Enhance irregular verb content  
**Language**: Python 3

---

### 🧹 Maintenance & Cleanup

#### `cleanup-test-artifacts.sh`
**Purpose**: Clean test artifacts and misplaced screenshots  
**Usage**: `./scripts/cleanup-test-artifacts.sh` or `npm run cleanup`

**What it cleans**:
- ✅ `tests/artifacts/screenshots/debug/*`
- ✅ `tests/artifacts/screenshots/reports/*`
- ✅ `tests/artifacts/logs/*`
- ✅ Root-level screenshots (`page-*.png`, `test-*.png`, etc.)
- ✅ `.playwright-mcp/*.png` (deprecated)
- ✅ `test-results/*`
- ✅ `playwright-report/*`

**What it preserves**:
- ✅ `tests/artifacts/screenshots/validation/*` (committed screenshots)
- ✅ `docs/*.png` (documentation)
- ✅ `tests/*/snapshots/*.png` (visual regression baselines)

**When to run**:
- After test runs to clean up temporary files
- Before commits to avoid committing artifacts
- When disk space is low

---

### 🔐 Secret Management (SOPS)

#### `sops-encrypt.sh`
**Purpose**: Encrypt environment files with SOPS + age
**Usage**: `npm run secrets:encrypt`

**What it does**:
1. Finds `.env.local`, `.env.production`, `.env.staging`
2. Encrypts each file → `.env.*.enc`
3. Encrypted files are safe to commit to git

**Prerequisites**:
- SOPS installed: `brew install sops`
- age installed: `brew install age`

#### `sops-decrypt.sh`
**Purpose**: Decrypt environment files
**Usage**: `npm run secrets:decrypt`

**What it does**:
1. Finds `.env.*.enc` files
2. Decrypts each → `.env.*` (unencrypted)
3. App can now use the secrets

**Prerequisites**:
- SOPS + age installed
- age private key in one of:
  - `SOPS_AGE_KEY` environment variable
  - macOS: `~/Library/Application Support/sops/age/keys.txt`
  - Linux: `~/.config/sops/age/keys.txt`

**Workflow**:
```bash
# First time setup (get key from team lead)
mkdir -p ~/Library/Application\ Support/sops/age
# Save key to keys.txt

# Decrypt secrets
npm run secrets:decrypt

# After modifying .env.local
npm run secrets:encrypt
git add .env.local.enc
git commit -m "chore: update encrypted secrets"
```

**Important**:
- ✅ `.env.*.enc` files ARE committed (encrypted)
- ❌ `.env.*` files are gitignored (unencrypted)
- ❌ Never commit the age private key (`keys.txt`)
- 🔑 Store private key in 1Password, Bitwarden, or secure team channel

---

### 🚀 Deployment & Validation

#### `pre-deploy-check.sh`
**Purpose**: Run pre-deployment checklist  
**Usage**: `./scripts/pre-deploy-check.sh` or `npm run pre-deploy`

**Checks performed**:
1. ✅ Environment variables (`.env.local`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. ✅ Dependencies (`node_modules`)
3. ✅ TypeScript compilation (`npm run type-check`)
4. ✅ Linting (`npm run lint`)
5. ✅ Tests (`npm test`)
6. ✅ Production build (`npm run build`)

**Exit codes**:
- `0` - Success
- `2` - Environment error
- `3` - Build error
- `4` - Config error

**When to run**:
- ✅ Before deploying to production
- ✅ Before pushing to main branch
- ✅ After major changes

---

### 🧪 Testing Utilities

#### `testing/test-admin-panel.cjs`
**Purpose**: Test admin panel functionality  
**Language**: CommonJS Node.js

#### `testing/test-task-showcase.cjs`
**Purpose**: Test task showcase UI  
**Language**: CommonJS Node.js

---

## 🛠️ Common Workflows

### Initial Database Setup

```bash
# 1. Apply schema
./scripts/apply-schema.sh

# 2. Seed with content
npm run seed:supabase
```

### Content Updates

```bash
# 1. Update JSON files in public/learning-paths/
# 2. Re-seed database
npm run seed:supabase
```

### Audio Content Workflow

```bash
# 1. Install Python dependencies
pip3 install -r scripts/requirements.txt

# 2. Generate audio files
python3 scripts/generate-spanish-audio.py

# 3. Add audio paths to JSONs
python3 scripts/add-audio-to-flashcards.py
```

### Secret Management Workflow

```bash
# First time setup (new machine/developer)
brew install sops age
# Get age private key from team lead / password manager
# Save to: ~/Library/Application Support/sops/age/keys.txt

# Decrypt secrets
npm run secrets:decrypt

# After modifying secrets
npm run secrets:encrypt
git add .env.local.enc
git commit -m "chore: update encrypted secrets"
```

### Pre-Deployment Workflow

```bash
# 1. Clean artifacts
./scripts/cleanup-test-artifacts.sh

# 2. Run checks
./scripts/pre-deploy-check.sh

# 3. Deploy (if all checks pass)
npm run deploy
```

---

## 📝 Adding New Scripts

### Guidelines

1. **Choose the right language**:
   - **TypeScript**: Database operations, complex logic, type safety needed
   - **Python**: Content generation, audio processing, data transformation
   - **Bash**: Simple automation, file operations, cleanup

2. **File naming**:
   - Use kebab-case: `generate-audio.py`, `seed-database.ts`
   - Add shebang for executables: `#!/usr/bin/env python3`

3. **Documentation**:
   - Add docstring/comment at top explaining purpose
   - Document prerequisites and dependencies
   - Provide usage examples

4. **Error handling**:
   - Use `set -e` in bash scripts (exit on error)
   - Handle exceptions in Python/TypeScript
   - Provide meaningful error messages

5. **Dependencies**:
   - Python: Add to `requirements.txt`
   - Node.js: Add to `package.json` devDependencies
   - Bash: Document required tools

6. **Testing**:
   - Test scripts locally before committing
   - Provide example usage
   - Document expected output

### Template Structure

**TypeScript**:
```typescript
/**
 * Script Name
 * 
 * Description of what this script does.
 * 
 * Usage:
 *   npm run script-name
 * 
 * Prerequisites:
 *   - Requirement 1
 *   - Requirement 2
 */

// Implementation
```

**Python**:
```python
#!/usr/bin/env python3
"""
Script Name

Description of what this script does.

Usage:
    python3 scripts/script-name.py

Prerequisites:
    - Requirement 1
    - Requirement 2
"""

# Implementation
```

**Bash**:
```bash
#!/bin/bash
# Script Name
# 
# Description of what this script does.
# 
# Usage:
#   ./scripts/script-name.sh

set -euo pipefail

# Implementation
```

---

## 🚨 Critical Rules

### DO

- ✅ Test scripts locally before committing
- ✅ Handle errors gracefully
- ✅ Document prerequisites and usage
- ✅ Use environment variables for sensitive data
- ✅ Clean up temporary files
- ✅ Validate inputs
- ✅ Provide meaningful error messages

### DON'T

- ❌ Commit sensitive data (API keys, passwords)
- ❌ Modify production data without backups
- ❌ Run destructive operations without confirmation
- ❌ Hardcode file paths (use relative paths)
- ❌ Skip error handling
- ❌ Leave debug code in production scripts

---

## 🔒 Security

### Sensitive Data

**Environment Variables**: Store in `.env.local` (gitignored), encrypted in `.env.local.enc` (committed)

**SOPS Encryption** (recommended):
```bash
# Encrypt secrets for git
npm run secrets:encrypt

# Decrypt on new machine
npm run secrets:decrypt
```

**Never commit**:
- Unencrypted `.env.*` files
- age private key (`keys.txt`)
- Database credentials (except encrypted)
- Service account tokens (except encrypted)

### Database Operations

- ⚠️ Seeding scripts DELETE existing data
- ✅ Always backup before running destructive operations
- ✅ Test on development database first
- ✅ Use transactions where possible

---

## 📊 Script Dependencies

### Python Scripts

**Installation**:
```bash
pip3 install -r scripts/requirements.txt
```

**Required libraries** (see `requirements.txt`):
- gTTS or similar for audio generation
- Standard library (json, pathlib, re)

### TypeScript Scripts

**Installation**:
```bash
npm install
```

**Dependencies**: Defined in `package.json`

### Bash Scripts

**System tools** (usually pre-installed):
- `bash`, `zsh`
- `rm`, `mkdir`, `find`
- `grep`, `sed`, `awk`

---

## 🧪 Testing Scripts

### Manual Testing

```bash
# 1. Run script in dry-run mode (if available)
./scripts/script-name.sh --dry-run

# 2. Test on sample data
# 3. Verify output
# 4. Clean up test artifacts
```

### Automated Testing

- Unit tests for complex logic
- Integration tests for database scripts
- See `tests/` directory for testing utilities

---

## 📚 Related Documentation

- **Database Schema**: `infrastructure/supabase/AGENTS.md`
- **Content Guidelines**: `public/AGENTS.md`
- **Testing Guide**: `tests/AGENTS.md`
- **Deployment**: `docs/guides/deployment.md`

---

## 💡 Tips for Agents

### When Working with Scripts

1. **Read the script first**: Understand what it does before running
2. **Check prerequisites**: Ensure all dependencies are installed
3. **Test on development**: Never run untested scripts on production
4. **Backup data**: Before running destructive operations
5. **Review output**: Verify script completed successfully

### Common Tasks

**Reseed database**:
```bash
npm run seed:supabase
```

**Generate audio content**:
```bash
python3 scripts/add-audio-to-flashcards.py
```

**Clean test artifacts**:
```bash
./scripts/cleanup-test-artifacts.sh
```

**Pre-deployment check**:
```bash
./scripts/pre-deploy-check.sh
```

### Debugging

**Script fails**:
1. Check error message
2. Verify prerequisites (dependencies, env vars)
3. Check file paths
4. Review recent changes
5. Test with minimal input

**Database seeding fails**:
1. Verify Supabase connection (`.env.local`)
2. Check schema is applied
3. Validate JSON files
4. Check RLS policies
5. Review Supabase logs

---

**Last Updated**: 2025-12-02
**Maintained by**: @trsdn  
**Questions?**: See main `AGENTS.md` or project documentation
