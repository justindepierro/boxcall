# Mobile Experience Audit - December 7, 2025

## 🚨 Critical Issues Reported

### Issue #1: Plays Not Visible on Mobile Playbook
**Reported**: User cannot see plays when logged into phone account  
**Status**: 🔴 INVESTIGATING  
**Priority**: P0 - Blocker

**Initial Investigation**:
- ✅ RLS policies exist for plays table (line 591-607 in schema.sql)
- ✅ useTeamsData hook fetches plays with pagination (100 at a time)
- ✅ Mobile view uses same data source as desktop (PlaybookPage.tsx line 91)
- 🔍 Need to verify: Auth state on mobile, team membership, playbook selection

**Potential Root Causes**:
1. **Authentication Issue**: User may not be properly authenticated on mobile
   - Check: `useAuth()` hook returns valid user
   - Check: Auth token persists in mobile browser
2. **Team Membership Issue**: User may not have active team_member record
   - RLS policy requires: `tm.status = 'active'` AND user in team_members table
   - Check: team_members record exists with status='active'
3. **Playbook Selection Issue**: No playbook selected or selectedPlaybookId invalid
   - Check: localStorage persistence of `bc_active_playbook_${activeTeamId}`
   - Check: teamPlaybooks array has items
4. **Mobile Browser Caching**: Stale data or cached empty state
   - Check: Pull-to-refresh functionality working
   - Check: React Query cache invalidation

**Data Flow Check**:
```
User Auth → team_members → playbooks → plays
     ↓           ↓             ↓          ↓
  auth.uid()  RLS policy   pb.team_id  pb.id = plays.playbook_id
```

**Files to Debug**:
- `src/hooks/useTeamsData.ts` (lines 169-401) - Data fetching
- `src/pages/PlaybookPage.tsx` (lines 75-120) - Playbook selection
- `src/components/playbook/page/MobilePlaybookView.tsx` - Mobile UI
- `database/schema.sql` (lines 591-607) - RLS policies

---

### Issue #2: Transparent/Invisible Modal Backdrops
**Reported**: Hard time opening modals, dropdowns sometimes transparent  
**Status**: 🔴 CRITICAL  
**Priority**: P0 - Blocker

**Initial Investigation**:
- ⚠️ Modal.tsx has default zIndex=9999 (line 79) - inconsistent with design system
- ⚠️ getBackdropStyles() uses `bg-black/80` (line 65) - should be opaque on mobile
- ⚠️ Some modals use custom z-index values (CreatePersonnelModal z-[60]/z-[70])
- ✅ Design system has standardized z-index tokens (tailwind.config.js)

**Design System Z-Index Tokens** (from tailwind.config.js):
```
z-dropdown:        1000
z-sticky:          1020
z-fixed:           1030
z-modal-backdrop:  1040
z-modal:           1050
z-popover:         1060
z-tooltip:         1070
```

**Problems Identified**:
1. **Inconsistent Z-Index**: Modal.tsx defaults to 9999 instead of design tokens
2. **Backdrop Opacity**: May be too transparent on some mobile devices
3. **Stacking Context Issues**: Some modals use arbitrary z-[60], z-[70] values
4. **iOS Safari Issues**: Potential backdrop-filter incompatibility

**Files with Z-Index Issues**:
- `src/components/ui/Modal/Modal.tsx` - zIndex=9999 default (should use z-modal)
- `src/components/playbook/modals/CreatePersonnelModal.tsx` - z-[60], z-[70]
- `src/components/playbook/modals/CreateFormationModal.tsx` - z-[60], z-[70]
- `src/components/playbook/modals/EditPersonnelBadgeModal.tsx` - z-[60], z-[70]

**Recommended Fixes**:
1. Update Modal.tsx default zIndex to use design token constant
2. Increase backdrop opacity for mobile (bg-black/90 minimum)
3. Audit all modal components for z-index consistency
4. Test backdrop-blur-sm on iOS Safari (may need fallback)

---

## 📱 Mobile Audit Checklist

