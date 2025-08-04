# Role-Based Access Control (RBAC) & Data Master Plan

> **Generated**: August 4, 2025  
> **Status**: Comprehensive RBAC Strategy + Mock Data Cleanup + Coach Account Integration  
> **Purpose**: Future-proof role/permission system with proper data management

## 🎯 **Executive Summary**

**Current Problem**: Role switching chaos, inconsistent permissions, mock data bleeding through  
**Industry Standard**: RBAC with clear separation of concerns (Authentication vs Authorization vs Data Scoping)  
**Goal**: Clean, testable, maintainable permission system + proper dev environment + Coach Account system  
**Priority**: Critical - affects security, UX, and development workflow

## 🆕 **NEW: Coach Account System**

### **Coach Account Overview**

- **Standalone Personal Accounts**: $9.99 one-time purchase
- **Personal Playbook Library**: Individual coach's plays, practices, game plans
- **Team Integration Ready**: Import personal content when joining teams
- **No Recurring Fees**: Lifetime access to coaching tools
- **Team Code System**: Can be linked to teams via school/team codes

### **Coach Account Role Type**

```typescript
export enum UserRole {
  SUPER_ADMIN = "super_admin", // System-wide access (YOU)
  COACH_INDIVIDUAL = "coach_individual", // 🆕 Personal coach account
  TEAM_OWNER = "team_owner", // Team creator/owner
  HEAD_COACH = "head_coach", // Full team management
  ASSISTANT_COACH = "coach", // Limited team management
  TEAM_MANAGER = "manager", // Administrative tasks
  PLAYER = "player", // Player-specific features
  FAMILY = "family", // Family portal access
  VIEWER = "viewer", // Read-only access
}
```

### **Coach Account Permissions**

```typescript
// New Coach-Specific Permissions
MANAGE_PERSONAL_PLAYBOOK = "coach:personal_playbook",
CREATE_PRACTICE_PLANS = "coach:practice_plans",
EXPORT_IMPORT_CONTENT = "coach:import_export",
REQUEST_TEAM_LINK = "coach:request_team_link",
VIEW_COACHING_ANALYTICS = "coach:analytics",
```

### **Coach Account Data Model**

```typescript
interface CoachAccount {
  id: string;
  userId: string; // Links to User table
  subscriptionType: "coach_individual";
  purchaseDate: Date;
  isActive: boolean;

  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    address: Address;
  };

  // Coaching Background
  coachingInfo: {
    primarySport: string;
    yearsExperience: string;
    coachingLevel: string;
  };

  // Team Connection
  teamConnections: {
    teamId?: string;
    schoolCode?: string;
    requestedTeamLink?: boolean;
    linkStatus: "none" | "pending" | "approved" | "rejected";
  }[];

  // Personal Content
  personalPlaybooks: PlaybookLibrary;
  practicePlans: PracticePlan[];
  gamePlans: GamePlan[];
}
```

### **Coach Account Flow Integration**

1. **New User Path**: Account creation → Optional $9.99 coach upgrade → Personal dashboard
2. **Existing User Path**: Add coach account from dashboard → $9.99 purchase → Enhanced features
3. **Team Integration Path**:
   - Enter team/school code during coach account creation
   - OR join team later and import personal content
   - Head Coach approves coach account linking
4. **Content Migration**: Personal playbooks → Team playbooks (import/copy, not move)

---

## 🏗️ **Industry Standard RBAC Architecture**

### **Core Principles (OAuth 2.0 + RBAC Best Practices)**

1. **Separation of Concerns**:
   - **Authentication**: Who you are (`justindepierro@gmail.com`)
   - **Authorization**: What you can do (permissions)
   - **Data Scoping**: What data you see (team membership, dev modes)

2. **Hierarchical Roles** (Industry Standard):

   ```typescript
   // Primary Role Hierarchy
   export enum UserRole {
     SUPER_ADMIN = "super_admin", // System-wide access (YOU)
     TEAM_OWNER = "team_owner", // Team creator/owner
     HEAD_COACH = "head_coach", // Full team management
     ASSISTANT_COACH = "coach", // Limited team management
     TEAM_MANAGER = "manager", // Administrative tasks
     PLAYER = "player", // Player-specific features
     FAMILY = "family", // Family portal access
     VIEWER = "viewer", // Read-only access
   }
   ```

3. **Permission-Based Actions** (What you can DO):

   ```typescript
   export enum Permission {
     // Team Management
     CREATE_TEAM = "team:create",
     DELETE_TEAM = "team:delete",
     MANAGE_TEAM_SETTINGS = "team:manage",

     // User Management
     INVITE_USERS = "users:invite",
     MANAGE_ROLES = "users:manage_roles",
     REMOVE_USERS = "users:remove",

     // Content Management
     CREATE_PLAYS = "content:create_plays",
     EDIT_SCHEDULE = "content:edit_schedule",
     MANAGE_ACHIEVEMENTS = "content:manage_achievements",

     // System (Super Admin Only)
     ACCESS_ALL_TEAMS = "system:access_all_teams",
     MANAGE_BILLING = "system:manage_billing",
     VIEW_ANALYTICS = "system:view_analytics",
   }
   ```

