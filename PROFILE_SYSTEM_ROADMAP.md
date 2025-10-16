# Profile System Roadmap & Audit

**Date**: October 16, 2025  
**Status**: 🔴 Critical Issues Found  
**Priority**: High

---

## 🚨 Critical Issues Identified

### 1. **Database Schema Mismatch** 🔴
**Issue**: ProfilePage.tsx references columns that don't exist in the database:
- `coaching_system`
- `coaching_experience`
- `education`
- `certifications`
- `coaching_philosophy`
- `specializations`
- `current_school`
- `previous_schools`
- `mentors`
- `years_coaching`
- `social_twitter`
- `social_instagram`
- `social_linkedin`
- `social_tiktok`
- `social_youtube`
- `personal_website`

**Current Schema** (database/schema.sql):
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'player',
  bio TEXT,
  phone TEXT,
  email TEXT,
  display_name TEXT,
  address TEXT,
  settings JSONB,
  position TEXT,
  jersey_number INTEGER,
  emergency_contact TEXT,
  emergency_phone TEXT,
  grade_level TEXT,
  height_inches INTEGER,
  weight_lbs INTEGER,
  is_active BOOLEAN,
  notification_preferences JSONB,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Result**: Save fails with "column does not exist" error  
**Priority**: 🔴 Critical - Blocking profile saves

---

### 2. **Avatar Storage Bucket Missing** 🔴
**Issue**: ProfilePage.tsx uploads to `supabase.storage.from("avatars")` but bucket doesn't exist

**Code Reference** (ProfilePage.tsx:362-376):
```typescript
const { error } = await supabase.storage
  .from("avatars")
  .upload(`${profile.id}/${avatarFile.name}`, avatarFile, {
    upsert: true,
  });
```

**Result**: Avatar upload fails silently, image never updates  
**Priority**: 🔴 Critical - Blocking avatar uploads

---

### 3. **Multiple Profile Pages Needed** 🟡
**Current State**: Single ProfilePage.tsx serves all roles (coach, player, admin)

**Problems**:
- Mixed concerns (coaching fields + player fields in same form)
- UI shows irrelevant fields based on role (player sees coaching fields if role check fails)
- No role-specific workflows
- Difficult to maintain and extend

**Priority**: 🟡 Medium - UX issue, not blocking

---

## 📋 Roadmap

### Phase 1: Emergency Fixes (Do Now) 🔴

#### 1.1 Create Missing Database Columns Migration
**File**: `supabase/migrations/20251016000004_add_profile_fields.sql`

```sql
-- Add coaching-specific fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS coaching_experience TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS coaching_philosophy TEXT,
ADD COLUMN IF NOT EXISTS specializations TEXT,
ADD COLUMN IF NOT EXISTS current_school TEXT,
ADD COLUMN IF NOT EXISTS previous_schools TEXT,
ADD COLUMN IF NOT EXISTS mentors TEXT,
ADD COLUMN IF NOT EXISTS coaching_system TEXT,
ADD COLUMN IF NOT EXISTS years_coaching INTEGER;

-- Add social media fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS social_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS social_tiktok TEXT,
ADD COLUMN IF NOT EXISTS social_youtube TEXT,
ADD COLUMN IF NOT EXISTS personal_website TEXT;

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_current_school ON profiles(current_school);

-- Update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON profiles;
CREATE TRIGGER update_profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();
```

**Action Items**:
- [ ] Create migration file
- [ ] Test migration locally
- [ ] Apply to production database
- [ ] Verify ProfilePage saves successfully
- [ ] Test with coach account
- [ ] Test with player account

---

#### 1.2 Create Avatars Storage Bucket
**Manual Setup** (Supabase Dashboard):

1. **Navigate to**: Supabase Dashboard → Storage
2. **Create bucket**: Name: `avatars`
3. **Settings**:
   - Public: ✅ Yes (for profile pictures)
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
4. **Policies**:

