# Role System Redesign

## Current Problem

The current single `role` field is too limiting and doesn't properly handle:

- App-level permissions vs team-level permissions
- Different subscription tiers
- Team ownership vs team membership
- Administrative access vs coaching access

## Proposed Multi-Layer Role System

### 1. App-Level Roles (Global Permissions)

These control what features users can access in the application:

```typescript
type AppRole =
  | "admin" // Platform administrator (isAdmin = true)
  | "head_coach" // Owns teams, paid subscription
  | "coach" // Paid coaching account
  | "free_coach" // Free coaching account (limited features)
  | "player" // Free player account
  | "family"; // Free family account

interface AppPermissions {
  canCreateTeams: boolean;
  canManagePayments: boolean;
  canAccessPremiumFeatures: boolean;
  canInviteUnlimitedMembers: boolean;
  maxTeamsOwned: number;
  maxPlayersPerTeam: number;
}

const APP_PERMISSIONS: Record<AppRole, AppPermissions> = {
  admin: {
    canCreateTeams: true,
    canManagePayments: true,
    canAccessPremiumFeatures: true,
    canInviteUnlimitedMembers: true,
    maxTeamsOwned: -1, // unlimited
    maxPlayersPerTeam: -1,
  },
  head_coach: {
    canCreateTeams: true,
    canManagePayments: true,
    canAccessPremiumFeatures: true,
    canInviteUnlimitedMembers: true,
    maxTeamsOwned: 5,
    maxPlayersPerTeam: 50,
  },
  coach: {
    canCreateTeams: true,
    canManagePayments: false,
    canAccessPremiumFeatures: true,
    canInviteUnlimitedMembers: false,
    maxTeamsOwned: 2,
    maxPlayersPerTeam: 25,
  },
  free_coach: {
    canCreateTeams: true,
    canManagePayments: false,
    canAccessPremiumFeatures: false,
    canInviteUnlimitedMembers: false,
    maxTeamsOwned: 1,
    maxPlayersPerTeam: 15,
  },
  player: {
    canCreateTeams: false,
    canManagePayments: false,
    canAccessPremiumFeatures: false,
    canInviteUnlimitedMembers: false,
    maxTeamsOwned: 0,
    maxPlayersPerTeam: 0,
  },
  family: {
    canCreateTeams: false,
    canManagePayments: false,
    canAccessPremiumFeatures: false,
    canInviteUnlimitedMembers: false,
    maxTeamsOwned: 0,
    maxPlayersPerTeam: 0,
  },
};
```

### 2. Team-Level Roles (Team-Specific Permissions)

These control what users can do within a specific team:

```typescript
type TeamRole =
  | "owner" // Created the team, full control
  | "head_coach" // Primary coach, can manage everything except billing
  | "assistant_coach" // Can manage players and practices
  | "coordinator" // Can manage logistics, limited player access
  | "manager" // Can manage equipment, logistics
  | "family" // Can view their player's info
  | "alumni" // Former player, limited access
  | "player"; // Active team member

interface TeamPermissions {
  canManageTeamSettings: boolean;
  canManageMembers: boolean;
  canManagePractices: boolean;
  canManagePlaybook: boolean;
  canViewAllPlayers: boolean;
  canEditPlayerProfiles: boolean;
  canManageEvents: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

const TEAM_PERMISSIONS: Record<TeamRole, TeamPermissions> = {
  owner: {
    canManageTeamSettings: true,
    canManageMembers: true,
    canManagePractices: true,
    canManagePlaybook: true,
    canViewAllPlayers: true,
    canEditPlayerProfiles: true,
    canManageEvents: true,
    canViewAnalytics: true,
    canExportData: true,
  },
  head_coach: {
    canManageTeamSettings: false, // billing stays with owner
    canManageMembers: true,
    canManagePractices: true,
    canManagePlaybook: true,
    canViewAllPlayers: true,
    canEditPlayerProfiles: true,
    canManageEvents: true,
    canViewAnalytics: true,
    canExportData: true,
  },
  assistant_coach: {
    canManageTeamSettings: false,
    canManageMembers: false,
    canManagePractices: true,
    canManagePlaybook: true,
    canViewAllPlayers: true,
    canEditPlayerProfiles: true,
    canManageEvents: false,
    canViewAnalytics: true,
    canExportData: false,
  },
  coordinator: {
    canManageTeamSettings: false,
    canManageMembers: false,
    canManagePractices: false,
    canManagePlaybook: false,
    canViewAllPlayers: true,
    canEditPlayerProfiles: false,
    canManageEvents: true,
    canViewAnalytics: false,
    canExportData: false,
  },
  manager: {
    canManageTeamSettings: false,
    canManageMembers: false,
    canManagePractices: false,
    canManagePlaybook: false,
    canViewAllPlayers: true,
    canEditPlayerProfiles: false,
    canManageEvents: true,
    canViewAnalytics: false,
    canExportData: false,
  },
  family: {
    canManageTeamSettings: false,
    canManageMembers: false,
    canManagePractices: false,
    canManagePlaybook: false,
    canViewAllPlayers: false, // only their own player
    canEditPlayerProfiles: false,
    canManageEvents: false,
    canViewAnalytics: false,
    canExportData: false,
  },
  alumni: {
    canManageTeamSettings: false,
    canManageMembers: false,
    canManagePractices: false,
    canManagePlaybook: false,
    canViewAllPlayers: false,
    canEditPlayerProfiles: false,
    canManageEvents: false,
    canViewAnalytics: false,
    canExportData: false,
  },
  player: {
    canManageTeamSettings: false,
    canManageMembers: false,
    canManagePractices: false,
    canManagePlaybook: false,
    canViewAllPlayers: false, // roster view only
    canEditPlayerProfiles: false, // only their own
    canManageEvents: false,
    canViewAnalytics: false,
    canExportData: false,
  },
};
```

