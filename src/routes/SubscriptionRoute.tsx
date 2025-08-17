import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "./paths";

import { LoadingScreen, AccessDenied } from "./GuardUI";
import { supabase } from "../lib/supabase";
import { useAuthGate } from "./useAuthGate";

import type { Database } from "../types/database";

// Subscription tier type
type SubscriptionTier =
  Database["public"]["Tables"]["teams"]["Row"]["subscription_tier"];
interface SubscriptionRouteProps {
  children: React.ReactNode;
  requiredTiers: NonNullable<SubscriptionTier>[];
  teamId?: string;
  fallbackTo?: string;
}
interface TeamSubscription {
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
}
/**
 * SubscriptionRoute Component
 *
 * Protects routes based on team subscription status.
 * Since teams REQUIRE premium to exist, this mainly checks for active subscriptions.
 *
 * @param children - The component(s) to render if subscription is valid
 * @param requiredTiers - Array of subscription tiers that can access this route
 * @param teamId - Team ID (optional, will try to get from URL params)
 * @param fallbackTo - Where to redirect if access is denied (default: '/dashboard')
 */
export const SubscriptionRoute: React.FC<SubscriptionRouteProps> = ({
  children,
  requiredTiers,
  teamId,
  fallbackTo = "/dashboard",
}) => {
  const gate = useAuthGate({ requireAuth: true, redirectTo: ROUTES.LOGIN });
  const params = useParams();
  const [subscription, setSubscription] = useState<TeamSubscription | null>(
    null
  );
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  // Get team ID from props or URL params
  const currentTeamId = teamId || params.teamId;
  useEffect(() => {
    const checkTeamSubscription = async () => {
      if (!currentTeamId) {
        setSubscription(null);
        setCheckingSubscription(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("subscription_tier, subscription_expires_at")
          .eq("id", currentTeamId)
          .single();
        if (error || !data) {
          setSubscription(null);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error("Error checking team subscription:", error);
        setSubscription(null);
      } finally {
        setCheckingSubscription(false);
      }
    };
    if (currentTeamId) {
      checkTeamSubscription();
    } else {
      setCheckingSubscription(false);
    }
  }, [currentTeamId]);
  // Show loading spinner while checking
  if (gate.status === "loading" || checkingSubscription) {
    return <LoadingScreen />;
  }
  // Not authenticated
  if (gate.status === "redirect") return gate.element!;
  // No team ID
  if (!currentTeamId) {
    return <Navigate to={fallbackTo || ROUTES.DASHBOARD} replace />;
  }
  // No subscription data found
  if (!subscription) {
    return (
      <AccessDenied
        title="Team Not Found"
        iconName="users"
        message="Unable to verify team subscription status."
      />
    );
  }
  // Check subscription tier
  if (
    !subscription.subscription_tier ||
    !requiredTiers.includes(subscription.subscription_tier)
  ) {
    return (
      <AccessDenied
        title="Premium Feature"
        iconName="star"
        message={
          <>
            This feature requires a {requiredTiers.join(" or ")} subscription.
            Current plan: {subscription.subscription_tier || "none"}
          </>
        }
      />
    );
  }
  // Check if subscription is expired
  if (subscription.subscription_expires_at) {
    const expirationDate = new Date(subscription.subscription_expires_at);
    if (expirationDate < new Date()) {
      return (
        <AccessDenied
          title="Subscription Expired"
          iconName="clock"
          message={
            <>
              Team subscription expired on {expirationDate.toLocaleDateString()}
              . Please renew to continue using premium features.
            </>
          }
        />
      );
    }
  }
  // Access granted, render the protected content
  return <>{children}</>;
};
