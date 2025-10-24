# Run Database Migrations Guide

## Quick Steps

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

2. **Run Migration 1: Storage Bucket**
   - Open: `supabase/migrations/20251106000006_create_announcement_images_bucket.sql`
   - Copy entire contents
   - Paste into Supabase SQL Editor
   - Click "Run" (bottom right)
   - ✅ Should see: "Success. No rows returned"

3. **Run Migration 2: Announcements Rich Content**
   - Open: `supabase/migrations/20251106000007_add_rich_content_to_announcements.sql`
   - Copy entire contents
   - Paste into Supabase SQL Editor
   - Click "Run"
   - ✅ Should see: "Success. No rows returned"

4. **Run Migration 3: Comments Rich Content**
   - Open: `supabase/migrations/20251106000008_add_rich_content_to_comments.sql`
   - Copy entire contents
   - Paste into Supabase SQL Editor
   - Click "Run"
   - ✅ Should see: "Success. No rows returned"

## Verify Migrations

After running, verify in Supabase:

### Storage Bucket

1. Go to: Storage → Buckets
2. Should see: `announcement-images` bucket (public)
3. Try uploading a test image

### Table Columns

1. Go to: Table Editor → team_announcements
2. Should see new column: `content_json` (jsonb, nullable)
3. Go to: Table Editor → announcement_comments
4. Should see new column: `content_json` (jsonb, nullable)

## Troubleshooting

### "Bucket already exists"

- Safe to ignore - bucket was created previously
- Or: Delete bucket and re-run

### "Column already exists"

- Safe to ignore - migrations use `IF NOT EXISTS`

### Permission errors

- Make sure you're logged in as project owner
- Check RLS policies are correct

## What These Migrations Do

1. **Storage Bucket**: Creates secure bucket for inline images
   - 5MB file size limit
   - JPEG, PNG, GIF, WebP allowed
   - Public read access
   - Team members can upload

2. **Rich Content Columns**: Adds JSONB columns for TipTap content
   - Stores formatted text + inline images
   - Backward compatible (keeps plain text)
   - Indexed for performance

## After Running

Once all 3 migrations are run:

- ✅ Drag & drop images into announcements
- ✅ Paste images from clipboard
- ✅ Rich text formatting (bold, italic, lists)
- ✅ Same features in comments
- ✅ Automatic image resizing & compression
- ✅ Blazing fast performance