### 3. Database Schema Changes

#### Update profiles table:

```sql
-- Add new app-level role system
ALTER TABLE profiles
DROP COLUMN role,
ADD COLUMN app_role TEXT DEFAULT 'player' CHECK (app_role IN ('admin', 'head_coach', 'coach', 'free_coach', 'player', 'family')),
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE,

-- Add coaching-specific fields
ADD COLUMN years_coaching INTEGER,
ADD COLUMN coaching_experience TEXT,
ADD COLUMN education TEXT,
ADD COLUMN coaching_philosophy TEXT,
ADD COLUMN certifications TEXT[],
ADD COLUMN current_school TEXT,

-- Add subscription info
ADD COLUMN subscription_tier TEXT DEFAULT 'free',
ADD COLUMN subscription_expires_at TIMESTAMPTZ;
```

#### Update team_memberships table:

```sql
-- Add team-level roles
ALTER TABLE team_memberships
ADD COLUMN team_role TEXT DEFAULT 'player' CHECK (team_role IN ('owner', 'head_coach', 'assistant_coach', 'coordinator', 'manager', 'family', 'alumni', 'player')),
ADD COLUMN can_manage_members BOOLEAN DEFAULT FALSE,
ADD COLUMN can_manage_practices BOOLEAN DEFAULT FALSE,
ADD COLUMN invited_by UUID REFERENCES profiles(id);
```

### 4. Implementation Strategy

#### Phase 1: Database Migration

1. Create migration scripts to add new fields
2. Migrate existing `role` data to new `app_role` system
3. Set `is_admin` for current admin users
4. Update team_memberships with appropriate team_roles

#### Phase 2: Permission System

1. Create `usePermissions` hook that combines app and team permissions
2. Update all permission checks throughout the app
3. Create permission guards for routes and components

#### Phase 3: UI Updates

1. Update profile forms to show appropriate fields based on app_role
2. Create team member management with role assignment
3. Update navigation and features based on permissions

### 5. Code Examples

#### Permission Hook:

```typescript
// hooks/usePermissions.ts
export function usePermissions(teamId?: string) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: membership } = useTeamMembership(teamId);

  const appPermissions = useMemo(() => {
    if (!profile?.app_role) return null;
    return APP_PERMISSIONS[profile.app_role];
  }, [profile?.app_role]);

  const teamPermissions = useMemo(() => {
    if (!membership?.team_role) return null;
    return TEAM_PERMISSIONS[membership.team_role];
  }, [membership?.team_role]);

  return {
    app: appPermissions,
    team: teamPermissions,
    isAdmin: profile?.is_admin || false,
    canAccess: (permission: string) => {
      // Combine app and team permissions logic
    },
  };
}
```

#### Profile Form Logic:

```typescript
// components/profile/ProfileForm.tsx
function ProfileForm() {
  const { profile } = useProfile();
  const showCoachingFields = ['admin', 'head_coach', 'coach', 'free_coach'].includes(profile?.app_role);
  const showPlayerFields = profile?.app_role === 'player';

  return (
    <form>
      {/* Basic fields for everyone */}
      <BasicInfoSection />

      {/* Coaching fields for coaches/admins */}
      {showCoachingFields && <CoachingInfoSection />}

      {/* Athletic fields for players */}
      {showPlayerFields && <AthleticInfoSection />}

      {/* Family-specific fields */}
      {profile?.app_role === 'family' && <FamilyInfoSection />}
    </form>
  );
}
```

### 6. Migration Script Example

```typescript
// scripts/migrate-role-system.ts
async function migrateRoleSystem() {
  // 1. Add new columns
  await supabase.rpc("exec", {
    sql: `
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS app_role TEXT DEFAULT 'player',
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    `,
  });

  // 2. Migrate existing data
  const { data: profiles } = await supabase.from("profiles").select("id, role");

  for (const profile of profiles) {
    let app_role = "player";
    let is_admin = false;

    if (profile.role === "admin") {
      app_role = "admin";
      is_admin = true;
    } else if (profile.role === "coach") {
      app_role = "free_coach"; // default to free, upgrade manually
    }

    await supabase
      .from("profiles")
      .update({ app_role, is_admin })
      .eq("id", profile.id);
  }

  // 3. Update team_memberships for team owners
  // Set creators of teams as 'owner' role
}
```

## Benefits of This System

1. **Clear Separation**: App permissions vs team permissions
2. **Flexible**: Can have different roles in different teams
3. **Scalable**: Easy to add new roles or permissions
4. **Business Model Ready**: Built-in subscription tier support
5. **Granular Control**: Fine-tuned permissions for each context

## Next Steps

1. Review and approve this design
2. Create database migration scripts
3. Implement permission system
4. Update UI components
5. Test thoroughly with different role combinations

Would you like me to proceed with implementing any part of this system?
