# Docker & Supabase CLI Setup Guide

## 🎯 Overview

This guide provides a bulletproof setup for using Supabase CLI and Docker with BoxCall.

## 📋 Prerequisites

### 1. Install Required Tools

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Supabase CLI
brew install supabase/tap/supabase

# Install Docker Desktop
brew install --cask docker

# Install PostgreSQL client tools (for psql)
brew install postgresql@15
```

### 2. Verify Installations

```bash
# Check Supabase CLI version
supabase --version
# Expected: >= 1.100.0

# Check Docker version
docker --version
# Expected: >= 24.0.0

# Check psql version
psql --version
# Expected: >= 15.0
```

## 🔧 Supabase CLI Setup

### 1. Link Your Project

```bash
# Navigate to project root
cd /Users/justindepierro/Documents/boxcall

# Login to Supabase
supabase login

# Link to your remote project
supabase link --project-ref lvmuiqwihlpnwppdqqfl
```

### 2. Configure Environment Variables

Your `.env` file should contain:

```bash
# Supabase Remote Configuration
VITE_SUPABASE_URL=https://lvmuiqwihlpnwppdqqfl.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Database Connection (use pooler for stability)
DATABASE_URL=postgresql://postgres.lvmuiqwihlpnwppdqqfl:N3v3rsayd1e1715@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require

# SuperAdmin Configuration
VITE_SUPER_ADMIN_EMAIL=justindepierro@gmail.com
SUPER_ADMIN_EMAIL=justindepierro@gmail.com

# Dev Mode Configuration (IMPORTANT!)
VITE_DEFAULT_DEV_MODE=production
VITE_FORCE_DEV_MODE=reset

# Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Quick Reference Commands

```bash
# Check connection status
supabase status

# View remote database schema
supabase db pull

# Apply local migrations to remote
supabase db push

# Reset remote database (DANGER!)
supabase db reset --linked

# View database logs
supabase logs db

# Open Supabase Dashboard
supabase dashboard
```

## 🐳 Docker Setup (Local Development)

### 1. Start Local Supabase Stack

```bash
# Initialize Supabase (first time only)
supabase init

# Start all services (Postgres, Auth, Storage, etc.)
supabase start

# This will output:
# - API URL: http://localhost:54321
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
# - Anon Key: (local anon key)
# - Service Role Key: (local service role key)
```

### 2. Configure Local Environment

Create `.env.local` for local development:

```bash
# Local Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key_from_supabase_start

# Local Database
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# SuperAdmin Configuration (same as production)
VITE_SUPER_ADMIN_EMAIL=justindepierro@gmail.com
SUPER_ADMIN_EMAIL=justindepierro@gmail.com

# Dev Mode
VITE_DEFAULT_DEV_MODE=production
VITE_FORCE_DEV_MODE=none
```

### 3. Docker Commands Reference

```bash
# Stop local Supabase
supabase stop

# Stop and remove all data (clean slate)
supabase stop --no-backup

# View Docker containers
docker ps

# View logs for specific service
docker logs supabase_db_boxcall
docker logs supabase_auth_boxcall

# Restart a specific service
docker restart supabase_db_boxcall
```

## 🗄️ Database Management

### 1. Connecting with psql

```bash
# Connect to remote database (production)
psql "postgresql://postgres.lvmuiqwihlpnwppdqqfl:N3v3rsayd1e1715@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Connect to local database
psql "postgresql://postgres:postgres@localhost:54322/postgres"
```

### 2. Common psql Commands

```sql
-- List all tables
\dt

-- Describe a table
\d table_name

-- List all functions
\df

-- List all policies
\dp

-- Execute SQL file
\i path/to/file.sql

-- Exit psql
\q
```

### 3. Useful Queries

```sql
-- Check your user
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'justindepierro@gmail.com';

-- Check team memberships
SELECT tm.team_id, tm.status, tm.team_role, t.name as team_name
FROM public.team_members tm
JOIN public.teams t ON t.id = tm.team_id
WHERE tm.user_id = 'your_user_id_here';

-- Check RLS helper functions
\df public.is_active_team_member

-- Test RLS helper function
SELECT public.is_active_team_member(
  'your_user_id'::uuid,
  'team_id'::uuid
) as is_member;
```

## 🔄 Migration Workflow

### 1. Create New Migration

```bash
# Create new migration file
supabase migration new my_migration_name

# This creates: supabase/migrations/TIMESTAMP_my_migration_name.sql
```

### 2. Write Migration

Edit the generated SQL file:

```sql
-- Example migration
BEGIN;

-- Add new column
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS new_field TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_plays_new_field
ON plays(new_field);

COMMIT;
```

### 3. Test Migration Locally

```bash
# Start local stack
supabase start

# Apply migration locally
supabase db reset

# Verify it worked
supabase db diff
```

### 4. Apply to Production

```bash
# Push to remote database
supabase db push

# Verify status
supabase db pull
```

## 🚨 Troubleshooting

### Issue: "Connection refused" when using Supabase CLI

```bash
# Check if Docker is running
docker ps

# If not, start Docker Desktop app
open /Applications/Docker.app

# Then start Supabase
supabase start
```

### Issue: "Migration already applied"

```bash
# View migration history
supabase migration list

# If needed, repair migration status
supabase migration repair --status applied TIMESTAMP_migration_name
```

### Issue: "Permission denied" errors in database

```bash
# Check if RLS helper functions exist
psql "$DATABASE_URL" -c "\df public.is_active_team_member"

# If missing, apply the fix migration
psql "$DATABASE_URL" -f supabase/migrations/20251023160001_fix_team_access_policies.sql
```

### Issue: Can't see teams/playbooks in UI

```bash
# 1. Clear browser localStorage
# Open DevTools (F12) > Application > Local Storage > Clear

# 2. Check environment variables
cat .env | grep SUPER_ADMIN

# 3. Verify database connection
npm run dev
# Check browser console for errors

# 4. Run the fix script
./scripts/fix-superadmin.sh
```

## 🎯 Best Practices

### 1. Always Use Pooler for Production

```bash
# ✅ GOOD (pooler - stable, handles connection pooling)
DATABASE_URL=postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres

# ❌ BAD (direct - can fail, limited connections)
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
```

### 2. Keep Migrations Idempotent

```sql
-- ✅ GOOD (safe to run multiple times)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ❌ BAD (fails on second run)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN;
CREATE INDEX idx_users_email ON users(email);
```

### 3. Test Locally First

```bash
# 1. Start local stack
supabase start

# 2. Test migration
supabase db reset

# 3. Verify application works
npm run dev

# 4. Only then push to production
supabase db push
```

### 4. Backup Before Major Changes

```bash
# Create backup
supabase db dump -f backup.sql

# Create backup with data
supabase db dump --data-only -f backup_data.sql
```

## 📚 Additional Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Docker Desktop Docs](https://docs.docker.com/desktop/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [BoxCall Architecture Docs](./docs/ARCHITECTURE.md)

## 🆘 Getting Help

If you encounter issues not covered here:

1. Check the Supabase logs: `supabase logs db`
2. Check Docker logs: `docker logs supabase_db_boxcall`
3. Review recent migrations: `ls -la supabase/migrations/`
4. Run the fix script: `./scripts/fix-superadmin.sh`

---

Last Updated: October 23, 2025
