# BoxCall Role Switcher & Database Audit Report

## Executive Summary

The current dev tools and role switcher have significant complexity and broken functionality due to:

1. **Multiple overlapping systems** for dev modes, role switching, and user types
2. **Confusing terminology** mixing subscription tiers with team roles
3. **Broken buttons** in dev tools due to mismatched expectations
4. **Complex database schema** that doesn't align with the business model

## Current Problems Identified

### 1. Role Switcher Complexity

**Issue**: Multiple competing systems exist:

- `ProfessionalDevTools.tsx` - Facebook messenger-style popup
- `QuickDevPanel.tsx` - Legacy quick switcher
- `CleanDevPanel.tsx` - "Phase 3" implementation
- `QuickDevPanelEnhanced.tsx` - Professional dev profile system
- `CleanDevPanel_backup.tsx` - Backup version

**Current Dev Modes**: 15+ different modes across multiple files with inconsistent naming:

```typescript
"production" |
  "blank_slate" |
  "super_admin_real" |
  "super_admin_mock" |
  "view_as_head_coach" |
  "view_as_coach" |
  "view_as_player" |
  "view_as_manager" |
  "view_as_family" |
  "dev_head_coach" |
  "dev_assistant_coach" |
  "dev_player" |
  "dev_super_admin";
```

### 2. Database Schema Issues

**Current User System** (Profiles Table):

```sql
role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'coach', 'assistant_coach', 'family', 'admin'))
```

**Problems**:

- No subscription tier tracking in database
- Role names don't match business model
- No clear distinction between app-level subscriptions vs team roles
- Team members table has separate roles, creating confusion

### 3. Terminology Confusion

**Current Mixed System**:

- App-level subscription: "head_coach" ($199), "coach" ($19.99), "player" (free)
- Team-level roles: "head_coach", "coach", "manager", "player", "family"
- Database roles: "player", "coach", "assistant_coach", "family", "admin"

## Proposed Simplified System

### 1. Clear Subscription Tiers (App Level)

```typescript
export type SubscriptionTier =
  | "boxcall_free" // $0 - Players, family, initial registration
  | "boxcall_pro" // $19.99 - Coaches
  | "boxcall_premium"; // $199.99/year - Program owners (head coaches)
```

### 2. Clear Team Roles (Program Level)

```typescript
export type TeamRole =
  | "head_coach" // Program owner (BoxCall Premium subscriber)
  | "coach" // Assistant coaches (BoxCall Pro subscribers)
  | "manager" // Administrative staff (BoxCall Free with elevated permissions)
  | "player" // Athletes (BoxCall Free)
  | "family"; // Parents/guardians (BoxCall Free)
```

### 3. Simplified Dev Mode System

Replace 15+ modes with 6 clear options:

```typescript
export type DevMode =
  | "production" // Real data, real permissions
  | "blank_slate" // New user experience
  | "test_as_head_coach" // Test head coach permissions
  | "test_as_coach" // Test assistant coach permissions
  | "test_as_player" // Test player experience
  | "test_as_family"; // Test family portal
```

## Database Schema Updates Needed

### 1. Add Subscription Tracking

```sql
-- Add to profiles table
ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'boxcall_free'
  CHECK (subscription_tier IN ('boxcall_free', 'boxcall_pro', 'boxcall_premium'));
ALTER TABLE profiles ADD COLUMN subscription_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'active'
  CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial'));
```

### 2. Clarify Role Column

```sql
-- Update existing role check
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('head_coach', 'coach', 'manager', 'player', 'family', 'admin'));
```

### 3. Team Subscription Management

```sql
-- Add team subscription tracking
ALTER TABLE teams ADD COLUMN subscription_tier TEXT DEFAULT 'boxcall_free';
ALTER TABLE teams ADD COLUMN subscription_owner_id TEXT REFERENCES profiles(id);
ALTER TABLE teams ADD COLUMN subscription_expires_at TIMESTAMPTZ;
```

## Dev Tools Button Fixes Needed

### 1. Current Broken Buttons

- **"Test DB"** - Works but unclear feedback
- **"Export State"** - Works but cluttered output
- **"Reload Data"** - Broken - tries to run Node script from frontend
- **"Clear All"** - Dangerous without proper safeguards
- **"Run All Tests"** - Cluttered output, unclear results

### 2. Proposed Simplified Dev Tools

Replace complex panel with focused tools:

```typescript
interface SimplifiedDevTools {
  // Essential info only
  currentMode: DevMode;
  currentRole: TeamRole;
  subscriptionTier: SubscriptionTier;
  dataCount: { teams: number; playbooks: number; plays: number };

  // Core actions only
  actions: {
    switchMode: (mode: DevMode) => void;
    testDatabase: () => Promise<boolean>;
    resetToProduction: () => void;
    exportDebugInfo: () => void;
  };
}
```

## Implementation Plan

### Phase 1: Simplify Dev Tools (1 day)

1. Replace multiple dev panels with single, clean component
2. Reduce dev modes from 15+ to 6 clear options
3. Fix broken buttons with proper error handling
4. Add clear visual indicators for current state

### Phase 2: Database Alignment (1 day)

1. Add subscription tier columns
2. Update role constraints
3. Create migration scripts
4. Update seed data

### Phase 3: Business Logic Update (2 days)

1. Update authentication to use new subscription system
2. Implement proper permission checking
3. Update UI to reflect clear user types
4. Test all user flows

## Immediate Actions Required

1. **Consolidate dev panels** - Keep only one, remove others
2. **Fix broken "Reload Data" button** - Remove or implement properly
3. **Clarify role vs subscription** throughout codebase
4. **Add subscription tier to user profiles**
5. **Update dev mode names** to be self-explanatory

## Benefits of Proposed System

✅ **Clear separation**: App subscriptions vs team roles  
✅ **Simplified dev tools**: 6 modes instead of 15+  
✅ **Working buttons**: All functionality properly implemented  
✅ **Business alignment**: Code matches pricing model  
✅ **Easier testing**: Clear, predictable user states  
✅ **Better UX**: Users understand their access level

## Files Requiring Updates

### High Priority

- `src/components/dev/ProfessionalDevTools.tsx` - Fix broken buttons
- `src/types/permissions.ts` - Align with business model
- `database/schema.sql` - Add subscription tracking
- `src/app/dev-mode-types.ts` - Simplify to 6 modes

### Medium Priority

- All dev panel components - Consolidate to one
- `src/app/auth-store.ts` - Support subscription tiers
- Permission checking throughout app

### Low Priority

- Update documentation
- Create migration guide
- Update tests

---

_Generated: $(date)_
_Priority: High - Blocking effective development and testing_
