# Supabase Storage Setup Guide: play-diagrams Bucket

## Quick Start

This bucket stores play diagram images (screenshots, photos, whiteboard captures) uploaded by coaches.

## Dashboard Setup Steps

### 1. Create the Bucket

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/_/storage/buckets)
2. Click **"Create a new bucket"**
3. Configure:
   - **Bucket name**: `play-diagrams`
   - **Public bucket**: ❌ **NO** (keep private, RLS-protected)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**:
     ```
     image/jpeg
     image/png
     image/webp
     image/heic
     ```
4. Click **"Create bucket"**

### 2. Apply RLS Policies

1. Navigate to **Storage** → **Policies**
2. Select the `play-diagrams` bucket
3. Click **"New Policy"** for each policy below
4. Run the SQL from `database/migrations/20251127130000_create_play_diagrams_storage_bucket.sql`

**Policy Names:**

- ✅ Team members can upload play diagrams (INSERT)
- ✅ Team members can view play diagrams (SELECT)
- ✅ Team members can update play diagrams (UPDATE)
- ✅ Team members can delete play diagrams (DELETE)

### 3. Verify Setup

Run this query in SQL Editor:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE name = 'play-diagrams';

-- Check policies
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%play diagrams%';
```

Expected: 1 bucket + 4 policies

---

## File Structure

### Path Format

```
plays/{playbook_id}/{play_id}/diagram-{timestamp}.{extension}
```

### Example Path

```
plays/pb-uuid-123/play-uuid-456/diagram-1732737600.jpg
```

### Benefits

- ✅ **Team isolation**: RLS policies check playbook ownership
- ✅ **Easy cleanup**: Delete all files when play/playbook deleted
- ✅ **No collisions**: Timestamp ensures unique filenames
- ✅ **Organized**: Hierarchical structure mirrors database

---

## Usage in App

### ImageUpload Component Props

```tsx
<ImageUpload
  value={play.diagram_image_url || undefined}
  onChange={async (url) => {
    await handleInlineSave("diagram_image_url", url || null);
  }}
  bucket="play-diagrams"
  path={`plays/${play.playbook_id}/${play.id}`}
  maxSizeBytes={5 * 1024 * 1024}
  acceptedFormats={["image/jpeg", "image/png", "image/webp", "image/heic"]}
/>
```

### File Upload Flow

1. **User selects image** (drag-drop, file picker, camera)
2. **ImageUpload validates** file size + format
3. **Upload to Supabase Storage** at `plays/{playbook_id}/{play_id}/diagram-{timestamp}.jpg`
4. **RLS policy checks** user is team member with access to playbook
5. **Get public URL** from Supabase Storage
6. **Save URL to database** in `plays.diagram_image_url` column
7. **Show preview** in PlayCard expanded details

### File Deletion Flow

1. **User clicks delete** on diagram preview
2. **Delete from storage** via Supabase Storage API
3. **Clear database field** set `plays.diagram_image_url = NULL`
4. **RLS policy checks** user has access to delete

---

## Security

### RLS Protection

- ✅ **Team-based access**: Only team members can access their team's play diagrams
- ✅ **Playbook ownership**: Policies verify user's team owns the playbook
- ✅ **No public access**: Bucket is private, requires authentication
- ✅ **CRUD permissions**: Separate policies for insert/select/update/delete

### File Validation

- ✅ **Size limit**: 5MB max (prevents storage abuse)
- ✅ **MIME types**: Only images (jpeg, png, webp, heic)
- ✅ **Path structure**: Enforced by app logic (not policy)
- ✅ **Timestamps**: Prevents filename collisions

---

## Cleanup Operations

### Delete Play Diagram

```sql
-- Delete single play's diagrams
DELETE FROM storage.objects
WHERE bucket_id = 'play-diagrams'
  AND name LIKE 'plays/{playbook_id}/{play_id}/%';
```

### Delete Playbook Diagrams

```sql
-- Delete all plays' diagrams in playbook
DELETE FROM storage.objects
WHERE bucket_id = 'play-diagrams'
  AND name LIKE 'plays/{playbook_id}/%';
```

### Cleanup Orphaned Files

```sql
-- Find files with no matching play in database
SELECT o.name
FROM storage.objects o
WHERE o.bucket_id = 'play-diagrams'
  AND NOT EXISTS (
    SELECT 1 FROM plays p
    WHERE o.name LIKE 'plays/%/' || p.id || '/%'
  );
```

---

## Monitoring

### Storage Usage Query

```sql
-- Total storage used by play-diagrams bucket
SELECT
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint as total_bytes,
  ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_mb
FROM storage.objects
WHERE bucket_id = 'play-diagrams'
GROUP BY bucket_id;
```

### Recent Uploads

```sql
-- Files uploaded in last 24 hours
SELECT
  name,
  metadata->>'size' as size_bytes,
  created_at
FROM storage.objects
WHERE bucket_id = 'play-diagrams'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Issue: Upload fails with "Permission denied"

**Cause**: RLS policy not matching user's team membership

**Fix**: Verify user is in `team_members` table with access to playbook's team

```sql
-- Check user's team membership
SELECT tm.team_id, t.name, tm.role
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
WHERE tm.user_id = auth.uid();
```

### Issue: Files not appearing in app

**Cause**: `diagram_image_url` not saved to database

**Fix**: Check database column value

```sql
-- Check play's diagram URL
SELECT id, play_name, diagram_image_url
FROM plays
WHERE id = '{play_id}';
```

### Issue: "File too large" error

**Cause**: File exceeds 5MB limit

**Fix**: Compress image before upload or increase bucket limit in dashboard

---

## Performance Notes

- **Image loading**: Use lazy loading for diagram previews
- **Thumbnail generation**: Consider generating thumbnails for faster grid view
- **CDN**: Supabase Storage includes CDN for fast global access
- **Caching**: Browser caches images automatically via public URLs

---

## Migration Checklist

- [ ] Create `play-diagrams` bucket in Supabase Dashboard
- [ ] Set bucket to private (not public)
- [ ] Configure 5MB file size limit
- [ ] Set allowed MIME types (jpeg, png, webp, heic)
- [ ] Apply 4 RLS policies from migration SQL
- [ ] Run verification queries
- [ ] Test upload from AddNewPlayModal
- [ ] Test upload from PlayCard details
- [ ] Test image preview in expanded PlayCard
- [ ] Test delete functionality
- [ ] Monitor storage usage

---

## Files Referenced

- **Migration SQL**: `database/migrations/20251127130000_create_play_diagrams_storage_bucket.sql`
- **ImageUpload Component**: `src/components/ui/ImageUpload/ImageUpload.tsx`
- **PlayCard Integration**: `src/components/playbook/play-card/PlayCardDetails.tsx`
- **AddNewPlayModal Integration**: `src/components/playbook/AddNewPlayModal.tsx`
