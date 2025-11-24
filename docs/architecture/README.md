# Architecture Documentation

This directory contains architectural documentation, decision records, and system design documents.

## Structure

- `decisions/` - Architecture Decision Records (ADRs)
- `diagrams/` - System diagrams and visualizations
- `*.md` - Architecture documentation and status reports

## Key Documents

- `css-modules.md` - CSS Modules architecture
- `css-modules-migration.md` - CSS Modules migration report
- `implementation-status.md` - Implementation status tracking
- `testing-report.md` - Testing architecture and status
- `e2e-test-status.md` - E2E testing status

## Architecture Decision Records

ADRs document significant architectural decisions made during the project. Each ADR should follow the template in `decisions/template.md`.

## System Overview

The learning platform follows a hexagonal (ports and adapters) architecture:

- **Core** - Domain logic and business rules
- **Storage** - Data persistence layer
- **UI** - User interface components
- **Services** - Application services orchestrating core logic