```sql
-- Policy 1: Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow public read access to avatars
CREATE POLICY "Public avatar read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 4: Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Action Items**:
- [ ] Create avatars bucket in Supabase Dashboard
- [ ] Set bucket to public
- [ ] Apply storage policies
- [ ] Test avatar upload with coach account
- [ ] Verify avatar displays after upload
- [ ] Test avatar replacement (re-upload)
- [ ] Test avatar deletion

---

### Phase 2: Improve Current ProfilePage (Quick Wins) 🟢

#### 2.1 Add Better Error Handling
**File**: `src/pages/ProfilePage.tsx`

**Changes**:
```typescript
// Replace current error handling with detailed error messages
const handleAvatarUpload = async (): Promise<string | null> => {
  if (!avatarFile || !profile?.id) return null;

  setAvatarUploading(true);
  try {
    // Validate file size
    if (avatarFile.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Avatar file size must be less than 5MB"
      });
      return null;
    }

    // Validate file type
    if (!avatarFile.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Avatar must be an image file (JPG, PNG, GIF, WebP)"
      });
      return null;
    }

    // Generate unique filename to avoid caching issues
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        upsert: true,
        contentType: avatarFile.type
      });

    if (error) {
      console.error("Avatar upload error:", error);
      setMessage({
        type: "error",
        text: `Avatar upload failed: ${error.message}`
      });
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      setMessage({
        type: "error",
        text: "Failed to get avatar URL after upload"
      });
      return null;
    }

    console.log("Avatar uploaded successfully:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error("Avatar upload exception:", error);
    setMessage({
      type: "error",
      text: "Unexpected error during avatar upload"
    });
    return null;
  } finally {
    setAvatarUploading(false);
  }
};
```

**Action Items**:
- [ ] Add file size validation
- [ ] Add file type validation
- [ ] Add unique filename generation (prevent caching)
- [ ] Add detailed error messages
- [ ] Add console logging for debugging
- [ ] Test upload with various file types
- [ ] Test upload with oversized files

---

#### 2.2 Add Avatar Preview Before Upload
**Enhancement**: Show preview of selected image before saving

```typescript
const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

// Add to file input handler
const handleAvatarFileChange = (file: File | null) => {
  setAvatarFile(file);
  
  if (file) {
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  } else {
    setAvatarPreview(null);
  }
};

// Update image display to show preview
{avatarPreview || profile.avatar_url ? (
  <img
    src={avatarPreview || profile.avatar_url}
    alt="Profile"
    className="w-full h-full object-cover rounded-xl"
  />
) : (
  // ... initials fallback
)}
```

**Action Items**:
- [ ] Add avatar preview state
- [ ] Add FileReader for image preview
- [ ] Update UI to show preview
- [ ] Add visual indicator when preview is shown
- [ ] Test preview with various image formats

---

#### 2.3 Fix Fallback Logic
**Issue**: Current fallback logic is incomplete

**Current Code** (Line 267-295):
```typescript
// If the update failed due to missing columns, try again with just the existing fields
if (error && error.message?.includes("column") && error.message?.includes("does not exist")) {
  // Fallback update with only existing fields
}
```

**Problem**: After Phase 1.1 migration, this fallback becomes dead code

**Solution**: Remove fallback after migration is confirmed successful

**Action Items**:
- [ ] After migration applied, remove fallback code
- [ ] Simplify update logic
- [ ] Add error logging for unexpected errors
- [ ] Add Sentry integration for error tracking (future)

---

### Phase 3: Role-Specific Profile Pages (Refactor) 🟡

#### 3.1 Architecture Decision
**Current**: Single ProfilePage.tsx with conditional rendering  
**Proposed**: Separate pages for each role

**Option A: Separate Page Components** (Recommended)
```
src/pages/
  ├── CoachProfilePage.tsx    # Coach-specific fields
  ├── PlayerProfilePage.tsx   # Player-specific fields
  └── AdminProfilePage.tsx    # Admin-specific fields

src/components/profile/
  ├── ProfileSharedLayout.tsx # Shared UI components
  ├── AvatarUpload.tsx        # Reusable avatar upload
  ├── BasicInfoSection.tsx    # Shared basic info
  ├── CoachingSection.tsx     # Coach-only fields
  ├── AthleticSection.tsx     # Player-only fields
  └── SocialLinksSection.tsx  # Shared social links
```

**Option B: Single Page with Role Modules** (Current approach, improved)
```
src/pages/ProfilePage.tsx       # Main wrapper
src/components/profile/
  ├── CoachingModule.tsx        # Coach-specific UI
  ├── AthleticModule.tsx        # Player-specific UI
  └── AdminModule.tsx           # Admin-specific UI
