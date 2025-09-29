/**
 * Multi-Badge Display Component
 *
 * Displays multiple badges for a user showing all their roles and subscription status.
 * This allows users to have both admin status, app-level roles, and subscription tiers.
 */

import React from "react";
import { RoleBadge, SubscriptionBadge } from "./RoleBadge";
import { Badge } from "./Badge";

interface MultiBadgeDisplayProps {
  isAdmin?: boolean | null;
  appRole?: string | null;
  subscriptionTier?: string | null;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical" | "wrap";
  className?: string;
}

export const MultiBadgeDisplay: React.FC<MultiBadgeDisplayProps> = ({
  isAdmin,
  appRole,
  subscriptionTier,
  size = "md",
  layout = "wrap",
  className = "",
}) => {
  const badges = [];

  // Admin badge (for platform admins) - only show if not showing role badge
  if (isAdmin && (!appRole || appRole === "admin")) {
    badges.push(
      <Badge key="admin" variant="danger" className="text-xs">
        Platform Admin
      </Badge>
    );
  }

  // Role badge (for all users with app roles, but skip admin if we already showed admin badge)
  if (appRole && appRole !== "player" && !(isAdmin && appRole === "admin")) {
    badges.push(<RoleBadge key="role" role={appRole} size="sm" />);
  }

  // Subscription badge
  if (subscriptionTier && subscriptionTier !== "free") {
    badges.push(
      <SubscriptionBadge key="subscription" tier={subscriptionTier} />
    );
  }

  if (badges.length === 0) {
    return <RoleBadge role="player" size={size} />;
  }

  const layoutClasses = {
    horizontal: "flex items-center space-x-2",
    vertical: "flex flex-col space-y-2",
    wrap: "flex flex-wrap items-center gap-2",
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>{badges}</div>
  );
};

export default MultiBadgeDisplay;
