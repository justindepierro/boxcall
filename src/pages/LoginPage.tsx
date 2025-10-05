import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { ProgressiveAuthFlow } from "../components/ui/Auth/ProgressiveAuthFlow";
import { PageLayout } from "../components/layout/PageLayout";
import { Aurora } from "../components/ui/Aurora";
import { ROUTES } from "../routes/paths";
import { useAuth } from "../app/auth-store";
import { getLoginDestination } from "../utils/navigationUtils";
import { auth as logAuth } from "../utils/logger";

/**
 * Login Page
 *
 * Enhanced authentication page with progressive UX flow.
 * Redirects authenticated users to dashboard or intended destination.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const destination = getLoginDestination(
        location.search,
        ROUTES.DASHBOARD
      );
      logAuth(`User already logged in, redirecting to: ${destination}`);
      navigate(destination, { replace: true });
    }
  }, [user, loading, navigate, location.search]);

  const handleLoginSuccess = () => {
    const destination = getLoginDestination(location.search, ROUTES.DASHBOARD);
    logAuth(`Login successful, navigating to: ${destination}`);
    navigate(destination, { replace: true });
  };

  // Show nothing while checking auth state
  if (loading) {
    return null;
  }

  // Don't show login form if already logged in
  if (user) {
    return null;
  }

  return (
    <Aurora variant="minimal" fullHeight>
      <PageLayout>
        <ProgressiveAuthFlow onSuccess={handleLoginSuccess} />
      </PageLayout>
    </Aurora>
  );
};

export default LoginPage;