```

**Recommendation**: Option A - Separate pages for:
- Cleaner code organization
- Easier maintenance
- Better type safety
- Faster page loads (less conditional logic)
- Easier to add role-specific features

---

#### 3.2 Proposed Profile Pages Structure

##### A. **CoachProfilePage** (`/profile/coach`)
**Fields**:
- Basic Info (name, email, phone, bio, address)
- Avatar Upload
- Coaching Information:
  - Years of Experience
  - Current School
  - Previous Schools
  - Education
  - Certifications
  - Coaching Philosophy
  - Specializations
  - Coaching System Preference
  - Mentors/Influences
- Social Links
- Account Settings (password reset, notifications)

**UI Enhancements**:
- Coaching highlights/stats card
- Certification badges display
- Link to team management
- Playbook quick access

---

##### B. **PlayerProfilePage** (`/profile/player`)
**Fields**:
- Basic Info (name, email, phone, address)
- Avatar Upload
- Athletic Information:
  - Position(s)
  - Jersey Number
  - Height
  - Weight
  - Grade Level
- Emergency Contact Information
- Social Links
- Account Settings

**UI Enhancements**:
- Athletic stats card
- Position badges
- Team affiliation display
- Performance highlights (future)
- Training schedule (future)

**Key Difference**: Players CANNOT edit roster data (jersey, position, etc.) from their profile. That's managed by coaches in the Roster page. Player profile is for personal info only.

---

##### C. **AdminProfilePage** (`/profile/admin`)
**Fields**:
- Basic Info
- Avatar Upload
- Administrative Information:
  - Organization
  - Department
  - Access Level
- Social Links
- Account Settings

**UI Enhancements**:
- System admin tools quick links
- User management shortcuts
- System health overview

---

#### 3.3 Shared Components to Extract

##### AvatarUpload Component
**File**: `src/components/profile/AvatarUpload.tsx`

```typescript
interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userId: string;
  displayName?: string;
  onUploadSuccess: (url: string) => void;
  onUploadError: (error: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  userId,
  displayName,
  onUploadSuccess,
  onUploadError
}) => {
  // Extracted avatar upload logic
  // File validation
  // Preview
  // Upload to storage
  // Return public URL
};
```

**Benefits**:
- Reusable across all profile pages
- Single source of truth for avatar logic
- Easier to test
- Consistent UX

---

##### BasicInfoSection Component
**File**: `src/components/profile/BasicInfoSection.tsx`

```typescript
interface BasicInfoSectionProps {
  formData: {
    display_name: string;
    full_name: string;
    phone: string;
    email: string;
    address: string;
    bio: string;
  };
  onFieldChange: (field: string, value: string) => void;
  validationErrors: Record<string, string>;
  isEmailEditable?: boolean; // Default false
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  onFieldChange,
  validationErrors,
  isEmailEditable = false
}) => {
  // Shared basic info form fields
};
```

---

##### SocialLinksSection Component
**File**: `src/components/profile/SocialLinksSection.tsx`

```typescript
interface SocialLinksSectionProps {
  formData: {
    social_twitter?: string;
    social_instagram?: string;
    social_linkedin?: string;
    social_tiktok?: string;
    social_youtube?: string;
    personal_website?: string;
  };
  onFieldChange: (field: string, value: string) => void;
  validationErrors: Record<string, string>;
}

export const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  formData,
  onFieldChange,
  validationErrors
}) => {
  // Social links form with icons
  // URL validation
  // Link preview
};
```

---

#### 3.4 Routing Changes
**File**: `src/app/AppRouter.tsx`

```typescript
// Add role-based profile routing
<Route path="/profile" element={<ProfileRouter />} />

// ProfileRouter component
const ProfileRouter: React.FC = () => {
  const profile = useAuthProfile();
  
  // Redirect to role-specific profile page
  if (profile?.app_role === 'coach') {
    return <Navigate to="/profile/coach" replace />;
  } else if (profile?.app_role === 'player') {
    return <Navigate to="/profile/player" replace />;
  } else if (profile?.is_admin) {
    return <Navigate to="/profile/admin" replace />;
  }
  
  return <Navigate to="/profile/coach" replace />; // Default fallback
};

