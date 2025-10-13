# Save Queue System - Test Guide

**Version**: 3.0.0  
**Date**: October 13, 2025  
**Status**: Testing Phase

---

## Overview

This guide provides comprehensive testing procedures for the Save Queue system with exponential backoff retry logic.

---

## Test Environment Setup

### Prerequisites
- Development server running (`npm run dev`)
- Browser DevTools open (Network tab)
- Access to Play Grid or Formation Builder

### Network Throttling Setup
1. Open Chrome/Edge DevTools → Network tab
2. Set throttle to "Slow 3G" or "Offline"
3. Use "Disable cache" for consistent testing

---

## Test Scenarios

### ✅ Test 1: Normal Save Operation (Baseline)

**Purpose**: Verify save indicator works without queue

**Steps**:
1. Navigate to Play Grid
2. Edit any play (change name, tags, etc.)
3. Observe SaveIndicatorLogo animation

**Expected Results**:
- Logo animates during save
- Logo shows success state (green checkmark briefly)
- No queue badge appears
- Console shows: "Save completed successfully"

**Pass Criteria**: ✅ Save completes without queue intervention

---

### ✅ Test 2: Single Save Failure with Auto-Retry

**Purpose**: Verify queue captures failed saves and retries with backoff

**Steps**:
1. Open Network tab → Set to "Offline"
2. Edit a play in Play Grid
3. Wait and observe queue badge appear
4. Go back "Online" in Network tab
5. Observe auto-retry

**Expected Results**:
- Save fails initially
- Queue badge appears with "1"
- Logo shows error state briefly
- After ~1 second (first retry): Request fires
- If still offline, badge stays at "1"
- When online: Save succeeds, badge disappears

**Pass Criteria**: ✅ Queue captures failure, retries when online

---

### ✅ Test 3: Multiple Failed Saves

**Purpose**: Test queue accumulation and batch retry

**Steps**:
1. Set Network to "Offline"
2. Edit 3 different plays rapidly
3. Observe queue badge incrementing
4. Go "Online"
5. Watch queue process all saves

**Expected Results**:
- Queue badge shows "1" → "2" → "3"
- Each failed save adds to queue
- When online: Queue processes sequentially
- Badge decrements: "3" → "2" → "1" → (disappears)
- All plays saved successfully

**Pass Criteria**: ✅ All queued saves eventually succeed

---

### ✅ Test 4: Exponential Backoff Timing

**Purpose**: Verify retry delays increase exponentially

**Steps**:
1. Set Network to "Slow 3G" (not offline, just slow)
2. Edit a play
3. Open Console
4. Watch retry timing in console logs

**Expected Results**:
```
Retry 1: ~1 second delay (2^0 * 1000ms)
Retry 2: ~2 second delay (2^1 * 1000ms)
Retry 3: ~4 second delay (2^2 * 1000ms)
Retry 4: ~8 second delay (2^3 * 1000ms)
Retry 5: ~16 second delay (2^4 * 1000ms)
Retry 6+: ~30 second delay (capped at 30000ms)
```

**Pass Criteria**: ✅ Delays match exponential pattern with 30s cap

---

### ✅ Test 5: Max Retries Enforcement

**Purpose**: Verify queue removes operations after max retries

**Steps**:
1. Set Network to "Offline"
2. Edit a play
3. Wait for ~5-6 retry attempts
4. Check console for "Max retries exceeded" message

**Expected Results**:
- Queue badge shows "1"
- After max retries (default: 5): Badge disappears
- Console shows: "Save operation failed after 5 retries"
- Operation removed from queue

**Pass Criteria**: ✅ Failed operations don't retry forever

---

### ✅ Test 6: Manual Retry Button

**Purpose**: Test user-initiated retry via queue badge

**Steps**:
1. Set Network to "Offline"
2. Edit a play (badge shows "1")
3. Click the queue badge
4. Go "Online"
5. Click badge again

**Expected Results**:
- Clicking badge triggers immediate retry (even if still offline)
- Console shows: "Retrying failed saves..."
- When online + clicked: Save succeeds immediately
- Badge disappears

**Pass Criteria**: ✅ Manual retry works on demand

---

### ✅ Test 7: Clear Queue (Right-Click)

**Purpose**: Test queue clearing via context menu

**Steps**:
1. Set Network to "Offline"
2. Edit 2-3 plays (badge shows "2" or "3")
3. Right-click the queue badge
4. Confirm queue cleared

**Expected Results**:
- Right-click triggers context menu action
- Queue badge disappears immediately
- Console shows: "Save queue cleared by user"
- Haptic feedback (medium)

**Pass Criteria**: ✅ Queue clears without saving pending operations

---

### ✅ Test 8: Queue Persistence Across Edits

**Purpose**: Verify queue maintains state during continued editing

