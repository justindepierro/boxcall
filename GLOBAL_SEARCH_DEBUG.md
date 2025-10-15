# Global Search Debugging Guide 🔍

## Issue: Dropdown Not Appearing

I've added extensive logging to help debug why the dropdown isn't showing. Here's how to test:

---

## Step 1: Open Browser Console

1. Open your app in the browser
2. Press **F12** or **Cmd+Option+I** (Mac) / **Ctrl+Shift+I** (Windows)
3. Click on the **Console** tab

---

## Step 2: Try Searching

1. Click on the search bar (or press `Cmd+K`)
2. Type at least 2 characters (e.g., "test" or a play name you know exists)
3. Watch the console output

---

## What You Should See

### Expected Console Logs:

```
🔍 GlobalSearch: Input focused, setting isOpen to true
🔍 GlobalSearch: Input changed, query: te isOpen: true
🔍 GlobalSearch: Checking dropdown render. isOpen: true query: te queryLength: 2 isLoading: false results: 0
🔍 GlobalSearch: Starting search for: te
🔍 GlobalSearch: Team ID: 550e8400-e29b-41d4-a716-446655440000
🔍 GlobalSearch: Found 5 total players
🔍 GlobalSearch: Filtered to 0 matching players
🔍 GlobalSearch: Searching plays, have 12 plays
🔍 GlobalSearch: Found 3 matching plays
🔍 GlobalSearch: Total results found: 5
🔍 GlobalSearch: Result breakdown: { plays: 3, formations: 1, personnel: 0, players: 1 }
```

---

## Common Issues & Solutions

### Issue 1: "TeamID is undefined"
**Symptom:** Console shows `Team ID: undefined`

**Solution:**
- Check if you're logged in
- Check if a team is selected
- Try refreshing the page

### Issue 2: "Found 0 plays"
**Symptom:** Console shows `Searching plays, have 0 plays`

**Solution:**
- You don't have any plays yet
- Go to Playbook and create a play first
- Then try searching again

### Issue 3: "isOpen: false" after typing
**Symptom:** Console shows `isOpen: false` even after typing

**Solution:**
- There may be a CSS z-index issue
- The dropdown is being hidden behind another element
- Check if the header has a high z-index

### Issue 4: Results found but dropdown not visible
**Symptom:** Console shows results but you can't see the dropdown

**Solution:**
- This is a CSS visibility issue
- The dropdown has z-index 9999 and explicit colors now
- Check if there's a parent element with `overflow: hidden`

---

## Verify Z-Index

Open DevTools → Elements tab:
1. Find the search input: `<input type="text" placeholder="Search plays..."`
2. Look for its parent `<div class="relative">`
3. Check if the dropdown div appears in the DOM when you type
4. If it appears but isn't visible, check its computed styles

---

## Manual Test Checklist

- [ ] Console shows "Input focused" when clicking search
- [ ] Console shows "Input changed" when typing
- [ ] Console shows "Starting search for: ..." after 300ms
- [ ] Console shows "Team ID: ..." (should not be undefined)
- [ ] Console shows "Found X total players"
- [ ] Console shows "Searching plays, have X plays"
- [ ] Console shows "Total results found: X" (X > 0)
- [ ] Console shows "Checking dropdown render. isOpen: true"
- [ ] Dropdown actually appears visually
- [ ] Can click on results
- [ ] Can use arrow keys to navigate

---

## Current Enhancements

I've made these debugging changes:

1. ✅ Added console logs for every step
2. ✅ Added try-catch blocks around each search type
3. ✅ Changed dropdown z-index to 9999 (very high)
4. ✅ Changed dropdown background to solid colors (not transparent)
5. ✅ Added explicit border (2px gray)
6. ✅ Added click handler logging on dropdown
7. ✅ Log isOpen state changes

---

## Next Steps

**After you test and check the console:**

1. **Share the console output** - Copy/paste what you see
2. **Check if dropdown appears in DOM** - Use Elements tab
3. **Try different queries** - Player names, formation names, etc.
4. **Check your plays** - Do you have plays created?

---

## Quick Fixes to Try

### Fix 1: Ensure you have data
```
1. Go to /playbook
2. Create a test play named "Test Play 123"
3. Save it
4. Go back and search for "test"
```

### Fix 2: Check team selection
```
1. Look at top right of app
2. Make sure a team is selected (not "No Team")
3. If no team, create or join one
```

### Fix 3: Force dropdown visibility
If dropdown exists in DOM but not visible, add this temporarily:

```css
/* In browser console */
document.querySelector('[ref="resultsRef"]')?.style.cssText = 
  'display: block !important; position: absolute !important; z-index: 99999 !important; background: red !important;'
```

This will make it super obvious if it exists.

---

## Report Back

Please share:
1. **Console output** - What logs do you see?
2. **Element inspection** - Is the dropdown div in the DOM?
3. **Current page** - What page are you on? (/playbook, /dashboard, etc.)
4. **Data status** - Do you have plays/players created?

---

Let's get this working! 🚀