// Role-specific routes
<Route path="/profile/coach" element={<CoachProfilePage />} />
<Route path="/profile/player" element={<PlayerProfilePage />} />
<Route path="/profile/admin" element={<AdminProfilePage />} />
```

---

#### 3.5 Migration Plan for Refactor

**Step 1**: Extract shared components (Week 1)
- [ ] Create `AvatarUpload.tsx`
- [ ] Create `BasicInfoSection.tsx`
- [ ] Create `SocialLinksSection.tsx`
- [ ] Create `ProfileSharedLayout.tsx`
- [ ] Test components in isolation

**Step 2**: Create CoachProfilePage (Week 1-2)
- [ ] Create `CoachProfilePage.tsx`
- [ ] Use shared components
- [ ] Add coaching-specific sections
- [ ] Add form validation
- [ ] Add save logic
- [ ] Test thoroughly

**Step 3**: Create PlayerProfilePage (Week 2)
- [ ] Create `PlayerProfilePage.tsx`
- [ ] Use shared components
- [ ] Add athletic sections
- [ ] Add emergency contact section
- [ ] Add save logic
- [ ] Test thoroughly

**Step 4**: Create AdminProfilePage (Week 2)
- [ ] Create `AdminProfilePage.tsx`
- [ ] Use shared components
- [ ] Add admin-specific sections
- [ ] Add save logic
- [ ] Test thoroughly

**Step 5**: Update routing and navigation (Week 3)
- [ ] Add ProfileRouter
- [ ] Update navigation links
- [ ] Add role-based redirects
- [ ] Update breadcrumbs

**Step 6**: Deprecate old ProfilePage (Week 3)
- [ ] Mark old ProfilePage as deprecated
- [ ] Add console warnings
- [ ] Update all internal links
- [ ] Remove after 1 sprint

---

### Phase 4: Future Enhancements 🔵

#### 4.1 Player Profile Customization
**Related to**: User's second request about player profile options

**Features**:
- Profile themes/colors
- Custom badges
- Bio formatting (markdown support)
- Highlight videos (future)
- Stats dashboard (future)
- Achievement showcase (future)

**Note**: Separate from roster management (coach-controlled)

---

#### 4.2 Profile Privacy Controls
**Features**:
- Public/Private profile toggle
- Field-level privacy (show/hide specific fields)
- Social media link visibility
- Contact info visibility
- Team roster visibility

**Schema Addition**:
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "profile_visibility": "team",
  "contact_visibility": "coaches",
  "social_visibility": "public",
  "stats_visibility": "team"
}';
```

---

#### 4.3 Profile Verification
**Features**:
- Email verification badge
- Coach certification verification
- School affiliation verification
- ID verification (for age-restricted content)

---

#### 4.4 Profile Analytics
**Features**:
- Profile views counter
- Link clicks tracking
- Most viewed sections
- Profile completion percentage

---

## 🎯 Action Plan Summary

### Immediate Actions (This Week)
1. ✅ **Create migration** for missing profile columns
2. ✅ **Create avatars bucket** in Supabase Storage
3. ✅ **Apply migration** to database
4. ✅ **Test profile save** with all fields
5. ✅ **Test avatar upload** with coach account

### Short-Term (Next 2 Weeks)
6. ✅ Improve error handling in ProfilePage
7. ✅ Add avatar preview before upload
8. ✅ Extract shared components (AvatarUpload, BasicInfoSection, SocialLinksSection)
9. ✅ Create CoachProfilePage
10. ✅ Create PlayerProfilePage

### Medium-Term (Next Month)
11. ✅ Create AdminProfilePage
12. ✅ Update routing for role-specific profiles
13. ✅ Migrate all users to new profile pages
14. ✅ Deprecate old ProfilePage

### Long-Term (Future Sprints)
15. ⏳ Add profile customization features
16. ⏳ Add privacy controls
17. ⏳ Add profile verification
18. ⏳ Add profile analytics

---

## 📊 Current vs Desired State

### Current State 🔴
- ❌ Profile saves fail (missing columns)
- ❌ Avatar uploads fail (missing bucket)
- ❌ Single profile page serves all roles
- ❌ Confusing UX (irrelevant fields shown)
- ❌ Hard to maintain and extend
- ❌ No error handling for uploads
- ❌ No preview before upload

### Desired State (After Phase 1-2) 🟢
- ✅ Profile saves successfully
- ✅ Avatar uploads work
- ✅ Better error messages
- ✅ Preview before upload
- ⏳ Single profile page (improved)

### Desired State (After Phase 3) 🟢
- ✅ Role-specific profile pages
- ✅ Clean code architecture
- ✅ Reusable components
- ✅ Better UX per role
- ✅ Easier to maintain
- ✅ Type-safe

