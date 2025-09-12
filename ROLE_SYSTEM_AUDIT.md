# 🚨 ROLE SYSTEM AUDIT & OVERHAUL PLAN

## 📊 CURRENT STATE ANALYSIS - CRITICAL ISSUES IDENTIFIED

### 🔴 MAJOR INCONSISTENCIES FOUND

#### 1. **Multiple Conflicting Role Definitions**

**Database Schema (`database/schema.sql`)**:

```sql
role TEXT CHECK (role IN ('player', 'coach', 'assistant_coach', 'family', 'admin'))
```

**TypeScript Types (`src/types/database/tables/userTables.ts`)**:

```typescript
role: "player" | "coach" | "assistant_coach" | "family" | "admin";
```

**Database Enum (`src/types/database/index.ts`)**:

```typescript
Enums: {
  user_role: "player" | "coach" | "family" | "admin"; // ❌ MISSING assistant_coach!
}
```

**Permissions System (`src/types/permissions.ts`)**:

```typescript
export type AppUserType =
  | "super_admin"
  | "admin"
  | "head_coach"
  | "coach"
  | "player"
  | "family";
```

#### 2. **Team vs App Role Confusion**

**Problem**: We have TWO different role systems that overlap:

- **App-level roles** (subscription-based): `head_coach`, `coach`, `player`, `family`, `admin`
- **Team-level roles** (team membership): `head_coach`, `coach`, `manager`, `player`, `family`

**Current Inconsistent Usage**:

```typescript
// ProfileCard.tsx - Uses app-level role
const userRole = profile?.role || "player";

// TeamBulletin.tsx - Mixes both systems
const userRole = membershipRole || profile.role || "player";
```

#### 3. **Database Migration Inconsistencies**

**RLS Policies Use Different Role Values**:

```sql
-- Some use 'coach'
AND tm.role IN ('coach', 'admin')

-- Others use specific coaching roles
AND tm.role IN ('head_coach','assistant_coach','coordinator','manager')

-- Some use 'admin' vs 'head_coach'
WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
```

#### 4. **Permission System Mismatch**

**Permission Matrix** defines roles that don't exist in database:

- `super_admin` (not in DB)
- `head_coach` (sometimes used, sometimes not)
- Missing `assistant_coach` in some definitions

---

## 🎯 PROPOSED SOLUTION - UNIFIED ROLE ARCHITECTURE

### **Phase 1: Standardize Core Role Definitions**

#### A. **App-Level User Types** (Primary Profile Role)

```sql
-- New standardized enum in database
CREATE TYPE user_role AS ENUM (
  'super_admin',    -- System administrators
  'admin',          -- Team administrators/head coaches
  'coach',          -- Assistant coaches/coordinators
  'player',         -- Team players
  'family'          -- Family members/parents
);
```

#### B. **Team-Level Roles** (Team Membership Specific)

```sql
-- Team-specific positions within a team
CREATE TYPE team_role AS ENUM (
  'head_coach',         -- Team owner/head coach
  'assistant_coach',    -- Assistant coaches
  'coordinator',        -- Specialized coordinators (OC, DC, etc.)
  'manager',           -- Team managers
  'player',            -- Active players
  'family',            -- Family members
  'alumni'             -- Former players/coaches
);
```

### **Phase 2: Clean Database Schema**

#### Update `profiles` table:

```sql
ALTER TABLE profiles
  ALTER COLUMN role TYPE user_role USING role::user_role;
```

#### Update `team_members` table:

```sql
ALTER TABLE team_members
  ADD COLUMN team_role team_role DEFAULT 'player',
  ADD COLUMN app_permissions TEXT[] DEFAULT '{}';
```

### **Phase 3: Unified Permission System**

#### New Permission Architecture:

```typescript
interface UserPermissions {
  // App-level (subscription-based)
  appRole: "super_admin" | "admin" | "coach" | "player" | "family";
  subscriptionTier: "free" | "coach_tools" | "team_premium" | "enterprise";

  // Team-level (per team membership)
  teamMemberships: {
    teamId: string;
    role:
      | "head_coach"
      | "assistant_coach"
      | "coordinator"
      | "manager"
      | "player"
      | "family";
    permissions: Permission[];
    isActive: boolean;
  }[];
}
```

---

## 🔧 IMPLEMENTATION ROADMAP

### **Step 1: Database Schema Unification** (Priority: CRITICAL)

#### 1.1 Create New Migration

```sql
-- migration_999_role_system_overhaul.sql

-- Create standardized enums
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'coach', 'player', 'family');
CREATE TYPE team_role AS ENUM ('head_coach', 'assistant_coach', 'coordinator', 'manager', 'player', 'family', 'alumni');

-- Update profiles table
ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING
  CASE
    WHEN role = 'assistant_coach' THEN 'coach'::user_role
    ELSE role::user_role
  END;

-- Update team_members table
ALTER TABLE team_members
  ADD COLUMN team_role team_role DEFAULT 'player',
  ADD COLUMN capabilities TEXT[] DEFAULT '{}';

-- Migrate existing data
UPDATE team_members SET team_role =
  CASE
    WHEN role = 'admin' THEN 'head_coach'::team_role
    WHEN role = 'coach' THEN 'assistant_coach'::team_role
    ELSE role::team_role
  END;
```

#### 1.2 Update All RLS Policies

```sql
-- Standardize all policies to use new role system
-- Example:
CREATE POLICY "team_content_coaches_manage" ON team_posts
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = true
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );
```

