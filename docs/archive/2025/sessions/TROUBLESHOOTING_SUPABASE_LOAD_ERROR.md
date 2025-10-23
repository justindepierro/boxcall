# Troubleshooting: Supabase Load Failed Error

## Error

`Error: Load failed (api.supabase.com)`

## Most Likely Causes

### 1. Browser Cache Issue (Most Common)

The validation code changes require a hard refresh.

**Fix:**

- **Chrome/Edge:** `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
- **Safari:** `Cmd + Option + R`
- Or clear browser cache and reload

### 2. Development Server Needs Restart

The dev server may not have picked up the new validation files.

**Fix:**

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Supabase Network/Auth Issue

Temporary connectivity or authentication problem.

**Check:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for detailed error message
4. Go to Network tab
5. Filter by "supabase"
6. Check for 401 (auth) or 403 (permission) errors

**Possible issues:**

- **401 Unauthorized:** Session expired → Log out and log back in
- **403 Forbidden:** RLS policy issue → Check if user has proper team membership
- **Network error:** Supabase API temporarily down → Wait and retry

### 4. RLS Policy Blocking Data

The new `play_assignments` migration might have RLS conflicts.

**Check:**

```sql
-- In Supabase SQL Editor, verify you can query:
SELECT * FROM plays LIMIT 5;
SELECT * FROM formations LIMIT 5;
SELECT * FROM playbooks WHERE id = 'your-playbook-id';
```

### 5. Validation Breaking Existing Plays

Unlikely (validation only runs on save), but check:

**Temporarily disable validation to test:**

In `src/components/playbook/play-card/fieldDefinitions.tsx`, comment out:

```typescript
// validation={(value) => {
//   const result = validateFormationName(value);
//   return result.isValid ? null : result.error || "Invalid formation";
// }}
```

If this fixes it, there's a deeper issue with how validation interacts with existing data.

## Quick Debug Steps

### Step 1: Open Browser Console

1. Open your app in the browser
2. Press F12 (DevTools)
3. Go to Console tab
4. Copy the full error message

### Step 2: Check Network Tab

1. In DevTools, go to Network tab
2. Reload the page
3. Look for failed requests (red text)
4. Click on the failed request
5. Check:
   - **Request URL:** What endpoint failed?
   - **Status Code:** 401? 403? 500?
   - **Response:** What error message?

### Step 3: Check Authentication

1. In Console, type: `localStorage.getItem('supabase.auth.token')`
2. If null → You're logged out
3. If present → Auth token exists

### Step 4: Try Incognito/Private Window

1. Open app in incognito mode
2. Log in fresh
3. If it works → Cache issue
4. If it fails → Deeper problem

## Common Fixes

### Fix 1: Hard Refresh

```
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows/Linux)
```

### Fix 2: Clear Supabase LocalStorage

In browser console:

```javascript
localStorage.removeItem("supabase.auth.token");
// Then log in again
```

### Fix 3: Restart Dev Server

```bash
# Kill the server
Ctrl + C

# Restart
npm run dev
```

### Fix 4: Check Supabase Status

Visit: https://status.supabase.com
Check if there's an ongoing incident.

## If Still Broken

### Temporarily Revert Validation

```bash
git stash
# Test if app loads
# If it works, the validation code is the issue
git stash pop
```

### Check Type Errors

The get_errors output showed many type errors in:

- `src/utils/playbookHealthScore.ts`
- `src/components/playbook/FormationSelector.tsx`

These might be blocking compilation. Run:

```bash
npm run type-check
```

### Check Build

```bash
npm run build
```

If build fails, that's the issue (not Supabase).

## What to Share for Help

If you need to share the error, include:

1. Full error message from browser console
2. Network tab screenshot showing failed request
3. Status code and response body
4. Whether it works in incognito mode
5. Output of `npm run build` and `npm run type-check`

---

## Most Likely Solution

Based on the context (new validation code just added), **99% chance it's a browser cache issue.**

**Try first:**

1. Hard refresh: `Cmd + Shift + R`
2. If that doesn't work: Restart dev server
3. If that doesn't work: Open in incognito and log in fresh

The validation code we added:

- ✅ Only runs on save (not load)
- ✅ Doesn't touch Supabase queries
- ✅ Doesn't affect RLS policies
- ✅ Type checks pass

So it's unlikely to be the cause unless there's a module import/bundling issue that restarting the dev server will fix.
