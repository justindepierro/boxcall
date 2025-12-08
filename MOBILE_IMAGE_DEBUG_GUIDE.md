# Mobile Image Debugging Guide - iOS Safari

**Last Updated**: December 7, 2025  
**Status**: Testing Required - Desktop Works, Mobile Shows "?" Icons

## Summary

Fixed three critical mobile UX issues:

1. ✅ **Loading state** - "Configure Personnel" CTA now only shows when truly empty (not during loading)
2. ✅ **Horizontal scrolling** - Added `overflow-x-hidden` and `max-w-full` to content containers
3. 🔍 **iOS Safari images** - Added comprehensive debugging, awaiting test results

## What Was Fixed

### 1. Empty State vs Loading State (FIXED)

**Problem**: "Configure Personnel" button appeared during data loading as if no plays existed.

**Root Cause**: Component checked `state.playsCreated === 0` which stayed 0 during initial load.

**Solution**: Changed all checks from `state.playsCreated` to `optimisticPlays.length`:

- `MobilePlaybookView.tsx` line 184: Empty state conditional
- `MobilePlaybookView.tsx` line 197: Plays grid conditional
- `MobilePlaybookView.tsx` line 109: Search bar visibility
- `MobilePlaybookView.tsx` line 171: Padding calculation

**Result**: Loading skeleton/empty state logic now based on actual data presence, not stale state variable.

### 2. Horizontal Scrolling (FIXED)

**Problem**: Mobile view had nested horizontal/vertical scrolling from multiple overflow containers.

**Solution**: Added layout constraints to content container:

```tsx
className = "px-4 py-3 space-y-3 pb-32 overflow-x-hidden max-w-full";
```

**Result**: Content constrained to viewport width, prevents unwanted horizontal scroll.

### 3. Image Debugging (IN PROGRESS)

**Problem**: Desktop shows images correctly, iOS Safari shows "?" file icon placeholder.

**Changes Made**:

**File**: `src/components/playbook/page/MobilePlayCard.tsx` (lines 97-118)

- Added `onError` handler logging: playId, playName, diagramUrl, fallbackUrl, error src
- Added `onLoad` handler logging: playName, diagram_url
- Logs fire when images load/fail on mobile devices

**File**: `src/hooks/useTeamsData.ts` (lines 295-308)

- Enhanced mobile debug logging with detailed diagram_url inspection:
  - Type of diagram_url (string/null/undefined)
  - Explicit null/undefined/empty string checks
  - Sample of actual diagram URLs from first 5 plays with images

**File**: `src/pages/PlaybookPage.tsx` (lines 115-147)

- Added imageCheck object showing:
  - Count of plays with images vs without
  - Sample URLs from plays that have images
  - Viewport dimensions and user agent for iOS identification

## How to Test on iOS Safari

### Step 1: Open Console in iOS Safari

1. On Mac: Safari → Develop → [Your iPhone Name] → [BoxCall Tab]
2. On iPhone: Settings → Safari → Advanced → Web Inspector (must be enabled)

### Step 2: Navigate to Playbook Page

1. Log into BoxCall on your iPhone
2. Go to Playbook page
3. Wait for plays to load completely

### Step 3: Check Console Logs

Look for these log entries in order:

#### A. Initial Data Fetch (useTeamsData.ts)

```
📱 [Mobile Debug - useTeamsData] Plays fetched: {
  count: 26,
  hasMore: false,
  sample: [
    {
      id: "...",
      name: "Play Name",
      diagram_url: "https://..." OR null,
      diagram_url_type: "string" OR "object",
      diagram_url_null: true/false,
      diagram_url_undefined: true/false,
      diagram_url_empty: true/false,
      has_diagram_data: true/false
    }
  ],
  allDiagramUrls: ["https://...", "https://...", ...]
}
```

**What to Check**:

- Are `diagram_url` values strings or null?
- Does `allDiagramUrls` array have valid URLs?
- Are URLs accessible (copy/paste into Safari address bar)?

#### B. Page Mount (PlaybookPage.tsx)

```
📱 [Mobile Debug - PlaybookPage] {
  activeTeamId: "...",
  allPlaysCount: 26,
  playSample: [...],
  imageCheck: {
    playsWithImages: 15,
    playsWithoutImages: 11,
    sampleUrls: ["https://...", "https://...", ...]
  },
  userAgent: "Mozilla/5.0 (iPhone...)",
  viewport: {
    width: 390,
    height: 844,
    orientation: "portrait-primary"
  }
}
```

**What to Check**:

- Does `playsWithImages` count match expected?
- Are `sampleUrls` valid Supabase storage URLs?
- Is viewport size reasonable?