### **Step 2: TypeScript Type Consolidation** (Priority: HIGH)

#### 2.1 Create Unified Type Definitions

```typescript
// src/types/roles.ts (NEW FILE)
export type AppRole = "super_admin" | "admin" | "coach" | "player" | "family";
export type TeamRole =
  | "head_coach"
  | "assistant_coach"
  | "coordinator"
  | "manager"
  | "player"
  | "family"
  | "alumni";

export interface UserRoleContext {
  appRole: AppRole;
  teamMemberships: {
    teamId: string;
    teamRole: TeamRole;
    capabilities: string[];
    isActive: boolean;
  }[];
}
```

#### 2.2 Update Database Types

```typescript
// Update src/types/database/tables/userTables.ts
profiles: {
  Row: {
    id: string;
    role: AppRole;  // Standardized
    // ... other fields
  };
}

team_members: {
  Row: {
    id: string;
    team_id: string;
    user_id: string;
    team_role: TeamRole;  // NEW: Specific team role
    capabilities: string[];  // NEW: Granular permissions
    is_active: boolean;
  };
}
```

### **Step 3: Service Layer Refactoring** (Priority: HIGH)

#### 3.1 Create Role Resolution Service

```typescript
// src/services/roleService.ts (NEW FILE)
export class RoleService {
  /**
   * Get user's role context (app + team roles)
   */
  static async getUserRoleContext(
    userId: string,
    teamId?: string
  ): Promise<UserRoleContext> {
    // Implementation
  }

  /**
   * Check if user has specific capability
   */
  static hasCapability(
    context: UserRoleContext,
    capability: string,
    teamId?: string
  ): boolean {
    // Implementation
  }

  /**
   * Get effective permissions for UI rendering
   */
  static getUIPermissions(
    context: UserRoleContext,
    teamId?: string
  ): UIPermissions {
    // Implementation
  }
}
```

#### 3.2 Update All Components

```typescript
// Before (inconsistent)
const userRole = profile?.role || "player";
const isCoach = userRole === "coach";

// After (standardized)
const roleContext = useRoleContext();
const canManageTeam = RoleService.hasCapability(
  roleContext,
  "team.manage",
  teamId
);
```

### **Step 4: UI Component Updates** (Priority: MEDIUM)

#### 4.1 ProfileCard Role Display

```typescript
// Clean role display logic
const getRoleDisplayName = (appRole: AppRole, teamRole?: TeamRole) => {
  if (teamRole) {
    return teamRole.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }
  return appRole.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
};
```

#### 4.2 Navigation & Feature Gating

```typescript
// Consistent permission checks across all components
const canAccessPlaybook = RoleService.hasCapability(
  roleContext,
  "playbook.access",
  teamId
);
const canManageRoster = RoleService.hasCapability(
  roleContext,
  "roster.manage",
  teamId
);
```

---

## 🎯 IMMEDIATE ACTION ITEMS

### **WEEK 1: Database Foundation**

1. ✅ Create migration for enum types
2. ✅ Update `profiles` table role column
3. ✅ Add `team_role` to `team_members`
4. ✅ Update all RLS policies
5. ✅ Test database changes

### **WEEK 2: Type System**

1. ✅ Create unified role type definitions
2. ✅ Update all database type files
3. ✅ Create RoleService utility
4. ✅ Update permission checking logic

### **WEEK 3: Component Updates**

1. ✅ Update ProfileCard role logic
2. ✅ Fix ProfileEditModal role-based forms
3. ✅ Update navigation permission checks
4. ✅ Test all role-dependent UI

### **WEEK 4: Testing & Validation**

1. ✅ Create role-based test scenarios
2. ✅ Validate permission enforcement
3. ✅ Test role transitions (coach promotion, etc.)
4. ✅ Performance testing

---

## 🚨 BREAKING CHANGES & MIGRATION NOTES

### **Data Migration Required**

- All existing `assistant_coach` roles → `coach` (app level) + `assistant_coach` (team level)
- All `admin` roles → `admin` (app level) + `head_coach` (team level)

### **Code Changes Required**

- Update all `profile.role` references
- Replace hardcoded role strings with enum values
- Update permission checking logic throughout app

### **RLS Policy Updates**

- All policies using role-based checks need updating
- New policies for team-role-based permissions

---

## 📈 EXPECTED BENEFITS

1. **Consistency**: Single source of truth for all role definitions
2. **Scalability**: Clear separation of app vs team permissions
3. **Maintainability**: Centralized role logic and permission checking
4. **Security**: Proper granular permission enforcement
5. **Developer Experience**: Clear, type-safe role handling

---

## 🔍 TESTING STRATEGY

### **Role Transition Tests**

```typescript
describe("Role System", () => {
  it("should handle coach promotion correctly", () => {
    // Test app-level and team-level role changes
  });

  it("should enforce permissions correctly", () => {
    // Test permission inheritance and overrides
  });

  it("should render UI elements based on roles", () => {
    // Test conditional rendering
  });
});
```

### **Database Integrity Tests**

- Validate all RLS policies work with new role system
- Test role-based data access patterns
- Verify migration doesn't break existing data

---

This comprehensive overhaul will solve all the current role inconsistencies and provide a solid foundation for future development.

# [ARCHIVED] Historical Reference

This document is kept for history. For current status and roadmap, see `docs/CURRENT_STATUS.md` and `docs/product/ROADMAP.md`.
