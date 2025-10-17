# Role System Migration - Step by Step Guide

## 🎯 Overview

We've generated SQL migration files that need to be run in Supabase's SQL Editor. This is the cleanest approach that won't create hundreds of tables.

## 📁 Generated Files

- `database/migrations/2025-09-29T01-01-28_role_system_migration.sql` - Schema changes
- `database/migrations/2025-09-29T01-01-28_migrate_role_data.sql` - Data migration

## 🚀 Step-by-Step Execution

### Step 1: Run Schema Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/lvmuiqwihlpnwppdqqfl)
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `database/migrations/2025-09-29T01-01-28_role_system_migration.sql`
5. Paste into the SQL Editor
6. Click "Run" (or Cmd+Enter)

### Step 2: Run Data Migration

1. In the same SQL Editor, create another new query
2. Copy the contents of `database/migrations/2025-09-29T01-01-28_migrate_role_data.sql`
3. Paste and run

### Step 3: Verify Migration

```bash
# Run our verification script
export VITE_SUPABASE_URL="https://lvmuiqwihlpnwppdqqfl.supabase.co"
export VITE_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic"
node scripts/verify-migration.js
```

## 🔍 What This Migration Does

### Adds to `profiles` table:

- `app_role` - Global app permissions (admin, head_coach, coach, free_coach, player, family)
- `is_admin` - Simple boolean for platform admin access
- `years_coaching` - Coaching experience in years
- `coaching_experience` - Text description of coaching background
- `education` - Educational background
- `coaching_philosophy` - Personal coaching philosophy
- `certifications` - Array of certifications
- `current_school` - Current school/organization
- `subscription_tier` - Subscription level (free, premium)
- `subscription_expires_at` - When subscription expires

### Adds to `team_members` table:

- `team_role` - Role within specific team (owner, head_coach, assistant_coach, etc.)
- `invited_by` - Who invited this person to the team

### Migrates your data:

- Your current `role: "admin"` becomes `app_role: "admin"` + `is_admin: true`
- Sets your `subscription_tier` to `"premium"`

## 🎉 Benefits After Migration

1. **Clean Admin Check**: `profile.is_admin` for platform admin features
2. **Flexible Team Roles**: Different roles in different teams
3. **Subscription Ready**: Built-in subscription tier management
4. **Coaching Fields**: All the coaching info fields you wanted
5. **No Extra Tables**: Uses existing `profiles` and `team_members` tables

## 🔄 Next Steps After Migration

1. Update TypeScript types
2. Update components to use `app_role` instead of `role`
3. Implement permission hooks
4. Test the application

## 🚨 Rollback Plan (if needed)

If something goes wrong, you can rollback by:

1. Keeping the old `role` column (we didn't drop it)
2. The app will continue working with the old `role` field
3. New columns can be dropped if needed

Ready to run the migration? 🚀
