/**
 * Comprehensive Permission System
 *
 * This system combines app-level and team-level permissions
 * to provide granular access control throughout the application.
 */
/* eslint-disable react-refresh/only-export-components */

import { useAuthProfile } from "../app/auth-store";
import { useMemo } from "react";

// App-level permissions based on subscription tier and role
export interface AppPermissions {
  // Platform administration
  canManagePlatform: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;

  // Team creation and management
  canCreateTeams: boolean;
  canManagePayments: boolean;
  maxTeamsOwned: number;
  maxPlayersPerTeam: number;

  // Premium features
  canAccessPremiumFeatures: boolean;
  canExportData: boolean;
  canUseAdvancedStats: boolean;
  canInviteUnlimitedMembers: boolean;

  // Content features
  canCreateAdvancedPlays: boolean;
  canUseAIFeatures: boolean;
  canAccessVideoAnalysis: boolean;
}

// Team-level permissions for specific team contexts
export interface TeamPermissions {
  // Team settings and configuration
  canManageTeamSettings: boolean;
  canDeleteTeam: boolean;
  canManageBilling: boolean;

  // Member management
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;
  canViewAllMembers: boolean;

  // Content management
  canManagePractices: boolean;
  canManagePlaybook: boolean;
  canManageEvents: boolean;
  canManageRoster: boolean;

  // Data and analytics
  canViewAnalytics: boolean;
  canExportTeamData: boolean;
  canViewPlayerStats: boolean;
  canEditPlayerProfiles: boolean;
}

// Permission calculation functions
const calculateAppPermissions = (
  appRole: string | null,
  isAdmin: boolean | null,
  subscriptionTier: string | null
): AppPermissions => {
  const isPremium = subscriptionTier === "premium";

  // Admin gets everything
  if (isAdmin) {
    return {
      canManagePlatform: true,
      canViewAnalytics: true,
      canManageUsers: true,
      canCreateTeams: true,
      canManagePayments: true,
      maxTeamsOwned: -1, // unlimited
      maxPlayersPerTeam: -1, // unlimited
      canAccessPremiumFeatures: true,
      canExportData: true,
      canUseAdvancedStats: true,
      canInviteUnlimitedMembers: true,
      canCreateAdvancedPlays: true,
      canUseAIFeatures: true,
      canAccessVideoAnalysis: true,
    };
  }

  switch (appRole) {
    case "head_coach":
      return {
        canManagePlatform: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canCreateTeams: true,
        canManagePayments: true,
        maxTeamsOwned: isPremium ? 10 : 3,
        maxPlayersPerTeam: isPremium ? 100 : 30,
        canAccessPremiumFeatures: isPremium,
        canExportData: isPremium,
        canUseAdvancedStats: isPremium,
        canInviteUnlimitedMembers: isPremium,
        canCreateAdvancedPlays: isPremium,
        canUseAIFeatures: isPremium,
        canAccessVideoAnalysis: isPremium,
      };

    case "coach":
      return {
        canManagePlatform: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canCreateTeams: true,
        canManagePayments: false,
        maxTeamsOwned: isPremium ? 5 : 2,
        maxPlayersPerTeam: isPremium ? 50 : 20,
        canAccessPremiumFeatures: isPremium,
        canExportData: false,
        canUseAdvancedStats: isPremium,
        canInviteUnlimitedMembers: false,
        canCreateAdvancedPlays: isPremium,
        canUseAIFeatures: isPremium,
        canAccessVideoAnalysis: isPremium,
      };

    case "free_coach":
      return {
        canManagePlatform: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canCreateTeams: true,
        canManagePayments: false,
        maxTeamsOwned: 1,
        maxPlayersPerTeam: 15,
        canAccessPremiumFeatures: false,
        canExportData: false,
        canUseAdvancedStats: false,
        canInviteUnlimitedMembers: false,
        canCreateAdvancedPlays: false,
        canUseAIFeatures: false,
        canAccessVideoAnalysis: false,
      };

    case "player":
    case "family":
    default:
      return {
        canManagePlatform: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canCreateTeams: false,
        canManagePayments: false,
        maxTeamsOwned: 0,
        maxPlayersPerTeam: 0,
        canAccessPremiumFeatures: false,
        canExportData: false,
        canUseAdvancedStats: false,
        canInviteUnlimitedMembers: false,
        canCreateAdvancedPlays: false,
        canUseAIFeatures: false,
        canAccessVideoAnalysis: false,
      };
  }
};

// Main comprehensive permission hook
export function useComprehensivePermissions(teamId?: string) {
  const profile = useAuthProfile();
  // TODO: Add team membership hook when implementing team management
  // const teamMembership = useTeamMembership(teamId);

  const appPermissions = useMemo(() => {
    if (!profile) return null;
    return calculateAppPermissions(
      profile.app_role || profile.role,
      profile.is_admin,
      profile.subscription_tier
    );
  }, [profile]);

  const teamPermissions = useMemo(() => {
    if (!teamId) return null;
    // TODO: Use actual team membership data
    // For now, return null until team management is implemented
    return null;
  }, [teamId]);

  // Convenience methods
  const can = (permission: keyof AppPermissions | keyof TeamPermissions) => {
    if (appPermissions && permission in appPermissions) {
      return appPermissions[permission as keyof AppPermissions];
    }
    if (teamPermissions && permission in teamPermissions) {
      return teamPermissions[permission as keyof TeamPermissions];
    }
    return false;
  };

  const isAdmin = profile?.is_admin || false;
  const isPremium = profile?.subscription_tier === "premium";

  return {
    app: appPermissions,
    team: teamPermissions,
    can,
    isAdmin,
    isPremium,
    loading: !profile,
  };
}

// Permission guard components
interface PermissionGuardProps {
  permission: keyof AppPermissions | keyof TeamPermissions;
  teamId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  teamId,
  children,
  fallback = null,
}) => {
  const { can, loading } = useComprehensivePermissions(teamId);

  if (loading) return null;
  if (!can(permission)) return <>{fallback}</>;

  return <>{children}</>;
};

// Subscription gate component
interface SubscriptionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PremiumGate: React.FC<SubscriptionGateProps> = ({
  children,
  fallback = null,
}) => {
  const { isPremium, loading } = useComprehensivePermissions();

  if (loading) return null;
  if (!isPremium) return <>{fallback}</>;

  return <>{children}</>;
};