#### C. Image Load Attempts (MobilePlayCard.tsx)

**On Success**:

```
[MobilePlayCard] Image loaded: "Play Name" "https://..."
```

**On Error**:

```
[MobilePlayCard] Image load error: {
  playId: "...",
  playName: "Play Name",
  diagramUrl: "https://..." OR null,
  fallbackUrl: null,
  error: "https://..." (attempted URL)
}
```

**What to Check**:

- Do you see ANY successful loads?
- Do ALL images trigger errors?
- What URLs are in the error logs?

### Step 4: Test Image URLs Directly

1. Copy a `diagram_url` from console logs
2. Paste into Safari address bar
3. Navigate to URL

**Expected**: Image should display in browser  
**If fails**: Check:

- Is URL a Supabase storage URL?
- Does it require authentication?
- Is it a CORS issue?
- Does it exist in storage bucket?

### Step 5: Check Network Tab

1. Open Network tab in Safari Inspector
2. Filter by "Images" or "XHR"
3. Refresh playbook page
4. Look for image requests

**Check**:

- HTTP status codes (200 = success, 403 = forbidden, 404 = not found)
- Response headers (CORS, Content-Type)
- Request headers (cookies, auth tokens)

## Common Issues and Solutions

### Issue 1: diagram_url is null in database

**Symptom**: Console shows `diagram_url: null` for all plays

**Cause**: Database field is empty, data never populated

**Solution**:

1. Check database directly:

```sql
SELECT id, play_name, diagram_url
FROM plays
WHERE diagram_url IS NOT NULL
LIMIT 10;
```

2. If empty, need to populate diagram_url field OR add diagram_image_url column

### Issue 2: CORS blocking image loads

**Symptom**: Console errors like "blocked by CORS policy"

**Cause**: Supabase storage bucket not configured for public access

**Solution**:

1. Go to Supabase dashboard → Storage → Bucket settings
2. Enable public access OR configure CORS headers
3. Verify bucket policy allows reads

### Issue 3: URLs require authentication

**Symptom**: Images load on desktop (logged in session) but not mobile

**Cause**: Supabase storage using authenticated URLs, mobile session expired

**Solution**:

1. Check if URLs are signed (have query params like `?token=...`)
2. If signed, check token expiration time
3. Consider using public bucket for diagram images

### Issue 4: WebP format not supported

**Symptom**: PNG/JPG load fine, WebP shows "?"

**Cause**: Older iOS versions don't support WebP

**Solution**: Serve fallback formats for iOS < 14

### Issue 5: Image URLs are relative paths

**Symptom**: URL doesn't start with `https://`

**Cause**: Stored as relative path, needs base URL

**Solution**: Prepend Supabase storage base URL in query or render

## Expected Console Output (Success Case)

```
📱 [Mobile Debug - useTeamsData] Plays fetched: { count: 26, allDiagramUrls: ["https://xyz.supabase.co/storage/v1/object/public/diagrams/abc.png", ...] }

📱 [Mobile Debug - PlaybookPage] { imageCheck: { playsWithImages: 15, sampleUrls: [...] } }

[MobilePlayCard] Image loaded: "Power I Right" "https://xyz.supabase.co/storage/v1/object/public/diagrams/abc.png"
[MobilePlayCard] Image loaded: "Twins Right" "https://xyz.supabase.co/storage/v1/object/public/diagrams/def.png"
[MobilePlayCard] Image loaded: "Ace Slot" "https://xyz.supabase.co/storage/v1/object/public/diagrams/ghi.png"
...
```

## Next Steps After Testing

1. **Copy console logs** from your iPhone Safari inspector
2. **Share logs** showing the exact values for:
   - `diagram_url` from useTeamsData
   - `sampleUrls` from PlaybookPage
   - Any error messages from MobilePlayCard
3. **Test direct URL access** by pasting a diagram_url into Safari
4. **Check Network tab** for failed image requests

Based on your findings, I'll implement the appropriate fix (CORS, authentication, URL format, etc).

## Files Modified

1. `src/components/playbook/page/MobilePlaybookView.tsx` - Loading state + overflow fixes
2. `src/components/playbook/page/MobilePlayCard.tsx` - Image error/load logging
3. `src/hooks/useTeamsData.ts` - Enhanced diagram_url debugging
4. `src/pages/PlaybookPage.tsx` - Image availability checks

## Commits

- `bb0710c5` - fix: Mobile playbook UX improvements - loading state, scroll constraints, image debugging
- `ab9831ca` - style: Format mobile playbook files with Prettier
