# BoxCall Role System Documentation

## Overview

BoxCall uses a **dual role system** with both global and team-specific roles. This document clarifies how these systems work, their intended use cases, and current implementation issues.

## Role System Architecture

### 1. Global Roles (System-Wide)

**Location**: `profiles.role` (database)  
**Purpose**: System-wide permissions and access control  
**Values**: `coach`, `player`, `admin`  
**Use Cases**:

- Non-team routes (dashboard, templates, boxcall)
- System administration features
- Global feature access

### 2. Team Roles (Team-Specific)

**Location**: `team_members.team_role` (database)  
**Purpose**: Team-specific permissions and responsibilities  
**Values**: `head_coach`, `assistant_coach`, `coordinator`, `manager`, `coach`, `player`, `family`  
**Use Cases**:

- Team management features
- Playbook access
- Analytics permissions
- Family view access

## Current Implementation Issues

### Type Mismatches

```typescript
// INCORRECT: Database has 'team_role' but types reference 'role'
export type TeamMemberRole =
  Database["public"]["Tables"]["team_members"]["Row"]["role"];
// Should be: Database["public"]["Tables"]["team_members"]["Row"]["team_role"]
```

### Query Inconsistencies

```typescript
// fetchTeamMembership selects both 'role' and 'team_role'
// But team_members table only has 'team_role'
.select("role, team_role, status")
```

### Role System Confusion

- `rbac.ts` defines comprehensive roles but they're not used in authorize.ts
- Database schema has inconsistent role definitions across migrations
- Authorize logic mixes global and team roles without clear separation

## Role Mapping & Permissions

### Global Role Permissions

| Role     | Can Access Templates | Can Access BoxCall | Can Manage Teams | Admin Features |
| -------- | -------------------- | ------------------ | ---------------- | -------------- |
| `admin`  | ✅                   | ✅                 | ✅               | ✅             |
| `coach`  | ✅                   | ✅                 | ✅               | ❌             |
| `player` | ❌                   | ❌                 | ❌               | ❌             |

### Team Role Permissions

| Role              | Team Settings | Analytics | Playbook | Family View |
| ----------------- | ------------- | --------- | -------- | ----------- |
| `head_coach`      | ✅            | ✅        | ✅       | ✅          |
| `assistant_coach` | ✅            | ❌        | ✅       | ✅          |
| `coordinator`     | ✅            | ❌        | ✅       | ✅          |
| `manager`         | ❌            | ❌        | ✅       | ✅          |
| `coach`           | ✅            | ❌        | ✅       | ✅          |
| `player`          | ❌            | ❌        | ✅       | ❌          |
| `family`          | ❌            | ❌        | ❌       | ✅          |

## Recommended Fixes

### 1. Fix Type Definitions

```typescript
// Correct the TeamMemberRole type
export type TeamMemberRole =
  Database["public"]["Tables"]["team_members"]["Row"]["team_role"];
```

### 2. Update Database Queries

```typescript
// Remove 'role' from team_members queries since it doesn't exist
.select("team_role, status")
```

### 3. Clarify Authorization Logic

- Global roles for system-wide features
- Team roles for team-specific features
- Clear separation in authorize() function

### 4. Standardize Role Values

- Use consistent role names across all systems
- Document role hierarchies and inheritance

## Migration Path

1. **Phase 1**: Fix type definitions and queries
2. **Phase 2**: Update authorization logic
3. **Phase 3**: Standardize role values
4. **Phase 4**: Add validation guards

## Examples

### Global Role Check

```typescript
// User can access coach-only templates
if (userProfile.role === "coach" || userProfile.role === "admin") {
  // Allow access
}
```

### Team Role Check

```typescript
// User can manage team settings
if (
  teamMembership.team_role === "head_coach" ||
  teamMembership.team_role === "assistant_coach"
) {
  // Allow access
}
```

### Combined Check

````typescript
// User can view analytics (global admin OR team coach)
const canViewAnalytics =
  userProfile.role === 'admin' ||
  (teamMembership?.team_role === 'head_coach' ||
   teamMembership?.team_role === 'assistant_coach');
```</content>
<parameter name="filePath">/Users/justindepierro/Documents/boxcall/docs/ROLE_SYSTEM_DOCUMENTATION.md
````
