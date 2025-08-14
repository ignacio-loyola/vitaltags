# Vital Tags — MVP

Monorepo with Next.js (web) + FastAPI (api), Postgres, Redis, S3-compatible storage. EU-ready, GDPR-minded.

## Quick start
1) Copy `.env.example` to `.env` (root) and `.env.local.example` to `apps/web/.env.local`.
2) `docker compose up --build`
3) Web: http://localhost:3000  API: http://localhost:8000  DB: localhost:5432

## Migrations
`docker compose exec api alembic upgrade head`

## Seed terminology
`docker compose exec api python -m app.services.terminology --seed`

## Tests
- API: `pytest`
- Web: `pnpm -C apps/web test`

## Architecture

- **Frontend**: Next.js with App Router, TypeScript, Tailwind CSS
- **Backend**: FastAPI with SQLModel, PostgreSQL, Redis
- **Storage**: S3-compatible (MinIO for dev)
- **Infrastructure**: Docker Compose, NGINX edge caching
- **Standards**: ICD-10, ATC, INN medical terminology
- **Privacy**: GDPR-compliant, data minimization, field-level controls