4. **Data Scoping** (What data you SEE):

   ```typescript
   export interface DataScope {
     mode: DataScopeMode;
     teamIds: string[];
     userId?: string;
     restrictions?: DataRestriction[];
   }

   export enum DataScopeMode {
     PRODUCTION = "production", // Real user data
     DEV_BLANK_SLATE = "dev_blank", // Empty state testing
     DEV_MOCK_TEAM = "dev_mock", // Mock team data
     SYSTEM_WIDE = "system_wide", // Super admin sees all
   }
   ```

### **Your Specific Case: Super Admin Powers**

Since you're `justindepierro@gmail.com` (the system owner), you should have:

```typescript
// Your User Profile
{
  email: "justindepierro@gmail.com",
  role: UserRole.SUPER_ADMIN,
  permissions: [
    Permission.CREATE_TEAM,         // ✅ Create teams at will
    Permission.ACCESS_ALL_TEAMS,    // ✅ See any team data
    Permission.MANAGE_ROLES,        // ✅ Switch between any role
    // ... ALL permissions
  ],
  dataScope: {
    mode: DataScopeMode.SYSTEM_WIDE,  // Can see everything
    teamIds: ["*"],                   // All teams
    restrictions: []                  // No restrictions
  }
}
```

---

## 🛠️ **Proposed RBAC Implementation**

### **1. Core RBAC Service**

```typescript
// src/services/rbac/RBACService.ts
export class RBACService {
  // Check if user has specific permission
  static hasPermission(
    user: UserProfile,
    permission: Permission,
    context?: { teamId?: string }
  ): boolean {
    // Super admin override (YOU)
    if (user.email === "justindepierro@gmail.com") {
      return true; // ✅ Unlimited access
    }

    // Regular permission checking logic
    return user.permissions?.includes(permission) || false;
  }

  // Get effective permissions for UI rendering
  static getEffectivePermissions(
    user: UserProfile,
    devMode?: DevMode
  ): Permission[] {
    // Super admin gets everything
    if (user.email === "justindepierro@gmail.com") {
      return Object.values(Permission);
    }

    // Dev mode overrides for testing
    if (devMode && devMode !== "production") {
      return this.getDevModePermissions(devMode);
    }

    // Production permissions
    return user.permissions || [];
  }

  // Get data scope (what data user can see)
  static getDataScope(user: UserProfile, devMode?: DevMode): DataScope {
    // Super admin sees everything
    if (user.email === "justindepierro@gmail.com") {
      return {
        mode:
          devMode === "blank_slate"
            ? DataScopeMode.DEV_BLANK_SLATE
            : DataScopeMode.SYSTEM_WIDE,
        teamIds: ["*"],
        restrictions: [],
      };
    }

    // Regular users see their team data
    return {
      mode: DataScopeMode.PRODUCTION,
      teamIds: user.teamMemberships?.map((m) => m.teamId) || [],
      restrictions: this.getUserRestrictions(user),
    };
  }
}
```

### **2. Permission Hooks (React)**

```typescript
// src/hooks/usePermissions.ts
export const usePermissions = () => {
  const { user } = useAuth();
  const { devMode } = useDevMode();

  const hasPermission = useCallback(
    (permission: Permission, context?: { teamId?: string }) => {
      return RBACService.hasPermission(user, permission, context);
    },
    [user]
  );

  const canCreateTeam = hasPermission(Permission.CREATE_TEAM);
  const canManageTeam = (teamId: string) =>
    hasPermission(Permission.MANAGE_TEAM_SETTINGS, { teamId });

  return {
    hasPermission,
    canCreateTeam,
    canManageTeam,
    isSystemAdmin: user?.email === "justindepierro@gmail.com",
  };
};
```

### **3. UI Components with Permissions**

```typescript
// Example usage in components
export const TeamCreationButton = () => {
  const { canCreateTeam } = usePermissions();

  if (!canCreateTeam) {
    return null; // Hidden for users without permission
  }

  return (
    <button onClick={handleCreateTeam}>
      Create Team
    </button>
  );
};
```

---

## 🔧 **Dev Mode Integration**

### **Clean Dev Mode Types**

```typescript
export type DevMode =
  | "production" // Real data, real permissions
  | "blank_slate" // Empty state, real permissions
  | "dev_head_coach" // Mock data + head coach permissions
  | "dev_player" // Mock data + player permissions
  | "dev_family" // Mock data + family permissions
  | "dev_system_admin"; // Mock data + system admin permissions

// No more "super_admin_real" confusion!
```

