# Mobile Testing Guide - December 7, 2025

## 🎯 Quick Start

This guide helps you test the BoxCall mobile experience on real devices after implementing the December 7, 2025 mobile fixes.

## 🔧 Fixes Implemented

### 1. Debug Logging Added
**Files Changed**:
- `src/pages/PlaybookPage.tsx` - Logs team/playbook/plays state on mobile
- `src/hooks/useTeamsData.ts` - Logs data fetching process

**What it does**: Console logs will now appear when using mobile devices, showing exactly what data is being loaded (or not loaded).

### 2. Modal Backdrop & Z-Index Fixed
**Files Changed**:
- `src/components/ui/Modal/Modal.tsx` - Changed zIndex default from 9999 to 1050, backdrop from bg-black/80 to bg-black/90
- `src/components/playbook/modals/CreatePersonnelModal.tsx` - Changed z-[60]/z-[70] to design tokens
- `src/components/playbook/modals/CreateFormationModal.tsx` - Changed z-[60]/z-[70] to design tokens
- `src/components/playbook/modals/EditPersonnelBadgeModal.tsx` - Changed z-[60]/z-[70] to design tokens

**What it does**: Modals now have darker, more visible backdrops (90% opacity instead of 80%) and use consistent z-index values from the design system.

## 📱 Testing Checklist

### Pre-Test Setup

1. **Deploy Latest Code**:
   ```bash
   git pull origin main
   npm run build
   # Deploy to Netlify or test environment
   ```

2. **Clear Browser Cache** on mobile device:
   - **iOS Safari**: Settings → Safari → Clear History and Website Data
   - **Android Chrome**: Settings → Privacy → Clear browsing data → Cached images and files

3. **Enable Console Logging** (for debugging):
   - **iOS Safari**: Settings → Safari → Advanced → Web Inspector (requires Mac with Safari)
   - **Android Chrome**: chrome://inspect on desktop Chrome, connect via USB

### Test Scenarios

#### Scenario 1: Login and Navigate to Playbook
**Device**: [Your device name]  
**Browser**: [Browser name]  
**Date**: [Test date]

**Steps**:
1. Navigate to BoxCall app URL
2. Login with your credentials
3. Wait for home page to load
4. Tap "Playbook" in navigation
5. **CHECK**: Do plays appear in the grid?

**Expected Result**:
- ✅ Plays grid shows all plays from selected playbook
- ✅ Console log shows: `📱 [Mobile Debug - PlaybookPage]` with play count
- ✅ Console log shows: `📱 [Mobile Debug - useTeamsData]` with fetch results

**If plays DON'T show**:
- Open browser console (see Pre-Test Setup)
- Look for debug logs starting with 📱
- Copy console output and paste in issue report (see Reporting Issues section)

---

#### Scenario 2: Test Modal Backdrop Visibility
**Device**: [Your device name]  
**Browser**: [Browser name]  
**Date**: [Test date]

**Steps**:
1. Navigate to Playbook page
2. Tap on any play card to open detail modal
3. **CHECK**: Is the backdrop (dark area behind modal) clearly visible?
4. **CHECK**: Can you see the modal content clearly against the backdrop?
5. Tap the backdrop area (not the modal)
6. **CHECK**: Does the modal close?

**Expected Result**:
- ✅ Backdrop is dark gray/black and clearly visible
- ✅ Modal stands out against backdrop
- ✅ Tapping backdrop dismisses modal
- ✅ No transparent or "see-through" areas

---

#### Scenario 3: Test Dropdowns
**Device**: [Your device name]  
**Browser**: [Browser name]  
**Date**: [Test date]

**Steps**:
1. Navigate to Playbook page
2. Tap the 3-dot menu on any play card
3. **CHECK**: Is the dropdown menu visible (not transparent)?
4. **CHECK**: Does the dropdown stay within screen bounds?
5. Tap outside the dropdown
6. **CHECK**: Does it close?

**Expected Result**:
- ✅ Dropdown has solid background (not transparent)
- ✅ All menu items are readable
- ✅ Menu doesn't extend off screen
- ✅ Tapping outside closes menu

---

#### Scenario 4: Test Touch Targets
**Device**: [Your device name]  
**Browser**: [Browser name]  
**Date**: [Test date]

**Steps**:
1. Navigate to Playbook page
2. Try tapping various buttons (search, filter, add play, etc.)
3. **CHECK**: Do all buttons respond on first tap?
4. **CHECK**: Are hit areas large enough for comfortable tapping?

**Expected Result**:
- ✅ All buttons respond on first tap
- ✅ No need to tap multiple times
- ✅ Touch targets feel comfortable (44px minimum)
- ✅ No accidental taps on adjacent elements

---

#### Scenario 5: Test Pull-to-Refresh
**Device**: [Your device name]  
**Browser**: [Browser name]  
**Date**: [Test date]