### Touch Target Compliance (44px minimum)
- [ ] All buttons meet 44px minimum touch target
- [ ] Dropdown triggers are large enough
- [ ] Checkbox/radio inputs have large hit areas
- [ ] Icon-only buttons have proper padding
- [ ] Tab bar items meet size requirements

### Modal & Overlay Issues
- [ ] All modals have opaque, visible backdrops
- [ ] Z-index values use design system tokens
- [ ] Modals dismiss properly on backdrop tap
- [ ] No stacking context conflicts
- [ ] Smooth animations on open/close

### Dropdown Behavior
- [ ] Dropdowns open in correct direction (don't go off-screen)
- [ ] Dropdown content is fully visible
- [ ] Backdrop allows dismissal on outside tap
- [ ] Select/option elements are large enough
- [ ] Autocomplete dropdowns positioned correctly

### Form Input Issues
- [ ] Inputs trigger mobile keyboard appropriately
- [ ] Inputs have proper inputMode attributes
- [ ] Search inputs show search keyboard
- [ ] Number inputs show numeric keyboard
- [ ] Email inputs show email keyboard

### Navigation & Layout
- [ ] Bottom nav doesn't overlap content
- [ ] Fixed headers stay in position during scroll
- [ ] Safe area insets respected (iPhone notch, etc.)
- [ ] Pull-to-refresh works correctly
- [ ] Swipe gestures don't conflict

### Performance on Mobile
- [ ] Images optimized/lazy loaded
- [ ] No layout shift during data loading
- [ ] Skeleton screens show immediately
- [ ] React Query cache working
- [ ] Service worker caching enabled

### iOS Safari Specific
- [ ] Backdrop-filter works (or has fallback)
- [ ] Viewport height issues handled (100vh vs 100dvh)
- [ ] Touch events don't double-fire
- [ ] Input zoom disabled (font-size >= 16px)
- [ ] Momentum scrolling enabled

### Android Chrome Specific
- [ ] Viewport height consistent
- [ ] Address bar auto-hide works
- [ ] PWA install prompt shows
- [ ] Touch feedback visible
- [ ] Back button behavior correct

---

## 🔧 Immediate Actions Required

### 1. Debug Plays Not Loading (P0) ✅ COMPLETED
**Status**: Debug logging implemented (Dec 7, 2025)

**Changes Made**:
- ✅ Added debug logging to `PlaybookPage.tsx` (logs team/playbook/plays state on mobile)
- ✅ Added debug logging to `useTeamsData.ts` (logs data fetch start, success, errors)
- ✅ Logs include: user agent, viewport size, orientation, play count, playbook IDs
- ✅ Mobile-specific logs marked with 📱 emoji for easy filtering

**Test Script Added**:
```typescript
// PlaybookPage.tsx - logs on mobile devices only
useEffect(() => {
  if (isMobileOrTablet) {
    console.log("📱 [Mobile Debug - PlaybookPage]", {
      timestamp: new Date().toISOString(),
      activeTeamId,
      teamPlaybooksCount: teamPlaybooks.length,
      selectedPlaybookId,
      allPlaysCount: allPlaysForStats.length,
      // ... detailed state
    });
  }
}, [dependencies]);
```

**Next Steps**:
1. Deploy to staging/production
2. Test on real mobile device
3. Check browser console for 📱 debug logs
4. Verify plays load or identify RLS/auth issue

---

### 2. Fix Modal Backdrop Issues (P0) ✅ COMPLETED
**Status**: All modal components updated (Dec 7, 2025)

**Changes Made**:
✅ **Modal.tsx** (src/components/ui/Modal/Modal.tsx):
- Changed default zIndex from 9999 to 1050 (z-modal design token)
- Increased backdrop opacity from `bg-black/80` to `bg-black/90`
- Now uses consistent design system values

✅ **CreatePersonnelModal.tsx**:
- Changed backdrop z-index from `z-[60]` to `z-modal-backdrop`
- Changed modal z-index from `z-[70]` to `z-modal`
- Increased backdrop opacity from `bg-black/60` to `bg-black/90`

✅ **CreateFormationModal.tsx**:
- Changed backdrop z-index from `z-[60]` to `z-modal-backdrop`
- Changed modal z-index from `z-[70]` to `z-modal`
- Increased backdrop opacity from `bg-black/60` to `bg-black/90`

✅ **EditPersonnelBadgeModal.tsx**:
- Changed backdrop z-index from `z-[60]` to `z-modal-backdrop`
- Changed modal z-index from `z-[70]` to `z-modal`
- Increased backdrop opacity from `bg-black/70` to `bg-black/90`

**Before/After**:
```typescript
// BEFORE (inconsistent)
zIndex = 9999  // Modal.tsx
className="z-[60]"  // Backdrop in custom modals
className="z-[70]"  // Modal in custom modals
className="bg-black/60"  // Backdrop opacity

// AFTER (design system tokens)
zIndex = 1050  // Uses z-modal design token value
className="z-modal-backdrop"  // 1040
className="z-modal"  // 1050
className="bg-black/90"  // More opaque for mobile
```

**Design System Alignment**:
- z-modal-backdrop: 1040 (backdrops behind modals)
- z-modal: 1050 (modal content)
- All values now match `tailwind.config.js` tokens

---

### 3. Comprehensive Mobile Testing (P1) 🔄 IN PROGRESS
**Status**: Testing guide created, awaiting device testing

**Testing Resources**:
- ✅ Created `docs/MOBILE_TESTING_GUIDE_DEC7_2025.md` with 5 test scenarios
- ✅ Device matrix template (iPhone, Android, iPad)
- ✅ Issue report template
- ✅ Console log reference guide

**Devices to Test**:
- iPhone 14 Pro (iOS 17) - Safari
- iPhone SE (iOS 16) - Safari
- Samsung Galaxy S23 (Android 13) - Chrome
- iPad Pro (iPadOS 17) - Safari
- Desktop Chrome DevTools mobile emulation

**Test Scenarios** (see MOBILE_TESTING_GUIDE_DEC7_2025.md):
1. ⏳ Login → Navigate to Playbook → Verify plays load
2. ⏳ Open play detail modal → Verify backdrop visible → Tap to dismiss
3. ⏳ Open filters dropdown → Verify not transparent → Verify positioning
4. ⏳ Create new play → Test all form inputs → Save
5. ⏳ Pull-to-refresh → Verify data reloads

**Next Actions**:
1. Deploy latest code to staging
2. Execute test scenarios on real devices
3. Document results in testing guide
4. File issues for any failures found

---

## 📊 Known Mobile Issues (from past audits)

### From QUICK_WINS_COMPLETE_NOV29_2025.md:
✅ Z-Index standardization completed (34 files updated)  
✅ Backdrop colors standardized (bg-backdrop tokens)  
⚠️ Some modals still use arbitrary z-index values

### From PHASE_2_MOBILE_UI_COMPLETE.md:
✅ BottomSheet component with gesture support  
✅ Pull-to-refresh implemented  
✅ FloatingActionButton with 56px touch target  
✅ Safe area insets handled

### Outstanding Issues:
- Modal default zIndex still 9999 (not using design tokens)
- Some custom modals use z-[60], z-[70] instead of tokens
- Backdrop opacity may be insufficient on bright screens
- Plays not loading on mobile (NEW - Dec 7, 2025)

---

## 🎯 Success Criteria

**Issue #1 (Plays Loading)**:
- ✅ User can see all plays from their team's playbook on mobile
- ✅ Pull-to-refresh successfully reloads play data
- ✅ Playbook selection persists across sessions
- ✅ Loading states show properly (skeleton screens)

**Issue #2 (Modal Backdrops)**:
- ✅ All modal backdrops are clearly visible (not transparent)
- ✅ All modals use design system z-index tokens
- ✅ Backdrops dismiss modals on tap
- ✅ No z-index stacking conflicts

**Overall Mobile Experience**:
- ✅ All touch targets meet 44px minimum
- ✅ All interactive elements work on first tap
- ✅ No UI elements hidden or cut off
- ✅ Smooth, responsive animations
- ✅ PWA installation works on iOS and Android

---

## 📦 Code Changes Summary

### Files Modified (December 7, 2025)

**1. src/pages/PlaybookPage.tsx**
- Added `useEffect` hook with mobile debug logging
- Logs team state, playbook selection, plays count
- Includes viewport info (width, height, orientation)
- Only runs on mobile/tablet devices (`isMobileOrTablet` check)

**2. src/components/ui/Modal/Modal.tsx**
- Changed `zIndex` default: `9999` → `1050`
- Changed `getBackdropStyles()`: `bg-black/80` → `bg-black/90`
- Now aligns with design system z-index tokens

**3. src/hooks/useTeamsData.ts**
- Added mobile detection: `/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)`
- Logs fetch start with Supabase config check
- Logs fetch success with play count and sample data
- Logs fetch errors with detailed error info

**4. src/components/playbook/modals/CreatePersonnelModal.tsx**
- Backdrop: `z-[60]` → `z-modal-backdrop`, `bg-black/60` → `bg-black/90`
- Modal: `z-[70]` → `z-modal`

**5. src/components/playbook/modals/CreateFormationModal.tsx**
- Backdrop: `z-[60]` → `z-modal-backdrop`, `bg-black/60` → `bg-black/90`
- Modal: `z-[70]` → `z-modal`

**6. src/components/playbook/modals/EditPersonnelBadgeModal.tsx**
- Backdrop: `z-[60]` → `z-modal-backdrop`, `bg-black/70` → `bg-black/90`
- Modal: `z-[70]` → `z-modal`

**7. docs/MOBILE_AUDIT_DEC7_2025.md**
- Created comprehensive mobile audit document
- Documented both critical issues (plays not loading, transparent modals)
- Added mobile compliance checklist (touch targets, modals, dropdowns, forms)
- Added test scenarios and debugging guide

**8. docs/MOBILE_TESTING_GUIDE_DEC7_2025.md**
- Created step-by-step testing guide with 5 scenarios
- Added device matrix template for test tracking
- Added issue report template
- Added console log reference guide for debugging

### Design System Alignment

**Z-Index Tokens** (from `tailwind.config.js`):
```css
z-dropdown:        1000
z-sticky:          1020
z-fixed:           1030
z-modal-backdrop:  1040  ← Now used in all modal backdrops
z-modal:           1050  ← Now used in all modal content
z-popover:         1060
z-tooltip:         1070
```

**Before**: Mixed arbitrary values (`z-[60]`, `z-[70]`, `9999`)  
**After**: Consistent design tokens (`z-modal-backdrop`, `z-modal`)

### Performance Impact

- **Debug logging**: Minimal impact, only runs on mobile devices, only logs on state changes
- **Backdrop opacity**: No performance impact, purely visual change (80% → 90% opacity)
- **Z-index changes**: No performance impact, improves stacking order consistency

### Breaking Changes

❌ None - all changes are backwards compatible

### TypeScript Errors

✅ All files pass type-checking (verified with `get_errors` tool)

---

## 📝 Testing Log

### Test Session 1 - [DATE]
**Device**: [Device name]  
**Browser**: [Browser name]  
**Tester**: [Name]

**Results**:
- [ ] Issue #1 (Plays loading): PASS / FAIL
- [ ] Issue #2 (Modal backdrops): PASS / FAIL
- [ ] Touch targets: PASS / FAIL
- [ ] Dropdowns: PASS / FAIL

**Notes**:
[Observations, screenshots, reproduction steps]

---

## 🔗 Related Documentation

- `docs/archive/completed/QUICK_WINS_COMPLETE_NOV29_2025.md` - Z-Index standardization
- `docs/archive/2025/phases/PHASE_2_MOBILE_UI_COMPLETE.md` - Mobile UI components
- `src/constants/zIndex.ts` - Z-Index scale constants
- `tailwind.config.js` - Design system z-index tokens (lines 346-353)
- `database/schema.sql` - RLS policies (lines 467-650)

---

## 📅 Timeline

- **Dec 7, 2025**: Issues reported, audit created
- **Next**: Debug plays loading issue, fix modal backdrops
- **Target**: All P0 issues resolved within 24 hours
