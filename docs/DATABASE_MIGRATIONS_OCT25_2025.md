# Database Migrations - October 25, 2025

## Summary

Created database migrations for the social features infrastructure that were referenced in TypeScript services but missing from the database.

## New Migrations Created

### 1. **Notifications Table** (`20251025000001_add_notifications_table.sql`)

- **Purpose**: Stores in-app notifications for users
- **Features**:
  - Supports 4 notification types: `mention`, `comment_reply`, `reaction`, `announcement`
  - Links to related entities (announcements, comments, triggering users)
  - Read/unread tracking
  - Flexible JSONB data field for type-specific metadata
- **Helper Functions**:
  - `mark_all_notifications_read(user_id)` - Mark all unread notifications as read
  - `get_unread_notification_count(user_id)` - Get count of unread notifications
- **RLS Policies**: Users can only view/update their own notifications

### 2. **Mentions Table** (`20251025000002_add_mentions_table.sql`)

- **Purpose**: Stores @mentions in announcements and comments
- **Features**:
  - Links mentioned users to content where they were mentioned
  - Tracks position and context of mentions
  - Supports both announcement and comment mentions
  - Prevents duplicate mentions
- **Helper Functions**:
  - `get_user_mentions(user_id, limit, offset)` - Get all mentions for a user with pagination
- **RLS Policies**: Team members can view mentions in content they can access

## Existing Migrations (Already Applied)

These migrations already exist in the database:

- ✅ `20251106000001_add_team_announcements.sql` - Team announcements table
- ✅ `20251106000004_add_comment_reactions.sql` - Comment reactions table

## How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)

```bash
# Make sure you're in the project root
cd /Users/justindepierro/Documents/boxcall

# Apply all pending migrations
npx supabase db push

# Or apply a specific migration
npx supabase db push --include-all
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** > **Migrations**
3. Click **New Migration**
4. Copy the contents of each migration file
5. Run the migration

### Option 3: Using the Migration Script

```bash
# Run the Node.js migration script
node apply_migration.js supabase/migrations/20251025000001_add_notifications_table.sql
node apply_migration.js supabase/migrations/20251025000002_add_mentions_table.sql
```

## Verify Migrations Applied

After applying, verify the tables exist:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('notifications', 'mentions');

-- Check notifications table structure
\d notifications

-- Check mentions table structure
\d mentions

-- Test helper functions
SELECT get_unread_notification_count('YOUR_USER_ID_HERE');
```

## Update TypeScript Types

After applying migrations, regenerate TypeScript types:

```bash
# Generate types from Supabase
npx supabase gen types typescript --local > src/types/supabase-generated.ts

# Or if using remote database
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase-generated.ts
```

## Features Now Enabled

With these migrations applied, the following features will work:

1. **@Mentions in Announcements & Comments**
   - Users can @mention other team members
   - Mentions are tracked and linked to content
   - Services: `mentionsService.ts`

2. **In-App Notifications**
   - Notifications for mentions, replies, reactions, announcements
   - Unread notification tracking
   - Notification bell in UI
   - Services: `notificationsService.ts`

3. **Comment Reactions**
   - Already supported with existing migration
   - Services: `commentReactionsService.ts`

4. **Team Announcements**
   - Already supported with existing migration
   - Services: `announcementsService.ts`

## Next Steps

1. ✅ Apply the migrations to your Supabase database
2. ✅ Regenerate TypeScript types
3. ✅ Remove `@ts-expect-error` comments from service files:
   - `src/services/notificationsService.ts`
   - `src/services/mentionsService.ts`
4. ✅ Test the social features in the application
5. ✅ Monitor for any RLS policy issues

## Rollback (If Needed)

If you need to rollback these migrations:

```sql
-- Drop tables (will cascade delete all data)
DROP TABLE IF EXISTS mentions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_mentions CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_read CASCADE;
DROP FUNCTION IF EXISTS get_unread_notification_count CASCADE;
```

## Notes

- All tables have Row Level Security (RLS) enabled
- Policies ensure users can only access appropriate data
- Foreign key constraints maintain referential integrity
- Indexes are created for common query patterns
- Helper functions use `SECURITY DEFINER` for safe execution

## Migration Status

| Migration                                    | Status     | Date Created         | Applied    |
| -------------------------------------------- | ---------- | -------------------- | ---------- |
| `20251025000001_add_notifications_table.sql` | ✅ Created | Oct 25, 2025         | ⏳ Pending |
| `20251025000002_add_mentions_table.sql`      | ✅ Created | Oct 25, 2025         | ⏳ Pending |
| `20251106000001_add_team_announcements.sql`  | ✅ Exists  | Nov 6, 2025 (future) | ✅ Applied |
| `20251106000004_add_comment_reactions.sql`   | ✅ Exists  | Nov 6, 2025 (future) | ✅ Applied |

---

**Created**: October 25, 2025  
**Author**: GitHub Copilot  
**Purpose**: Complete social features infrastructure for BoxCall
