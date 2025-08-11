# 05. Migration Plan & DB Hardening

(Status: stub)

Scope:

- duplicate_key column + backfill
- Migration 010 recognitions backfill (SELECT counts draft)
- Search vector & GIN index additions
- Telemetry/event tables (minimal)

Principles:

- Dry-run report before any data mutation
- Idempotent, retry-safe scripts
- Concurrent index creation for large tables

Immediate TODO:

1. Draft migration file: add duplicate_key (nullable) + comment.
2. Script: compute duplicate_key for existing plays (batched, dry-run first).
3. Row count + hash sample report for recognition sources (for Migration 010).
4. Template: standard migration description block (purpose, dry run, rollback).