**Steps**:
1. Navigate to Playbook page
2. Scroll to top of plays list
3. Pull down on the screen
4. **CHECK**: Does refresh indicator appear?
5. Release to trigger refresh
6. **CHECK**: Does data reload?

**Expected Result**:
- ✅ Pull-to-refresh gesture works
- ✅ Indicator shows while refreshing
- ✅ Plays data reloads
- ✅ Console shows new fetch logs

---

### Advanced Testing

#### Test A: Offline Behavior (PWA)
1. Turn on Airplane Mode
2. Navigate to previously visited pages
3. **CHECK**: Do pages load from cache?
4. Try to create/edit data
5. **CHECK**: Does app show offline message?

#### Test B: Orientation Change
1. View Playbook in portrait mode
2. Rotate device to landscape
3. **CHECK**: Does layout adjust properly?
4. **CHECK**: Are all elements still accessible?

#### Test C: Different Screen Sizes
Test on:
- Small phone (iPhone SE, Pixel 5)
- Medium phone (iPhone 14, Galaxy S23)
- Large phone (iPhone 14 Pro Max, Galaxy S23 Ultra)
- Tablet (iPad, Galaxy Tab)

**CHECK**: Layout works on all sizes

---

## 🐛 Reporting Issues

If you find an issue during testing, please include:

### Issue Report Template

```markdown
**Issue**: [Brief description]

**Device**: [e.g., iPhone 14 Pro, iOS 17.1]
**Browser**: [e.g., Safari, Chrome Mobile]
**Date**: [Test date]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Console Logs** (if available):
```
[Paste console output here, especially lines with 📱 emoji]
```

**Screenshots**:
[Attach screenshots if helpful]

**Additional Context**:
[Any other relevant information]
```

### Where to Report
- Create GitHub issue with "mobile" label
- Ping in team Slack channel
- Add to `docs/MOBILE_AUDIT_DEC7_2025.md` testing log section

---

## 📊 Test Results Template

### Device Matrix

| Device | OS | Browser | Scenario 1 | Scenario 2 | Scenario 3 | Scenario 4 | Scenario 5 | Notes |
|--------|----|---------|-----------|-----------|-----------|-----------|-----------| ------|
| iPhone 14 Pro | iOS 17 | Safari | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| iPhone SE | iOS 16 | Safari | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| Galaxy S23 | Android 13 | Chrome | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |
| iPad Pro | iPadOS 17 | Safari | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | |

Legend: ⏳ Not Tested | ✅ Pass | ❌ Fail | ⚠️ Issue Found

### Summary Statistics
- **Total Devices Tested**: 0
- **Pass Rate**: 0%
- **Critical Issues**: 0
- **Minor Issues**: 0
- **Blockers**: 0

---

## 🔍 Debug Console Output Reference

When testing, look for these console log patterns:

### Successful Data Load
```
📱 [Mobile Debug - useTeamsData] Starting data fetch
📱 [Mobile Debug - useTeamsData] Plays fetched: { count: 42, hasMore: false, ... }
📱 [Mobile Debug - PlaybookPage] { allPlaysCount: 42, ... }
```

### Missing Plays (RLS Issue)
```
📱 [Mobile Debug - useTeamsData] Plays fetched: { count: 0, ... }
📱 [Mobile Debug - PlaybookPage] { allPlaysCount: 0, teamPlaybooksCount: 1, ... }
```

### Auth Issue
```
🔧 VITE_SUPABASE_URL: MISSING
[BoxCall] Using dev Supabase stub
```

### Network Error
```
📱 [Mobile Debug - useTeamsData] Plays fetch error: { error: "connection timeout", ... }
```

---

## 💡 Common Issues & Solutions

### Issue: No plays show up
**Solution**: Check console for:
- Auth state (user ID should be present)
- Team membership (activeTeamId should match team)
- Playbook selection (selectedPlaybookId should be valid)
- RLS policies (plays count should be > 0 from database)

### Issue: Modal backdrop is transparent
**Solution**: Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R) to clear cached CSS.

### Issue: Dropdowns off-screen
**Solution**: Check viewport size in console logs. May need responsive positioning fix.

### Issue: Buttons too small to tap
**Solution**: Check if touch target is < 44px. May need padding increase.

---

## ✅ Sign-Off

After completing all tests, the following should be verified:

- [ ] Plays load correctly on all tested devices
- [ ] All modals have visible backdrops
- [ ] All dropdowns are accessible and not transparent
- [ ] All touch targets meet 44px minimum
- [ ] Pull-to-refresh works on all devices
- [ ] No console errors on mobile
- [ ] Performance is acceptable (< 3s page load)
- [ ] PWA installation works on iOS and Android

**Tested by**: [Your name]  
**Date**: [Test completion date]  
**Sign-off**: [ ] Ready for production / [ ] Needs additional fixes