### **Data Resolution Strategy**

```typescript
export class DataResolutionService {
  static resolveUserData(user: UserProfile, devMode: DevMode) {
    const dataScope = RBACService.getDataScope(user, devMode);

    switch (dataScope.mode) {
      case DataScopeMode.SYSTEM_WIDE:
        return this.getSystemWideData(); // Your real data + all teams

      case DataScopeMode.PRODUCTION:
        return this.getUserTeamData(user.id); // Real user data

      case DataScopeMode.DEV_BLANK_SLATE:
        return this.getEmptyStateData(); // Clean empty state

      case DataScopeMode.DEV_MOCK_TEAM:
        return this.getMockTeamData(devMode); // Consistent mock data
    }
  }
}
```

---

## 📋 **Implementation Roadmap**

### **Phase 1: RBAC Foundation** ✅ **COMPLETED**

- [x] Create `RBACService` with super admin override for justindepierro@gmail.com ✅ **DONE**
- [x] Implement `usePermissions` hook ✅ **DONE**
- [x] Create RBAC types (`src/types/rbac.ts`) ✅ **DONE**
- [x] Add permission checks to team creation flows ✅ **DONE**
- [x] Update TeamBulletin with super admin indicators ✅ **DONE**
- [x] Super admin email override system working ✅ **DONE**
- [x] Fix team creation UI issues (bullseye icon, emoji cleanup) ✅ **DONE**
- [x] Create comprehensive team creation wizard ✅ **DONE**
- [x] Create team joining workflow ✅ **DONE**
- [x] Implement routing for team creation/joining ✅ **DONE**
- [x] Create Coach Account system ($9.99 standalone) ✅ **DONE**
- [x] Test with your account extensively ✅ **COMPLETED**

### **Phase 2: Coach Account Integration** ✅ **COMPLETED**

- [x] Design Coach Account data model ✅ **DONE**
- [x] Create Coach Account creation flow ✅ **DONE**
- [x] Implement 7-step coach onboarding wizard ✅ **DONE**
- [x] Add school/team code connection system ✅ **DONE**
- [x] Route integration (`/create-coach-account`) ✅ **DONE**
- [x] Update payment page with coach account option ✅ **DONE**
- [x] Add `COACH_INDIVIDUAL` role to RBAC system ✅ **DONE**
- [x] Document coach account permissions ✅ **DONE**

### **Phase 3: Clean Dev Modes** 🔄 **NEXT PRIORITY**

- [ ] Simplify dev mode types (remove confusing ones) 📝 **PLANNED**
- [ ] Implement `DataResolutionService` 📝 **PLANNED**
- [ ] Clean up all role-switching logic 📝 **PLANNED**
- [ ] Add clear dev mode indicators 📝 **PLANNED**
- [ ] Remove mock data bleeding into production mode 📝 **PLANNED**

### **Phase 4: Team Management Features** 📝 **FUTURE**

- [ ] School verification system integration 📝 **PLANNED**
- [ ] Team ownership transfer functionality 📝 **PLANNED**
- [ ] Head coach role assignment/transfer 📝 **PLANNED**
- [ ] Coach account → team integration workflow 📝 **PLANNED**
- [ ] Personal playbook → team playbook import 📝 **PLANNED**

### **Phase 5: Payment System Integration** 📝 **FUTURE**

- [ ] Stripe for Education integration 📝 **PLANNED**
- [ ] Team subscription billing ($199/year) 📝 **PLANNED**
- [ ] Coach account billing ($9.99 one-time) 📝 **PLANNED**
- [ ] School/district enterprise billing 📝 **PLANNED**
- [ ] Payment verification and access control 📝 **PLANNED**

---

## 🎯 **Current Status & Next Steps**

### **✅ What's Been Completed (Phases 1 & 2)**

1. **Core RBAC Infrastructure**:
   - `RBACService.ts` with super admin override for `justindepierro@gmail.com`
   - `usePermissions.ts` hook for React components
   - Complete RBAC type definitions in `rbac.ts`

2. **Super Admin Powers Implemented**:
   - Email-based super admin detection (`justindepierro@gmail.com`)
   - Unlimited permissions for system owner
   - Special UI indicators in TeamBulletin

3. **Team Management System**:
   - Multi-step team creation wizard (10 steps)
   - Team joining workflows with multiple options
   - School/mascot field separation
   - Auto-season assignment (2024-2025)
   - Proper routing integration (`/create-team`, `/join-team`)

4. **Coach Account System**:
   - Standalone $9.99 coach account creation
   - 7-step coach onboarding wizard
   - Personal playbook system foundation
   - Team connection via school codes
   - Complete UI/UX matching team creation flow
   - Route integration (`/create-coach-account`)

