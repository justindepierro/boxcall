import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ProgressiveAuthFlow } from "../components/ui/Auth/ProgressiveAuthFlow";
import { PageLayout } from "../components/layout/PageLayout";
import { ROUTES } from "../routes/paths";
import { useAuth } from "../app/auth-store";

/**
 * Login Page
 *
 * Enhanced authentication page with progressive UX flow.
 * Redirects authenticated users to dashboard.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      console.log("✅ User already logged in, redirecting to dashboard");
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLoginSuccess = () => {
    console.log("🎉 LoginPage: handleLoginSuccess called");
    console.log("🔀 LoginPage: Navigating to dashboard...");
    
    // Redirect to dashboard after successful login
    navigate(ROUTES.DASHBOARD, { replace: true });
    
    console.log("✅ LoginPage: Navigation initiated");
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
    <PageLayout>
      <ProgressiveAuthFlow onSuccess={handleLoginSuccess} />
    </PageLayout>
  );
};

export default LoginPage;
