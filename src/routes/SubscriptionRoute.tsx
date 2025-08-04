import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthLoading, useIsAuthenticated } from "../app/auth-store";
import { Icon } from "../components/ui/Icon/Icon";
import { supabase } from "../lib/supabase";
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600"></div>
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
          <h1 className="text-2xl font-bold text-red-600 mb-4 flex items-center justify-center">
            <Icon name="users" size="lg" className="mr-2" />
            Team Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to verify team subscription status.
          </p>
          <button
            onClick={() => (window.location.href = fallbackTo)}
            className="bg-jade-500 text-white px-4 py-2 rounded-sm hover:bg-jade-600 font-sans font-semibold"
          >
            Return to Dashboard
          </button>
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
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">
            ⭐ Premium Feature
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This feature requires a {requiredTiers.join(" or ")} subscription.
            Current plan: {subscription.subscription_tier || "none"}
          </p>
          <div className="space-y-3">
            <button className="w-full bg-jade-500 text-white px-4 py-2 rounded-sm hover:bg-jade-600 font-sans font-semibold">
              Upgrade Subscription
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Go Back
            </button>
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
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              ⏰ Subscription Expired
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Team subscription expired on {expirationDate.toLocaleDateString()}
              . Please renew to continue using premium features.
            </p>
            <div className="space-y-3">
              <button className="w-full bg-jade-500 text-white px-4 py-2 rounded-sm hover:bg-jade-600 font-sans font-semibold">
                Renew Subscription
              </button>
              <button
                onClick={() => (window.location.href = fallbackTo)}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
  // Access granted, render the protected content
  return <>{children}</>;
};