---

## 🧪 Testing Checklist

### Phase 1 Testing
- [ ] **Database Migration**
  - [ ] Migration applies without errors
  - [ ] All new columns exist in profiles table
  - [ ] No data loss
  - [ ] Indexes created successfully

- [ ] **Profile Save (Coach)**
  - [ ] Basic info saves
  - [ ] Coaching fields save
  - [ ] Social links save
  - [ ] Success message shown
  - [ ] Data persists after reload

- [ ] **Profile Save (Player)**
  - [ ] Basic info saves
  - [ ] Athletic fields save
  - [ ] Emergency contact saves
  - [ ] Success message shown
  - [ ] Data persists after reload

- [ ] **Avatar Upload**
  - [ ] Bucket exists and is public
  - [ ] Upload succeeds with JPG
  - [ ] Upload succeeds with PNG
  - [ ] Upload succeeds with GIF
  - [ ] Upload fails with > 5MB file (shows error)
  - [ ] Upload fails with non-image file (shows error)
  - [ ] Avatar displays after upload
  - [ ] Avatar updates on page reload
  - [ ] Old avatar replaced when uploading new one

### Phase 2 Testing
- [ ] **Error Handling**
  - [ ] File size validation works
  - [ ] File type validation works
  - [ ] Network error handled gracefully
  - [ ] Detailed error messages shown
  - [ ] Console logs errors for debugging

- [ ] **Avatar Preview**
  - [ ] Preview shows before upload
  - [ ] Preview updates when selecting different file
  - [ ] Preview clears when removing file
  - [ ] Original avatar still visible if preview cleared

### Phase 3 Testing
- [ ] **Shared Components**
  - [ ] AvatarUpload component works in all contexts
  - [ ] BasicInfoSection component works in all profiles
  - [ ] SocialLinksSection component works correctly
  - [ ] Components handle validation properly

- [ ] **CoachProfilePage**
  - [ ] Page loads correctly
  - [ ] All fields editable
  - [ ] Coaching sections display
  - [ ] Save works
  - [ ] Validation works
  - [ ] Navigation works

- [ ] **PlayerProfilePage**
  - [ ] Page loads correctly
  - [ ] All fields editable
  - [ ] Athletic sections display
  - [ ] Emergency contact section displays
  - [ ] Save works
  - [ ] Validation works
  - [ ] Cannot edit roster-controlled fields

- [ ] **Routing**
  - [ ] /profile redirects to correct role page
  - [ ] Direct URL access works
  - [ ] Navigation links updated
  - [ ] Breadcrumbs correct

---

## 📝 Notes

### Important Distinctions

**Roster Management (Coach-controlled)**:
- Location: `/roster` page
- Managed by: Coaches only
- Data source: `team_players` table
- Fields: jersey_number, position, grade_level, height, weight, roster_status
- Purpose: Team roster management

**Player Profile (Player-controlled)**:
- Location: `/profile/player` page
- Managed by: Player themselves
- Data source: `profiles` table
- Fields: bio, avatar, emergency contact, personal info, social links
- Purpose: Personal profile customization

**Key Point**: Players should NOT be able to edit their jersey number or position from their profile. That's roster data managed by coaches.

---

## 🔗 Related Documents

- `PLAYER_VIEW_NAVIGATION_RLS.md` - Player navigation and permissions
- `INVITATION_SYSTEM_FUTURE_PROOFING.md` - Player invitation system
- `database/schema.sql` - Current database schema
- `src/pages/ProfilePage.tsx` - Current profile page implementation

---

## 📞 Questions & Decisions Needed

1. **Avatar Storage**: Should we keep avatars in Supabase Storage or move to CDN later?
   - **Decision**: Start with Supabase Storage, migrate to CDN if performance becomes issue

2. **Profile Visibility**: Should profiles be public by default?
   - **Decision**: Team-visible by default, add privacy controls in Phase 4

3. **Social Media**: Should we validate social media URLs?
   - **Decision**: Yes, add URL validation in Phase 2

4. **Emergency Contact**: Should emergency contact be required for all players?
   - **Decision**: Yes, required for all players regardless of age

5. **Coaching Certifications**: Should we add document upload for certifications?
   - **Decision**: Phase 4 enhancement

---

**Last Updated**: October 16, 2025  
**Next Review**: After Phase 1 completion
