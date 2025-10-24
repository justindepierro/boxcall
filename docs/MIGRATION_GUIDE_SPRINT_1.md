# Database Migration Guide - Sprint 1 Features

## 📋 Overview

Two migrations need to be applied to enable Sprint 1 features:
1. **007_create_notifications.sql** - Enables @mention notifications
2. **008_add_announcement_status.sql** - Enables draft mode

## 🚀 How to Apply Migrations

### Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: BoxCall

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Apply Migration 007 (Notifications)**
   ```bash
   # Copy entire content from:
   database/migrations/007_create_notifications.sql
   
   # Paste into SQL Editor
   # Click "Run" or press Cmd+Enter
   ```
   
   **Expected Result:**
   - Creates `notifications` table
   - Creates 5 indexes
   - Creates 4 RLS policies
   - Creates update trigger
   - You should see: "Success. No rows returned"

4. **Apply Migration 008 (Draft Mode)**
   ```bash
   # Copy entire content from:
   database/migrations/008_add_announcement_status.sql
   
   # Paste into SQL Editor
   # Click "Run" or press Cmd+Enter
   ```
   
   **Expected Result:**
   - Adds `status` column to `team_announcements`
   - Adds `scheduled_for` column
   - Creates 2 indexes
   - Updates RLS policy
   - You should see: "Success. No rows returned"

---

## ✅ Verification Steps

After applying migrations, verify they worked:

### Test Notifications Table
```sql
-- Should return the notifications table schema
SELECT * FROM information_schema.tables 
WHERE table_name = 'notifications';

-- Should return 0 rows (table exists but empty)
SELECT COUNT(*) FROM notifications;
```

### Test Draft Mode Columns
```sql
-- Should show new columns: status, scheduled_for
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'team_announcements' 
  AND column_name IN ('status', 'scheduled_for');

-- Should return all announcements with status 'published' (default)
SELECT id, title, status 
FROM team_announcements 
LIMIT 5;
```

---

## 🔧 Troubleshooting

### Issue: "relation already exists"
**Solution:** Migration already applied. Check if table/column exists.

### Issue: "permission denied"
**Solution:** You need admin access to the database. Contact project owner.

### Issue: "syntax error"
**Solution:** Make sure you copied the ENTIRE file content, including all comments.

### Issue: RLS policy conflicts
```sql
-- Drop existing policies if needed
DROP POLICY IF EXISTS "Users can view team announcements" ON team_announcements;

-- Then re-run the migration
```

---

## 🎯 What Each Migration Enables

### Migration 007: Notifications
**Enables:**
- @mention notifications in announcements
- NotificationBell component shows unread count
- Dropdown shows recent 10 notifications
- Mark as read / delete actions
- Real-time updates every 30 seconds

**User Experience:**
- Type `@` in announcement editor → Select user
- On publish → Mentioned user gets notification
- Bell icon shows red badge with count
- Click bell → See notification list
- Click notification → Navigate to announcement

---

### Migration 008: Draft Mode
**Enables:**
- Save announcements as drafts
- Drafts visible only to author
- Schedule posts for future publish
- Filter between draft/published/scheduled

**User Experience:**
- Create announcement → Save as draft (not visible to team)
- Return later → Continue editing draft
- Publish when ready → Changes status to 'published'
- Set scheduled_for → Auto-publish at specified time (requires cron job)

---

## 📊 Migration Status Tracking

| Migration | File | Status | Applied Date | Notes |
|-----------|------|--------|--------------|-------|
| 007 | create_notifications.sql | ⏳ Pending | - | Enables @mentions |
| 008 | add_announcement_status.sql | ⏳ Pending | - | Enables drafts |

**Update this table after applying migrations!**

---

## 🔄 Rollback (If Needed)

### Rollback Migration 008
```sql
-- Remove new columns
ALTER TABLE team_announcements 
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS scheduled_for;

-- Restore original RLS policy
DROP POLICY IF EXISTS "Users can view team announcements" ON team_announcements;
CREATE POLICY "Users can view team announcements"
  ON team_announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_announcements.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'active'
    )
  );
```

### Rollback Migration 007
```sql
-- Drop notifications table (cascade deletes all related data)
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_notifications_updated_at() CASCADE;
```

**⚠️ WARNING:** Rollback will delete all notifications and drafts!

---

## 📝 Post-Migration Checklist

- [ ] Migration 007 applied successfully
- [ ] Migration 008 applied successfully
- [ ] Notifications table exists and has RLS policies
- [ ] team_announcements has status and scheduled_for columns
- [ ] Test creating announcement with @mention
- [ ] Verify notification appears in bell dropdown
- [ ] Test saving draft (visible only to author)
- [ ] Test publishing draft (visible to team)
- [ ] All existing announcements still visible
- [ ] No errors in browser console

---

## 🆘 Need Help?

If migrations fail or you encounter issues:

1. **Check Supabase logs** - SQL Editor shows error messages
2. **Verify database connection** - Ensure project is active
3. **Check existing schema** - Tables might already exist
4. **Contact team** - Share error message from SQL Editor

---

**Last Updated:** October 24, 2025  
**Sprint:** Sprint 1 - Announcements Enhancement  
**Related:** `docs/SPRINT_1_COMPLETE.md`
