# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VitalTags v2 is a medical emergency information system built as a pnpm monorepo with Next.js App Router. The system manages emergency medical profiles with tiered data access (public emergency info vs. protected clinical records) using cryptographic protection.

## Development Commands

All commands should be run from the `vitaltags-v2/` directory:

```bash
# Development
pnpm dev                    # Start Next.js dev server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Database
pnpm prisma:generate        # Generate Prisma client
pnpm prisma:migrate:dev     # Run migrations in development
pnpm prisma:migrate:deploy  # Deploy migrations to production
pnpm seed                   # Seed database with test data

# Testing
pnpm test                   # Run unit tests (Vitest)
pnpm test:ui                # Run tests with UI
pnpm e2e                    # Run Playwright e2e tests

# Database setup
docker-compose up -d        # Start PostgreSQL on port 5433
```

## Architecture

### Monorepo Structure
- `apps/web/` - Next.js application with App Router
- `prisma/` - Database schema and migrations
- `scripts/` - Utility scripts (seeding, etc.)

### Key Technologies
- **Next.js 14** with App Router and TypeScript
- **Prisma** ORM with PostgreSQL
- **Authentication**: Custom session-based auth with WebAuthn support
- **Cryptography**: libsodium for encryption, PASETO tokens for break-glass access
- **Testing**: Vitest for unit tests, Playwright for e2e
- **Validation**: Zod schemas with @t3-oss/env-nextjs for environment variables

### Database Design
- **User/Profile separation**: Users can have multiple profiles
- **Tiered data model**: Public emergency data (Tier E) vs. encrypted clinical data (Tier C)
- **Audit logging**: All profile access tracked with IP/UA hashing
- **RLS enabled**: Row-level security for data protection
- **Medical terms**: Conditions, Medications, Allergies with i18n support

### Security Features
- Content Security Policy with strict directives
- Security headers (HSTS, X-Frame-Options, etc.)
- Encrypted PII storage with KEK/DEK pattern
- Rate limiting and audit trails
- WebAuthn passwordless authentication

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `KEK_HEX` - 256-bit hex key for encryption
- `PII_SALT_HEX` - Salt for PII hashing
- `PASETO_LOCAL_KEY` - 256-bit hex key for PASETO tokens
- `RP_ID`, `RP_ORIGIN`, `RP_NAME` - WebAuthn relying party config

## Testing

### Unit Tests
- Located in `src/lib/*.test.ts` files
- Run with Vitest, includes crypto and business logic tests
- Environment is Node.js with jsdom for DOM testing

### E2E Tests
- Located in `apps/web/tests/`
- Uses Playwright with Chromium
- Tests security headers, API endpoints, and core flows
- Web server auto-starts on `http://localhost:3000`

## Key Files and Patterns

### API Routes
- Located in `apps/web/src/app/api/`
- Follow Next.js App Router conventions
- Include comprehensive error handling and validation

### Database Layer
- `src/lib/db.ts` - Prisma client singleton
- `src/lib/auth.ts` - Session management
- Schema in `prisma/schema.prisma` with comprehensive audit trail

### Cryptographic Operations
- `src/lib/crypto.ts` - Core encryption/decryption utilities
- `src/lib/tokens.ts` - PASETO token management
- `src/lib/sodium.ts` - libsodium wrapper

### Frontend Components
- React Server Components with minimal client-side state
- TypeScript strict mode enabled
- Security-first approach with CSP compliance

## Development Workflow

1. Start database: `docker-compose up -d`
2. Run migrations: `pnpm prisma:migrate:dev`
3. Start dev server: `pnpm dev`
4. Run tests before committing: `pnpm test && pnpm e2e`
5. Always run `pnpm lint` before commits

The application serves a `/healthz` endpoint and enforces strict security headers in production.