**Steps**:
1. Set Network to "Offline"
2. Edit Play A (badge: "1")
3. Edit Play B (badge: "2")
4. Edit Play A again (same play as #2)
5. Go "Online"
6. Observe save behavior

**Expected Results**:
- Queue shows "2" (not "3" - shouldn't duplicate same play)
- Both plays save when online
- No duplicate save operations
- Badge disappears after both complete

**Pass Criteria**: ✅ Queue handles duplicate operations intelligently

---

### ✅ Test 9: Queue Status During Navigation

**Purpose**: Verify queue badge persists across page navigation

**Steps**:
1. Set Network to "Offline"
2. Edit a play in Play Grid (badge: "1")
3. Navigate to Formations tab
4. Navigate back to Playbook tab
5. Check if badge still shows "1"

**Expected Results**:
- Queue badge visible on all pages (fixed in header)
- Badge persists after navigation
- Queue state maintained in context
- Going "Online" still triggers retry

**Pass Criteria**: ✅ Queue state survives navigation

---

### ✅ Test 10: Concurrent Save Operations

**Purpose**: Test queue handling multiple simultaneous saves

**Steps**:
1. Set Network to "Slow 3G"
2. Rapidly edit 5 plays in quick succession (< 1 second apart)
3. Observe queue behavior
4. Check console for processing order

**Expected Results**:
- Queue badge increments rapidly: "1" → "2" → "3" → "4" → "5"
- Queue processes sequentially (not in parallel)
- Console shows: "Processing save queue..."
- No race conditions or duplicate saves
- Badge decrements as each save completes

**Pass Criteria**: ✅ Queue prevents concurrent save conflicts

---

## Console Output Examples

### Successful Save
```
[SaveStateContext] Save operation queued: play-123
[SaveStateContext] Processing save queue... (1 operations)
[SaveStateContext] Save completed successfully
```

### Failed Save with Retry
```
[SaveStateContext] Save operation queued: play-123
[SaveStateContext] Processing save queue... (1 operations)
[SaveStateContext] Save failed, retrying in 1000ms (attempt 1/5)
[SaveStateContext] Retrying save operation: play-123
[SaveStateContext] Save completed successfully
```

### Max Retries Exceeded
```
[SaveStateContext] Save operation queued: play-123
[SaveStateContext] Save failed, retrying in 1000ms (attempt 1/5)
[SaveStateContext] Save failed, retrying in 2000ms (attempt 2/5)
[SaveStateContext] Save failed, retrying in 4000ms (attempt 3/5)
[SaveStateContext] Save failed, retrying in 8000ms (attempt 4/5)
[SaveStateContext] Save failed, retrying in 16000ms (attempt 5/5)
[SaveStateContext] Save operation failed after 5 retries: play-123
```

---

## Visual Indicators Checklist

### SaveIndicatorLogo States
- [ ] **Idle**: Default logo appearance
- [ ] **Saving**: Animated pulse/spin during save
- [ ] **Success**: Brief green checkmark or success state
- [ ] **Error**: Brief red X or error state

### Queue Badge States
- [ ] **Hidden**: No pending saves (queueLength === 0)
- [ ] **Visible**: Shows count when queueLength > 0
- [ ] **Color**: Amber/warning color (bg-warning-500)
- [ ] **Hover**: Scales to 110% on hover
- [ ] **Tooltip**: Shows count and instructions

---

## Performance Validation

### Metrics to Check
- [ ] **Queue Processing Time**: < 100ms per operation
- [ ] **Memory Usage**: No memory leaks after 100+ queued saves
- [ ] **UI Responsiveness**: No lag during queue processing
- [ ] **Network Requests**: One request per save (no duplicates)

### Tools
- Chrome DevTools → Performance tab
- Memory profiler for leak detection
- Network tab for request monitoring

---

## Edge Cases

### Scenario 1: Browser Refresh with Pending Saves
**Current Behavior**: Queue is lost (in-memory only)  
**Future**: IndexedDB persistence (P1 feature)

### Scenario 2: Logout with Pending Saves
**Expected**: Queue should clear on logout  
**Test**: Verify no stale saves after re-login

### Scenario 3: Rapid Network Fluctuations
**Test**: Toggle offline/online rapidly during save  
**Expected**: Queue handles gracefully, no duplicate saves

---

## Success Criteria Summary

✅ **All 10 test scenarios pass**  
✅ **Visual indicators work correctly**  
✅ **Console output matches expected patterns**  
✅ **No performance degradation**  
✅ **Edge cases handled gracefully**  

---

## Discovered Issues Log

### Issue Template
```markdown
**Issue #**: [Number]  
**Severity**: [Critical / High / Medium / Low]  
**Test Case**: [Which test revealed it]  
**Description**: [What went wrong]  
**Expected**: [What should happen]  
**Actual**: [What actually happened]  
**Steps to Reproduce**: [Minimal repro steps]  
**Fix Status**: [Not Started / In Progress / Fixed]  
```

### Example Issue (Template Only)
```markdown
**Issue #1**: Queue badge doesn't clear after successful retry  
**Severity**: Medium  
**Test Case**: Test 2 - Single Save Failure  
**Description**: Badge remains visible after save succeeds  
**Expected**: Badge disappears when queueLength === 0  
**Actual**: Badge shows "0" instead of hiding  
**Fix Status**: Fixed in v3.0.1  
```

---

## Next Steps After Testing

1. **Document Results**: Fill in checkboxes and issue log
2. **Update Main Documentation**: Add findings to `UNIVERSAL_SAVE_INDICATOR_COMPLETE.md`
3. **Create Usage Guide**: Document integration patterns for other components
4. **Plan P1 Features**: Begin offline support (IndexedDB persistence)

---

**Last Updated**: October 13, 2025  
**Tester**: [Your Name]  
**Status**: Ready for Testing
