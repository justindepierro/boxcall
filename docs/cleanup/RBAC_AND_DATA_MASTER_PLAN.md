# Role-Based Access Control (RBAC) & Data Master Plan

> **Generated**: August 4, 2025  
> **Status**: Comprehensive RBAC Strategy + Mock Data Cleanup  
> **Purpose**: Future-proof role/permission system with proper data management

## 🎯 **Executive Summary**

**Current Problem**: Role switching chaos, inconsistent permissions, mock data bleeding through  
**Industry Standard**: RBAC with clear separation of concerns (Authentication vs Authorization vs Data Scoping)  
**Goal**: Clean, testable, maintainable permission system + proper dev environment  
**Priority**: Critical - affects security, UX, and development workflow

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

### **Phase 1: RBAC Foundation** ✅ **IN PROGRESS**

- [x] Create `RBACService` with super admin override for justindepierro@gmail.com
- [x] Implement `usePermissions` hook
- [x] Add permission checks to team creation flows
- [x] Update TeamBulletin with super admin indicators
- [ ] Test with your account extensively
- [ ] Add team creation/joining flows

### **Phase 2: Clean Dev Modes**

- [ ] Simplify dev mode types (remove confusing ones)
- [ ] Implement `DataResolutionService`
- [ ] Clean up all role-switching logic
- [ ] Add clear dev mode indicators

### **Phase 3: Permission-Driven UI**

- [ ] Wrap components with permission checks
- [ ] Hide/show features based on actual permissions
- [ ] Add loading states for permission resolution

### **Phase 4: Testing & Documentation**

- [ ] Create permission test matrix
- [ ] Document role hierarchy
- [ ] Test all dev mode combinations

---

## 🎯 **Immediate Fixes Needed**

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
- ✅ Clear understanding of what data you're seeing
- ✅ No artificial limitations

### **For Development**

- ✅ Consistent permission checking
- ✅ Easy to add new roles/permissions
- ✅ Testable permission scenarios
- ✅ Clean separation of dev/production data

### **For Future Users**

- ✅ Clear role hierarchy
- ✅ Predictable permissions
- ✅ Secure by default
- ✅ Scalable to enterprise needs

---

## 💡 **Key Insights**

1. **You're the system owner** - should have unlimited access
2. **RBAC is about predictability** - same role = same permissions
3. **Dev modes test UX** - not security restrictions
4. **Data scoping ≠ permissions** - what you see vs what you can do
5. **Future-proof** - enterprise customers will need this clarity

---

_This plan transforms the chaotic role system into industry-standard RBAC while giving you the super admin powers you need for development._
