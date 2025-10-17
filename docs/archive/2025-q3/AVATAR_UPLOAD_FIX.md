# Avatar Upload Troubleshooting Guide

**Date**: October 16, 2025  
**Status**: 🔴 Active Issues

---

## 🚨 Current Errors

Based on your screenshot, you have **2 active errors**:

### Error 1: Avatar Upload Failed (RLS Policy) 🔴

```
Avatar upload failed:
ErrorTrackingService.tsx:140
new row violates row-level security policy
```

**Root Cause**: Storage RLS policies are incorrectly configured or missing

**Impact**: Avatar files cannot be uploaded to storage

---

### Error 2: Malformed Array Literal 🔴

```
Failed to update profile: malformed array literal:
"NFHS Level 3, First Aid, CPR, DASA, USATF Level 1"
```

**Root Cause**: The `certifications` field might be an array type in database but code sends string

**Impact**: Profile save fails when certifications field has data

---

## ✅ Fix #1: Avatar Upload RLS Policy

### Step 1: Run RLS Fix Migration

In Supabase SQL Editor, run:

```sql
-- File: supabase/migrations/20251016000005_fix_avatar_rls.sql

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Policy 1: INSERT - Allow users to upload to their own folder
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: UPDATE - Allow users to replace their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: SELECT - Allow public read access
CREATE POLICY "Public avatar read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 4: DELETE - Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 2: Verify Policies Created

```sql
SELECT
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';
```

**Expected Result**: 4 policies listed (INSERT, UPDATE, SELECT, DELETE)

---

## ✅ Fix #2: Certifications Array Issue

### Step 1: Check Data Type

Run this in Supabase SQL Editor:

```sql
-- Check column type
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'certifications';
```

**Expected**: `data_type` should be `text` (not `array` or `text[]`)

---

### Step 2: If It's An Array Type, Convert It

If the query above shows `ARRAY` or `text[]`, run this fix:

```sql
-- Convert array column to text
ALTER TABLE profiles
ALTER COLUMN certifications TYPE TEXT
USING array_to_string(certifications::text[], ', ');
```

---

### Step 3: Clear Your Current Certifications Data (Temporary)

If the fix above doesn't work, temporarily clear your certifications data:

```sql
-- Clear certifications for your user only
UPDATE profiles
SET certifications = NULL
WHERE email = 'justindepierro@gmail.com';
```

Then try saving your profile again without certifications data.

---

## 🧪 Testing Steps

### Test 1: Avatar Upload

1. **Verify bucket exists**:
   - Supabase Dashboard → Storage
   - Should see `avatars` bucket
   - Should show "Public" badge

2. **Verify policies exist**:

   ```sql
   SELECT COUNT(*) FROM storage.policies WHERE bucket_id = 'avatars';
   ```

   - Should return `4`

3. **Test upload**:
   - Go to `/profile`
   - Click "Choose File"
   - Select image
   - Click "Save Changes"
   - **Expected**: No RLS error, avatar uploads

4. **Verify file in storage**:
   - Supabase Dashboard → Storage → avatars
   - Should see folder with your user ID
   - Should see uploaded image file

---

### Test 2: Profile Save

1. **Clear certifications temporarily**:
   - Remove text from Certifications field
   - Click "Save Changes"
   - **Expected**: Profile saves successfully

2. **Add certifications back gradually**:
   - Add simple text: `NFHS Certified`
   - Click "Save Changes"
   - **Expected**: Saves successfully

3. **Add full certifications**:
   - Add: `NFHS Level 3, First Aid, CPR, DASA, USATF Level 1`
   - Click "Save Changes"
   - **Expected**: Saves successfully (after fix applied)

---

## 🔍 Additional Debugging

### Check Current User ID

In browser console:

```javascript
const { data } = await supabase.auth.getUser();
console.log("User ID:", data.user.id);
```

This should match your folder name in storage.

---

### Check Storage Bucket Configuration

In Supabase Dashboard:

1. Storage → avatars → Settings
2. Verify:
   - ✅ Public bucket
   - ✅ 5MB file size limit
   - ✅ Allowed MIME types include: image/jpeg, image/png, image/gif

---

### Check Avatar Upload Code

The upload path should be: `{user_id}/{filename}`

Example: `7afcafe0-0154-4787-9752-957fa2372d0/{timestamp}.jpg`

Verify in browser DevTools Network tab:

1. Select avatar file
2. Click Save
3. Look for `POST` request to storage API
4. Check request path includes your user ID

---

## 🚨 Common Issues & Solutions

### Issue: "Policy with name already exists"

**Solution**: Drop policies first before creating:

```sql
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
```

---

### Issue: "auth.uid() returns null"

**Solution**: Make sure you're logged in:

```sql
SELECT auth.uid(), auth.role();
```

Should return your user ID and 'authenticated' role.

---

### Issue: "Folder name extraction fails"

**Problem**: `(storage.foldername(name))[1]` returns wrong value

**Debug**:

```sql
-- Test with sample path
SELECT (storage.foldername('7afcafe0-0154-4787-9752-957fa2372d0/avatar.jpg'))[1];
```

Should return: `7afcafe0-0154-4787-9752-957fa2372d0`

---

### Issue: Avatar uploads but doesn't display

**Solutions**:

1. Check browser console for image load errors
2. Verify public URL is correct
3. Check CORS settings in Supabase
4. Hard refresh browser (Cmd+Shift+R)
5. Clear browser cache

---

## 📋 Complete Fix Checklist

Run these in order:

- [ ] **1. Fix RLS Policies**

  ```sql
  -- Run: supabase/migrations/20251016000005_fix_avatar_rls.sql
  ```

- [ ] **2. Verify 4 policies exist**

  ```sql
  SELECT COUNT(*) FROM storage.policies WHERE bucket_id = 'avatars';
  ```

- [ ] **3. Check certifications data type**

  ```sql
  SELECT data_type FROM information_schema.columns
  WHERE table_name = 'profiles' AND column_name = 'certifications';
  ```

- [ ] **4. If array type, convert to text**

  ```sql
  ALTER TABLE profiles ALTER COLUMN certifications TYPE TEXT;
  ```

- [ ] **5. Test avatar upload**
  - Go to profile page
  - Select image
  - Save
  - Check for errors

- [ ] **6. Test profile save**
  - Update display name
  - Add/update certifications
  - Save
  - Check for errors

- [ ] **7. Verify avatar displays**
  - Check if avatar shows in profile
  - Reload page
  - Check if avatar persists

---

## 🎯 Expected Results After Fixes

### Success Indicators

1. ✅ No "violates row-level security policy" error
2. ✅ No "malformed array literal" error
3. ✅ Avatar file uploads successfully
4. ✅ Avatar displays in profile page
5. ✅ Profile saves with all fields
6. ✅ Success message: "Profile updated successfully!"

### Console Should Show

```
Avatar uploaded successfully: https://[project].supabase.co/storage/v1/object/public/avatars/[user-id]/[timestamp].jpg
Profile updated successfully!
```

---

## 📞 If Still Having Issues

If errors persist after applying fixes:

1. **Share the output of**:

   ```sql
   -- Check policies
   SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

   -- Check certifications type
   SELECT data_type FROM information_schema.columns
   WHERE table_name = 'profiles' AND column_name = 'certifications';

   -- Check your user ID
   SELECT auth.uid();
   ```

2. **Check browser console** for full error stack trace

3. **Check Supabase logs**:
   - Dashboard → Logs → API Logs
   - Look for storage-related errors

---

**Last Updated**: October 16, 2025  
**Status**: Awaiting fix application