5. **UI/UX Improvements**:
   - Fixed bullseye icon → BoxCall logo
   - Removed emoji from super admin indicators
   - Professional payment page with founders pricing
   - Consistent design patterns across flows
   - Responsive mobile-friendly layouts

### **🔄 Current Focus (Phase 3)**

**Next Priority: Clean Up Dev Mode Chaos**

The core functionality is working great, but the dev mode system needs cleanup:

1. **Simplify Dev Mode Names** - Remove confusing modes like `super_admin_real`
2. **Data Resolution Service** - Clean separation between mock and real data
3. **Clear Dev Indicators** - Users should know what data they're seeing
4. **Mock Data Isolation** - Prevent bleeding into production mode

### **⚠️ Known Issues to Address**

- [x] ~~Team icon showing bullseye instead of BoxCall logo~~ ✅ **FIXED**
- [x] ~~Remove emoji from super admin button~~ ✅ **FIXED**
- [x] ~~Team creation flow restrictions~~ ✅ **FIXED**
- [x] ~~Missing team creation/joining routes~~ ✅ **FIXED**
- [x] ~~Coach account system needed~~ ✅ **IMPLEMENTED**
- [ ] Dev mode names are still confusing (`super_admin_real` etc.)
- [ ] Data resolution service not yet implemented
- [ ] Mock data can bleed into production views
- [ ] Payment integration placeholders need real implementation

### **1. Give You Super Admin Powers**

```typescript
// In auth or permission service
if (user?.email === "justindepierro@gmail.com") {
  return {
    ...user,
    role: UserRole.SUPER_ADMIN,
    permissions: Object.values(Permission), // ALL permissions
    canCreateTeamUnlimited: true,
    canAccessAllData: true,
  };
}
```

### **2. Fix Team Creation Flow**

- Remove artificial role restrictions for super admin
- Add unlimited team creation for you
- Clean up confusing permission checks

### **3. Streamline Dev Mode UI**

- Remove confusing mode names
- Clear indicators of what data you're seeing
- Consistent behavior across all components

---

## 🏆 **Success Criteria**

### **For You (Super Admin)**

- ✅ Can create teams without restrictions
- ✅ Can switch between any role for testing
- ✅ Can create coach accounts without limitations
- ✅ No artificial limitations in any flow
- ✅ Clear super admin indicators throughout UI
- [ ] 🔄 Clear understanding of what data you're seeing (needs dev mode cleanup)

### **For Development**

- ✅ Consistent permission checking across all components
- ✅ Easy to add new roles/permissions
- ✅ Testable permission scenarios
- ✅ Clean separation of dev/production data architecture
- ✅ Coach account system fully integrated
- [ ] 🔄 Clean dev mode names and data resolution

### **For Future Users**

- ✅ Clear role hierarchy (SUPER_ADMIN → COACH_INDIVIDUAL → TEAM_OWNER → HEAD_COACH → etc.)
- ✅ Predictable permissions based on role
- ✅ Secure by default with super admin override
- ✅ Scalable to enterprise needs
- ✅ Coach account onboarding flow
- ✅ Team creation and joining workflows

---

## 💡 **Key Insights & Lessons Learned**

1. **You're the system owner** - unlimited access implemented and working ✅
2. **RBAC is about predictability** - same role = same permissions (implemented) ✅
3. **Coach accounts fill a gap** - standalone coaching tools before team commitment ✅
4. **UI consistency matters** - shared design patterns across all flows ✅
5. **Dev modes test UX** - not security restrictions (needs cleanup) 🔄
6. **Data scoping ≠ permissions** - what you see vs what you can do (architecture ready) ✅
7. **Future-proof design** - enterprise customers will benefit from this clarity ✅
8. **One-time purchases work** - $9.99 coach accounts vs $199 team subscriptions ✅

## 🎯 **Next Sprint Priorities**

### **Immediate (Next 1-2 Sessions)**

1. **Clean Dev Mode Names** - Remove confusing `super_admin_real`, `super_admin_mock` etc.
2. **Data Resolution Service** - Implement clean mock vs real data switching
3. **Dev Mode UI Indicators** - Clear badges showing what data mode you're in

### **Short Term (Next Week)**

1. **Payment Integration** - Connect Stripe for coach accounts and team subscriptions
2. **School Code System** - Implement team lookup and joining via codes
3. **Personal Playbook Foundation** - Basic coach content library

### **Medium Term (Next Month)**

1. **Team Integration Workflow** - Coach account → team member flow
2. **Content Import/Export** - Personal playbooks → team playbooks
3. **Advanced Role Management** - Ownership transfers, role assignments

---

_**Status: Major milestone achieved!** Core RBAC system working, team creation/joining flows complete, coach account system implemented. Ready for next phase of dev mode cleanup and payment integration._
