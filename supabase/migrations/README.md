# Database Migration Standards & Best Practices

## Overview

This document outlines standards and best practices for database migrations in the BoxCall project to ensure reliability, maintainability, and prevent migration conflicts.

## Migration Naming Convention

- **Format**: `YYYYMMDDHHMMSS_description.sql`
- **Timestamp**: Use 14-digit timestamp (YYYYMMDDHHMMSS) for uniqueness
- **Description**: Use snake_case, descriptive names
- **Examples**:
  - `20251024000000_bulletproof_database_reconstruction.sql` ✅
  - `20251023000000_add_badge_customization.sql` ✅
  - `migration_123.sql` ❌ (no timestamp)
  - `20251023_add_feature.sql` ❌ (not 14 digits)

## Migration Best Practices

### 1. Idempotent Operations

All migrations must be idempotent - they should be safe to run multiple times.

**Good:**

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

**Bad:**

```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false; -- Fails if column exists
CREATE INDEX idx_users_email ON users(email); -- Fails if index exists
```

### 2. Comprehensive Error Handling

Migrations should handle edge cases and provide clear error messages.

```sql
DO $$
BEGIN
  -- Check prerequisites
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'required_table') THEN
    RAISE EXCEPTION 'Required table "required_table" does not exist. Run prerequisite migrations first.';
  END IF;

  -- Perform migration
  ALTER TABLE my_table ADD COLUMN IF NOT EXISTS new_column TEXT;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Migration failed: %', SQLERRM;
END $$;
```

### 3. RLS Policy Management

Always use `IF NOT EXISTS` and `DROP POLICY IF EXISTS` for policies.

```sql
-- Drop existing policy (safe)
DROP POLICY IF EXISTS "Users can view data" ON my_table;

-- Create new policy
CREATE POLICY "Users can view data" ON my_table
FOR SELECT USING (auth.uid() = user_id);
```

### 4. Index Management

Use `IF NOT EXISTS` for indexes and consider performance impact.

```sql
CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);
```

### 5. Constraint Management

Handle constraints carefully to avoid conflicts.

```sql
-- Add constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'my_table' AND constraint_name = 'my_constraint'
  ) THEN
    ALTER TABLE my_table ADD CONSTRAINT my_constraint CHECK (column > 0);
  END IF;
END $$;
```

## Migration Dependencies

### Forbidden: Circular Dependencies

- Migration A depends on table created in migration B
- Migration B depends on table created in migration A

### Allowed: Linear Dependencies

- Migration A creates table X
- Migration B adds column to table X
- Migration C adds index to table X

### Handling Complex Dependencies

For complex interdependent changes, create a single comprehensive migration that handles all related changes atomically.

## Rollback Strategy

### 1. Create Rollback Migrations

Every migration that creates/modifies data should have a corresponding rollback.

**Naming**: `YYYYMMDDHHMMSS_rollback_description.sql`

### 2. Safe Rollback Operations

Rollbacks must be safe and reversible.

```sql
-- Good rollback
DROP TABLE IF EXISTS new_table CASCADE;
ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;

-- Bad rollback (dangerous)
DELETE FROM important_table WHERE created_at > '2025-01-01'; -- Data loss
```

### 3. Rollback Testing

Test rollbacks in development before applying to production.

## Migration Testing

### 1. Local Testing

```bash
# Reset local database
npx supabase db reset --local

# Apply migrations
npx supabase db push --local

# Verify schema
npx supabase db diff --local
```

### 2. Integration Testing

- Test application functionality after migrations
- Verify RLS policies work correctly
- Check performance impact of new indexes

## Emergency Procedures

### Migration Fails in Production

1. **Don't panic** - Supabase migrations are transactional
2. Check the error message
3. Create a fix migration (don't modify existing ones)
4. Test fix locally
5. Apply fix to production

### Migration Conflicts

1. Identify conflicting migrations
2. Mark problematic migrations as "reverted" in history
3. Create consolidated migration
4. Apply consolidated migration

### Database Inconsistency

1. Pull remote schema: `supabase db pull --linked`
2. Compare with local migrations
3. Repair history: `supabase migration repair --status applied <migration_id>`
4. Apply missing migrations

## Migration File Structure

```
supabase/migrations/
├── 20250928012435_apply_complete_schema.sql          # Initial schema
├── 20250928013235_add_profiles_insert_policy.sql     # Policy additions
├── 20251011000000_add_personnel_system.sql           # Feature additions
├── 20251011000001_rollback_personnel_system.sql      # Rollbacks
├── 20251024000000_bulletproof_database_reconstruction.sql  # Emergency fixes
└── README.md                                         # This file
```

## Tools & Automation

### Migration Validation Script

Create scripts to validate migration integrity:

```bash
#!/bin/bash
# validate_migrations.sh
echo "Validating migration files..."

# Check naming convention
for file in supabase/migrations/*.sql; do
  if [[ ! $file =~ ^supabase/migrations/[0-9]{14}_.*\.sql$ ]]; then
    echo "❌ Invalid migration name: $file"
    exit 1
  fi
done

echo "✅ All migrations follow naming convention"
```

### Pre-commit Hooks

Add pre-commit hooks to validate migrations before commit.

## Monitoring & Maintenance

### Regular Audits

- Monthly: Review migration history for anomalies
- Quarterly: Test rollback procedures
- Annually: Consider schema consolidation

### Performance Monitoring

- Monitor query performance after index additions
- Watch for RLS policy performance issues
- Track migration execution times

## Conclusion

Following these standards ensures:

- **Reliability**: Migrations work consistently across environments
- **Maintainability**: Easy to understand and modify migrations
- **Safety**: Reduced risk of data loss or corruption
- **Debuggability**: Clear error messages and rollback procedures

Remember: Migrations are permanent. Test thoroughly and document carefully.
