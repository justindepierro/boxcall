# Archive - Old Migration Scripts

This directory contains legacy migration scripts that have been replaced by the new database CLI tools.

## Current Tools (Use These!)

Located in project root:

- **`db-cli.js`** - Main database CLI tool
- **`migrate-cli.js`** - Migration runner

### Commands:

```bash
npm run db:migrate:easy <file>  # Copy SQL + open editor (recommended)
npm run db:status               # Check connection
npm run db:migrate <file>       # Preview migration
npm run db:sql                  # Open SQL editor
```

## Archived Scripts (Don't Use)

These were experimental attempts at direct CLI migration execution:

### Migration Runners (Old)

- `apply_migration.js` - Early migration attempt
- `migrate.js` - Postgres client approach
- `migrate-exec.js` - Node postgres attempt
- `run-migration.js` - Original runner
- `run-supabase-migration.js` - Supabase CLI wrapper
- `run_migration.js` - Another variant

### Specific Migration Scripts

- `apply_play_type_migration.cjs` - Play type migration
- `run_array_migration.js` - Array field migration
- `run_migration_practice_script_plays.js` - Practice script migration

### Testing/Utilities

- `check-protection-db.js` - DB protection check
- `check_migration_status.js` - Status checker
- `get-db-url.js` - Connection string helper
- `show-migration.js` - Display migration
- `test-db-connection.js` - Connection tester
- `test-db.cjs` - DB test script

## Why Archived?

After extensive testing, we learned:

1. **DDL migrations cannot execute via Supabase JS client** (security limitation)
2. **Direct database connections are complex** (connection string formats, auth issues)
3. **SQL Editor is Supabase's recommended approach** for schema changes
4. **Our new `db:migrate:easy` command makes SQL Editor workflow instant**

## History

These scripts were created during Phase 13 development (Oct 2025) while trying to enable direct CLI migration execution. After updating Supabase CLI and testing all approaches, we determined that the copy-to-editor workflow is the most reliable method.

---

**Current Status:** Use `npm run db:migrate:easy` for all migrations. ✅
