# 🧪 Global Search - Quick Test Guide

## Try These Features Now!

### 1. ⚡ Fast Search (Phase 1)
1. Click the search bar (or press **Cmd/Ctrl+K**)
2. Type "smaug" (or any player/play name)
3. Notice: **Results appear in ~100ms**
4. Check console: "⚡ Search completed in XXms"
5. Search for "smaug" again → Should be **instant** (<10ms cache hit)

### 2. 🎯 Text Highlighting (Phase 1)
- Type any query
- Look at results: Your search text is **highlighted in yellow**
- Works in both titles and subtitles

### 3. 💀 Loading Skeletons (Phase 1)
- Clear the search and type a new query
- While loading, you'll see **3 animated skeleton cards**
- Much better than a spinner!

### 4. 🕒 Recent Searches (Phase 2)
1. Do a few searches: "smaug", "dragon", etc.
2. Clear the input field
3. Click on the search bar again
4. You'll see **recent searches with clock icons**
5. Click any recent search to populate the input
6. Click "Clear" to wipe history

### 5. 🎯 Filter Chips (Phase 2)
1. Search for something that returns multiple types (e.g., "dragon")
2. Notice **filter chips** at the top: "All (5)", "Plays (3)", "Players (2)"
3. Click "Plays" → Only plays shown
4. Click "Players" → Only players shown
5. Click "All" → Everything shown again

### 6. ⌨️ Keyboard Navigation (Phase 2)
**Try these shortcuts**:
- **Cmd/Ctrl+K**: Focus search bar
- **Type** to search
- **Tab**: Cycle forward through results
- **Shift+Tab**: Cycle backward
- **Home**: Jump to first result
- **End**: Jump to last result
- **Arrow Up/Down**: Navigate results
- **Enter**: Select highlighted result
- **Escape**: Close and blur

Look for the **blue ring** around the focused item!

### 7. 📊 Result Grouping (Phase 2)
1. Search for something with many results
2. Results are **grouped by type**: "Plays (3)", "Formations (2)", etc.
3. Each group shows **max 3 items**
4. If more than 3 exist, click **"Show X more"**
5. Click **"Show less"** to collapse

### 8. 🧪 Test Combinations
**Try these combinations**:
- Filter to "Plays" + Use keyboard navigation
- Recent search + Filter chips
- Grouped results + Keyboard nav (Tab across groups)
- Filter chips + "Show more" buttons

---

## What to Look For

### Performance ✅
- [ ] Search results appear in <150ms
- [ ] Repeated searches are instant
- [ ] Filter toggles are instant (0ms)
- [ ] Keyboard nav is smooth
- [ ] No lag or jank

### Visual Polish ✅
- [ ] Text highlighting works (yellow background)
- [ ] Skeletons appear while loading
- [ ] Blue ring on keyboard focus (distinct from hover)
- [ ] Filter chips highlight when active
- [ ] Recent searches have clock icons
- [ ] Group headers are visually distinct
- [ ] Hover effects work everywhere

### Functionality ✅
- [ ] Search history persists after page reload
- [ ] Recent searches appear when focused
- [ ] Filter chips show accurate counts
- [ ] Tab/Shift+Tab cycles through results
- [ ] Groups expand/collapse correctly
- [ ] All keyboard shortcuts work
- [ ] Clear history button works

### Accessibility ✅
- [ ] Can use search entirely with keyboard
- [ ] Focus indicators are clear
- [ ] Screen reader compatible (check announcements)
- [ ] Contrast is sufficient

---

## Expected Behavior

### Search Flow
1. **Focus** → Recent searches appear (if any)
2. **Type 2 chars** → Search begins, skeletons show
3. **Results arrive** → Filter chips appear, results grouped
4. **Select result** → Navigates + adds to history

### Filter Flow
1. **Search** → Multiple types returned
2. **Click filter** → Only that type shown
3. **Keyboard nav** → Works with filtered results
4. **Click "All"** → Everything shown again

### Keyboard Flow
1. **Cmd/Ctrl+K** → Focus search
2. **Type** → Search executes
3. **Tab** → Cycles through results
4. **Home/End** → Jumps to first/last
5. **Enter** → Selects item
6. **Escape** → Closes and blurs

---

## Performance Benchmarks

### Search Speed
- **Initial search**: 80-120ms ✅
- **Cached repeat**: <10ms ✅
- **Recent click**: 0ms ✅

### Interaction Speed
- **Filter toggle**: 0ms ✅
- **Group expand**: 0ms ✅
- **Keyboard nav**: 0ms ✅

### Storage
- **localStorage**: <3KB ✅
- **Memory**: Minimal ✅

---

## Common Issues to Check

### If search is slow:
- Check network tab for sequential requests (should be parallel)
- Check console for timing logs
- Try a repeated search (should be <10ms)

### If keyboard nav doesn't work:
- Make sure dropdown is open
- Check for blue ring on focused item
- Try Tab vs Arrow keys (both should work)

### If history doesn't persist:
- Check localStorage (look for `bc_search_history`)
- Try searching, refreshing page, checking recent searches
- Make sure you selected a result (history saves on selection)

### If groups don't show:
- Make sure you have mixed results (multiple types)
- Check that filter is set to "All"
- Try different search queries

---

## Quick Validation Checklist

**Phase 1 Features** (2 min):
- [ ] Search is fast (<150ms)
- [ ] Text is highlighted
- [ ] Skeletons appear while loading
- [ ] Repeated searches are instant

**Phase 2 Features** (3 min):
- [ ] Recent searches appear
- [ ] Filter chips work
- [ ] Tab key cycles results
- [ ] Groups show with "Show more"
- [ ] History persists after reload

**Total Test Time**: ~5 minutes for full validation

---

## Report Issues

If you find any bugs or unexpected behavior:

1. **Note the steps to reproduce**
2. **Check browser console for errors**
3. **Check network tab for failed requests**
4. **Note your browser and OS**

Ready to test? Start with #1 (Fast Search) and work your way down! 🚀
