import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthLoading, useIsAuthenticated } from "../app/auth-store";
import { Icon } from "../components/ui/Icon/Icon";
import { Button } from "../components/ui/Button/Button";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import { Typography } from "../components/design-system/Typography";
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
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();
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
  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-jade"></div>
      </div>
    );
  }
  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // No team ID
  if (!currentTeamId) {
    return <Navigate to={fallbackTo} replace />;
  }
  // No subscription data found
  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Typography
            variant="headline-md"
            as="h1"
            className="text-red-600 mb-4 flex items-center justify-center"
          >
            <Icon name="users" size="lg" className="mr-2" />
            Team Not Found
          </Typography>
          <p className="mb-6 text-text-secondary">
            Unable to verify team subscription status.
          </p>
          <Button
            variant="primary"
            onClick={() => (window.location.href = fallbackTo)}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  // Check subscription tier
  if (
    !subscription.subscription_tier ||
    !requiredTiers.includes(subscription.subscription_tier)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Typography
            variant="headline-md"
            as="h1"
            className="text-yellow-600 mb-4"
          >
            ⭐ Premium Feature
          </Typography>
          <p className="mb-6 text-text-secondary">
            This feature requires a {requiredTiers.join(" or ")} subscription.
            Current plan: {subscription.subscription_tier || "none"}
          </p>
          <div className="space-y-3">
            <Button fullWidth variant="primary">
              Upgrade Subscription
            </Button>
            <Button
              fullWidth
                variant="ghost"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  // Check if subscription is expired
  if (subscription.subscription_expires_at) {
    const expirationDate = new Date(subscription.subscription_expires_at);
    if (expirationDate < new Date()) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <Typography
              variant="headline-md"
              as="h1"
              className="text-red-600 mb-4"
            >
              ⏰ Subscription Expired
            </Typography>
            <p className="mb-6 text-text-secondary">
              Team subscription expired on {expirationDate.toLocaleDateString()}
              . Please renew to continue using premium features.
            </p>
            <div className="space-y-3">
              <Button fullWidth variant="primary">
                Renew Subscription
              </Button>
              <Button
                fullWidth
                variant="ghost"
                onClick={() => (window.location.href = fallbackTo)}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }
  // Access granted, render the protected content
  return <>{children}</>;
};
