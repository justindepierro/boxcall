# Avatar Storage Setup Guide

**Date**: October 16, 2025  
**Priority**: 🔴 Critical - Required for avatar uploads

---

## 🚨 Current Issue

Avatar uploads are failing because the `avatars` storage bucket doesn't exist in Supabase.

**Error**: Silent failure - avatar file is selected but never uploads  
**Code Reference**: `ProfilePage.tsx:362` - `supabase.storage.from("avatars")`

---

## ✅ Setup Instructions

### Step 1: Create Storage Bucket

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard
   - Select your project: BoxCall

2. **Navigate to Storage**:
   - Click "Storage" in left sidebar
   - Click "Create a new bucket"

3. **Bucket Configuration**:

   ```
   Name: avatars
   Public: ✅ Yes (checked)
   File size limit: 5242880 (5MB)
   Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
   ```

4. **Click "Create bucket"**

---

### Step 2: Set Up Storage Policies

After creating the bucket, click on the `avatars` bucket, then click "Policies" tab.

#### Policy 1: Allow Users to Upload Their Own Avatar

```sql
-- Policy Name: Users can upload own avatar
-- Operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**What this does**: Allows authenticated users to upload files to their own folder (`/avatars/{user_id}/`)

---

#### Policy 2: Allow Users to Update Their Own Avatar

```sql
-- Policy Name: Users can update own avatar
-- Operation: UPDATE
-- Target roles: authenticated

CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**What this does**: Allows users to replace their existing avatar

---

#### Policy 3: Public Read Access

```sql
-- Policy Name: Public avatar read access
-- Operation: SELECT
-- Target roles: public

CREATE POLICY "Public avatar read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

**What this does**: Allows anyone to view avatars (needed for displaying profile pictures)

---

#### Policy 4: Allow Users to Delete Their Own Avatar

```sql
-- Policy Name: Users can delete own avatar
-- Operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**What this does**: Allows users to remove their avatar

---

### Step 3: Verify Setup

#### Test Upload (via Console)

1. Open browser DevTools console
2. Run this test code:

```javascript
// Test avatar upload
const testFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
const userId = "YOUR_USER_ID"; // Replace with actual user ID

const { data, error } = await supabase.storage
  .from("avatars")
  .upload(`${userId}/test.jpg`, testFile);

if (error) {
  console.error("Upload failed:", error);
} else {
  console.log("Upload successful:", data);
}

// Get public URL
const { data: urlData } = supabase.storage
  .from("avatars")
  .getPublicUrl(`${userId}/test.jpg`);

console.log("Public URL:", urlData?.publicUrl);
```

**Expected Result**: Upload succeeds and returns public URL

---

#### Test in Profile Page

1. Log in to your app
2. Navigate to `/profile`
3. Click "Choose File" under Profile Picture
4. Select an image file
5. Click "Save Changes"
6. **Expected**: Avatar updates and new image is displayed

---

## 🔍 Troubleshooting

### Issue: "Bucket not found" error

**Solution**: Make sure you created the bucket with the exact name `avatars` (lowercase, no spaces)

---

### Issue: "Access denied" error

**Solution**: Check that storage policies are applied correctly. Run this query to verify:

```sql
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';
```

You should see 4 policies (INSERT, UPDATE, SELECT, DELETE).

---

### Issue: Avatar uploads but doesn't display

**Possible causes**:

1. Public read policy not applied
2. Incorrect public URL generation
3. CORS issues

**Solution**:

1. Verify public read policy exists
2. Check that `getPublicUrl()` returns a valid URL
3. Check browser console for CORS errors

---

### Issue: Upload fails with large files

**Solution**:

- Verify file size limit is set to 5MB (5242880 bytes)
- Check that file is actually under 5MB
- Add file size validation in code (already in roadmap Phase 2.1)

---

### Issue: Avatar URL has cache issues

**Problem**: Old avatar still shows after uploading new one

**Solution**: Use unique filenames with timestamps (already in roadmap Phase 2.1):

```typescript
const fileExt = avatarFile.name.split(".").pop();
const fileName = `${Date.now()}.${fileExt}`;
const filePath = `${profile.id}/${fileName}`;
```

---

## 📂 File Structure

After setup, storage structure will be:

```
avatars/
├── {user_id_1}/
│   ├── 1697472000000.jpg  (timestamp-based filename)
│   └── 1697472123456.png
├── {user_id_2}/
│   └── 1697472234567.jpg
└── {user_id_3}/
    └── 1697472345678.png
```

Each user has their own folder (`user_id`), and files are named with timestamps to avoid caching issues.

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Bucket `avatars` exists
- [ ] Bucket is marked as Public
- [ ] File size limit is 5MB
- [ ] Allowed MIME types include: jpeg, png, gif, webp
- [ ] 4 storage policies are applied:
  - [ ] INSERT policy (authenticated users)
  - [ ] UPDATE policy (authenticated users)
  - [ ] SELECT policy (public)
  - [ ] DELETE policy (authenticated users)
- [ ] Test upload works via console
- [ ] Test upload works in Profile page
- [ ] Avatar displays after upload
- [ ] Public URL is accessible

---

## 🔗 Related Files

- `src/pages/ProfilePage.tsx` - Profile page with avatar upload
- `PROFILE_SYSTEM_ROADMAP.md` - Complete profile system roadmap
- `supabase/migrations/20251016000004_add_profile_fields.sql` - Profile fields migration

---

## 📝 Next Steps

After setting up storage:

1. ✅ Apply `20251016000004_add_profile_fields.sql` migration
2. ✅ Test profile save with all fields
3. ✅ Test avatar upload with coach account
4. ✅ Test avatar upload with player account
5. ⏳ Implement Phase 2 improvements (error handling, preview)

---

**Last Updated**: October 16, 2025
